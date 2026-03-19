import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toMogoMemberId } from '../common/utils/member-id.util';
import {
  WrongAnswerGradeDto,
  FilterWrongAnswerDto,
  UpdateWrongReasonDto,
} from './dto/wrong-answer-request.dto';
import {
  GradeResultResponseDto,
  WrongAnswerListResponseDto,
  WrongAnswerSummaryDto,
  WrongAnswerByExamResponseDto,
  WrongAnswerDetailDto,
} from './dto/wrong-answer-response.dto';

@Injectable()
export class WrongAnswerService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 답안 채점 및 저장
   */
  async gradeAnswers(dto: WrongAnswerGradeDto): Promise<GradeResultResponseDto> {
    const { studentId, mockExamId, subjectAreaName, subjectName, answers } = dto;

    // 학생 확인 (memberId로 조회, 없으면 자동 생성)
    const ehMemberId = toMogoMemberId(studentId);
    let member = await this.prisma.member.findUnique({
      where: { memberId: ehMemberId },
    });
    if (!member) {
      // 학생이 없으면 자동 생성
      member = await this.prisma.member.create({
        data: {
          memberId: ehMemberId,
          year: new Date().getFullYear(),
          name: `학생${studentId}`,
        },
      });
    }
    const numericMemberId = member.id;

    // 모의고사 확인
    const mockExam = await this.prisma.mockExam.findUnique({
      where: { id: mockExamId },
    });
    if (!mockExam) {
      throw new NotFoundException(`모의고사 ID ${mockExamId}를 찾을 수 없습니다.`);
    }

    // 해당 모의고사의 문제들 조회
    const questionWhere: any = { mockExamId };
    if (subjectAreaName) questionWhere.subjectAreaName = subjectAreaName;
    if (subjectName) questionWhere.subjectName = subjectName;

    const questions = await this.prisma.examQuestion.findMany({
      where: questionWhere,
      orderBy: { questionNumber: 'asc' },
    });

    if (questions.length === 0) {
      throw new BadRequestException('해당 조건에 맞는 문제가 없습니다.');
    }

    // 문제 번호로 빠른 검색을 위한 맵 생성
    const questionMap = new Map(questions.map((q) => [q.questionNumber, q]));

    // 채점 결과 및 저장 데이터 준비
    const results: any[] = [];
    const answersToUpsert: any[] = [];
    let correctCount = 0;
    let totalScore = 0;
    let earnedScore = 0;

    for (const answer of answers) {
      const question = questionMap.get(answer.questionNumber);
      if (!question) {
        continue; // 해당 문제 번호가 없으면 스킵
      }

      const isCorrect = answer.selectedAnswer === question.answer;
      const questionScore = question.score || 2;
      const earned = isCorrect ? questionScore : 0;

      totalScore += questionScore;
      earnedScore += earned;
      if (isCorrect) correctCount++;

      results.push({
        questionNumber: answer.questionNumber,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.answer,
        isCorrect,
        earnedScore: earned,
      });

      answersToUpsert.push({
        studentId: numericMemberId, // numeric member.id for Prisma
        mockExamId,
        examQuestionId: question.id,
        subjectAreaName: question.subjectAreaName,
        subjectName: question.subjectName,
        questionNumber: answer.questionNumber,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.answer,
        isCorrect,
        score: questionScore,
        earnedScore: earned,
      });
    }

    // 답안 저장 (upsert)
    for (const answerData of answersToUpsert) {
      await this.prisma.studentAnswer.upsert({
        where: {
          memberId_examQuestionId: {
            memberId: answerData.studentId,
            examQuestionId: answerData.examQuestionId,
          },
        },
        update: {
          selectedAnswer: answerData.selectedAnswer,
          isCorrect: answerData.isCorrect,
          earnedScore: answerData.earnedScore,
        },
        create: {
          memberId: answerData.studentId,
          mockExamId: answerData.mockExamId,
          examQuestionId: answerData.examQuestionId,
          subjectAreaName: answerData.subjectAreaName,
          subjectName: answerData.subjectName,
          questionNumber: answerData.questionNumber,
          selectedAnswer: answerData.selectedAnswer,
          correctAnswer: answerData.correctAnswer,
          isCorrect: answerData.isCorrect,
          score: answerData.score,
          earnedScore: answerData.earnedScore,
        },
      });
    }

    // 성적 테이블(eh_student_scores) 업데이트
    // 현재 과목(Area)에 따라 점수 필드 매핑
    const scoreUpdateData: any = {};

    // 과목별 점수 매핑 로직
    // 국어(Korean) -> koreanRaw
    // 수학(Math) -> mathRaw
    // 영어(English) -> englishRaw (절대평가 등급은 별도 계산 필요하지만 일단 원점수 저장)
    // 한국사(History) -> historyRaw
    // 탐구(Inquiry) -> inquiry1Raw / inquiry2Raw (선택과목명으로 구분 필요)

    if (subjectAreaName === '국어') {
      scoreUpdateData.koreanRaw = earnedScore;
      if (dto.subjectName) scoreUpdateData.koreanSelection = dto.subjectName;
    } else if (subjectAreaName === '수학') {
      scoreUpdateData.mathRaw = earnedScore;
      if (dto.subjectName) scoreUpdateData.mathSelection = dto.subjectName;
    } else if (subjectAreaName === '영어') {
      scoreUpdateData.englishRaw = earnedScore;
    } else if (subjectAreaName === '한국사') {
      scoreUpdateData.historyRaw = earnedScore;
    } else if (subjectAreaName === '사회탐구' || subjectAreaName === '과학탐구') {
      // 탐구는 1, 2 과목 구분 필요 -> 기존 점수 조회해서 비어있는 곳에 넣거나
      // dto에 inquiryIndex가 있으면 좋겠지만, 지금은 subjectName으로 판단
      // 지금은 단순하게: 기존 점수가 있으면 inquiry2, 없으면 inquiry1 (단, 같은 과목이면 덮어쓰기)

      // 기존 점수 조회
      const existingScore = await this.prisma.studentScore.findUnique({
        where: {
          memberId_mockExamId: {
            memberId: numericMemberId,
            mockExamId,
          },
        },
      });

      if (existingScore) {
        if (existingScore.inquiry1Selection === subjectName) {
          scoreUpdateData.inquiry1Raw = earnedScore;
          scoreUpdateData.inquiry1Selection = subjectName;
        } else if (existingScore.inquiry2Selection === subjectName) {
          scoreUpdateData.inquiry2Raw = earnedScore;
          scoreUpdateData.inquiry2Selection = subjectName;
        } else if (!existingScore.inquiry1Selection) {
          scoreUpdateData.inquiry1Raw = earnedScore;
          scoreUpdateData.inquiry1Selection = subjectName;
        } else {
          scoreUpdateData.inquiry2Raw = earnedScore;
          scoreUpdateData.inquiry2Selection = subjectName;
        }
      } else {
        scoreUpdateData.inquiry1Raw = earnedScore;
        scoreUpdateData.inquiry1Selection = subjectName;
      }
    }

    // 점수 저장 (upsert)
    await this.prisma.studentScore.upsert({
      where: {
        memberId_mockExamId: {
          memberId: numericMemberId,
          mockExamId,
        },
      },
      update: scoreUpdateData,
      create: {
        memberId: numericMemberId,
        mockExamId,
        ...scoreUpdateData,
      },
    });

    return {
      memberId: numericMemberId,
      mockExamId,
      subjectAreaName,
      subjectName,
      results,
      totalQuestions: results.length,
      correctCount,
      wrongCount: results.length - correctCount,
      totalScore,
      earnedScore,
      correctRate: results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0,
    };
  }

  /**
   * 오답 목록 조회 (필터링 지원)
   */
  async findWrongAnswers(
    studentId: string,
    filter: FilterWrongAnswerDto,
  ): Promise<WrongAnswerListResponseDto> {
    const member = await this.prisma.member.findUnique({ where: { memberId: toMogoMemberId(studentId) } });
    if (!member) return { memberId: 0, items: [], totalCount: 0, page: 1, limit: 20, totalPages: 0 };
    const numericId = member.id;
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = { memberId: numericId };

    if (filter.mockExamId) {
      where.mockExamId = filter.mockExamId;
    }
    if (filter.subjectAreaName) {
      where.subjectAreaName = filter.subjectAreaName;
    }
    if (filter.subjectName) {
      where.subjectName = filter.subjectName;
    }
    if (filter.bookmarkedOnly) {
      where.isBookmarked = true;
    }
    if (filter.wrongOnly !== false) {
      // 기본값: 오답만
      where.isCorrect = false;
    }
    if (filter.maxReviewCount !== undefined) {
      where.reviewCount = { lte: filter.maxReviewCount };
    }

    // 전체 개수 조회
    const totalCount = await this.prisma.studentAnswer.count({ where });

    // 데이터 조회
    const answers = await this.prisma.studentAnswer.findMany({
      where,
      skip,
      take: limit,
      include: {
        mockExam: {
          select: {
            id: true,
            name: true,
            year: true,
            month: true,
          },
        },
        examQuestion: {
          select: {
            difficulty: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { questionNumber: 'asc' }],
    });

    // 응답 형식으로 변환
    const items: WrongAnswerDetailDto[] = answers.map((a) => ({
      id: a.id,
      memberId: a.memberId,
      mockExamId: a.mockExamId,
      examQuestionId: a.examQuestionId,
      subjectAreaName: a.subjectAreaName || undefined,
      subjectName: a.subjectName || undefined,
      questionNumber: a.questionNumber,
      selectedAnswer: a.selectedAnswer,
      correctAnswer: a.correctAnswer,
      isCorrect: a.isCorrect,
      score: a.score || undefined,
      earnedScore: a.earnedScore || undefined,
      wrongReason: a.wrongReason || undefined,
      reviewCount: a.reviewCount,
      lastReviewedAt: a.lastReviewedAt || undefined,
      isBookmarked: a.isBookmarked,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      difficulty: a.examQuestion?.difficulty || undefined,
      mockExamName: a.mockExam?.name,
      mockExamYear: a.mockExam?.year || undefined,
      mockExamMonth: a.mockExam?.month || undefined,
    }));

    return {
      memberId: numericId,
      items,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  /**
   * 개별 답안 조회
   */
  async findOne(id: number) {
    const answer = await this.prisma.studentAnswer.findUnique({
      where: { id },
      include: {
        member: true,
        mockExam: true,
        examQuestion: true,
      },
    });

    if (!answer) {
      throw new NotFoundException(`답안 ID ${id}를 찾을 수 없습니다.`);
    }

    return answer;
  }

  /**
   * 오답 이유 업데이트
   */
  async updateWrongReason(id: number, dto: UpdateWrongReasonDto) {
    await this.findOne(id); // 존재 확인

    return this.prisma.studentAnswer.update({
      where: { id },
      data: { wrongReason: dto.wrongReason },
    });
  }

  /**
   * 북마크 토글
   */
  async toggleBookmark(id: number) {
    const answer = await this.findOne(id);

    return this.prisma.studentAnswer.update({
      where: { id },
      data: { isBookmarked: !answer.isBookmarked },
    });
  }

  /**
   * 복습 기록
   */
  async recordReview(id: number) {
    await this.findOne(id); // 존재 확인

    return this.prisma.studentAnswer.update({
      where: { id },
      data: {
        reviewCount: { increment: 1 },
        lastReviewedAt: new Date(),
      },
    });
  }

  /**
   * 오답 요약 통계 조회
   */
  async getSummary(studentId: string): Promise<WrongAnswerSummaryDto> {
    const member = await this.prisma.member.findUnique({ where: { memberId: toMogoMemberId(studentId) } });
    const numericId = member?.id ?? -1;
    // 전체 통계
    const totalAnswers = await this.prisma.studentAnswer.count({
      where: { memberId: numericId },
    });

    const correctCount = await this.prisma.studentAnswer.count({
      where: { memberId: numericId, isCorrect: true },
    });

    const wrongCount = totalAnswers - correctCount;

    const bookmarkedCount = await this.prisma.studentAnswer.count({
      where: { memberId: numericId, isBookmarked: true },
    });

    const needReviewCount = await this.prisma.studentAnswer.count({
      where: { memberId: numericId, isCorrect: false, reviewCount: 0 },
    });

    // 과목별 통계
    const bySubjectRaw = await this.prisma.studentAnswer.groupBy({
      by: ['subjectAreaName', 'subjectName'],
      where: { memberId: numericId },
      _count: { id: true },
    });

    const bySubjectWrong = await this.prisma.studentAnswer.groupBy({
      by: ['subjectAreaName', 'subjectName'],
      where: { memberId: numericId, isCorrect: false },
      _count: { id: true },
    });

    const bySubjectNeedReview = await this.prisma.studentAnswer.groupBy({
      by: ['subjectAreaName', 'subjectName'],
      where: { memberId: numericId, isCorrect: false, reviewCount: 0 },
      _count: { id: true },
    });

    // 과목별 통계 병합
    const subjectMap = new Map<string, any>();

    for (const item of bySubjectRaw) {
      const key = `${item.subjectAreaName || ''}_${item.subjectName || ''}`;
      subjectMap.set(key, {
        subjectAreaName: item.subjectAreaName || '미분류',
        subjectName: item.subjectName || undefined,
        totalCount: item._count?.id || 0,
        wrongCount: 0,
        needReviewCount: 0,
      });
    }

    for (const item of bySubjectWrong) {
      const key = `${item.subjectAreaName || ''}_${item.subjectName || ''}`;
      const existing = subjectMap.get(key);
      if (existing) {
        existing.wrongCount = item._count?.id || 0;
      }
    }

    for (const item of bySubjectNeedReview) {
      const key = `${item.subjectAreaName || ''}_${item.subjectName || ''}`;
      const existing = subjectMap.get(key);
      if (existing) {
        existing.needReviewCount = item._count?.id || 0;
      }
    }

    const bySubject = Array.from(subjectMap.values()).map((s) => ({
      ...s,
      wrongRate: s.totalCount > 0 ? Math.round((s.wrongCount / s.totalCount) * 100) : 0,
    }));

    return {
      memberId: numericId,
      totalAnswers,
      correctCount,
      wrongCount,
      overallCorrectRate: totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0,
      bookmarkedCount,
      needReviewCount,
      bySubject,
    };
  }

  /**
   * 모의고사별 오답 현황 조회
   */
  async getByExam(studentId: string): Promise<WrongAnswerByExamResponseDto> {
    const member = await this.prisma.member.findUnique({ where: { memberId: toMogoMemberId(studentId) } });
    const numericId = member?.id ?? -1;
    // 모의고사별 전체 답안 수
    const totalByExam = await this.prisma.studentAnswer.groupBy({
      by: ['mockExamId'],
      where: { memberId: numericId },
      _count: { id: true },
    });

    // 모의고사별 오답 수
    const wrongByExam = await this.prisma.studentAnswer.groupBy({
      by: ['mockExamId'],
      where: { memberId: numericId, isCorrect: false },
      _count: { id: true },
    });

    // 모의고사 정보 조회
    const mockExamIds = totalByExam.map((t) => t.mockExamId);
    const mockExams = await this.prisma.mockExam.findMany({
      where: { id: { in: mockExamIds } },
      select: { id: true, name: true, year: true, month: true },
    });
    const mockExamMap = new Map(mockExams.map((m) => [m.id, m]));

    // 오답 수 맵 생성
    const wrongMap = new Map(wrongByExam.map((w) => [w.mockExamId, w._count?.id || 0]));

    // 결과 생성
    const exams = totalByExam.map((t) => {
      const mockExam = mockExamMap.get(t.mockExamId);
      const wrongCount = wrongMap.get(t.mockExamId) || 0;
      return {
        mockExamId: t.mockExamId,
        mockExamName: mockExam?.name || '알 수 없음',
        year: mockExam?.year || undefined,
        month: mockExam?.month || undefined,
        totalCount: t._count?.id || 0,
        wrongCount,
        wrongRate: (t._count?.id || 0) > 0 ? Math.round((wrongCount / (t._count?.id || 1)) * 100) : 0,
      };
    });

    // 년도/월 기준 정렬
    exams.sort((a, b) => {
      if (a.year !== b.year) return (b.year || 0) - (a.year || 0);
      return (b.month || 0) - (a.month || 0);
    });

    return {
      memberId: numericId,
      exams,
    };
  }

  /**
   * 답안 삭제
   */
  async remove(id: number) {
    await this.findOne(id); // 존재 확인

    return this.prisma.studentAnswer.delete({
      where: { id },
    });
  }

  /**
   * 학생의 특정 모의고사 답안 전체 삭제
   */
  async removeByExam(studentId: string, mockExamId: number) {
    const member = await this.prisma.member.findUnique({ where: { memberId: toMogoMemberId(studentId) } });
    if (!member) return { count: 0 };
    return this.prisma.studentAnswer.deleteMany({
      where: { memberId: member.id, mockExamId },
    });
  }
}
