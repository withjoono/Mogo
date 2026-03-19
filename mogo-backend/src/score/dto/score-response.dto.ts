import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScoreResponseDto {
  @ApiProperty({ description: '점수 ID' })
  id: number;

  @ApiProperty({ description: '학생 ID' })
  studentId: number;

  @ApiProperty({ description: '모의고사 ID' })
  mockExamId: number;

  // 국어
  @ApiPropertyOptional({ description: '국어 선택과목' })
  koreanSelection?: string;

  @ApiPropertyOptional({ description: '국어 원점수' })
  koreanRaw?: number;

  @ApiPropertyOptional({ description: '국어 표준점수' })
  koreanStandard?: number;

  @ApiPropertyOptional({ description: '국어 백분위' })
  koreanPercentile?: number;

  @ApiPropertyOptional({ description: '국어 등급' })
  koreanGrade?: number;

  // 영어
  @ApiPropertyOptional({ description: '영어 원점수' })
  englishRaw?: number;

  @ApiPropertyOptional({ description: '영어 등급' })
  englishGrade?: number;

  // 수학
  @ApiPropertyOptional({ description: '수학 선택과목' })
  mathSelection?: string;

  @ApiPropertyOptional({ description: '수학 원점수' })
  mathRaw?: number;

  @ApiPropertyOptional({ description: '수학 표준점수' })
  mathStandard?: number;

  @ApiPropertyOptional({ description: '수학 백분위' })
  mathPercentile?: number;

  @ApiPropertyOptional({ description: '수학 등급' })
  mathGrade?: number;

  // 탐구1
  @ApiPropertyOptional({ description: '탐구1 선택과목' })
  inquiry1Selection?: string;

  @ApiPropertyOptional({ description: '탐구1 원점수' })
  inquiry1Raw?: number;

  @ApiPropertyOptional({ description: '탐구1 표준점수' })
  inquiry1Standard?: number;

  @ApiPropertyOptional({ description: '탐구1 백분위' })
  inquiry1Percentile?: number;

  @ApiPropertyOptional({ description: '탐구1 등급' })
  inquiry1Grade?: number;

  // 탐구2
  @ApiPropertyOptional({ description: '탐구2 선택과목' })
  inquiry2Selection?: string;

  @ApiPropertyOptional({ description: '탐구2 원점수' })
  inquiry2Raw?: number;

  @ApiPropertyOptional({ description: '탐구2 표준점수' })
  inquiry2Standard?: number;

  @ApiPropertyOptional({ description: '탐구2 백분위' })
  inquiry2Percentile?: number;

  @ApiPropertyOptional({ description: '탐구2 등급' })
  inquiry2Grade?: number;

  // 한국사
  @ApiPropertyOptional({ description: '한국사 원점수' })
  historyRaw?: number;

  @ApiPropertyOptional({ description: '한국사 등급' })
  historyGrade?: number;

  // 제2외국어
  @ApiPropertyOptional({ description: '제2외국어 선택과목' })
  foreignSelection?: string;

  @ApiPropertyOptional({ description: '제2외국어 원점수' })
  foreignRaw?: number;

  @ApiPropertyOptional({ description: '제2외국어 등급' })
  foreignGrade?: number;

  // 합산
  @ApiPropertyOptional({ description: '국수탐 표준점수 합계' })
  totalStandardSum?: number;

  @ApiPropertyOptional({ description: '국수탐 백분위 합계' })
  totalPercentileSum?: number;

  @ApiPropertyOptional({ description: '상위누백(표점)' })
  topCumulativeStd?: number;

  @ApiPropertyOptional({ description: '상위누백(원점)' })
  topCumulativeRaw?: number;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;

  @ApiProperty({ description: '수정일' })
  updatedAt: Date;
}










