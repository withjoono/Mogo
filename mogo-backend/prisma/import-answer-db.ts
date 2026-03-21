import 'dotenv/config';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool, { schema: 'mogo' });
const prisma = new PrismaClient({ adapter });

const EXCEL_PATH = path.join(
  __dirname,
  '../../Uploads/SunungMock-Answer-DB.xlsx',
);

interface AnswerRow {
  학년: string;
  시험명: string;
  과목: string;
  세부과목: string;
  번호: number;
  정답: number;
  난이도: string;
  배점: number;
  정답률: string;
  선지1: string;
  선지2: string;
  선지3: string;
  선지4: string;
  선지5: string;
}

// 시험명에서 모의고사 코드 생성
function generateMockExamCode(grade: string, examName: string): string {
  // 학년 변환: 고3 -> H3, 고2 -> H2, 고1 -> H1
  const gradeCode = grade.replace('고', 'H');

  // 시험명 파싱: "2025.11.13 수능" -> year=25, month=11
  const match = examName.match(/(\d{4})\.(\d{1,2})\.?(\d{1,2})?\s*(.+)/);
  if (!match) {
    // 매칭 실패시 시험명 기반으로 고유 코드 생성
    return `${gradeCode}${examName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6)}`;
  }

  const year = match[1].substring(2); // 2025 -> 25
  const month = match[2].padStart(2, '0'); // 11 -> 11, 3 -> 03

  return `${gradeCode}${year}${month}`;
}

// 시험 유형 판단
function getExamType(examName: string): string {
  if (examName.includes('수능') || examName.includes('수학능력')) return '수능';
  if (examName.includes('평가원')) return '평가원';
  return '교육청';
}

// 퍼센트 문자열을 숫자로 변환
function parsePercent(value: string | number | undefined): number | null {
  if (value === undefined || value === null || value === '') return null;
  const str = String(value).replace('%', '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

async function importAnswerData() {
  console.log('🚀 Starting Answer DB import...');
  console.log(`📂 Reading file: ${EXCEL_PATH}`);

  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<AnswerRow>(sheet);

  console.log(`📑 Found ${data.length} rows in sheet: ${sheetName}`);

  // 모의고사 맵 (코드 -> id)
  const mockExamMap = new Map<string, number>();

  // 기존 모의고사 로드
  const existingExams = await prisma.mockExam.findMany();
  existingExams.forEach((exam) => {
    mockExamMap.set(exam.code, exam.id);
  });

  let examCreatedCount = 0;
  let questionCount = 0;
  let skippedCount = 0;
  const batchSize = 500;
  let batch: any[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    const grade = String(row['학년'] || '').trim();
    const examName = String(row['시험명'] || '').trim();
    const subject = String(row['과목'] || '').trim();
    const subjectDetail = String(row['세부과목'] || '').trim();
    const questionNumber = parseInt(String(row['번호'] || '0'), 10);
    const answer = parseInt(String(row['정답'] || '0'), 10);
    const difficulty = String(row['난이도'] || '').trim();
    const score = parseInt(String(row['배점'] || '0'), 10);
    const correctRate = parsePercent(row['정답률']);
    const ratio1 = parsePercent(row['선지1']);
    const ratio2 = parsePercent(row['선지2']);
    const ratio3 = parsePercent(row['선지3']);
    const ratio4 = parsePercent(row['선지4']);
    const ratio5 = parsePercent(row['선지5']);

    if (!grade || !examName || !questionNumber) {
      skippedCount++;
      continue;
    }

    // 모의고사 코드 생성 및 조회/생성
    const mockExamCode = generateMockExamCode(grade, examName);

    if (!mockExamMap.has(mockExamCode)) {
      // 새 모의고사 생성
      const gradeCode = grade.replace('고', 'H');
      const match = examName.match(/(\d{4})\.(\d{1,2})/);
      const year = match ? parseInt(match[1], 10) : null;
      const month = match ? parseInt(match[2], 10) : null;
      const type = getExamType(examName);

      const newExam = await prisma.mockExam.upsert({
        where: { code: mockExamCode },
        update: { name: `${grade} ${examName}`, type },
        create: {
          code: mockExamCode,
          name: `${grade} ${examName}`,
          grade: gradeCode,
          year,
          month,
          type,
        },
      });
      mockExamMap.set(mockExamCode, newExam.id);
      examCreatedCount++;
      console.log(`📝 Created MockExam: ${mockExamCode} - ${grade} ${examName}`);
    }

    const mockExamId = mockExamMap.get(mockExamCode)!;

    // 배치에 추가
    batch.push({
      mockExamId,
      subjectAreaName: subject || null,
      subjectName: subjectDetail || null,
      questionNumber,
      score: score || 2,
      answer: answer || 0,
      difficulty: difficulty || null,
      correctRate,
      choiceRatio1: ratio1,
      choiceRatio2: ratio2,
      choiceRatio3: ratio3,
      choiceRatio4: ratio4,
      choiceRatio5: ratio5,
    });

    // 배치 처리
    if (batch.length >= batchSize) {
      await prisma.examQuestion.createMany({
        data: batch,
        skipDuplicates: true,
      });
      questionCount += batch.length;
      console.log(`✅ Imported ${questionCount} questions...`);
      batch = [];
    }
  }

  // 남은 배치 처리
  if (batch.length > 0) {
    await prisma.examQuestion.createMany({
      data: batch,
      skipDuplicates: true,
    });
    questionCount += batch.length;
  }

  console.log('\n✨ Import completed!');
  console.log(`📊 Summary:`);
  console.log(`   - MockExams created: ${examCreatedCount}`);
  console.log(`   - Questions imported: ${questionCount}`);
  console.log(`   - Rows skipped: ${skippedCount}`);
}

async function main() {
  try {
    await importAnswerData();
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
