const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../../Uploads/SunungMock-Answer-DB.xlsx');
const PROD_DB_URL = 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod';

async function main() {
    console.log('📂 Reading Excel file:', EXCEL_PATH);
    const wb = XLSX.readFile(EXCEL_PATH);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);
    console.log(`📊 Total rows: ${rows.length}`);

    const pool = new Pool({
        connectionString: PROD_DB_URL,
        max: 5,
    });

    try {
        // Set search_path to examhub
        await pool.query(`SET search_path TO examhub`);

        // Check existing data
        const existing = await pool.query(`SELECT count(*) as cnt FROM examhub.eh_mock_answer`);
        console.log(`📋 Existing rows in eh_mock_answer: ${existing.rows[0].cnt}`);

        if (parseInt(existing.rows[0].cnt) > 0) {
            console.log('⚠️  Data already exists. Truncating...');
            await pool.query(`TRUNCATE TABLE examhub.eh_mock_answer RESTART IDENTITY`);
        }

        // Batch insert
        const BATCH_SIZE = 500;
        let inserted = 0;

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);
            const values = [];
            const params = [];
            let paramIdx = 1;

            for (const row of batch) {
                const grade = String(row['학년'] || '').trim() || null;
                const examName = String(row['시험명'] || '').trim() || null;
                const subject = String(row['과목'] || '').trim() || null;
                const subjectDetail = String(row['세부과목'] || '').trim() || null;
                const questionNumber = parseInt(row['번호']) || null;
                const answer = parseInt(row['정답']) || null;
                const difficulty = String(row['난이도'] || '').trim() || null;
                const score = parseInt(row['배점']) || null;
                const correctRate = String(row['정답률'] || '').trim() || null;
                const choiceRatio1 = String(row['선지1'] || '').trim() || null;
                const choiceRatio2 = String(row['선지2'] || '').trim() || null;
                const choiceRatio3 = String(row['선지3'] || '').trim() || null;
                const choiceRatio4 = String(row['선지4'] || '').trim() || null;
                const choiceRatio5 = String(row['선지5'] || '').trim() || null;

                values.push(
                    `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
                );
                params.push(
                    grade, examName, subject, subjectDetail,
                    questionNumber, answer, difficulty, score,
                    correctRate, choiceRatio1, choiceRatio2,
                    choiceRatio3, choiceRatio4, choiceRatio5
                );
            }

            const sql = `
        INSERT INTO examhub.eh_mock_answer 
          (grade, exam_name, subject, subject_detail, question_number, answer, difficulty, score, correct_rate, choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5)
        VALUES ${values.join(', ')}
      `;

            await pool.query(sql, params);
            inserted += batch.length;

            if (inserted % 5000 === 0 || inserted === rows.length) {
                console.log(`  ✅ Inserted ${inserted}/${rows.length} rows`);
            }
        }

        // Verify
        const finalCount = await pool.query(`SELECT count(*) as cnt FROM examhub.eh_mock_answer`);
        console.log(`\n✨ Import completed! Total rows: ${finalCount.rows[0].cnt}`);

        // Show sample
        const sample = await pool.query(`SELECT * FROM examhub.eh_mock_answer LIMIT 3`);
        console.log('Sample data:', JSON.stringify(sample.rows, null, 2));
    } finally {
        await pool.end();
    }
}

main().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
