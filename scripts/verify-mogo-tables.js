const pg = require('pg');
const c = new pg.Client({
    host: '127.0.0.1', port: 5432, user: 'tsuser',
    password: 'tsuser1234', database: 'geobukschool_dev'
});

c.connect()
    .then(() => c.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='mogo' ORDER BY table_name`))
    .then(r => {
        console.log(`\nTables in mogo schema (${r.rows.length}):`);
        r.rows.forEach(row => console.log(`  - ${row.table_name}`));
    })
    .catch(e => console.error('Error:', e.message))
    .finally(() => c.end());
