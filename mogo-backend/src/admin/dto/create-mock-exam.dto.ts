import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, Min, Max, Matches } from 'class-validator';

export class CreateMockExamDto {
  @ApiProperty({ example: 'H32403', description: '시험 코드' })
  @IsString()
  @Matches(/^H[123]\d{4}$/, { message: '시험 코드는 H1/H2/H3 + 년도(2자리) + 월(2자리) 형식이어야 합니다.' })
  code: string;

  @ApiProperty({ example: '2024년 3월 고3 모의고사', description: '시험명' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'H3', description: '학년 (H1, H2, H3)' })
  @IsString()
  @IsEnum(['H1', 'H2', 'H3'], { message: '학년은 H1, H2, H3 중 하나여야 합니다.' })
  grade: string;

  @ApiProperty({ example: 2024, description: '년도' })
  @IsNumber()
  @Min(2020)
  @Max(2030)
  year: number;

  @ApiProperty({ example: 3, description: '월' })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: '교육청', description: '유형 (교육청, 평가원, 수능)' })
  @IsString()
  @IsEnum(['교육청', '평가원', '수능'], { message: '유형은 교육청, 평가원, 수능 중 하나여야 합니다.' })
  type: string;
}
