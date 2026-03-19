import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchMockExamDto } from './dto/search-mock-exam.dto';
import {
  GradeAnswersDto,
  GradeResultDto,
  GradeResultItemDto,
} from './dto/grade-answers.dto';

@Injectable()
export class MockExamService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    return this.prisma.mockExam.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findByGrade(grade: string) {
    return this.prisma.mockExam.findMany({
      where: { grade: this.gradeToCode(grade) },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  // Helper: 학년 표시명 → DB 코드 변환 ("고3" → "H3")
  private gradeToCode(grade: string): string {
    const map: Record<string, string> = { '고1': 'H1', '고2': 'H2', '고3': 'H3' };
    return map[grade] || grade;
  }

  async search(searchDto: SearchMockExamDto) {
    const { year, grade, month } = searchDto;
    const where: any = {};
    if (year) where.year = year;
    if (grade) where.grade = this.gradeToCode(grade);
    if (month) where.month = month;
    return this.prisma.mockExam.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findByCode(code: string) {
    const mockExam = await this.prisma.mockExam.findUnique({
      where: { code },
      include: { questions: { orderBy: { questionNumber: 'asc' } } },
    });
    if (!mockExam) {
      throw new NotFoundException(`모의고사 코드 ${code}를 찾을 수 없습니다.`);
    }
    return mockExam;
  }

  async findById(id: number) {
    const mockExam = await this.prisma.mockExam.findUnique({
      where: { id },
      include: { questions: { orderBy: { questionNumber: 'asc' } } },
    });
    if (!mockExam) {
      throw new NotFoundException(`모의고사 ID ${id}를 찾을 수 없습니다.`);
    }
    return mockExam;
  }

  async checkExists(year: number, grade: string, month: number) {
    const mockExam = await this.prisma.mockExam.findFirst({
      where: { year, grade: this.gradeToCode(grade), month },
    });
    return { exists: !!mockExam, mockExam: mockExam || null };
  }

  async getKyokwaSubjects(curriculum: '2015' | '2022' = '2015') {
    if (curriculum === '2022') {
      return this.prisma.kyokwaSubject2022.findMany({
        orderBy: [{ kyokwaCode: 'asc' }, { classificationCode: 'asc' }, { subjectCode: 'asc' }],
      });
    }
    return this.prisma.kyokwaSubject2015.findMany({
      orderBy: [{ kyokwaCode: 'asc' }, { classificationCode: 'asc' }, { subjectCode: 'asc' }],
    });
  }

  async getAnswers(mockExamId: number, subject: string, subjectDetail?: string) {
    const where: any = { mockExamId, subjectAreaName: subject };
    if (subjectDetail) where.subjectName = subjectDetail;
    return this.prisma.examQuestion.findMany({
      where,
      orderBy: { questionNumber: 'asc' },
      select: {
        questionNumber: true,
        answer: true,
        score: true,
        difficulty: true,
        correctRate: true,
      },
    });
  }

  async gradeAnswers(gradeDto: GradeAnswersDto): Promise<GradeResultDto> {
    const { mockExamId, subject, subjectDetail, answers } = gradeDto;
    const where: any = { mockExamId, subjectAreaName: subject };
    if (subjectDetail) where.subjectName = subjectDetail;

    const correctAnswers = await this.prisma.examQuestion.findMany({
      where,
      orderBy: { questionNumber: 'asc' },
    });

    if (correctAnswers.length === 0) {
      const subjectInfo = subjectDetail ? ` - ${subjectDetail}` : '';
      throw new NotFoundException(
        `모의고사 ID ${mockExamId}의 ${subject}${subjectInfo} 정답을 찾을 수 없습니다.`
      );
    }

    const answerMap = new Map(
      correctAnswers.map((q) => [
        q.questionNumber,
        {
          answer: q.answer,
          score: q.score,
          difficulty: q.difficulty,
          correctRate: q.correctRate ? Number(q.correctRate) : null,
        },
      ])
    );

    const results: GradeResultItemDto[] = [];
    let earnedScore = 0;
    let correctCount = 0;

    for (const studentAnswer of answers) {
      const correct = answerMap.get(studentAnswer.questionNumber);
      if (correct) {
        const isCorrect = studentAnswer.answer === correct.answer;
        const questionScore = correct.score || 2;
        if (isCorrect) {
          correctCount++;
          earnedScore += questionScore;
        }
        results.push({
          questionNumber: studentAnswer.questionNumber,
          studentAnswer: studentAnswer.answer,
          correctAnswer: correct.answer,
          isCorrect,
          score: questionScore,
          earnedScore: isCorrect ? questionScore : 0,
          difficulty: correct.difficulty || undefined,
          correctRate: correct.correctRate || undefined,
        });
      }
    }

    const allQuestionsTotal = correctAnswers.reduce((sum, q) => sum + (q.score || 2), 0);

    return {
      mockExamId,
      subject,
      subjectDetail,
      totalQuestions: correctAnswers.length,
      correctCount,
      totalScore: allQuestionsTotal,
      earnedScore,
      results,
    };
  }
}

