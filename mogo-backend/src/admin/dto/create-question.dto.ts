import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @ApiProperty({ example: '국어', description: '과목' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ example: '화법과 작문', description: '세부 과목' })
  @IsOptional()
  @IsString()
  subjectDetail?: string;

  @ApiProperty({ example: 1, description: '문제 번호' })
  @IsNumber()
  @Min(1)
  @Max(45)
  questionNumber: number;

  @ApiProperty({ example: 3, description: '정답 (1-5)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  answer: number;

  @ApiProperty({ example: 2, description: '배점' })
  @IsNumber()
  @Min(1)
  @Max(4)
  score: number;

  @ApiPropertyOptional({ example: 2, description: '난이도 (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @ApiPropertyOptional({ example: 0.75, description: '정답률 (0-1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  correctRate?: number;
}

export class UploadQuestionsDto {
  @ApiProperty({ type: [CreateQuestionDto], description: '문제 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
