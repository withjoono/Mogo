import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 개별 문제 답안 DTO
 */
export class WrongAnswerItemDto {
  @ApiProperty({ description: '문제 번호', example: 1 })
  @IsInt()
  @Min(1)
  @Max(45)
  questionNumber: number;

  @ApiProperty({ description: '학생이 선택한 답 (1-5)', example: 3 })
  @IsInt()
  @Min(1)
  @Max(5)
  selectedAnswer: number;
}

/**
 * 답안 일괄 채점 요청 DTO
 */
export class WrongAnswerGradeDto {
  @ApiProperty({ description: '학생 ID (memberId)' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: '모의고사 ID' })
  @IsInt()
  mockExamId: number;

  @ApiPropertyOptional({ description: '교과 영역명 (국어, 수학 등)' })
  @IsOptional()
  @IsString()
  subjectAreaName?: string;

  @ApiPropertyOptional({ description: '세부 과목명 (화법과 작문 등)' })
  @IsOptional()
  @IsString()
  subjectName?: string;

  @ApiProperty({
    description: '답안 목록',
    type: [WrongAnswerItemDto],
    example: [
      { questionNumber: 1, selectedAnswer: 3 },
      { questionNumber: 2, selectedAnswer: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WrongAnswerItemDto)
  answers: WrongAnswerItemDto[];
}

/**
 * 오답 메모 업데이트 DTO
 */
export class UpdateWrongReasonDto {
  @ApiProperty({ description: '오답 이유/메모', example: '개념 혼동으로 인한 실수' })
  @IsString()
  wrongReason: string;
}

/**
 * 북마크 토글 DTO
 */
export class ToggleBookmarkDto {
  @ApiProperty({ description: '북마크 여부' })
  @IsBoolean()
  isBookmarked: boolean;
}

/**
 * 복습 기록 DTO
 */
export class RecordReviewDto {
  @ApiPropertyOptional({ description: '복습 메모' })
  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * 오답 필터 DTO
 */
export class FilterWrongAnswerDto {
  @ApiPropertyOptional({ description: '모의고사 ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mockExamId?: number;

  @ApiPropertyOptional({ description: '교과 영역명' })
  @IsOptional()
  @IsString()
  subjectAreaName?: string;

  @ApiPropertyOptional({ description: '세부 과목명' })
  @IsOptional()
  @IsString()
  subjectName?: string;

  @ApiPropertyOptional({ description: '북마크만 조회' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  bookmarkedOnly?: boolean;

  @ApiPropertyOptional({ description: '오답만 조회 (기본값: true)' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  wrongOnly?: boolean;

  @ApiPropertyOptional({ description: '복습 횟수 이하 필터' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxReviewCount?: number;

  @ApiPropertyOptional({ description: '페이지 번호 (1부터 시작)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '페이지당 항목 수', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
