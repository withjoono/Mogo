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
  options: '-c search_path=mogo,hub',
});
const adapter = new PrismaPg(pool, { schema: 'mogo' });
const prisma = new PrismaClient({ adapter });

const EXCEL_PATH = path.join(__dirname, '../../Uploads/모의고사 디비 폼.xlsx');

interface SheetData {
  [key: string]: unknown[];
}

function readExcel(): SheetData {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const data: SheetData = {};

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    data[sheetName] = XLSX.utils.sheet_to_json(sheet);
  });

  return data;
}

// 모의고사 임포트 (실제 컬럼명: '모의고사 코드', '모의고사 명')
async function importMockExams(data: unknown[]) {
  console.log('📝 Importing mock exams...');

  let count = 0;
  for (const row of data as any[]) {
    const code = String(row['모의고사 코드'] || '').trim();
    const name = String(row['모의고사 명'] || '').trim();

    if (!code || !name) continue;

    // 코드 파싱: H32403 -> grade=H3, year=24, month=03
    const grade = code.substring(0, 2); // H3
    const year =
      code.length >= 4 ? 2000 + parseInt(code.substring(2, 4), 10) : null;
    const month = code.length >= 6 ? parseInt(code.substring(4, 6), 10) : null;

    // 유형 판단
    let type = '교육청';
    if (name.includes('평가원')) type = '평가원';
    else if (name.includes('수능') || name.includes('수학능력')) type = '수능';

    await prisma.mockExam.upsert({
      where: { code },
      update: { name, grade, year, month, type },
      create: { code, name, grade, year, month, type },
    });
    count++;
  }

  console.log(`✅ Imported ${count} mock exams`);
}

// 학생 정보 임포트 (실제 컬럼명에 맞춤)
async function importStudents(data: unknown[]) {
  console.log('👨‍🎓 Importing students...');

  let count = 0;
  for (const row of data as any[]) {
    const studentId = String(row['학생 ID'] || '').trim();
    const name = String(row['학생명'] || '').trim();
    const year = parseInt(row['년도'] || new Date().getFullYear(), 10);

    if (!studentId || !name) continue;

    const schoolLevel = String(row['초/중/고'] || '').trim() || null;
    const schoolName = String(row['학교명'] || '').trim() || null;
    const grade = String(row['학년'] || '').trim() || null;
    const schoolType = String(row['학교타입'] || '').trim() || null;
    const phone = String(row['학생연락처'] || '').trim() || null;
    const parentPhone = String(row['학부모연락처'] || '').trim() || null;
    const email = String(row['학생이메일'] || '').trim() || null;
    const parentEmail = String(row['학부모이메일'] || '').trim() || null;

    await prisma.member.upsert({
      where: { memberId: studentId },
      update: {
        name,
        year,
        schoolLevel,
        schoolName,
        grade,
        schoolType,
        phone,
        parentPhone,
        email,
        parentEmail,
      },
      create: {
        memberId: studentId,
        name,
        year,
        schoolLevel,
        schoolName,
        grade,
        schoolType,
        phone,
        parentPhone,
        email,
        parentEmail,
      },
    });
    count++;
  }

  console.log(`✅ Imported ${count} students`);
}

// 멘토링 정보 임포트 (실제 컬럼명에 맞춤)
// async function importMentoring(data: unknown[]) {
//   console.log('👨‍🏫 Importing mentoring... (Skipped, not in schema)');
// }

// 대학 및 학과 임포트 (실제 컬럼명에 맞춤 - 복잡한 헤더 구조)
async function importUniversitiesAndDepartments(data: unknown[]) {
  console.log('🏫 Importing universities and departments...');

  const universityMap = new Map<string, number>();
  let uniCount = 0;
  let deptCount = 0;

  for (const row of data as any[]) {
    const deptCode = String(row['대학학과코드'] || '').trim();
    const uniName = String(row['대학명'] || '').trim();
    const region = String(row['지역'] || '').trim();

    if (!deptCode || !uniName) continue;

    // 대학코드 추출 (대학학과코드에서 앞 4-5자리가 대학코드)
    const uniCode = String(row['대학코드'] || deptCode.substring(0, 4)).trim();

    // 대학 upsert
    if (!universityMap.has(uniCode)) {
      const totalScore = parseFloat(row['환산점수총점'] || '0') || null;
      const conversionRate = parseFloat(row['1000점통일'] || '0') || null;
      const status = String(
        row['존립상황'] || row['(폐과,생성,존립,변경?)'] || '존립',
      ).trim();

      const uni = await prisma.university.upsert({
        where: { code: uniCode },
        update: {
          name: uniName,
          region: region || null,
          totalScore,
          conversionRate,
          status,
        },
        create: {
          code: uniCode,
          name: uniName,
          region: region || null,
          totalScore,
          conversionRate,
          status,
        },
      });
      universityMap.set(uniCode, uni.id);
      uniCount++;
    }

    // 학과 정보 추출
    const deptName = String(row['모집단위명'] || '').trim();
    if (!deptName) continue;

    const departmentCode = String(row['학과코드'] || '').trim() || null;
    const admissionType = String(row['전형유형'] || '').trim() || null;

    // 줄바꿈이 있는 컬럼명 처리
    const admissionGroup =
      String(row['모\r\n집\r\n군'] || row['모집군'] || '').trim() || null;
    const category = String(row['계열'] || '').trim() || null;
    const subCategory = String(row['상세계열'] || '').trim() || null;
    const quota =
      parseInt(row['모집\r\n인원'] || row['모집인원'] || '0', 10) || null;
    const selectionMethod =
      String(row['선발\r\n방식'] || row['선발방식'] || '').trim() || null;

    // 수능 반영 비율
    const koreanRatio = String(row['국'] || '').trim() || null;
    const mathRatio = String(row['수'] || '').trim() || null;
    const englishRatio = String(row['영'] || '').trim() || null;
    const inquiryRatio = String(row['탐'] || '').trim() || null;
    const historyRatio = String(row['한국사'] || '').trim() || null;
    const foreignRatio = String(row['제2외'] || '').trim() || null;

    const status = String(
      row['존립상황'] || row['(폐과,생성,존립,변경?)'] || '존립',
    ).trim();

    await prisma.department.upsert({
      where: { code: deptCode },
      update: {
        name: deptName,
        departmentCode,
        admissionType,
        admissionGroup,
        category,
        subCategory,
        quota,
        selectionMethod,
        koreanRatio,
        mathRatio,
        englishRatio,
        inquiryRatio,
        historyRatio,
        foreignRatio,
        status,
      },
      create: {
        code: deptCode,
        universityId: universityMap.get(uniCode)!,
        departmentCode,
        name: deptName,
        admissionType,
        admissionGroup,
        category,
        subCategory,
        quota,
        selectionMethod,
        koreanRatio,
        mathRatio,
        englishRatio,
        inquiryRatio,
        historyRatio,
        foreignRatio,
        status,
      },
    });
    deptCount++;
  }

  console.log(
    `✅ Imported ${uniCount} universities and ${deptCount} departments`,
  );
}

