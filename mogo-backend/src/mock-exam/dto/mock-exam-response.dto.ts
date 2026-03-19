import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MockExamResponseDto {
  @ApiProperty({ description: '모의고사 ID' })
  id: number;

  @ApiProperty({ description: '모의고사 코드', example: 'H32403' })
  code: string;

  @ApiProperty({ description: '모의고사 이름', example: '고3 24년 3월 교육청 모의' })
  name: string;

  @ApiPropertyOptional({ description: '학년', example: 'H3' })
  grade?: string;

  @ApiPropertyOptional({ description: '연도', example: 2024 })
  year?: number;

  @ApiPropertyOptional({ description: '시행 월', example: 3 })
  month?: number;

  @ApiPropertyOptional({ description: '유형 (교육청, 평가원, 수능)', example: '교육청' })
  type?: string;

  @ApiProperty({ description: '생성일' })
  createdAt: Date;
}










