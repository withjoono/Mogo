import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchMockExamDto {
  @ApiPropertyOptional({ description: '연도', example: 2024 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ description: '학년 (H1, H2, H3)', example: 'H3' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({ description: '시행 월', example: 3 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  month?: number;
}










