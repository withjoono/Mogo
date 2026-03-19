const pg = require('pg');

/**
 * 프로덕션 DB에 mogo 스키마 생성
 * Cloud SQL Proxy가 포트 5434에서 실행 중이어야 합니다.
 */
async function main() {
    const client = new pg.Client({
        host: '127.0.0.1',
        port: 5434,
        user: 'tsuser',
        password: 'tsuser1234',
        database: 'geobukschool_prod'
    });

    try {
        await client.connect();
        console.log('✅ Connected to geobukschool_prod (production)');

        await client.query('CREATE SCHEMA IF NOT EXISTS mogo');
        console.log('✅ Schema "mogo" created (or already exists)');

        const result = await client.query(`
            SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'mogo'
        `);
        console.log(`✅ Schema verified: ${result.rows.length > 0 ? 'mogo exists' : 'NOT FOUND'}`);

        await client.query('GRANT ALL ON SCHEMA mogo TO tsuser');
        console.log('✅ Granted ALL privileges on schema "mogo" to tsuser');

    } catch (e) {
        console.error(`❌ Error: ${e.message}`);
    } finally {
        await client.end();
    }
}

main();
