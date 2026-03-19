require('dotenv').config();
const { Client } = require('pg');

const c = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'tsuser',
    password: process.env.DB_PASSWORD || 'tsuser1234',
    database: process.env.DB_NAME || 'geobukschool_dev',
});

async function createTable() {
    await c.connect();
    console.log('Connected OK');

    // Check if table already exists
    const check = await c.query(
        "SELECT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='eh_mock_answer')"
    );

    if (check.rows[0].exists) {
        console.log('Table eh_mock_answer already exists!');
        await c.end();
        return;
    }

    // Create the table
    await c.query(`
    CREATE TABLE eh_mock_answer (
      id SERIAL PRIMARY KEY,
      grade VARCHAR(10),
      exam_name VARCHAR(100),
      subject VARCHAR(50),
      subject_detail VARCHAR(50),
      question_number INTEGER,
      answer INTEGER,
      difficulty VARCHAR(10),
      score INTEGER,
      correct_rate VARCHAR(10),
      choice_ratio_1 VARCHAR(10),
      choice_ratio_2 VARCHAR(10),
      choice_ratio_3 VARCHAR(10),
      choice_ratio_4 VARCHAR(10),
      choice_ratio_5 VARCHAR(10)
    );
  `);
    console.log('Table eh_mock_answer created!');

    // Create indexes
    await c.query('CREATE INDEX idx_eh_mock_answer_grade_exam ON eh_mock_answer(grade, exam_name)');
    await c.query('CREATE INDEX idx_eh_mock_answer_subject ON eh_mock_answer(subject, subject_detail)');
    console.log('Indexes created!');

    await c.end();
    console.log('Done!');
}

createTable().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
