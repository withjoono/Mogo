const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../../Uploads/SunungMock-Answer-DB.xlsx');

async function main() {
    // 1. Read Excel file
    console.log('=== Excel File Analysis ===');
    const wb = XLSX.readFile(EXCEL_PATH);
    console.log('Sheet names:', wb.SheetNames);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    console.log('Total rows:', data.length);
    console.log('Headers:', JSON.stringify(data[0]));
    console.log('Row 1:', JSON.stringify(data[1]));
    console.log('Row 2:', JSON.stringify(data[2]));
    console.log('Row 3:', JSON.stringify(data[3]));

    // 2. Check production DB
    console.log('\n=== Production DB Check ===');
    const pool = new Pool({
        connectionString: 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod',
    });

    try {
        const tables = await pool.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'examhub' ORDER BY table_name`
        );
        console.log('Tables in examhub schema:');
        tables.rows.forEach(row => console.log(' ', row.table_name));

        // Check eh_mock_answer
        try {
            const count = await pool.query(`SELECT count(*) as cnt FROM examhub.eh_mock_answer`);
            console.log('\neh_mock_answer count:', count.rows[0].cnt);
            if (parseInt(count.rows[0].cnt) > 0) {
                const sample = await pool.query(`SELECT * FROM examhub.eh_mock_answer LIMIT 3`);
                console.log('Sample data:', JSON.stringify(sample.rows, null, 2));
            }
        } catch (e) {
            console.log('\neh_mock_answer table does not exist or error:', e.message);
        }

        // Check eh_mock_exams
        try {
            const count = await pool.query(`SELECT count(*) as cnt FROM examhub.eh_mock_exams`);
            console.log('\neh_mock_exams count:', count.rows[0].cnt);
        } catch (e) {
            console.log('\neh_mock_exams error:', e.message);
        }

        // Check eh_exam_questions
        try {
            const count = await pool.query(`SELECT count(*) as cnt FROM examhub.eh_exam_questions`);
            console.log('eh_exam_questions count:', count.rows[0].cnt);
        } catch (e) {
            console.log('eh_exam_questions error:', e.message);
        }
    } finally {
        await pool.end();
    }
}

main().catch(e => console.error('Error:', e.message));
