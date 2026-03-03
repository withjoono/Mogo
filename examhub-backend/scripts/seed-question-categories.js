/**
 * Seed eh_2015_question_category from Excel file
 * - Creates the table if it doesn't exist
 * - Inserts data for all H3 mock exams (2015 curriculum)
 */
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../upload/eh_2015_question_category.xlsx');

// Production DB
const pool = new Pool({
    host: '34.64.165.158',
    port: 5432,
    user: 'tsuser',
    password: 'tsuser1234',
    database: 'geobukschool_prod',
    ssl: { rejectUnauthorized: false },
});

async function main() {
    const client = await pool.connect();
    try {
        // 1. Create table if not exists
        console.log('📋 Creating table if not exists...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS examhub.eh_2015_question_category (
        id SERIAL PRIMARY KEY,
        mock_exam_id INTEGER NOT NULL REFERENCES examhub.eh_mock_exams(id),
        subject VARCHAR(20) NOT NULL,
        question_number INTEGER NOT NULL,
        sub_subject VARCHAR(50),
        question_type VARCHAR(50),
        question_form VARCHAR(20),
        major_chapter VARCHAR(100),
        minor_chapter VARCHAR(100),
        score INTEGER,
        UNIQUE(mock_exam_id, subject, question_number)
      )
    `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_qc2015_mock ON examhub.eh_2015_question_category(mock_exam_id)`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_qc2015_subj_type ON examhub.eh_2015_question_category(subject, question_type)`);
        console.log('✅ Table ready');

        // 2. Read Excel
        console.log(`📂 Reading ${EXCEL_PATH}...`);
        const wb = XLSX.readFile(EXCEL_PATH);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        console.log(`📑 Found ${rows.length} rows`);

        // 3. Get all H3 mock exams (2015 curriculum: grade starts with H3)
        const examRes = await client.query(
            `SELECT id, code FROM examhub.eh_mock_exams WHERE code LIKE 'H3%' ORDER BY id`
        );
        const exams = examRes.rows;
        console.log(`🎯 Found ${exams.length} H3 mock exams`);

        // 4. Get existing score data from eh_exam_questions for each exam (to fill score column)
        const scoreMap = new Map(); // key: `${mockExamId}_${subject}_${questionNumber}` -> score
        const scoreRes = await client.query(
            `SELECT mock_exam_id, subject_area_name, question_number, score 
       FROM examhub.eh_exam_questions 
       WHERE mock_exam_id = ANY($1::int[])`,
            [exams.map(e => e.id)]
        );
        for (const row of scoreRes.rows) {
            const key = `${row.mock_exam_id}_${row.subject_area_name}_${row.question_number}`;
            scoreMap.set(key, row.score);
        }
        console.log(`📊 Loaded ${scoreMap.size} question scores from exam_questions`);

        // 5. Subject mapping: Excel 과목 -> subject_area_name in exam_questions
        const subjectToArea = {
            '언매': '국어', '화작': '국어',
            '미적': '수학', '확통': '수학', '기하': '수학',
            '영어': '영어',
        };

        // 6. Insert for each exam
        let totalInserted = 0;
        let totalSkipped = 0;

        for (const exam of exams) {
            // Check if already seeded
            const existCheck = await client.query(
                `SELECT COUNT(*) as cnt FROM examhub.eh_2015_question_category WHERE mock_exam_id = $1`,
                [exam.id]
            );
            if (parseInt(existCheck.rows[0].cnt) > 0) {
                console.log(`⏭️  ${exam.code} already has data (${existCheck.rows[0].cnt} rows), skipping`);
                totalSkipped++;
                continue;
            }

            let examInserted = 0;
            for (const row of rows) {
                const subject = String(row['과목'] || '').trim();
                const questionNumber = parseInt(row['문항'] || '0', 10);
                const subSubject = String(row['세부과목'] || '').trim() || null;
                const questionType = row['유형'] ? String(row['유형']).trim() : null;
                const questionForm = String(row['문제형태'] || '').trim() || null;
                const majorChapter = String(row['대단원'] || '').trim() || null;
                const minorChapter = String(row['소단원'] || '').trim() || null;

                if (!subject || !questionNumber) continue;

                // Try to get score from exam_questions
                const area = subjectToArea[subject] || subject;
                const scoreKey = `${exam.id}_${area}_${questionNumber}`;
                const score = scoreMap.get(scoreKey) || null;

                await client.query(
                    `INSERT INTO examhub.eh_2015_question_category 
           (mock_exam_id, subject, question_number, sub_subject, question_type, question_form, major_chapter, minor_chapter, score)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (mock_exam_id, subject, question_number) DO NOTHING`,
                    [exam.id, subject, questionNumber, subSubject, questionType, questionForm, majorChapter, minorChapter, score]
                );
                examInserted++;
            }
            totalInserted += examInserted;
            console.log(`✅ ${exam.code}: inserted ${examInserted} rows`);
        }

        console.log(`\n🎉 Done! Inserted ${totalInserted} total rows across ${exams.length - totalSkipped} exams (${totalSkipped} skipped)`);

        // 7. Verify
        const verifyRes = await client.query(`SELECT COUNT(*) as cnt FROM examhub.eh_2015_question_category`);
        console.log(`📊 Total rows in table: ${verifyRes.rows[0].cnt}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(() => process.exit(1));
