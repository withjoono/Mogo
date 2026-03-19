import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 학생 답안 기본 응답 DTO
 */
export class StudentAnswerDto {
  @ApiProperty({ description: '답안 ID' })
  id: number;

  @ApiProperty({ description: '학생 ID' })
  memberId: number;

  @ApiProperty({ description: '모의고사 ID' })
  mockExamId: number;

  @ApiProperty({ description: '문제 ID' })
  examQuestionId: number;

  @ApiPropertyOptional({ description: '교과 영역명' })
  subjectAreaName?: string;

  @ApiPropertyOptional({ description: '세부 과목명' })
  subjectName?: string;

  @ApiProperty({ description: '문제 번호' })
  questionNumber: number;

  @ApiProperty({ description: '선택한 답' })
  selectedAnswer: number;

  @ApiProperty({ description: '정답' })
  correctAnswer: number;

  @ApiProperty({ description: '정답 여부' })
  isCorrect: boolean;

  @ApiPropertyOptional({ description: '문제 배점' })
  score?: number;

  @ApiPropertyOptional({ description: '획득 점수' })
  earnedScore?: number;

  @ApiPropertyOptional({ description: '오답 이유' })
  wrongReason?: string;

  @ApiProperty({ description: '복습 횟수' })
  reviewCount: number;

  @ApiPropertyOptional({ description: '마지막 복습 일시' })
  lastReviewedAt?: Date;

  @ApiProperty({ description: '북마크 여부' })
  isBookmarked: boolean;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}

/**
 * 문제 정보가 포함된 오답 상세 응답 DTO
 */
export class WrongAnswerDetailDto extends StudentAnswerDto {
  @ApiPropertyOptional({ description: '문제 난이도 (상/중/하)' })
  difficulty?: string;

  @ApiPropertyOptional({ description: '정답률 (%)' })
  correctRate?: number;

  @ApiPropertyOptional({ description: '모의고사명' })
  mockExamName?: string;

  @ApiPropertyOptional({ description: '모의고사 년도' })
  mockExamYear?: number;

  @ApiPropertyOptional({ description: '모의고사 월' })
  mockExamMonth?: number;
}

/**
 * 오답 목록 응답 DTO
 */
export class WrongAnswerListResponseDto {
  @ApiProperty({ description: '학생 ID' })
  memberId: number;

  @ApiProperty({ description: '오답 목록', type: [WrongAnswerDetailDto] })
  items: WrongAnswerDetailDto[];

  @ApiProperty({ description: '전체 개수' })
  totalCount: number;

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지당 항목 수' })
  limit: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;
}

/**
 * 채점 결과 항목 DTO
 */
export class GradeResultItemDto {
  @ApiProperty({ description: '문제 번호' })
  questionNumber: number;

  @ApiProperty({ description: '선택한 답' })
  selectedAnswer: number;

  @ApiProperty({ description: '정답' })
  correctAnswer: number;

  @ApiProperty({ description: '정답 여부' })
  isCorrect: boolean;

  @ApiProperty({ description: '획득 점수' })
  earnedScore: number;
}

/**
 * 채점 결과 응답 DTO
 */
export class GradeResultResponseDto {
  @ApiProperty({ description: '학생 ID' })
  memberId: number;

  @ApiProperty({ description: '모의고사 ID' })
  mockExamId: number;

  @ApiPropertyOptional({ description: '교과 영역명' })
  subjectAreaName?: string;

  @ApiPropertyOptional({ description: '세부 과목명' })
  subjectName?: string;

  @ApiProperty({ description: '채점 결과 목록', type: [GradeResultItemDto] })
  results: GradeResultItemDto[];

  @ApiProperty({ description: '총 문제 수' })
  totalQuestions: number;

  @ApiProperty({ description: '정답 수' })
  correctCount: number;

  @ApiProperty({ description: '오답 수' })
  wrongCount: number;

  @ApiProperty({ description: '총점' })
  totalScore: number;

  @ApiProperty({ description: '획득 점수' })
  earnedScore: number;

  @ApiProperty({ description: '정답률 (%)' })
  correctRate: number;
}

/**
 * 과목별 오답 통계 DTO
 */
export class SubjectWrongStatDto {
  @ApiProperty({ description: '교과 영역명' })
  subjectAreaName: string;

  @ApiPropertyOptional({ description: '세부 과목명' })
  subjectName?: string;

  @ApiProperty({ description: '총 문제 수' })
  totalCount: number;

  @ApiProperty({ description: '오답 수' })
  wrongCount: number;

  @ApiProperty({ description: '오답률 (%)' })
  wrongRate: number;

  @ApiProperty({ description: '복습 필요 문제 수 (복습 0회)' })
  needReviewCount: number;
}

/**
 * 오답 요약 통계 응답 DTO
 */
export class WrongAnswerSummaryDto {
  @ApiProperty({ description: '학생 ID' })
  memberId: number;

  @ApiProperty({ description: '총 답안 수' })
  totalAnswers: number;

  @ApiProperty({ description: '정답 수' })
  correctCount: number;

  @ApiProperty({ description: '오답 수' })
  wrongCount: number;

  @ApiProperty({ description: '전체 정답률 (%)' })
  overallCorrectRate: number;

  @ApiProperty({ description: '북마크된 문제 수' })
  bookmarkedCount: number;

  @ApiProperty({ description: '복습이 필요한 문제 수 (오답 중 복습 0회)' })
  needReviewCount: number;

  @ApiProperty({ description: '과목별 오답 통계', type: [SubjectWrongStatDto] })
  bySubject: SubjectWrongStatDto[];
}

/**
 * 모의고사별 오답 통계 DTO
 */
export class MockExamWrongStatDto {
  @ApiProperty({ description: '모의고사 ID' })
  mockExamId: number;

  @ApiProperty({ description: '모의고사명' })
  mockExamName: string;

  @ApiPropertyOptional({ description: '년도' })
  year?: number;

  @ApiPropertyOptional({ description: '월' })
  month?: number;

  @ApiProperty({ description: '총 답안 수' })
  totalCount: number;

  @ApiProperty({ description: '오답 수' })
  wrongCount: number;

  @ApiProperty({ description: '오답률 (%)' })
  wrongRate: number;
}

/**
 * 모의고사별 오답 현황 응답 DTO
 */
export class WrongAnswerByExamResponseDto {
  @ApiProperty({ description: '학생 ID' })
  memberId: number;

  @ApiProperty({ description: '모의고사별 통계', type: [MockExamWrongStatDto] })
  exams: MockExamWrongStatDto[];
}
