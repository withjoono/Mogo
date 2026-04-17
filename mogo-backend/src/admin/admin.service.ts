import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockExamService } from '../mock-exam/mock-exam.service';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitGradingDto } from './dto/submit-grading.dto';
import { toMogoMemberId } from '../common/utils/member-id.util';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mockExamService: MockExamService,
  ) { }

  // Mock Exam CRUD
  async createMockExam(dto: CreateMockExamDto) {
    const existingExam = await this.prisma.mockExam.findUnique({
      where: { code: dto.code },
    });

    if (existingExam) {
      throw new BadRequestException(`시험 코드 ${dto.code}가 이미 존재합니다.`);
    }

    return this.prisma.mockExam.create({
      data: {
        code: dto.code,
        name: dto.name,
        grade: dto.grade,
        year: dto.year,
        month: dto.month,
        type: dto.type,
      },
    });
  }

  async updateMockExam(id: number, dto: Partial<CreateMockExamDto>) {
    const exam = await this.prisma.mockExam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException(`시험 ID ${id}를 찾을 수 없습니다.`);
    }

    if (dto.code && dto.code !== exam.code) {
      const existingExam = await this.prisma.mockExam.findUnique({
        where: { code: dto.code },
      });
      if (existingExam) {
        throw new BadRequestException(`시험 코드 ${dto.code}가 이미 존재합니다.`);
      }
    }

    return this.prisma.mockExam.update({
      where: { id },
      data: dto,
    });
  }

  async deleteMockExam(id: number) {
    const exam = await this.prisma.mockExam.findUnique({ where: { id } });
    if (!exam) {
      throw new NotFoundException(`시험 ID ${id}를 찾을 수 없습니다.`);
    }

    // Delete related questions first
    await this.prisma.examQuestion.deleteMany({
      where: { mockExamId: id },
    });

    return this.prisma.mockExam.delete({ where: { id } });
  }

  // Questions Management
  async uploadQuestions(mockExamId: number, questions: CreateQuestionDto[]) {
    const exam = await this.prisma.mockExam.findUnique({
      where: { id: mockExamId },
    });
    if (!exam) {
      throw new NotFoundException(`시험 ID ${mockExamId}를 찾을 수 없습니다.`);
    }

    // Delete existing questions for this subject if any
    const subjects = [...new Set(questions.map((q) => q.subject))];
    for (const subject of subjects) {
      await this.prisma.examQuestion.deleteMany({
        where: {
          mockExamId,
          subjectAreaName: subject,
        },
      });
    }

    // Create new questions
    const result = await this.prisma.examQuestion.createMany({
      data: questions.map((q) => ({
        mockExamId,
        subjectAreaName: q.subject,
        subjectName: q.subjectDetail,
        questionNumber: q.questionNumber,
        answer: q.answer,
        score: q.score || 2,
        difficulty: q.difficulty ? String(q.difficulty) : null,
        correctRate: q.correctRate,
      })),
    });

    return { count: result.count };
  }

  async updateQuestion(
    mockExamId: number,
    questionNumber: number,
    subject: string,
    dto: Partial<CreateQuestionDto>,
  ) {
    const question = await this.prisma.examQuestion.findFirst({
      where: { mockExamId, questionNumber, subjectAreaName: subject },
    });

    if (!question) {
      throw new NotFoundException(
        `시험 ${mockExamId}의 ${subject} ${questionNumber}번 문제를 찾을 수 없습니다.`,
      );
    }

    const updateData: Record<string, unknown> = {};
    if (dto.answer !== undefined) updateData.answer = dto.answer;
    if (dto.score !== undefined) updateData.score = dto.score;
    if (dto.difficulty !== undefined) updateData.difficulty = String(dto.difficulty);
    if (dto.correctRate !== undefined) updateData.correctRate = dto.correctRate;
    if (dto.subject !== undefined) updateData.subjectAreaName = dto.subject;
    if (dto.subjectDetail !== undefined) updateData.subjectName = dto.subjectDetail;

    return this.prisma.examQuestion.update({
      where: { id: question.id },
      data: updateData,
    });
  }

  async deleteQuestion(mockExamId: number, questionNumber: number, subject: string) {
    const question = await this.prisma.examQuestion.findFirst({
      where: { mockExamId, questionNumber, subjectAreaName: subject },
    });

    if (!question) {
      throw new NotFoundException(
        `시험 ${mockExamId}의 ${subject} ${questionNumber}번 문제를 찾을 수 없습니다.`,
      );
    }

    return this.prisma.examQuestion.delete({ where: { id: question.id } });
  }

  // Grading with Score Save
  async submitGrading(dto: SubmitGradingDto) {
    // First, grade the answers
    const gradeResult = await this.mockExamService.gradeAnswers({
      mockExamId: dto.mockExamId,
      subject: dto.subject,
      subjectDetail: dto.subjectDetail,
      answers: dto.answers,
    });

    // If saveScore is true, save to StudentScore
    if (dto.saveScore) {
      const scoreData = this.buildScoreData(dto, gradeResult.earnedScore);

      // Find existing score or create new one
      const existingScore = await this.prisma.studentScore.findFirst({
        where: {
          memberId: dto.memberId,
          mockExamId: dto.mockExamId,
        },
      });

      if (existingScore) {
        await this.prisma.studentScore.update({
          where: { id: existingScore.id },
          data: scoreData,
        });
      } else {
        await this.prisma.studentScore.create({
          data: {
            memberId: dto.memberId,
            mockExamId: dto.mockExamId,
            ...scoreData,
          },
        });
      }
    }

    return gradeResult;
  }

  private buildScoreData(
    dto: SubmitGradingDto,
    earnedScore: number,
  ): Record<string, number> {
    const subjectMap: Record<string, string> = {
      국어: 'koreanRaw',
      수학: 'mathRaw',
      영어: 'englishRaw',
      탐구1: 'inquiry1Raw',
      탐구2: 'inquiry2Raw',
      한국사: 'historyRaw',
    };

    const field = subjectMap[dto.subject];
    if (!field) return {};

    return { [field]: earnedScore };
  }

  // Get grading status by exam
  async getGradingByExam(examId: number) {
    return this.prisma.studentScore.findMany({
      where: { mockExamId: examId },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            grade: true,
            schoolName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get grading status by student
  async getGradingByStudent(studentId: string) {
    const member = await this.prisma.member.findUnique({ where: { memberId: toMogoMemberId(studentId) } });
    if (!member) return [];
    return this.prisma.studentScore.findMany({
      where: { memberId: member.id },
      include: {
        mockExam: {
          select: {
            id: true,
            code: true,
            name: true,
            year: true,
            month: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========== Seed Status & Question Seeding ==========

  /**
   * mg_mock_answer, mg_exam_questions 데이터 현황 조회
   */
  async getSeedStatus() {
    const mockAnswerCount = await this.prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
      'SELECT COUNT(*) as cnt FROM mg_mock_answer',
    );
    const examQuestionCount = await this.prisma.examQuestion.count();
    const mockExamCount = await this.prisma.mockExam.count();

    // 모의고사별 문제 수 조회
    const examQuestionsByExam = await this.prisma.examQuestion.groupBy({
      by: ['mockExamId'],
      _count: { id: true },
    });

    const allExams = await this.prisma.mockExam.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      select: { id: true, code: true, name: true, grade: true, year: true, month: true },
    });

    const questionCountMap = new Map(
      examQuestionsByExam.map((e) => [e.mockExamId, e._count?.id || 0]),
    );

    const examStatus = allExams.map((exam) => ({
      ...exam,
      questionCount: questionCountMap.get(exam.id) || 0,
      hasQuestions: (questionCountMap.get(exam.id) || 0) > 0,
    }));

    // mg_mock_answer distinct exams
    let mockAnswerExams: any[] = [];
    try {
      mockAnswerExams = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT DISTINCT grade, exam_name, COUNT(*) as question_count 
         FROM mg_mock_answer 
         GROUP BY grade, exam_name 
         ORDER BY exam_name DESC, grade`,
      );
    } catch (e) {
      // Table might not exist
    }

    return {
      mockAnswerCount: Number(mockAnswerCount?.[0]?.cnt || 0),
      examQuestionCount,
      mockExamCount,
      mockAnswerExams: mockAnswerExams.map((e) => ({
        ...e,
        question_count: Number(e.question_count),
      })),
      examStatus,
    };
  }

  /**
   * mg_mock_answer → mg_exam_questions 시딩
   * mg_mock_answer 테이블의 데이터를 읽어 mg_exam_questions에 삽입
   */
  async seedExamQuestionsFromMockAnswer(options?: { forceReseed?: boolean }) {
    this.logger.log('=== seedExamQuestionsFromMockAnswer 시작 ===');

    // 1. Check mg_mock_answer data
    const mockAnswerRows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT grade, exam_name, subject, subject_detail, question_number, answer,
              difficulty, score, correct_rate,
              choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5
       FROM mg_mock_answer
       ORDER BY id`,
    );

    if (mockAnswerRows.length === 0) {
      // Try auto-importing from examhub.eh_mock_answer
      this.logger.log('mg_mock_answer 비어있음 → examhub.eh_mock_answer에서 자동 복사 시도');
      try {
        const imported = await this.copyFromExamhubMockAnswer();
        if (imported === 0) {
          throw new BadRequestException(
            'mg_mock_answer 테이블이 비어있고, examhub.eh_mock_answer에도 데이터가 없습니다.',
          );
        }
        // Re-query after import
        const requery = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT grade, exam_name, subject, subject_detail, question_number, answer,
                  difficulty, score, correct_rate,
                  choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5
           FROM mg_mock_answer ORDER BY id`,
        );
        mockAnswerRows.splice(0, mockAnswerRows.length, ...requery);
      } catch (importErr) {
        if (importErr instanceof BadRequestException) throw importErr;
        throw new BadRequestException(
          `mg_mock_answer 테이블이 비어있습니다. examhub에서 복사 실패: ${importErr.message}`,
        );
      }
    }
    this.logger.log(`mg_mock_answer: ${mockAnswerRows.length}개 rows`);

    // 2. If forceReseed, clear existing exam questions
    if (options?.forceReseed) {
      // First delete all student answers (FK constraint)
      const deletedAnswers = await this.prisma.studentAnswer.deleteMany({});
      this.logger.log(`삭제된 student_answers: ${deletedAnswers.count}개`);
      const deleted = await this.prisma.examQuestion.deleteMany({});
      this.logger.log(`삭제된 기존 exam_questions: ${deleted.count}개`);
    }

    // 3. Build mock exam lookup
    const allExams = await this.prisma.mockExam.findMany();
    const examByGradeYearMonth = new Map(
      allExams.map((e) => [`${e.grade}|${e.year}|${e.month}`, e.id]),
    );

    // Helper functions
    const gradeToCode = (grade: string): string => {
      const map: Record<string, string> = { '고1': 'H1', '고2': 'H2', '고3': 'H3' };
      return map[grade] || grade;
    };

    const parseExamName = (examName: string) => {
      // Old format: "2025.03.26 학력평가"
      const match1 = examName.match(/^(\d{4})\.(\d{2})\.\d{2}\s+(.+)$/);
      if (match1) {
        return { year: parseInt(match1[1]), month: parseInt(match1[2]), type: match1[3].trim() };
      }
      // New format: "2026 고1 3월 학력평가" or "2026 고3 3월 학력평가"
      const match2 = examName.match(/^(\d{4})\s+고\d\s+(\d{1,2})월\s+(.+)$/);
      if (match2) {
        return { year: parseInt(match2[1]), month: parseInt(match2[2]), type: match2[3].trim() };
      }
      return { year: null, month: null, type: examName };
    };

    const subjectToAreaCode = (subject: string): string => {
      const map: Record<string, string> = {
        '국어': 'KOR', '수학': 'MATH', '영어': 'ENG',
        '한국사': 'HIST', '사회탐구': 'SOC', '과학탐구': 'SCI',
        '제2외국어': 'FOR', '통합사회': 'SOC_INT', '통합과학': 'SCI_INT',
      };
      return map[subject] || subject;
    };

    const parseRatio = (v: any): number | null => {
      if (v == null) return null;
      const parsed = parseFloat(String(v).replace('%', ''));
      return isNaN(parsed) ? null : parsed;
    };

    // 4. Map mock_answer rows to their mock exam IDs
    // First pass: find which mock exams exist
    const examNameToId = new Map<string, number>();
    const missingExams: { grade: string; gradeCode: string; year: number; month: number; type: string; examName: string }[] = [];

    const distinctExams = new Set<string>();
    for (const row of mockAnswerRows) {
      distinctExams.add(`${row.grade}|${row.exam_name}`);
    }

    for (const key of distinctExams) {
      const [grade, examName] = key.split('|');
      const { year, month, type } = parseExamName(examName);
      const gradeCode = gradeToCode(grade);

      if (!year || !month) continue;

      const lookupKey = `${gradeCode}|${year}|${month}`;
      const examId = examByGradeYearMonth.get(lookupKey);

      if (examId) {
        examNameToId.set(key, examId);
      } else {
        missingExams.push({ grade, gradeCode, year, month, type: type || '교육청', examName });
      }
    }

    // 5. Create missing mock exams
    let createdExams = 0;
    for (const exam of missingExams) {
      const code = `${exam.gradeCode}${String(exam.year).slice(2)}${String(exam.month).padStart(2, '0')}`;
      const name = `${exam.grade} ${String(exam.year).slice(2)}년 ${exam.month}월 ${exam.type}`;

      let typeValue = '교육청';
      if (exam.type.includes('수능')) typeValue = '수능';
      else if (exam.type.includes('평가원') || exam.type.includes('모의평가')) typeValue = '평가원';

      try {
        const created = await this.prisma.mockExam.upsert({
          where: { code },
          update: { name },
          create: { code, name, grade: exam.gradeCode, year: exam.year, month: exam.month, type: typeValue },
        });
        examNameToId.set(`${exam.grade}|${exam.examName}`, created.id);
        createdExams++;
        this.logger.log(`생성된 모의고사: ${code} → ${name} (id=${created.id})`);
      } catch (err) {
        this.logger.warn(`모의고사 생성 실패: ${code} - ${err.message}`);
      }
    }

    // 6. Insert exam questions
    let inserted = 0;
    let skipped = 0;
    const BATCH_SIZE = 100;

    for (let i = 0; i < mockAnswerRows.length; i += BATCH_SIZE) {
      const batch = mockAnswerRows.slice(i, i + BATCH_SIZE);
      const createData: any[] = [];

      for (const row of batch) {
        const mapKey = `${row.grade}|${row.exam_name}`;
        const mockExamId = examNameToId.get(mapKey);
        if (!mockExamId) {
          skipped++;
          continue;
        }

        createData.push({
          mockExamId,
          subjectAreaCode: subjectToAreaCode(row.subject),
          subjectAreaName: row.subject,
          subjectCode: row.subject_detail || null,
          subjectName: row.subject_detail || null,
          questionNumber: row.question_number,
          score: row.score || 2,
          answer: row.answer,
          choiceRatio1: parseRatio(row.choice_ratio_1),
          choiceRatio2: parseRatio(row.choice_ratio_2),
          choiceRatio3: parseRatio(row.choice_ratio_3),
          choiceRatio4: parseRatio(row.choice_ratio_4),
          choiceRatio5: parseRatio(row.choice_ratio_5),
          correctRate: parseRatio(row.correct_rate),
          difficulty: row.difficulty || null,
        });
      }

      if (createData.length > 0) {
        try {
          const result = await this.prisma.examQuestion.createMany({ data: createData });
          inserted += result.count;
        } catch (err) {
          this.logger.warn(`Batch insert error at row ${i}: ${err.message}`);
          // Try one by one for this batch
          for (const data of createData) {
            try {
              await this.prisma.examQuestion.create({ data });
              inserted++;
            } catch (e2) {
              skipped++;
            }
          }
        }
      }
    }

    // 7. Auto-convert correct_rate to difficulty for items without difficulty
    let diffUpdated = 0;
    try {
      const result = await this.prisma.$executeRawUnsafe(`
        UPDATE mg_exam_questions SET difficulty = 
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
        WHERE difficulty IS NULL AND correct_rate IS NOT NULL
      `);
      diffUpdated = result;
    } catch (e) {
      this.logger.warn(`Difficulty update error: ${e.message}`);
    }

    this.logger.log(`=== 시딩 완료: inserted=${inserted}, skipped=${skipped}, createdExams=${createdExams}, diffUpdated=${diffUpdated} ===`);

    return {
      success: true,
      inserted,
      skipped,
      createdExams,
      difficultyUpdated: diffUpdated,
      totalMockAnswerRows: mockAnswerRows.length,
    };
  }

  /**
   * examhub.eh_mock_answer → mogo.mg_mock_answer 데이터 복사
   * Cross-schema copy for when mg_mock_answer is empty
   */
  private async copyFromExamhubMockAnswer(): Promise<number> {
    this.logger.log('=== examhub.eh_mock_answer → mg_mock_answer 복사 시작 ===');

    try {
      // Check if eh_mock_answer exists and has data
      const srcCount = await this.prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
        `SELECT COUNT(*) as cnt FROM examhub.eh_mock_answer`,
      );
      const count = Number(srcCount?.[0]?.cnt || 0);

      if (count === 0) {
        this.logger.warn('examhub.eh_mock_answer도 비어있습니다.');
        return 0;
      }

      this.logger.log(`examhub.eh_mock_answer: ${count}개 rows → mg_mock_answer로 복사`);

      // Copy data using INSERT ... SELECT across schemas
      const result = await this.prisma.$executeRawUnsafe(`
        INSERT INTO mg_mock_answer (grade, exam_name, subject, subject_detail, question_number, answer, difficulty, score, correct_rate, choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5)
        SELECT grade, exam_name, subject, subject_detail, question_number, answer, difficulty, score, correct_rate, choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5
        FROM examhub.eh_mock_answer
      `);

      this.logger.log(`✅ ${result}개 rows 복사 완료`);
      return result;
    } catch (err) {
      this.logger.error(`Cross-schema copy failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * mg_mock_answer 데이터 일괄 임포트
   */
  async importMockAnswers(rows: any[], truncateFirst?: boolean) {
    this.logger.log(`=== importMockAnswers: ${rows.length}개 rows ===`);

    if (!rows || rows.length === 0) {
      throw new BadRequestException('임포트할 데이터가 없습니다.');
    }

    if (truncateFirst) {
      await this.prisma.$executeRawUnsafe('TRUNCATE TABLE mg_mock_answer RESTART IDENTITY');
      this.logger.log('mg_mock_answer 테이블 초기화 완료');
    }

    const BATCH_SIZE = 200;
    let inserted = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      const values = batch.map((row) => `(
        ${row.grade ? `'${row.grade.replace(/'/g, "''")}'` : 'NULL'},
        ${row.exam_name ? `'${row.exam_name.replace(/'/g, "''")}'` : 'NULL'},
        ${row.subject ? `'${row.subject.replace(/'/g, "''")}'` : 'NULL'},
        ${row.subject_detail ? `'${row.subject_detail.replace(/'/g, "''")}'` : 'NULL'},
        ${row.question_number || 'NULL'},
        ${row.answer || 'NULL'},
        ${row.difficulty ? `'${row.difficulty.replace(/'/g, "''")}'` : 'NULL'},
        ${row.score || 'NULL'},
        ${row.correct_rate ? `'${row.correct_rate.replace(/'/g, "''")}'` : 'NULL'},
        ${row.choice_ratio_1 ? `'${row.choice_ratio_1.replace(/'/g, "''")}'` : 'NULL'},
        ${row.choice_ratio_2 ? `'${row.choice_ratio_2.replace(/'/g, "''")}'` : 'NULL'},
        ${row.choice_ratio_3 ? `'${row.choice_ratio_3.replace(/'/g, "''")}'` : 'NULL'},
        ${row.choice_ratio_4 ? `'${row.choice_ratio_4.replace(/'/g, "''")}'` : 'NULL'},
        ${row.choice_ratio_5 ? `'${row.choice_ratio_5.replace(/'/g, "''")}'` : 'NULL'}
      )`).join(',');

      try {
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO mg_mock_answer 
            (grade, exam_name, subject, subject_detail, question_number, answer, 
             difficulty, score, correct_rate, 
             choice_ratio_1, choice_ratio_2, choice_ratio_3, choice_ratio_4, choice_ratio_5)
          VALUES ${values}
        `);
        inserted += batch.length;
      } catch (err) {
        this.logger.error(`Batch insert error at row ${i}: ${err.message}`);
      }
    }

    this.logger.log(`=== importMockAnswers 완료: ${inserted}/${rows.length} ===`);
    return { success: true, inserted, total: rows.length };
  }
}
