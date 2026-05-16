/**
 * Hub Groups 도메인 타입
 *
 * TODO(hub-contract): Hub 측 실제 응답 필드명(camel vs snake), id 타입(int|uuid),
 * group_type/role enum 값 확인 후 정합 보정. 현재는 가이드와 Hub 검증 로그(invite_code,
 * owner_hub_user_id, target_univ_code 컬럼 신설)에 근거한 추정.
 */

export type HubGroupType = 'student_study' | 'teacher' | 'target_univ';

export type HubGroupRole = 'leader' | 'member' | 'mentor' | 'student';

export interface HubGroup {
  id: number;
  name: string;
  groupType: HubGroupType;
  inviteCode: string | null;
  ownerHubUserId: string | null;
  targetUnivCode: string | null;
  memberCount: number;
  maxMembers: number | null;
  myRole?: HubGroupRole;
}

export interface HubGroupMember {
  hubUserId: string;
  role: HubGroupRole;
  joinedAt: string;
  displayName?: string;
}

// === 요청 바디 ===

export interface CreateHubGroupRequest {
  groupType: Exclude<HubGroupType, 'target_univ'>;
  name: string;
  grade?: string;
}

export interface JoinHubGroupRequest {
  inviteCode: string;
}

export interface MatchTargetUnivRequest {
  targetUnivCode: string;
  grade?: string;
  displayName?: string;
}
