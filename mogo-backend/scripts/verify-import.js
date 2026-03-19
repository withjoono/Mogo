const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod',
    });

    try {
        const res = await pool.query(`SELECT exam_name, count(*) as cnt FROM examhub.eh_mock_answer GROUP BY exam_name ORDER BY exam_name`);
        console.log('Exam names distribution:');
        res.rows.forEach(row => console.log(' ', row.exam_name, ':', row.cnt));

        const total = await pool.query(`SELECT count(*) as cnt FROM examhub.eh_mock_answer WHERE exam_name IS NOT NULL`);
        console.log('\nNon-null exam_name count:', total.rows[0].cnt);

        const sample = await pool.query(`SELECT * FROM examhub.eh_mock_answer LIMIT 2`);
        console.log('\nSample:', JSON.stringify(sample.rows, null, 2));
    } finally {
        await pool.end();
    }
}

main().catch(e => console.error('Error:', e.message));
