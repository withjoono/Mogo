import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 목표 대학 추가 요청
 */
export class CreateTargetDto {
  @ApiProperty({ description: '학생 ID (memberId)' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: '학과 ID 또는 대학학과코드' })
  @IsNumber()
  @Type(() => Number)
  departmentId: number;

  @ApiPropertyOptional({ description: '우선순위 (1-5)', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  priority?: number;
}

/**
 * 목표 대학 수정 요청
 */
export class UpdateTargetDto {
  @ApiPropertyOptional({ description: '우선순위 (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  priority?: number;

  @ApiPropertyOptional({ description: '학과 ID (변경 시)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  departmentId?: number;
}

/**
 * 목표 대학 비교 요청
 */
export class ComparisonRequestDto {
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

  @ApiPropertyOptional({ description: '특정 목표 대학 ID만 조회' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  targetId?: number;
}
