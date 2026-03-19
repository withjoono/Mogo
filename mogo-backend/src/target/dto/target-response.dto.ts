import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 목표 대학 정보
 */
export class TargetUniversityDto {
  @ApiProperty({ description: '목표 ID' })
  id: number;

  @ApiProperty({ description: '학생 ID' })
  studentId: number;

  @ApiProperty({ description: '우선순위' })
  priority: number;

  @ApiPropertyOptional({ description: '대학학과코드' })
  departmentCode?: string;

  @ApiPropertyOptional({ description: '대학명' })
  universityName?: string;

  @ApiPropertyOptional({ description: '학과명' })
  departmentName?: string;

  @ApiPropertyOptional({ description: '계열' })
  category?: string;

  @ApiProperty({ description: '생성일' })
  createdAt: string;
}

/**
 * 목표 대학 목록 응답
 */
export class TargetListResponseDto {
  @ApiProperty({ description: '학생 ID' })
  studentId: number;

  @ApiProperty({ description: '목표 대학 목록', type: [TargetUniversityDto] })
  targets: TargetUniversityDto[];

  @ApiProperty({ description: '총 개수' })
  totalCount: number;

  @ApiProperty({ description: '최대 등록 가능 개수' })
  maxCount: number;
}

/**
 * 시험별 비교 데이터
 */
export class ExamComparisonDataDto {
  @ApiProperty({ description: '모의고사 ID' })
  mockExamId: number;

  @ApiProperty({ description: '모의고사명' })
  examName: string;

  @ApiProperty({ description: '연도' })
  year: number;

  @ApiProperty({ description: '월' })
  month: number;

  @ApiPropertyOptional({ description: '내 환산점수' })
  myScore?: number;

  @ApiPropertyOptional({ description: '내 평균 등급' })
  myGrade?: number;

  @ApiPropertyOptional({ description: '목표 대학 최초컷 점수' })
  targetFirstCut?: number;

  @ApiPropertyOptional({ description: '목표 대학 추합컷 점수' })
  targetFinalCut?: number;

  @ApiPropertyOptional({ description: '점수 차이 (내 점수 - 최초컷)' })
  scoreDiff?: number;

  @ApiPropertyOptional({ description: '합격 가능성' })
  possibility?: 'safe' | 'possible' | 'challenging' | 'difficult';
}

/**
 * 대학별 비교 결과
 */
export class TargetComparisonResultDto {
  @ApiProperty({ description: '목표 ID' })
  targetId: number;

  @ApiProperty({ description: '우선순위' })
  priority: number;

  @ApiProperty({ description: '대학명' })
  universityName: string;

  @ApiProperty({ description: '학과명' })
  departmentName: string;

  @ApiPropertyOptional({ description: '계열' })
  category?: string;

  @ApiProperty({ description: '시험별 비교 데이터', type: [ExamComparisonDataDto] })
  examComparisons: ExamComparisonDataDto[];

  @ApiPropertyOptional({ description: '평균 점수 차이' })
  avgScoreDiff?: number;

  @ApiPropertyOptional({ description: '전체 합격 가능성' })
  overallPossibility?: 'safe' | 'possible' | 'challenging' | 'difficult';

  @ApiPropertyOptional({ description: '추천 메시지' })
  recommendation?: string;
}

/**
 * 목표 대학 비교 응답
 */
export class TargetComparisonResponseDto {
  @ApiProperty({ description: '학생 ID' })
  studentId: number;

  @ApiProperty({ description: '분석 기간' })
  period: {
    start: string;
    end: string;
  };

  @ApiProperty({ description: '총 시험 횟수' })
  totalExams: number;

  @ApiProperty({ description: '대학별 비교 결과', type: [TargetComparisonResultDto] })
  comparisons: TargetComparisonResultDto[];
}
