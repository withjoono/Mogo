const { Pool } = require('pg');
const DB_URL = 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod';
async function main() {
    const pool = new Pool({ connectionString: DB_URL, max: 3 });
    try {
        await pool.query('SET search_path TO examhub');
        const res = await pool.query(`
            SELECT DISTINCT subject FROM eh_score_conversion_standard 
            WHERE mock_exam_id = 11 ORDER BY subject
        `);
        console.log('Subjects for mockExamId=11:');
        res.rows.forEach(r => console.log('  ', JSON.stringify(r.subject)));

        // Check a sample
        const sample = await pool.query(`
            SELECT subject, standard_score, percentile, grade 
            FROM eh_score_conversion_standard 
            WHERE mock_exam_id = 11 AND subject = '국어'
            ORDER BY standard_score DESC LIMIT 3
        `);
        console.log('\nSample 국어:', sample.rows);

        const sample2 = await pool.query(`
            SELECT subject, standard_score, percentile, grade 
            FROM eh_score_conversion_standard 
            WHERE mock_exam_id = 11 AND subject = '화법과작문'
            ORDER BY standard_score DESC LIMIT 3
        `);
        console.log('Sample 화법과작문:', sample2.rows);
    } finally { await pool.end(); }
}
main().catch(console.error);
