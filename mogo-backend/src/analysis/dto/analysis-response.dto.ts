import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 과목별 점수 정보
 */
export class SubjectScoreDto {
  @ApiProperty({ description: '과목명' })
  subject: string;

  @ApiPropertyOptional({ description: '선택과목 (화작, 미적 등)' })
  selection?: string;

  @ApiPropertyOptional({ description: '원점수' })
  rawScore?: number;

  @ApiPropertyOptional({ description: '표준점수' })
  standardScore?: number;

  @ApiPropertyOptional({ description: '백분위' })
  percentile?: number;

  @ApiPropertyOptional({ description: '등급' })
  grade?: number;
}

/**
 * 성적 요약 응답
 */
export class ScoreSummaryDto {
  @ApiProperty({ description: '점수 ID' })
  scoreId: number;

  @ApiProperty({ description: '모의고사 정보' })
  mockExam: {
    id: number;
    code: string;
    name: string;
    year: number;
    month: number;
    grade: string;
  };

  @ApiProperty({ description: '과목별 점수', type: [SubjectScoreDto] })
  subjects: SubjectScoreDto[];

  @ApiProperty({ description: '총 표준점수 합계' })
  totalStandardSum: number;

  @ApiPropertyOptional({ description: '총 백분위 합계' })
  totalPercentileSum?: number;

  @ApiPropertyOptional({ description: '상위 누적 백분위 (표준점수 기준)' })
  topCumulativeStd?: number;
}

/**
 * 반영비율 분석 - 대학별 결과
 */
export class ReflectionResultDto {
  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '학과명' })
  departmentName: string;

  @ApiProperty({ description: '국어 반영비율 (%)' })
  koreanRatio: number;

  @ApiProperty({ description: '수학 반영비율 (%)' })
  mathRatio: number;

  @ApiProperty({ description: '영어 반영비율 (%)' })
  englishRatio: number;

  @ApiProperty({ description: '탐구 반영비율 (%)' })
  inquiryRatio: number;

  @ApiProperty({ description: '환산 점수 (1000점 만점)' })
  convertedScore: number;

  @ApiPropertyOptional({ description: '영어 등급 감점' })
  englishDeduction?: number;

  @ApiPropertyOptional({ description: '예상 등급' })
  estimatedGrade?: string;
}

/**
 * 반영비율 분석 응답
 */
export class ReflectionAnalysisDto {
  @ApiProperty({ description: '점수 ID' })
  scoreId: number;

  @ApiProperty({ description: '원본 점수 정보', type: [SubjectScoreDto] })
  originalScores: SubjectScoreDto[];

  @ApiProperty({ description: '대학별 분석 결과', type: [ReflectionResultDto] })
  results: ReflectionResultDto[];
}

/**
 * 조합별 분석 결과
 */
export class CombinationResultDto {
  @ApiProperty({ description: '조합명 (예: 국수탐, 국영탐)' })
  combinationName: string;

  @ApiProperty({ description: '포함 과목' })
  subjects: string[];

  @ApiProperty({ description: '표준점수 합계' })
  totalStandardScore: number;

  @ApiPropertyOptional({ description: '백분위 평균' })
  avgPercentile?: number;

  @ApiPropertyOptional({ description: '등급 평균' })
  avgGrade?: number;
}

/**
 * 조합별 분석 응답
 */
export class CombinationAnalysisDto {
  @ApiProperty({ description: '점수 ID' })
  scoreId: number;

  @ApiProperty({ description: '조합별 분석 결과', type: [CombinationResultDto] })
  combinations: CombinationResultDto[];
}

/**
 * 성취수준 분석 응답
 */
export class AchievementAnalysisDto {
  @ApiProperty({ description: '점수 ID' })
  scoreId: number;

  @ApiProperty({ description: '과목별 성취수준' })
  achievements: {
    subject: string;
    grade: number;
    gradeLabel: string; // '1등급', '2등급' 등
    percentile?: number;
    status: 'excellent' | 'good' | 'average' | 'belowAverage' | 'needsImprovement';
    message: string;
  }[];

  @ApiProperty({ description: '전체 평가' })
  overallAssessment: {
    avgGrade: number;
    strongSubjects: string[];
    weakSubjects: string[];
    recommendation: string;
  };
}
