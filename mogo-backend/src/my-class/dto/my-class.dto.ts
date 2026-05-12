export class CreateGroupStudyDto {
  name: string;
  description?: string;
  maxMembers?: number;
}

export class JoinGroupStudyDto {
  classCode: string;
}

export class RankingQueryDto {
  examId?: number;  // 특정 시험 기준 (없으면 최신 시험)
  limit?: number;
}
