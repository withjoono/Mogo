const { Pool } = require('pg');

const PROD_DB_URL = 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod';

async function main() {
    const pool = new Pool({ connectionString: PROD_DB_URL, max: 5 });

    try {
        // 1. Get unique (grade, exam_name) pairs from eh_mock_answer
        const { rows: exams } = await pool.query(`
      SELECT DISTINCT grade, exam_name 
      FROM examhub.eh_mock_answer 
      WHERE exam_name IS NOT NULL
      ORDER BY exam_name DESC, grade
    `);
        console.log(`Found ${exams.length} unique (grade, exam_name) pairs`);

        let inserted = 0;
        for (const exam of exams) {
            const { grade, exam_name } = exam;

            // Parse exam_name: "2025.11.13 수능" → year=2025, month=11, type=수능
            const match = exam_name.match(/^(\d{4})\.(\d{2})\.\d{2}\s+(.+)$/);
            if (!match) {
                console.log(`  ⚠️ Cannot parse: "${exam_name}"`);
                continue;
            }

            const year = parseInt(match[1]);
            const month = parseInt(match[2]);
            const typeRaw = match[3].trim();

            // Determine type
            let type = '교육청';
            if (typeRaw.includes('수능')) type = '수능';
            else if (typeRaw.includes('평가원')) type = '평가원';

            // Convert grade: 고3 → H3
            const gradeCode = grade.replace('고', 'H');

            // Generate code: H32511 (gradeCode + YY + MM)
            const yy = String(year).slice(2);
            const mm = String(month).padStart(2, '0');
            const code = `${gradeCode}${yy}${mm}`;

            // Build name: "2025년 11월 고3 수능"
            const name = `${year}년 ${month}월 ${grade} ${typeRaw}`;

            console.log(`  ${code} → ${name} (${type})`);

            // Upsert into eh_mock_exams
            await pool.query(`
        INSERT INTO examhub.eh_mock_exams (code, name, grade, year, month, type, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (code) DO UPDATE SET name = $2, grade = $3, year = $4, month = $5, type = $6
      `, [code, name, gradeCode, year, month, type]);
            inserted++;
        }

        console.log(`\n✅ Inserted/updated ${inserted} mock exams`);

        // Verify
        const { rows: result } = await pool.query(`
      SELECT id, code, name, grade, year, month, type 
      FROM examhub.eh_mock_exams 
      ORDER BY year DESC, month DESC, grade
    `);
        console.log(`\n📋 Total mock exams in DB: ${result.length}`);
        result.forEach(r => console.log(`  [${r.code}] ${r.name} (${r.type})`));
    } finally {
        await pool.end();
    }
}

main().catch(e => {
    console.error('❌ Error:', e.message);
    process.exit(1);
});
