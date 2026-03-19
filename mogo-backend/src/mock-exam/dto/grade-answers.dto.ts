import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerItemDto {
  @ApiProperty({ description: '문제 번호', example: 1 })
  @IsNumber()
  questionNumber: number;

  @ApiProperty({ description: '학생 답안 (1-5 또는 숫자)', example: 3 })
  @IsNumber()
  answer: number;
}

export class GradeAnswersDto {
  @ApiProperty({ description: '모의고사 ID', example: 1 })
  @IsNumber()
  mockExamId: number;

  @ApiProperty({ description: '과목명', example: '국어' })
  @IsString()
  subject: string;

  @ApiProperty({ description: '세부 과목명 (탐구과목일 경우)', required: false })
  @IsOptional()
  @IsString()
  subjectDetail?: string;

  @ApiProperty({ description: '학생 답안 목록', type: [AnswerItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}

export class GradeResultItemDto {
  @ApiProperty({ description: '문제 번호' })
  questionNumber: number;

  @ApiProperty({ description: '학생 답안' })
  studentAnswer: number;

  @ApiProperty({ description: '정답' })
  correctAnswer: number;

  @ApiProperty({ description: '정답 여부' })
  isCorrect: boolean;

  @ApiProperty({ description: '배점' })
  score: number;

  @ApiProperty({ description: '획득 점수' })
  earnedScore: number;

  @ApiProperty({ description: '난이도', required: false })
  difficulty?: string;

  @ApiProperty({ description: '정답률', required: false })
  correctRate?: number;
}

export class GradeResultDto {
  @ApiProperty({ description: '모의고사 ID' })
  mockExamId: number;

  @ApiProperty({ description: '과목명' })
  subject: string;

  @ApiProperty({ description: '세부 과목명' })
  subjectDetail?: string;

  @ApiProperty({ description: '총 문항 수' })
  totalQuestions: number;

  @ApiProperty({ description: '정답 문항 수' })
  correctCount: number;

  @ApiProperty({ description: '총점' })
  totalScore: number;

  @ApiProperty({ description: '획득 점수 (원점수)' })
  earnedScore: number;

  @ApiProperty({ description: '문제별 채점 결과', type: [GradeResultItemDto] })
  results: GradeResultItemDto[];
}
