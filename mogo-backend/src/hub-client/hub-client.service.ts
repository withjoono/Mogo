import { Injectable } from '@nestjs/common';
import { HubHttpService } from './hub-http.service';
import {
  HubGroup,
  CreateStudyGroupRequest,
  JoinHubGroupRequest,
  MatchAimUnivRequest,
} from './types/hub-group.types';

/**
 * 사용자용 Hub API 호출 (user JWT forward).
 *
 * 인증 모델:
 *   - 컨트롤러에서 받은 `Authorization: Bearer <user_jwt>` 헤더를 그대로 전달
 *   - X-Service-Id / service token 사용 안 함
 *   - 401은 호출자에 그대로 던져 SSO 재로그인 유도
 */
@Injectable()
export class HubClientService {
  constructor(private readonly http: HubHttpService) {}

  // ── 그룹 ─────────────────────────────────────────────────────

  /** 스터디그룹반 생성 (Mogo 학생 생성 = study 타입) */
  async createStudyGroup(authHeader: string, body: CreateStudyGroupRequest): Promise<HubGroup> {
    return this.http.request<HubGroup>({
      method: 'POST',
      path: '/api/groups/study',
      headers: { Authorization: authHeader },
      body,
    });
  }

  async joinGroup(authHeader: string, body: JoinHubGroupRequest): Promise<HubGroup> {
    return this.http.request<HubGroup>({
      method: 'POST',
      path: '/api/groups/join',
      headers: { Authorization: authHeader },
      body,
    });
  }

  async leaveStudyGroup(authHeader: string, groupId: string | number): Promise<void> {
    await this.http.request<void>({
      method: 'DELETE',
      path: `/api/groups/study/${groupId}/leave`,
      headers: { Authorization: authHeader },
    });
  }

  async leaveTeacherGroup(authHeader: string, groupId: string | number): Promise<void> {
    await this.http.request<void>({
      method: 'DELETE',
      path: `/api/groups/teacher/${groupId}/leave`,
      headers: { Authorization: authHeader },
    });
  }

  async getMyGroups(authHeader: string): Promise<HubGroup[]> {
    const result = await this.http.request<{ groups?: HubGroup[] } | HubGroup[]>({
      method: 'GET',
      path: '/api/groups/my',
      headers: { Authorization: authHeader },
    });
    if (Array.isArray(result)) return result;
    if (result && 'groups' in result && Array.isArray(result.groups)) return result.groups;
    return [];
  }

  // ── 목표대학반 자동 편입/탈퇴 ────────────────────────────────

  async matchAimUniv(authHeader: string, body: MatchAimUnivRequest): Promise<HubGroup> {
    return this.http.request<HubGroup>({
      method: 'POST',
      path: '/api/groups/aim-univ/match',
      headers: { Authorization: authHeader },
      body,
    });
  }

  async leaveAimUniv(
    authHeader: string,
    targetUnivCode: string,
  ): Promise<{ targetUnivCode: string; deletedCount: number }> {
    return this.http.request<{ targetUnivCode: string; deletedCount: number }>({
      method: 'DELETE',
      path: `/api/groups/aim-univ/${encodeURIComponent(targetUnivCode)}/leave`,
      headers: { Authorization: authHeader },
    });
  }
}
