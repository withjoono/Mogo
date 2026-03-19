import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 반영비율 분석 요청
 */
export class ReflectionAnalysisRequestDto {
  @ApiPropertyOptional({ description: '점수 ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scoreId?: number;

  @ApiPropertyOptional({ description: '대학 ID 목록 (지정하지 않으면 샘플 대학 사용)' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  universityIds?: number[];

  @ApiPropertyOptional({ description: '학과 ID 목록' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  departmentIds?: number[];
}

/**
 * 조합별 분석 요청
 */
export class CombinationAnalysisRequestDto {
  @ApiPropertyOptional({ description: '점수 ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scoreId?: number;

  @ApiPropertyOptional({
    description: '분석할 조합 목록 (기본: 국수탐, 국영탐, 수영탐, 국수영)',
    example: ['국수탐', '국영탐']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  combinations?: string[];
}

/**
 * 성취수준 분석 요청
 */
export class AchievementAnalysisRequestDto {
  @ApiPropertyOptional({ description: '점수 ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  scoreId?: number;
}
