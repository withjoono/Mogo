import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class CreateScoreDto {
  @ApiProperty({ description: '학생 ID (memberId)' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: '모의고사 ID' })
  @IsInt()
  mockExamId: number;

  // === 국어 ===
  @ApiPropertyOptional({ description: '국어 선택과목 (화작/언매)' })
  @IsOptional()
  @IsString()
  koreanSelection?: string;

  @ApiPropertyOptional({ description: '국어 원점수 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  koreanRaw?: number;

  @ApiPropertyOptional({ description: '국어 표준점수 (0-200)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  koreanStandard?: number;

  @ApiPropertyOptional({ description: '국어 백분위 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  koreanPercentile?: number;

  @ApiPropertyOptional({ description: '국어 등급 (1-9)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  koreanGrade?: number;

  // === 영어 ===
  @ApiPropertyOptional({ description: '영어 원점수 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  englishRaw?: number;

  @ApiPropertyOptional({ description: '영어 등급 (1-9)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  englishGrade?: number;

  // === 수학 ===
  @ApiPropertyOptional({ description: '수학 선택과목 (확통/미적/기하)' })
  @IsOptional()
  @IsString()
  mathSelection?: string;

  @ApiPropertyOptional({ description: '수학 원점수 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  mathRaw?: number;

  @ApiPropertyOptional({ description: '수학 표준점수 (0-200)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  mathStandard?: number;

  @ApiPropertyOptional({ description: '수학 백분위 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  mathPercentile?: number;

  @ApiPropertyOptional({ description: '수학 등급 (1-9)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  mathGrade?: number;

  // === 탐구1 ===
  @ApiPropertyOptional({ description: '탐구1 선택과목명' })
  @IsOptional()
  @IsString()
  inquiry1Selection?: string;

  @ApiPropertyOptional({ description: '탐구1 원점수 (0-50)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  inquiry1Raw?: number;

  @ApiPropertyOptional({ description: '탐구1 표준점수 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  inquiry1Standard?: number;

  @ApiPropertyOptional({ description: '탐구1 백분위 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  inquiry1Percentile?: number;

  @ApiPropertyOptional({ description: '탐구1 등급 (1-9)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  inquiry1Grade?: number;

  // === 탐구2 ===
  @ApiPropertyOptional({ description: '탐구2 선택과목명' })
  @IsOptional()
  @IsString()
  inquiry2Selection?: string;

  @ApiPropertyOptional({ description: '탐구2 원점수 (0-50)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  inquiry2Raw?: number;

  @ApiPropertyOptional({ description: '탐구2 표준점수 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  inquiry2Standard?: number;

  @ApiPropertyOptional({ description: '탐구2 백분위 (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  inquiry2Percentile?: number;

  @ApiPropertyOptional({ description: '탐구2 등급 (1-9)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  inquiry2Grade?: number;

  // === 한국사 ===
  @ApiPropertyOptional({ description: '한국사 원점수 (0-50)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  historyRaw?: number;

  @ApiPropertyOptional({ description: '한국사 등급 (1-9)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  historyGrade?: number;

  // === 제2외국어 ===
  @ApiPropertyOptional({ description: '제2외국어 선택과목명' })
  @IsOptional()
  @IsString()
  foreignSelection?: string;

  @ApiPropertyOptional({ description: '제2외국어 원점수 (0-50)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  foreignRaw?: number;

  @ApiPropertyOptional({ description: '제2외국어 등급 (1-9)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  foreignGrade?: number;
}










