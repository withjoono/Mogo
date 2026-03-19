import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: '-c search_path=examhub,hub',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');
  // 교과/과목 데이터는 hub 스키마의 hub_2015_kyokwa_subject / hub_2022_kyokwa_subject 테이블에서 조회 (시드 불필요)

  // 3. 모의고사 시드 데이터
  const mockExams = await Promise.all([
    prisma.mockExam.upsert({
      where: { code: 'H12403' },
      update: {},
      create: {
        code: 'H12403',
        name: '고1 24년 3월 교육청 모의',
        grade: 'H1',
        year: 2024,
        month: 3,
        type: '교육청',
      },
    }),
    prisma.mockExam.upsert({
      where: { code: 'H12406' },
      update: {},
      create: {
        code: 'H12406',
        name: '고1 24년 6월 교육청 모의',
        grade: 'H1',
        year: 2024,
        month: 6,
        type: '교육청',
      },
    }),
    prisma.mockExam.upsert({
      where: { code: 'H22403' },
      update: {},
      create: {
        code: 'H22403',
        name: '고2 24년 3월 교육청 모의',
        grade: 'H2',
        year: 2024,
        month: 3,
        type: '교육청',
      },
    }),
    prisma.mockExam.upsert({
      where: { code: 'H22406' },
      update: {},
      create: {
        code: 'H22406',
        name: '고2 24년 6월 평가원 모의',
        grade: 'H2',
        year: 2024,
        month: 6,
        type: '평가원',
      },
    }),
    prisma.mockExam.upsert({
      where: { code: 'H32403' },
      update: {},
      create: {
        code: 'H32403',
        name: '고3 24년 3월 교육청 모의',
        grade: 'H3',
        year: 2024,
        month: 3,
        type: '교육청',
      },
    }),
    prisma.mockExam.upsert({
      where: { code: 'H32406' },
      update: {},
      create: {
        code: 'H32406',
        name: '고3 24년 6월 평가원 모의',
        grade: 'H3',
        year: 2024,
        month: 6,
        type: '평가원',
      },
    }),
    prisma.mockExam.upsert({
      where: { code: 'H32409' },
      update: {},
      create: {
        code: 'H32409',
        name: '고3 24년 9월 평가원 모의',
        grade: 'H3',
        year: 2024,
        month: 9,
        type: '평가원',
      },
    }),
    prisma.mockExam.upsert({
      where: { code: 'H32411' },
      update: {},
      create: {
        code: 'H32411',
        name: '24년 대학수학능력시험',
        grade: 'H3',
        year: 2024,
        month: 11,
        type: '수능',
      },
    }),
  ]);
  console.log(`✅ Created ${mockExams.length} mock exams`);

  // 4. 대학 시드 데이터
  const universities = await Promise.all([
    prisma.university.upsert({
      where: { code: 'U001' },
      update: {},
      create: {
        code: 'U001',
        name: '대구경북과학기술원',
        shortName: '디지스트',
        region: '대구',
        totalScore: 630,
        conversionRate: 1.587302,
      },
    }),
    prisma.university.upsert({
      where: { code: 'U002' },
      update: {},
      create: {
        code: 'U002',
        name: '광주과학기술원',
        shortName: '지스트',
        region: '광주',
        totalScore: 600,
        conversionRate: 1.666667,
      },
    }),
    prisma.university.upsert({
      where: { code: 'U230' },
      update: {},
      create: {
        code: 'U230',
        name: '서울대학교',
        shortName: '서울대',
        region: '서울',
        totalScore: 1000,
        conversionRate: 1.0,
      },
    }),
    prisma.university.upsert({
      where: { code: 'U231' },
      update: {},
      create: {
        code: 'U231',
        name: '연세대학교',
        shortName: '연세대',
        region: '서울',
        totalScore: 1000,
        conversionRate: 1.0,
      },
    }),
    prisma.university.upsert({
      where: { code: 'U232' },
      update: {},
      create: {
        code: 'U232',
        name: '고려대학교',
        shortName: '고려대',
        region: '서울',
        totalScore: 1000,
        conversionRate: 1.0,
      },
    }),
  ]);
  console.log(`✅ Created ${universities.length} universities`);

  // 5. 학과 시드 데이터
  const dgist = universities.find((u) => u.code === 'U001');
  const gist = universities.find((u) => u.code === 'U002');
  const snu = universities.find((u) => u.code === 'U230');

  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'U0011' },
      update: {},
      create: {
        code: 'U0011',
        universityId: dgist!.id,
        departmentCode: '1',
        name: '반도체공학과',
        admissionGroup: '라',
        category: '자연',
        quota: 5,
        scoreElements: '표점+변표',
        scoreCombination: '국수영탐(2)',
        inquiryCount: 2,
        mathScienceReq: '미적기하+과탐 필수',
      },
    }),
    prisma.department.upsert({
      where: { code: 'U0012' },
      update: {},
      create: {
        code: 'U0012',
        universityId: dgist!.id,
        departmentCode: '2',
        name: '수능우수자통합선발',
        admissionGroup: '라',
        category: '통합',
        quota: 10,
        scoreElements: '표점+변표',
        scoreCombination: '국수영탐(2)',
        inquiryCount: 2,
        mathScienceReq: '미적기하+과탐 필수',
      },
    }),
    prisma.department.upsert({
      where: { code: 'U0021' },
      update: {},
      create: {
        code: 'U0021',
        universityId: gist!.id,
        departmentCode: '1',
        name: '반도체공학과',
        admissionGroup: '라',
        category: '자연',
        quota: 5,
        scoreElements: '표점+변표',
        scoreCombination: '국수영탐(2)',
        inquiryCount: 2,
        mathScienceReq: '미적기하+과탐 필수',
      },
    }),
    prisma.department.upsert({
      where: { code: 'U2301' },
      update: {},
      create: {
        code: 'U2301',
        universityId: snu!.id,
        departmentCode: '1',
        name: '컴퓨터공학부',
        admissionGroup: '가',
        category: '자연',
        quota: 30,
        scoreElements: '표점',
        scoreCombination: '국수영탐(2)',
        inquiryCount: 2,
        koreanRatio: '20',
        mathRatio: '35',
        englishRatio: '20',
        inquiryRatio: '25',
      },
    }),
  ]);
  console.log(`✅ Created ${departments.length} departments`);

  // 6. 샘플 학생 데이터
  const members = await Promise.all([
    prisma.member.upsert({
      where: { memberId: 'ST25000001' },
      update: {},
      create: {
        memberId: 'ST25000001',
        year: 2025,
        schoolLevel: '고',
        schoolName: '경기고등학교',
        grade: 'H2',
        name: '홍길동',
        schoolType: '일반고',
        phone: '010-1111-1111',
        parentPhone: '010-2222-2222',
        email: 'student1@example.com',
        parentEmail: 'parent1@example.com',
      },
    }),
    prisma.member.upsert({
      where: { memberId: 'ST25000002' },
      update: {},
      create: {
        memberId: 'ST25000002',
        year: 2025,
        schoolLevel: '고',
        schoolName: '서울고등학교',
        grade: 'H3',
        name: '김철수',
        schoolType: '일반고',
        phone: '010-3333-3333',
        parentPhone: '010-4444-4444',
        email: 'student2@example.com',
        parentEmail: 'parent2@example.com',
      },
    }),
  ]);
  console.log(`✅ Created ${members.length} members`);

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
