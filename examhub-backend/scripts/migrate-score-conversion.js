const { Pool } = require('pg');

async function main() {
    const pool = new Pool({
        connectionString: 'postgresql://tsuser:tsuser1234@34.64.165.158:5432/geobukschool_prod',
        max: 2,
    });

    try {
        await pool.query('SET search_path TO examhub');

        console.log('=== Creating 2015/2022 Score Conversion Tables ===\n');

        // 1. Rename existing tables (both are empty, safe to rename)
        console.log('1. Renaming eh_score_conversion_standard -> eh_2015_score_conversion_standard...');
        await pool.query(`ALTER TABLE IF EXISTS examhub.eh_score_conversion_standard RENAME TO eh_2015_score_conversion_standard`);
        console.log('   Done.');

        console.log('2. Renaming eh_score_conversion_raw -> eh_2015_score_conversion_raw...');
        await pool.query(`ALTER TABLE IF EXISTS examhub.eh_score_conversion_raw RENAME TO eh_2015_score_conversion_raw`);
        console.log('   Done.');

        // 2. Create 2022 tables (mirroring 2015 structure)
        console.log('3. Creating eh_2022_score_conversion_standard...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS examhub.eh_2022_score_conversion_standard (
                id SERIAL PRIMARY KEY,
                mock_exam_id INTEGER NOT NULL REFERENCES examhub.eh_mock_exams(id),
                subject VARCHAR(50) NOT NULL,
                standard_score INTEGER NOT NULL,
                percentile DECIMAL(6,2),
                grade INTEGER,
                cumulative_pct DECIMAL(10,6)
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_2022_scs_mock_exam ON examhub.eh_2022_score_conversion_standard(mock_exam_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_2022_scs_subject_score ON examhub.eh_2022_score_conversion_standard(subject, standard_score)`);
        console.log('   Done.');

        console.log('4. Creating eh_2022_score_conversion_raw...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS examhub.eh_2022_score_conversion_raw (
                id SERIAL PRIMARY KEY,
                mock_exam_id INTEGER NOT NULL REFERENCES examhub.eh_mock_exams(id),
                subject VARCHAR(50) NOT NULL,
                subject_type VARCHAR(50),
                common_score INTEGER,
                selection_score INTEGER,
                standard_score INTEGER
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_2022_scr_mock_exam ON examhub.eh_2022_score_conversion_raw(mock_exam_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_2022_scr_subject_type ON examhub.eh_2022_score_conversion_raw(subject, subject_type)`);
        console.log('   Done.');

        // 3. Verify
        console.log('\n=== Verification ===');
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'examhub' 
            AND table_name LIKE '%score_conversion%'
            ORDER BY table_name
        `);
        console.log('Score conversion tables:');
        tables.rows.forEach(r => console.log('  -', r.table_name));

    } finally {
        await pool.end();
    }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
