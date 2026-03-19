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
    console.log('Updating difficulty...');

    // Auto-convert correct_rate → 9-level difficulty
    // 정답률 낮을수록 어려운 문제 → 상상(최고난이도)
    // 정답률 높을수록 쉬운 문제 → 하하(최저난이도)
    const result = await c.query(`
        UPDATE eh_exam_questions SET difficulty = 
          CASE 
            WHEN correct_rate IS NULL THEN NULL
            WHEN correct_rate < 11.2  THEN '상상'
            WHEN correct_rate < 22.3  THEN '상중'
            WHEN correct_rate < 33.4  THEN '상하'
            WHEN correct_rate < 44.5  THEN '중상'
            WHEN correct_rate < 55.6  THEN '중중'
            WHEN correct_rate < 66.7  THEN '중하'
            WHEN correct_rate < 77.8  THEN '하상'
            WHEN correct_rate < 88.9  THEN '하중'
            ELSE '하하'
          END
    `);
    console.log(`  Updated ${result.rowCount} rows`);

    // Verify
    const r = await c.query(`
        SELECT difficulty, COUNT(*) as cnt 
        FROM eh_exam_questions 
        GROUP BY difficulty 
        ORDER BY 
          CASE difficulty 
            WHEN '상상' THEN 1 WHEN '상중' THEN 2 WHEN '상하' THEN 3
            WHEN '중상' THEN 4 WHEN '중중' THEN 5 WHEN '중하' THEN 6
            WHEN '하상' THEN 7 WHEN '하중' THEN 8 WHEN '하하' THEN 9
          END
    `);
    console.log('\nDifficulty distribution:');
    r.rows.forEach(row => console.log(`  ${row.difficulty}: ${row.cnt} questions`));

    await c.end();
    console.log('\n✅ Done!');
})().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
