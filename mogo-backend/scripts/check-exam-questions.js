require('dotenv').config();
const { Client } = require('pg');

const c = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
});

(async () => {
    await c.connect();

    // Check what subjects exist for mockExamId=38
    let r = await c.query(`
        SELECT DISTINCT subject_area_name, subject_name 
        FROM eh_exam_questions 
        WHERE mock_exam_id = 38 
        ORDER BY subject_area_name, subject_name
    `);
    console.log('mockExamId=38 subjects:');
    r.rows.forEach(row => console.log(`  area="${row.subject_area_name}" name="${row.subject_name}"`));

    // Count per subject
    r = await c.query(`
        SELECT subject_area_name, subject_name, COUNT(*) as cnt
        FROM eh_exam_questions 
        WHERE mock_exam_id = 38 
        GROUP BY subject_area_name, subject_name
        ORDER BY subject_area_name, subject_name
    `);
    console.log('\nCount by subject:');
    r.rows.forEach(row => console.log(`  ${row.subject_area_name} / ${row.subject_name}: ${row.cnt} questions`));

    // Also check what the mock exam 38 looks like
    r = await c.query('SELECT * FROM eh_mock_exams WHERE id = 38');
    console.log('\nmockExam 38:', r.rows[0]);

    await c.end();
})().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
