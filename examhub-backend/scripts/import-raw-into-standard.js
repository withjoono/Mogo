const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../upload');
const DB_URL = 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod';

async function main() {
    const pool = new Pool({ connectionString: DB_URL, max: 3 });

    try {
        await pool.query('SET search_path TO examhub');

        // Find Excel files
        const files = fs.readdirSync(UPLOAD_DIR)
            .filter(f => f.endsWith('_RawIntoStandard.xlsx') && !f.startsWith('~$'));

        if (files.length === 0) {
            console.log('⚠️  No *_RawIntoStandard.xlsx files found in upload/');
            return;
        }
        console.log(`📂 Found ${files.length} file(s): ${files.join(', ')}\n`);

        for (const file of files) {
            const examCode = file.split('_')[0];
            console.log(`${'='.repeat(50)}`);
            console.log(`📊 Processing: ${file} (code: ${examCode})`);

            // Find mock_exam_id
            const examResult = await pool.query(
                'SELECT id, name FROM eh_mock_exams WHERE code = $1',
                [examCode]
            );
            if (examResult.rows.length === 0) {
                console.log(`   ❌ No mock exam found with code '${examCode}'. Skipping.`);
                continue;
            }
            const mockExamId = examResult.rows[0].id;
            console.log(`   ✅ Found: ${examResult.rows[0].name} (id: ${mockExamId})`);

            // Read Excel
            const wb = XLSX.readFile(path.join(UPLOAD_DIR, file));
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            const dataRows = data.slice(1).filter(r => r[0] != null);
            console.log(`   📋 Data rows: ${dataRows.length}`);

            // Delete existing
            const deleted = await pool.query(
                'DELETE FROM eh_2015_score_conversion_raw WHERE mock_exam_id = $1',
                [mockExamId]
            );
            if (deleted.rowCount > 0) {
                console.log(`   🗑️  Deleted ${deleted.rowCount} existing rows`);
            }

            // Batch insert
            const BATCH_SIZE = 200;
            let inserted = 0;

            for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
                const batch = dataRows.slice(i, i + BATCH_SIZE);
                const values = [];
                const params = [];
                let paramIdx = 1;

                for (const row of batch) {
                    const subject = String(row[0] || '').trim();       // 영역 (국어, 수학, ...)
                    const subjectType = String(row[1] || '').trim();   // 과목명 (언어와 매체, ...)
                    const rawScore = parseInt(row[2]);                  // 원점수
                    const standardScore = parseInt(row[3]);             // 표점

                    if (!subject || isNaN(rawScore) || isNaN(standardScore)) continue;

                    values.push(
                        `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
                    );
                    params.push(mockExamId, subject, subjectType || null, rawScore, standardScore);
                }

                if (values.length === 0) continue;

                await pool.query(
                    `INSERT INTO eh_2015_score_conversion_raw 
                     (mock_exam_id, subject, subject_type, common_score, standard_score)
                     VALUES ${values.join(', ')}`,
                    params
                );
                inserted += values.length;
            }

            console.log(`   ✅ Inserted ${inserted} rows`);

            // Verify by subject
            const verify = await pool.query(
                `SELECT subject, subject_type, count(*) as cnt, 
                        min(common_score) as min_raw, max(common_score) as max_raw,
                        min(standard_score) as min_std, max(standard_score) as max_std
                 FROM eh_2015_score_conversion_raw 
                 WHERE mock_exam_id = $1 
                 GROUP BY subject, subject_type 
                 ORDER BY subject, subject_type`,
                [mockExamId]
            );
            console.log('   📊 By subject:');
            verify.rows.forEach(r => {
                console.log(`      ${r.subject} / ${r.subject_type}: ${r.cnt} rows (원점수 ${r.min_raw}~${r.max_raw}, 표점 ${r.min_std}~${r.max_std})`);
            });
        }

        // Total
        const total = await pool.query('SELECT count(*) as cnt FROM eh_2015_score_conversion_raw');
        console.log(`\n✨ Total rows in eh_2015_score_conversion_raw: ${total.rows[0].cnt}`);

    } finally {
        await pool.end();
    }
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
