import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockExamService } from '../mock-exam/mock-exam.service';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitGradingDto } from './dto/submit-grading.dto';
import { toExamHubMemberId } from '../common/utils/member-id.util';

@Injectable()
export class AdminService {
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
    const member = await this.prisma.member.findUnique({ where: { memberId: toExamHubMemberId(studentId) } });
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
}
