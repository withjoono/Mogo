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

        // 1. Create table if not exists
        console.log('=== Ensuring table exists ===');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS examhub.eh_2015_cumulative_top_pct (
                id SERIAL PRIMARY KEY,
                mock_exam_id INTEGER NOT NULL REFERENCES examhub.eh_mock_exams(id),
                standard_sum INTEGER NOT NULL,
                top_pct_base DECIMAL(8,4) NOT NULL,
                top_pct_eng_1 DECIMAL(8,4),
                top_pct_eng_2 DECIMAL(8,4),
                top_pct_eng_3 DECIMAL(8,4),
                top_pct_eng_4 DECIMAL(8,4),
                top_pct_eng_5 DECIMAL(8,4),
                top_pct_eng_6 DECIMAL(8,4),
                top_pct_eng_7 DECIMAL(8,4),
                top_pct_eng_8 DECIMAL(8,4),
                top_pct_eng_9 DECIMAL(8,4),
                UNIQUE(mock_exam_id, standard_sum)
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_2015_ctp_mock_exam ON examhub.eh_2015_cumulative_top_pct(mock_exam_id)`);
        console.log('  Table ready.\n');

        // 2. Find Excel files
        const files = fs.readdirSync(UPLOAD_DIR)
            .filter(f => f.endsWith('_CumulativeTopPercentile.xlsx') && !f.startsWith('~$'));

        if (files.length === 0) {
            console.log('⚠️  No *_CumulativeTopPercentile.xlsx files found in upload/');
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
            const dataRows = data.slice(1).filter(r => typeof r[0] === 'number');
            console.log(`   📋 Data rows: ${dataRows.length}`);

            // Delete existing
            const deleted = await pool.query(
                'DELETE FROM eh_2015_cumulative_top_pct WHERE mock_exam_id = $1',
                [mockExamId]
            );
            if (deleted.rowCount > 0) {
                console.log(`   🗑️  Deleted ${deleted.rowCount} existing rows`);
            }

            // Batch insert
            const BATCH_SIZE = 100;
            let inserted = 0;

            for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
                const batch = dataRows.slice(i, i + BATCH_SIZE);
                const values = [];
                const params = [];
                let paramIdx = 1;

                for (const row of batch) {
                    const standardSum = row[0];
                    const topPctBase = row[1];
                    const eng = [];
                    for (let g = 2; g <= 10; g++) {
                        eng.push(row[g] != null ? row[g] : null);
                    }

                    values.push(
                        `($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
                    );
                    params.push(mockExamId, standardSum, topPctBase, ...eng);
                }

                await pool.query(
                    `INSERT INTO eh_2015_cumulative_top_pct 
                     (mock_exam_id, standard_sum, top_pct_base, top_pct_eng_1, top_pct_eng_2, top_pct_eng_3, top_pct_eng_4, top_pct_eng_5, top_pct_eng_6, top_pct_eng_7, top_pct_eng_8, top_pct_eng_9)
                     VALUES ${values.join(', ')}`,
                    params
                );
                inserted += batch.length;
            }

            console.log(`   ✅ Inserted ${inserted} rows`);

            // Verify
            const verify = await pool.query(
                `SELECT min(standard_sum) as min_sum, max(standard_sum) as max_sum, count(*) as cnt
                 FROM eh_2015_cumulative_top_pct WHERE mock_exam_id = $1`,
                [mockExamId]
            );
            const v = verify.rows[0];
            console.log(`   📊 Verified: ${v.cnt} rows, 표점합 ${v.min_sum}~${v.max_sum}`);

            // Sample lookup
            const sample = await pool.query(
                `SELECT standard_sum, top_pct_base, top_pct_eng_1, top_pct_eng_2, top_pct_eng_3
                 FROM eh_2015_cumulative_top_pct 
                 WHERE mock_exam_id = $1 ORDER BY standard_sum DESC LIMIT 3`,
                [mockExamId]
            );
            console.log('   📋 Top 3 rows:', JSON.stringify(sample.rows));
        }

        // Total
        const total = await pool.query('SELECT count(*) as cnt FROM eh_2015_cumulative_top_pct');
        console.log(`\n✨ Total rows in eh_2015_cumulative_top_pct: ${total.rows[0].cnt}`);

    } finally {
        await pool.end();
    }
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
