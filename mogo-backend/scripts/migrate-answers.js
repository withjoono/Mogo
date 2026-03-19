const { Pool } = require('pg');
const DB_URL = 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod';

async function main() {
    const pool = new Pool({ connectionString: DB_URL, max: 3 });
    try {
        await pool.query('SET search_path TO examhub');

        // Build mapping: exam_name → mock_exam_id
        const exams = await pool.query('SELECT id, year, month FROM eh_mock_exams');
        const examMap = {};
        for (const e of exams.rows) {
            const key = `${e.year}-${String(e.month).padStart(2, '0')}`;
            examMap[key] = e.id;
        }

        // Subject area mapping: subject → subject_area_code
        const areaMap = {
            '국어': { code: 'KOR', name: '국어' },
            '수학': { code: 'MAT', name: '수학' },
            '영어': { code: 'ENG', name: '영어' },
            '한국사': { code: 'HIS', name: '한국사' },
            '사회탐구': { code: 'SOC', name: '사회탐구' },
            '과학탐구': { code: 'SCI', name: '과학탐구' },
            '제2외국어': { code: 'FOR', name: '제2외국어' },
        };

        // Read all eh_mock_answer rows
        const answers = await pool.query('SELECT * FROM eh_mock_answer ORDER BY id');
        console.log(`Total rows to migrate: ${answers.rows.length}`);

        let inserted = 0, skipped = 0;
        const BATCH_SIZE = 500;

        for (let i = 0; i < answers.rows.length; i += BATCH_SIZE) {
            const batch = answers.rows.slice(i, i + BATCH_SIZE);
            const values = [];
            const placeholders = [];

            for (const row of batch) {
                const parts = row.exam_name.match(/(\d{4})\.(\d{2})/);
                if (!parts) { skipped++; continue; }
                const key = `${parts[1]}-${parts[2]}`;
                const mockExamId = examMap[key];
                if (!mockExamId) { skipped++; continue; }

                const area = areaMap[row.subject] || { code: row.subject, name: row.subject };
                const idx = values.length / 16;
                const offset = idx * 16;

                // Parse correct_rate
                const correctRate = row.correct_rate ? parseFloat(row.correct_rate.replace('%', '')) : null;

                // Parse choice ratios
                const parseRatio = (v) => v ? parseFloat(String(v).replace('%', '')) : null;

                placeholders.push(
                    `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15}, $${offset + 16})`
                );
                values.push(
                    mockExamId,                           // mock_exam_id
                    area.code,                            // subject_area_code
                    area.name,                            // subject_area_name
                    row.subject_detail || '',              // subject_code
                    row.subject_detail || '',              // subject_name
                    row.question_number,                   // question_number
                    row.score || 2,                        // score
                    row.answer,                            // answer
                    parseRatio(row.choice_ratio_1),       // choice_ratio_1
                    parseRatio(row.choice_ratio_2),       // choice_ratio_2
                    parseRatio(row.choice_ratio_3),       // choice_ratio_3
                    parseRatio(row.choice_ratio_4),       // choice_ratio_4
                    parseRatio(row.choice_ratio_5),       // choice_ratio_5
                    correctRate,                           // correct_rate
                    row.difficulty || null,                 // difficulty
                    mockExamId,                            // duplicate for upsert check
                );
            }

            if (placeholders.length === 0) continue;

            // Remove the extra placeholder param (col 16 was a mistake)
            // Re-do with 15 params
            const values2 = [];
            const placeholders2 = [];
            let pIdx = 0;
            for (const row of batch) {
                const parts = row.exam_name.match(/(\d{4})\.(\d{2})/);
                if (!parts) continue;
                const key = `${parts[1]}-${parts[2]}`;
                const mockExamId = examMap[key];
                if (!mockExamId) continue;

                const area = areaMap[row.subject] || { code: row.subject, name: row.subject };
                const offset = pIdx * 15;
                const correctRate = row.correct_rate ? parseFloat(row.correct_rate.replace('%', '')) : null;
                const parseRatio = (v) => v ? parseFloat(String(v).replace('%', '')) : null;

                placeholders2.push(
                    `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14}, $${offset + 15})`
                );
                values2.push(
                    mockExamId,
                    area.code,
                    area.name,
                    row.subject_detail || '',
                    row.subject_detail || '',
                    row.question_number,
                    row.score || 2,
                    row.answer,
                    parseRatio(row.choice_ratio_1),
                    parseRatio(row.choice_ratio_2),
                    parseRatio(row.choice_ratio_3),
                    parseRatio(row.choice_ratio_4),
                    parseRatio(row.choice_ratio_5),
                    correctRate,
                    row.difficulty || null,
                );
                pIdx++;
            }

            if (placeholders2.length > 0) {
                await pool.query(`
                    INSERT INTO eh_exam_questions (mock_exam_id, subject_area_code, subject_area_name, subject_code, subject_name, question_number, score, answer, choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5, correct_rate, difficulty)
                    VALUES ${placeholders2.join(', ')}
                `, values2);
                inserted += placeholders2.length;
            }

            if (inserted % 5000 < BATCH_SIZE) {
                console.log(`  Migrated ${inserted}...`);
            }
        }

        console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);

        // Verify
        const cnt = await pool.query('SELECT count(*) as cnt FROM eh_exam_questions');
        console.log(`eh_exam_questions total: ${cnt.rows[0].cnt}`);
    } finally {
        await pool.end();
    }
}
main().catch(console.error);
