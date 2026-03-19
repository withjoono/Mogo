import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 성적 추이 요청
 */
export class TrendRequestDto {
  @ApiPropertyOptional({ description: '시작 연도' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startYear?: number;

  @ApiPropertyOptional({ description: '종료 연도' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endYear?: number;

  @ApiPropertyOptional({ description: '특정 과목만 조회' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: '학년 필터 (H1, H2, H3)' })
  @IsOptional()
  @IsString()
  grade?: string;
}

/**
 * 누적 분석 요청
 */
export class CumulativeRequestDto {
  @ApiPropertyOptional({ description: '시작 연도' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startYear?: number;

  @ApiPropertyOptional({ description: '종료 연도' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endYear?: number;
}

/**
 * 과목별 분석 요청
 */
export class SubjectAnalysisRequestDto {
  @ApiPropertyOptional({ description: '특정 과목만 조회 (국어, 수학, 영어 등)' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: '시작 연도' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  startYear?: number;

  @ApiPropertyOptional({ description: '종료 연도' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  endYear?: number;
}