// 학생 목표대학 임포트 (클래스 시트)
async function importStudentTargets(data: unknown[]) {
  console.log('🎯 Importing student targets...');

  const students = await prisma.member.findMany();
  const studentMap = new Map(students.map((s) => [s.memberId, s.id]));

  let count = 0;
  for (const row of data as any[]) {
    const departmentCode = String(row['목표대학'] || '').trim();
    const studentIdStr = String(row['학생아이디'] || '').trim();

    if (!departmentCode || !studentIdStr) continue;

    const studentId = studentMap.get(studentIdStr);
    if (!studentId) continue;

    // 기존 데이터 확인 후 생성
    const existing = await prisma.studentTarget.findFirst({
      where: { memberId: studentId, departmentCode },
    });

    if (!existing) {
      await prisma.studentTarget.create({
        data: { memberId: studentId, departmentCode, priority: count + 1 },
      });
      count++;
    }
  }

  console.log(`✅ Imported ${count} student targets`);
}

// 모의고사 문제 임포트 (H32211 같은 시트 - 복잡한 구조)
async function importExamQuestions(
  sheetName: string,
  workbook: XLSX.WorkBook,
  mockExamId: number,
) {
  console.log(`📋 Importing exam questions from ${sheetName}...`);

  const sheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  if (rawData.length < 3) {
    console.log(`⚠️ Sheet ${sheetName} has insufficient data`);
    return;
  }

  // 헤더 분석 (첫 번째 행이 메인 헤더)
  // 데이터는 세 번째 행부터 시작
  let count = 0;
  for (let i = 2; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    const subjectAreaCode = String(row[1] || '').trim() || null;
    const subjectCode = String(row[3] || '').trim() || null;
    const questionNumber = parseInt(row[5] || '0', 10);
    const score = parseInt(row[6] || '0', 10);
    const answer = parseInt(row[7] || '0', 10);

    if (!questionNumber || !score) continue;

    // 선택지 비율 (8번 인덱스부터)
    const choiceRatio1 = parseFloat(row[8] || '0') || null;
    const choiceRatio2 = parseFloat(row[9] || '0') || null;
    const choiceRatio3 = parseFloat(row[10] || '0') || null;
    const choiceRatio4 = parseFloat(row[11] || '0') || null;
    const choiceRatio5 = parseFloat(row[12] || '0') || null;

    await prisma.examQuestion.create({
      data: {
        mockExamId,
        subjectAreaCode,
        subjectCode,
        questionNumber,
        score,
        answer,
        choiceRatio1,
        choiceRatio2,
        choiceRatio3,
        choiceRatio4,
        choiceRatio5,
      },
    });
    count++;
  }

  console.log(`✅ Imported ${count} questions from ${sheetName}`);
}

async function main() {
  console.log('🚀 Starting Excel data import...');
  console.log(`📂 Reading file: ${EXCEL_PATH}`);

  const workbook = XLSX.readFile(EXCEL_PATH);
  const data: SheetData = {};
  workbook.SheetNames.forEach((sheetName) => {
    data[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  });

  const sheetNames = Object.keys(data);
  console.log(`📑 Found ${sheetNames.length} sheets: ${sheetNames.join(', ')}`);

  // 1. 모의고사명 임포트
  if (data['모의고사명']) {
    await importMockExams(data['모의고사명']);
  }

  // 2. 인적사항 임포트
  if (data['인적사항']) {
    await importStudents(data['인적사항']);
  }

  // 3. 대학학과코드 임포트
  if (data['대학학과코드']) {
    await importUniversitiesAndDepartments(data['대학학과코드']);
  }

  // 4. 멘토링 임포트
  // if (data['멘토링']) {
  //   await importMentoring(data['멘토링']);
  // }

  // 5. 학생 목표대학 임포트 (클래스 시트)
  if (data['클래스']) {
    await importStudentTargets(data['클래스']);
  }

  // 6. 모의고사 문제 임포트 (H로 시작하는 시트들)
  const mockExams = await prisma.mockExam.findMany();
  const mockExamMap = new Map(mockExams.map((e) => [e.code, e.id]));

  for (const sheetName of sheetNames) {
    if (sheetName.startsWith('H') && mockExamMap.has(sheetName)) {
      await importExamQuestions(
        sheetName,
        workbook,
        mockExamMap.get(sheetName)!,
      );
    }
  }

  console.log('✨ Excel data import completed!');
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
