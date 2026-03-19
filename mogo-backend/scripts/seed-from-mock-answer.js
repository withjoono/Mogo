require('dotenv').config();
const { Client } = require('pg');

const c = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'tsuser',
  password: process.env.DB_PASSWORD || 'tsuser1234',
  database: process.env.DB_NAME || 'geobukschool_dev',
});

// Helper: parse exam_name like "2025.11.13 수능" → { year: 2025, month: 11 }
function parseExamName(examName) {
  const match = examName.match(/^(\d{4})\.(\d{2})\.\d{2}\s+(.+)$/);
  if (match) {
    return { year: parseInt(match[1]), month: parseInt(match[2]), type: match[3] };
  }
  return { year: null, month: null, type: examName };
}

// Helper: grade Korean → code ("고3" → "H3", "고1" → "H1")
function gradeToCode(grade) {
  const map = { '고1': 'H1', '고2': 'H2', '고3': 'H3' };
  return map[grade] || grade;
}

// Helper: subject Korean → area code
function subjectToAreaCode(subject) {
  const map = {
    '국어': 'KOR', '수학': 'MATH', '영어': 'ENG',
    '한국사': 'HIST', '사회탐구': 'SOC', '과학탐구': 'SCI',
    '제2외국어': 'FOR', '통합사회': 'SOC_INT', '통합과학': 'SCI_INT',
  };
  return map[subject] || subject;
}

