const pg = require('pg');

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
        console.log('Connected to production DB');

        // Check mogo schema exists
        const schemas = await client.query(
            `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'mogo'`
        );
        console.log('mogo schema exists:', schemas.rows.length > 0);

        // List tables in mogo schema
        const tables = await client.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'mogo' ORDER BY table_name`
        );
        console.log(`Tables in mogo schema: ${tables.rows.length}`);
        tables.rows.forEach(r => console.log(`  - ${r.table_name}`));

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}

main();
