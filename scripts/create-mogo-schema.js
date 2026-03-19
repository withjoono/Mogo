const pg = require('pg');

/**
 * Mogo(모의) 앱용 DB 스키마 생성 스크립트
 * 
 * 1. 'mogo' 스키마 생성
 * 2. search_path에 mogo 추가
 * 
 * 테이블은 Prisma가 자동으로 생성합니다 (npx prisma db push)
 */

async function createMogoSchema(dbConfig) {
    const client = new pg.Client(dbConfig);
    
    try {
        await client.connect();
        console.log(`✅ Connected to ${dbConfig.database}`);

        // 1. mogo 스키마 생성
        await client.query(`CREATE SCHEMA IF NOT EXISTS mogo`);
        console.log(`✅ Schema 'mogo' created (or already exists)`);

        // 2. 스키마 확인
        const result = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = 'mogo'
        `);
        console.log(`✅ Schema verified: ${result.rows.length > 0 ? 'mogo exists' : 'NOT FOUND'}`);

        // 3. tsuser에게 mogo 스키마 권한 부여
        await client.query(`GRANT ALL ON SCHEMA mogo TO tsuser`);
        console.log(`✅ Granted ALL privileges on schema 'mogo' to tsuser`);

    } catch (e) {
        console.error(`❌ Error: ${e.message}`);
    } finally {
        await client.end();
    }
}

async function main() {
    // Development DB
    console.log('\\n=== Development DB (geobukschool_dev) ===');
    await createMogoSchema({
        host: '127.0.0.1',
        port: 5432,
        user: 'tsuser',
        password: 'tsuser1234',
        database: 'geobukschool_dev'
    });

    console.log('\\n✅ Done! Now run: cd mogo-backend && npx prisma db push');
}

main();
