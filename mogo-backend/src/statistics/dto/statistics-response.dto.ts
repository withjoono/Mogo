import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 단일 시험 데이터 포인트
 */
export class ExamDataPointDto {
  @ApiProperty({ description: '모의고사 ID' })
  mockExamId: number;

  @ApiProperty({ description: '모의고사명' })
  examName: string;

  @ApiProperty({ description: '연도' })
  year: number;

  @ApiProperty({ description: '월' })
  month: number;

  @ApiPropertyOptional({ description: '등급' })
  grade?: number;

  @ApiPropertyOptional({ description: '백분위' })
  percentile?: number;

  @ApiPropertyOptional({ description: '표준점수' })
  standardScore?: number;

  @ApiPropertyOptional({ description: '원점수' })
  rawScore?: number;

  @ApiPropertyOptional({ description: '상위누백 (표점 기준)' })
  topCumulativeStd?: number;

  @ApiPropertyOptional({ description: '상위누백 (원점수 기준)' })
  topCumulativeRaw?: number;
}

/**
 * 과목별 성적 추이
 */
export class SubjectTrendDto {
  @ApiProperty({ description: '과목명' })
  subject: string;

  @ApiPropertyOptional({ description: '선택과목' })
  selection?: string;

  @ApiProperty({ description: '시험별 데이터', type: [ExamDataPointDto] })
  dataPoints: ExamDataPointDto[];

  @ApiPropertyOptional({ description: '평균 등급' })
  avgGrade?: number;

  @ApiPropertyOptional({ description: '최고 등급' })
  bestGrade?: number;

  @ApiPropertyOptional({ description: '최저 등급' })
  worstGrade?: number;

  @ApiPropertyOptional({ description: '등급 변화 추세 (상승/하락/유지)' })
  trend?: 'up' | 'down' | 'stable';
}

/**
 * 성적 추이 응답
 */
export class TrendAnalysisDto {
  @ApiProperty({ description: '학생 ID' })
  studentId: number;

  @ApiProperty({ description: '분석 기간 시작' })
  periodStart: string;

  @ApiProperty({ description: '분석 기간 종료' })
  periodEnd: string;

  @ApiProperty({ description: '총 시험 횟수' })
  totalExams: number;

  @ApiProperty({ description: '과목별 추이', type: [SubjectTrendDto] })
  subjects: SubjectTrendDto[];

  @ApiPropertyOptional({ description: '전체 평균 등급 추이', type: [ExamDataPointDto] })
  overallTrend?: ExamDataPointDto[];
}

/**
 * 누적 통계
 */
export class CumulativeStatsDto {
  @ApiProperty({ description: '과목명' })
  subject: string;

  @ApiProperty({ description: '시험 횟수' })
  examCount: number;

  @ApiPropertyOptional({ description: '평균 등급' })
  avgGrade?: number;

  @ApiPropertyOptional({ description: '평균 백분위' })
  avgPercentile?: number;

  @ApiPropertyOptional({ description: '평균 표준점수' })
  avgStandardScore?: number;

  @ApiPropertyOptional({ description: '최고 등급' })
  bestGrade?: number;

  @ApiPropertyOptional({ description: '최저 등급' })
  worstGrade?: number;

  @ApiPropertyOptional({ description: '표준편차 (등급)' })
  stdDevGrade?: number;
}

/**
 * 누적 분석 응답
 */
export class CumulativeAnalysisDto {
  @ApiProperty({ description: '학생 ID' })
  studentId: number;

  @ApiProperty({ description: '총 시험 횟수' })
  totalExams: number;

  @ApiProperty({ description: '과목별 누적 통계', type: [CumulativeStatsDto] })
  subjectStats: CumulativeStatsDto[];

  @ApiProperty({ description: '전체 평균 등급' })
  overallAvgGrade: number;

  @ApiPropertyOptional({ description: '전체 평균 표준점수 합계' })
  overallAvgStandardSum?: number;

  @ApiProperty({ description: '성적 안정성 (높음/보통/낮음)' })
  stability: 'high' | 'medium' | 'low';

  @ApiProperty({ description: '전체 추세' })
  overallTrend: 'improving' | 'declining' | 'stable';
}

/**
 * 과목별 상세 분석
 */
export class SubjectDetailAnalysisDto {
  @ApiProperty({ description: '과목명' })
  subject: string;

  @ApiPropertyOptional({ description: '선택과목' })
  selection?: string;

  @ApiProperty({ description: '시험별 상세 데이터', type: [ExamDataPointDto] })
  exams: ExamDataPointDto[];

  @ApiProperty({ description: '통계 요약' })
  summary: {
    examCount: number;
    avgGrade?: number;
    avgPercentile?: number;
    avgStandardScore?: number;
    bestGrade?: number;
    worstGrade?: number;
    trend: 'up' | 'down' | 'stable';
    improvementRate?: number; // 향상률 (%)
  };

  @ApiPropertyOptional({ description: '추천 메시지' })
  recommendation?: string;
}

/**
 * 과목별 분석 응답
 */
export class SubjectAnalysisResponseDto {
  @ApiProperty({ description: '학생 ID' })
  studentId: number;

  @ApiPropertyOptional({ description: '요청된 과목 (없으면 전체)' })
  requestedSubject?: string;

  @ApiProperty({ description: '과목별 상세 분석', type: [SubjectDetailAnalysisDto] })
  analyses: SubjectDetailAnalysisDto[];
}