async function seed() {
  await c.connect();
  console.log('Connected OK');

  // ========== 1. Create tables ==========
  console.log('\n=== Creating tables ===');

  // eh_students
  await c.query(`
    CREATE TABLE IF NOT EXISTS eh_students (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(20) UNIQUE NOT NULL,
      year INTEGER NOT NULL,
      school_level VARCHAR(10),
      school_name VARCHAR(100),
      grade VARCHAR(10),
      name VARCHAR(50) NOT NULL,
      school_type VARCHAR(20),
      phone VARCHAR(20),
      parent_phone VARCHAR(20),
      email VARCHAR(100),
      parent_email VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('  ✓ eh_students');

  // eh_mock_exams
  await c.query(`
    CREATE TABLE IF NOT EXISTS eh_mock_exams (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      grade VARCHAR(10),
      year INTEGER,
      month INTEGER,
      type VARCHAR(20),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('  ✓ eh_mock_exams');

  // eh_subject_chapters
  await c.query(`
    CREATE TABLE IF NOT EXISTS eh_subject_chapters (
      id SERIAL PRIMARY KEY,
      subject_area_code VARCHAR(10),
      subject_code VARCHAR(10),
      major_name VARCHAR(100),
      major_code VARCHAR(10),
      minor_name VARCHAR(200),
      minor_code VARCHAR(10)
    );
  `);
  console.log('  ✓ eh_subject_chapters');

  // eh_exam_questions
  await c.query(`
    CREATE TABLE IF NOT EXISTS eh_exam_questions (
      id SERIAL PRIMARY KEY,
      mock_exam_id INTEGER REFERENCES eh_mock_exams(id),
      subject_area_code VARCHAR(10),
      subject_area_name VARCHAR(50),
      subject_code VARCHAR(10),
      subject_name VARCHAR(50),
      question_number INTEGER NOT NULL,
      score INTEGER NOT NULL DEFAULT 2,
      answer INTEGER NOT NULL,
      choice_ratio_1 DECIMAL(5,2),
      choice_ratio_2 DECIMAL(5,2),
      choice_ratio_3 DECIMAL(5,2),
      choice_ratio_4 DECIMAL(5,2),
      choice_ratio_5 DECIMAL(5,2),
      correct_rate DECIMAL(5,2),
      difficulty VARCHAR(10)
    );
  `);
  await c.query('CREATE INDEX IF NOT EXISTS idx_eq_mock_exam_id ON eh_exam_questions(mock_exam_id)');
  await c.query('CREATE INDEX IF NOT EXISTS idx_eq_subject ON eh_exam_questions(subject_area_code, subject_code)');
  console.log('  ✓ eh_exam_questions');

  // eh_student_scores
  await c.query(`
    CREATE TABLE IF NOT EXISTS eh_student_scores (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES eh_students(id),
      mock_exam_id INTEGER REFERENCES eh_mock_exams(id),
      korean_selection VARCHAR(20),
      korean_raw INTEGER,
      korean_standard INTEGER,
      korean_percentile DECIMAL(5,2),
      korean_grade INTEGER,
      english_raw INTEGER,
      english_grade INTEGER,
      math_selection VARCHAR(20),
      math_raw INTEGER,
      math_standard INTEGER,
      math_percentile DECIMAL(5,2),
      math_grade INTEGER,
      inquiry1_selection VARCHAR(50),
      inquiry1_raw INTEGER,
      inquiry1_standard INTEGER,
      inquiry1_percentile DECIMAL(5,2),
      inquiry1_grade INTEGER,
      inquiry2_selection VARCHAR(50),
      inquiry2_raw INTEGER,
      inquiry2_standard INTEGER,
      inquiry2_percentile DECIMAL(5,2),
      inquiry2_grade INTEGER,
      history_raw INTEGER,
      history_grade INTEGER,
      foreign_selection VARCHAR(50),
      foreign_raw INTEGER,
      foreign_grade INTEGER,
      total_standard_sum INTEGER,
      total_percentile_sum DECIMAL(6,2),
      top_cumulative_std DECIMAL(6,2),
      top_cumulative_raw DECIMAL(6,2),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(student_id, mock_exam_id)
    );
  `);
  console.log('  ✓ eh_student_scores');

  // eh_student_answers
  await c.query(`
    CREATE TABLE IF NOT EXISTS eh_student_answers (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES eh_students(id),
      mock_exam_id INTEGER REFERENCES eh_mock_exams(id),
      exam_question_id INTEGER REFERENCES eh_exam_questions(id),
      subject_area_name VARCHAR(50),
      subject_name VARCHAR(50),
      question_number INTEGER,
      selected_answer INTEGER,
      correct_answer INTEGER,
      is_correct BOOLEAN DEFAULT false,
      score INTEGER DEFAULT 2,
      earned_score INTEGER DEFAULT 0,
      wrong_reason TEXT,
      is_bookmarked BOOLEAN DEFAULT false,
      review_count INTEGER DEFAULT 0,
      last_reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(student_id, exam_question_id)
    );
  `);
  await c.query('CREATE INDEX IF NOT EXISTS idx_sa_student ON eh_student_answers(student_id)');
  await c.query('CREATE INDEX IF NOT EXISTS idx_sa_mock_exam ON eh_student_answers(mock_exam_id)');
  await c.query('CREATE INDEX IF NOT EXISTS idx_sa_subject ON eh_student_answers(student_id, subject_area_name)');
  console.log('  ✓ eh_student_answers');

  // Additional tables for complete schema
  await c.query(`
    CREATE TABLE IF NOT EXISTS eh_student_targets (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES eh_students(id),
      department_code VARCHAR(20),
      priority INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('  ✓ eh_student_targets');

  // ========== 2. Seed test student ==========
  console.log('\n=== Seeding test student ===');
  const existingStudent = await c.query("SELECT id FROM eh_students WHERE student_id = 'test001'");
  let studentId;
  if (existingStudent.rows.length === 0) {
    const r = await c.query(
      "INSERT INTO eh_students (student_id, year, grade, name) VALUES ('test001', 2025, '고3', '테스트학생') RETURNING id"
    );
    studentId = r.rows[0].id;
    console.log('  ✓ Created test student ID:', studentId);
  } else {
    studentId = existingStudent.rows[0].id;
    console.log('  ✓ Test student already exists, ID:', studentId);
  }

  // ========== 4. Seed mock exams from eh_mock_answer ==========
  console.log('\n=== Seeding mock exams ===');
  const distinctExams = await c.query(
    "SELECT DISTINCT grade, exam_name FROM eh_mock_answer ORDER BY exam_name"
  );
  console.log(`  Found ${distinctExams.rows.length} distinct grade+exam combos`);

  const mockExamMap = new Map(); // key: "grade|exam_name" → mockExamId

  for (const row of distinctExams.rows) {
    const { year, month, type } = parseExamName(row.exam_name);
    const gradeCode = gradeToCode(row.grade);
    const code = `${gradeCode}-${year}-${String(month).padStart(2, '0')}`;

    const existing = await c.query("SELECT id FROM eh_mock_exams WHERE code = $1", [code]);
    let examId;
    if (existing.rows.length === 0) {
      const r = await c.query(
        `INSERT INTO eh_mock_exams (code, name, grade, year, month, type)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [code, row.exam_name, gradeCode, year, month, type]
      );
      examId = r.rows[0].id;
    } else {
      examId = existing.rows[0].id;
    }
    mockExamMap.set(`${row.grade}|${row.exam_name}`, examId);
  }
  console.log(`  ✓ ${mockExamMap.size} mock exams seeded`);

  // ========== 5. Seed exam questions from eh_mock_answer ==========
  console.log('\n=== Seeding exam questions ===');

  // Check if already seeded
  const eqCount = await c.query("SELECT COUNT(*) FROM eh_exam_questions");
  if (parseInt(eqCount.rows[0].count) > 0) {
    console.log(`  ✓ Already seeded (${eqCount.rows[0].count} rows). Skipping.`);
  } else {
    // Load all mock_answer data
    const allAnswers = await c.query(
      "SELECT grade, exam_name, subject, subject_detail, question_number, answer, difficulty, score, correct_rate, choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5 FROM eh_mock_answer ORDER BY id"
    );
    console.log(`  Processing ${allAnswers.rows.length} rows...`);

    const BATCH = 500;
    let inserted = 0;

    await c.query('BEGIN');
    try {
      for (let i = 0; i < allAnswers.rows.length; i += BATCH) {
        const batch = allAnswers.rows.slice(i, i + BATCH);
        const values = [];
        const placeholders = [];

        batch.forEach((row, batchIdx) => {
          const mockExamId = mockExamMap.get(`${row.grade}|${row.exam_name}`);
          if (!mockExamId) return;

          const areaCode = subjectToAreaCode(row.subject);
          const offset = batchIdx * 14;

          // Parse correct_rate: "90%" → 90.00
          let cr = null;
          if (row.correct_rate) {
            const parsed = parseFloat(row.correct_rate.replace('%', ''));
            if (!isNaN(parsed)) cr = parsed;
          }

          // Parse choice ratios: "1%" → 1.00
          const parseRatio = (r) => {
            if (!r) return null;
            const p = parseFloat(r.replace('%', ''));
            return isNaN(p) ? null : p;
          };

          placeholders.push(
            `($${offset + 1},$${offset + 2},$${offset + 3},$${offset + 4},$${offset + 5},$${offset + 6},$${offset + 7},$${offset + 8},$${offset + 9},$${offset + 10},$${offset + 11},$${offset + 12},$${offset + 13},$${offset + 14})`
          );
          values.push(
            mockExamId,
            areaCode,
            row.subject,
            null, // subject_code (세부과목 코드는 별도 매핑 필요)
            row.subject_detail || null,
            row.question_number,
            row.score || 2,
            row.answer,
            parseRatio(row.choice_ratio_1),
            parseRatio(row.choice_ratio_2),
            parseRatio(row.choice_ratio_3),
            parseRatio(row.choice_ratio_4),
            parseRatio(row.choice_ratio_5),
            cr
          );
        });

        if (placeholders.length > 0) {
          await c.query(
            `INSERT INTO eh_exam_questions (mock_exam_id, subject_area_code, subject_area_name, subject_code, subject_name, question_number, score, answer, choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5, correct_rate)
             VALUES ${placeholders.join(', ')}`,
            values
          );
        }

        inserted += batch.length;
        if (inserted % 5000 === 0 || inserted === allAnswers.rows.length) {
          console.log(`  Inserted ${inserted}/${allAnswers.rows.length} questions...`);
        }
      }
      await c.query('COMMIT');
      console.log(`  ✓ ${inserted} exam questions seeded`);
    } catch (e) {
      await c.query('ROLLBACK');
      throw e;
    }
  }

  // Auto-convert correct_rate to 9-level difficulty (상상~하하)
  // 정답률이 낮을수록 어려운 문제 → 상상(최상난이도)
  // 정답률이 높을수록 쉬운 문제 → 하하(최하난이도)
  console.log('\n=== Auto-converting correct_rate → 9-level difficulty ===');
  await c.query(`
    UPDATE eh_exam_questions SET difficulty = 
      CASE 
        WHEN correct_rate IS NULL THEN NULL
        WHEN correct_rate < 11.2  THEN '상상'
        WHEN correct_rate < 22.3  THEN '상중'
        WHEN correct_rate < 33.4  THEN '상하'
        WHEN correct_rate < 44.5  THEN '중상'
        WHEN correct_rate < 55.6  THEN '중중'
        WHEN correct_rate < 66.7  THEN '중하'
        WHEN correct_rate < 77.8  THEN '하상'
        WHEN correct_rate < 88.9  THEN '하중'
        ELSE '하하'
      END
  `);
  console.log('  ✓ Difficulty updated (9-level: 상상~하하)');

  // ========== 6. Verification ==========
  console.log('\n=== Verification ===');

  let r = await c.query('SELECT COUNT(*) FROM eh_students');
  console.log('  eh_students:', r.rows[0].count);

  r = await c.query('SELECT COUNT(*) FROM eh_mock_exams');
  console.log('  eh_mock_exams:', r.rows[0].count);

  r = await c.query('SELECT COUNT(*) FROM eh_exam_questions');
  console.log('  eh_exam_questions:', r.rows[0].count);

  r = await c.query('SELECT COUNT(*) FROM eh_student_answers');
  console.log('  eh_student_answers:', r.rows[0].count);

  r = await c.query('SELECT COUNT(*) FROM eh_student_scores');
  console.log('  eh_student_scores:', r.rows[0].count);

  // Sample mock exam
  r = await c.query('SELECT id, code, name, grade, year, month FROM eh_mock_exams LIMIT 5');
  console.log('\n  Sample mock exams:');
  r.rows.forEach(row => console.log(`    ${row.id}: ${row.code} | ${row.name} | grade=${row.grade} year=${row.year} month=${row.month}`));

  // Sample questions
  r = await c.query(`
    SELECT eq.id, me.code, eq.subject_area_name, eq.subject_name, eq.question_number, eq.answer, eq.score, eq.difficulty
    FROM eh_exam_questions eq
    JOIN eh_mock_exams me ON me.id = eq.mock_exam_id
    WHERE me.code = 'H3-2025-11'
    ORDER BY eq.subject_area_name, eq.question_number
    LIMIT 10
  `);
  console.log('\n  Sample questions (H3-2025-11):');
  r.rows.forEach(row => console.log(`    Q${row.question_number}: ${row.subject_area_name}/${row.subject_name} ans=${row.answer} score=${row.score} diff=${row.difficulty}`));

  await c.end();
  console.log('\n✅ Seed complete!');
}

seed().catch(e => {
  console.error('Seed failed:', e.message);
  console.error(e.stack);
  process.exit(1);
});
