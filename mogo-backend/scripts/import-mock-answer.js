require('dotenv').config();
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
    max: 5,
});

const EXCEL_PATH = path.join(__dirname, '..', '..', 'Uploads', 'SunungMock-Answer-DB.xlsx');

async function importData() {
    console.log('Reading Excel file:', EXCEL_PATH);
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`Found ${data.length} rows`);

    // Get headers for reference
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    console.log('Excel columns:', keys);

    // Map Korean column names
    // 학년, 시험명, 과목, 세부과목, 번호, 정답, 난이도, 배점, 정답률, 선지1, 선지2, 선지3, 선지4, 선지5
    const BATCH_SIZE = 500;
    let imported = 0;

    const client = await pool.connect();

    try {
        // Check current count
        const countRes = await client.query('SELECT COUNT(*) FROM eh_mock_answer');
        const existingCount = parseInt(countRes.rows[0].count);
        if (existingCount > 0) {
            console.log(`Table already has ${existingCount} rows. Skipping import.`);
            return;
        }

        await client.query('BEGIN');

        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            const batch = data.slice(i, i + BATCH_SIZE);
            const values = [];
            const placeholders = [];

            batch.forEach((row, batchIdx) => {
                const cols = Object.values(row);
                const offset = batchIdx * 14;
                placeholders.push(
                    `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11}, $${offset + 12}, $${offset + 13}, $${offset + 14})`
                );
                values.push(
                    String(cols[0] || ''),           // grade (학년)
                    String(cols[1] || ''),           // exam_name (시험명)
                    String(cols[2] || ''),           // subject (과목)
                    String(cols[3] || ''),           // subject_detail (세부과목)
                    cols[4] != null ? parseInt(String(cols[4])) || null : null,  // question_number (번호)
                    cols[5] != null ? parseInt(String(cols[5])) || null : null,  // answer (정답)
                    String(cols[6] || ''),           // difficulty (난이도)
                    cols[7] != null ? parseInt(String(cols[7])) || null : null,  // score (배점)
                    String(cols[8] || ''),           // correct_rate (정답률)
                    String(cols[9] || ''),           // choice_ratio_1 (선지1)
                    String(cols[10] || ''),          // choice_ratio_2 (선지2)
                    String(cols[11] || ''),          // choice_ratio_3 (선지3)
                    String(cols[12] || ''),          // choice_ratio_4 (선지4)
                    String(cols[13] || ''),          // choice_ratio_5 (선지5)
                );
            });

            const query = `
        INSERT INTO eh_mock_answer (grade, exam_name, subject, subject_detail, question_number, answer, difficulty, score, correct_rate, choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5)
        VALUES ${placeholders.join(', ')}
      `;

            await client.query(query, values);
            imported += batch.length;

            if (imported % 5000 === 0 || imported === data.length) {
                console.log(`Imported ${imported}/${data.length} rows...`);
            }
        }

        await client.query('COMMIT');
        console.log(`\nDone! Total imported: ${imported} rows`);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

importData().catch(e => {
    console.error('Import failed:', e.message);
    process.exit(1);
});
