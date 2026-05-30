/**
 * Hub Groups 도메인 타입 (hub_group 3분리 체계 기준)
 *
 * groupType 변경:
 *   student_study → study
 *   target_univ   → aim_univ
 *   teacher       → teacher (유지)
 */

export type HubGroupType = 'study' | 'teacher' | 'aim_univ';

export type HubGroupRole = 'owner' | 'member';

export interface HubGroup {
  id: string;            // BigInt → string 직렬화
  name: string;
  groupType: HubGroupType;
  inviteCode: string | null;
  teacherHubId?: string | null;   // teacher 타입
  ownerHubId?: string | null;     // study 타입
  targetUnivCode?: string | null; // aim_univ 타입
  memberCount: number;
  maxMembers: number;
  isActive: boolean;
  joinedAt: string;
}

export interface HubGroupMember {
  hubUserId: string;
  nickname: string | null;
  profileImageUrl: string | null;
  role: HubGroupRole;
  joinedAt: string;
}

// === 요청 바디 ===

export interface CreateStudyGroupRequest {
  name: string;
  description?: string;
  maxMembers?: number;
}

export interface JoinHubGroupRequest {
  inviteCode: string;
}

export interface MatchAimUnivRequest {
  targetUnivCode: string;
  grade?: string;
  displayName?: string;
}
