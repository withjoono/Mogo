import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @ApiProperty({ example: 1, description: '문제 번호' })
  @IsNumber()
  questionNumber: number;

  @ApiProperty({ example: 3, description: '학생 답안 (1-5)' })
  @IsNumber()
  answer: number;
}

export class SubmitGradingDto {
  @ApiProperty({ example: 1, description: '학생 ID' })
  @IsNumber()
  memberId: number;

  @ApiProperty({ example: 1, description: '시험 ID' })
  @IsNumber()
  mockExamId: number;

  @ApiProperty({ example: '국어', description: '과목' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ example: '화법과 작문', description: '세부 과목' })
  @IsOptional()
  @IsString()
  subjectDetail?: string;

  @ApiProperty({ type: [AnswerDto], description: '답안 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @ApiPropertyOptional({ example: true, description: '점수 저장 여부' })
  @IsOptional()
  @IsBoolean()
  saveScore?: boolean;
}
