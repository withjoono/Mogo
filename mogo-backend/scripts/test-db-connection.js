
require('dotenv').config();
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
console.log(`Testing connection to: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`); // Hide password in logs

const client = new Client({
    connectionString: databaseUrl,
});

async function testConnection() {
    try {
        await client.connect();
        console.log('Successfully connected to the database!');
        const res = await client.query('SELECT NOW()');
        console.log('Database time:', res.rows[0].now);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection error:', err.message);
        if (err.code) console.error('Error code:', err.code);
        if (err.detail) console.error('Error detail:', err.detail);
        await client.end();
        process.exit(1);
    }
}

testConnection();
