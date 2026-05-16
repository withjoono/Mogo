import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateGroupStudyDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(50)
  maxMembers?: number;

  /** Hub /api/groups가 받는 학년 정보 (선택) — 문자열 (예: "H3", "3", "고3"), 최대 10자 */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  grade?: string;
}

export class JoinGroupStudyDto {
  @IsString()
  @MaxLength(16)
  classCode: string;
}

export class RankingQueryDto {
  @IsOptional()
  @IsInt()
  examId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
