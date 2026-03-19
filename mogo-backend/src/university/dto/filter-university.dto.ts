import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterUniversityDto {
  @ApiPropertyOptional({ description: '지역', example: '서울' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '계열', example: '자연' })
  @IsOptional()
  @IsString()
  category?: string;
}










