const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../upload');
const DB_URL = 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod';

async function main() {
    // 1. Find all *_Standard_Percen_Grade.xlsx files
    const files = fs.readdirSync(UPLOAD_DIR)
        .filter(f => f.endsWith('_Standard_Percen_Grade.xlsx'));

    if (files.length === 0) {
        console.log('⚠️  No *_Standard_Percen_Grade.xlsx files found in upload/');
        return;
    }

    console.log(`📂 Found ${files.length} file(s):`);
    files.forEach(f => console.log(`   - ${f}`));

    const pool = new Pool({ connectionString: DB_URL, max: 3 });

    try {
        await pool.query('SET search_path TO examhub');

        for (const file of files) {
            const examCode = file.split('_')[0]; // e.g. H32505
            console.log(`\n${'='.repeat(50)}`);
            console.log(`📊 Processing: ${file} (code: ${examCode})`);

            // Find mock_exam_id from code
            const examResult = await pool.query(
                'SELECT id, name FROM eh_mock_exams WHERE code = $1',
                [examCode]
            );

            if (examResult.rows.length === 0) {
                console.log(`   ❌ No mock exam found with code '${examCode}'. Skipping.`);
                continue;
            }

            const mockExamId = examResult.rows[0].id;
            const mockExamName = examResult.rows[0].name;
            console.log(`   ✅ Found: ${mockExamName} (id: ${mockExamId})`);

            // Read Excel
            const wb = XLSX.readFile(path.join(UPLOAD_DIR, file));
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws);

            console.log(`   📋 Rows: ${rows.length}`);

            // Delete existing data for this exam
            const deleted = await pool.query(
                'DELETE FROM eh_2015_score_conversion_standard WHERE mock_exam_id = $1',
                [mockExamId]
            );
            if (deleted.rowCount > 0) {
                console.log(`   🗑️  Deleted ${deleted.rowCount} existing rows`);
            }

            // Batch insert
            const BATCH_SIZE = 200;
            let inserted = 0;

            for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                const batch = rows.slice(i, i + BATCH_SIZE);
                const values = [];
                const params = [];
                let paramIdx = 1;

                for (const row of batch) {
                    const subject = String(row['과목'] || '').trim();
                    const standardScore = parseInt(row['표점']);
                    const percentile = parseInt(row['백분위']);
                    const grade = parseInt(row['등급']);

                    if (!subject || isNaN(standardScore) || isNaN(grade)) {
                        continue;
                    }

                    values.push(
                        `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
                    );
                    params.push(mockExamId, subject, standardScore, isNaN(percentile) ? null : percentile, grade);
                }

                if (values.length === 0) continue;

                await pool.query(
                    `INSERT INTO eh_2015_score_conversion_standard 
                     (mock_exam_id, subject, standard_score, percentile, grade)
                     VALUES ${values.join(', ')}`,
                    params
                );
                inserted += values.length;
            }

            console.log(`   ✅ Inserted ${inserted} rows`);

            // Verify by subject
            const verify = await pool.query(
                `SELECT subject, count(*) as cnt, min(standard_score) as min_score, max(standard_score) as max_score
                 FROM eh_2015_score_conversion_standard 
                 WHERE mock_exam_id = $1 
                 GROUP BY subject ORDER BY subject`,
                [mockExamId]
            );
            console.log('   📊 By subject:');
            verify.rows.forEach(r => {
                console.log(`      ${r.subject}: ${r.cnt} rows (표점 ${r.min_score}~${r.max_score})`);
            });
        }

        // Final total count
        const total = await pool.query('SELECT count(*) as cnt FROM eh_2015_score_conversion_standard');
        console.log(`\n${'='.repeat(50)}`);
        console.log(`✨ Total rows in eh_2015_score_conversion_standard: ${total.rows[0].cnt}`);

    } finally {
        await pool.end();
    }
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
