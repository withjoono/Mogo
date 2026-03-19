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

    // Total count
    let r = await c.query('SELECT COUNT(*) FROM eh_mock_answer');
    console.log('Total rows:', r.rows[0].count);

    // Sample data
    r = await c.query('SELECT * FROM eh_mock_answer LIMIT 5');
    console.log('\nSample rows:');
    r.rows.forEach(row => console.log(row));

    // Distinct grades
    r = await c.query('SELECT DISTINCT grade FROM eh_mock_answer ORDER BY grade');
    console.log('\nDistinct grades:', r.rows.map(x => x.grade));

    // Distinct exam names
    r = await c.query('SELECT DISTINCT exam_name FROM eh_mock_answer ORDER BY exam_name');
    console.log('\nDistinct exam names:', r.rows.map(x => x.exam_name));

    // Count by grade
    r = await c.query('SELECT grade, COUNT(*) as cnt FROM eh_mock_answer GROUP BY grade ORDER BY grade');
    console.log('\nCount by grade:');
    r.rows.forEach(row => console.log(`  ${row.grade}: ${row.cnt}`));

    await c.end();
})().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
