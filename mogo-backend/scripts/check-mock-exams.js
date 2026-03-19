const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod',
        max: 2,
    });

    try {
        await pool.query('SET search_path TO examhub');

        // 1. MockExam 전체 목록
        const exams = await pool.query(
            'SELECT id, code, name, grade, year, month, type FROM eh_mock_exams ORDER BY id'
        );
        console.log('=== eh_mock_exams ===');
        console.log(JSON.stringify(exams.rows, null, 2));

        // 2. ScoreConversionStandard 데이터 현황
        const scs = await pool.query(
            'SELECT mock_exam_id, count(*) as cnt FROM eh_score_conversion_standard GROUP BY mock_exam_id ORDER BY mock_exam_id'
        );
        console.log('\n=== eh_score_conversion_standard by mock_exam_id ===');
        console.log(JSON.stringify(scs.rows, null, 2));

        // 3. ScoreConversionStandard 샘플 데이터
        const sample = await pool.query(
            'SELECT * FROM eh_score_conversion_standard LIMIT 5'
        );
        console.log('\n=== ScoreConversionStandard sample ===');
        console.log(JSON.stringify(sample.rows, null, 2));

    } finally {
        await pool.end();
    }
}

main().catch(e => { console.error(e.message); process.exit(1); });
