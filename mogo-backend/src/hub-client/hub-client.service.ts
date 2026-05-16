import { Injectable } from '@nestjs/common';
import { HubHttpService } from './hub-http.service';
import {
  HubGroup,
  CreateHubGroupRequest,
  JoinHubGroupRequest,
  MatchTargetUnivRequest,
} from './types/hub-group.types';

/**
 * 사용자용 Hub API 호출 (user JWT forward).
 *
 * 인증 모델:
 *   - 컨트롤러에서 받은 `Authorization: Bearer <user_jwt>` 헤더를 그대로 전달
 *   - X-Service-Id / service token 사용 안 함
 *   - 401은 호출자에 그대로 던져 SSO 재로그인 유도 (재발급 시도 X — Mogo는 사용자
 *     JWT를 갱신할 권한이 없음)
 */
@Injectable()
export class HubClientService {
  constructor(private readonly http: HubHttpService) {}

  // ── 그룹 ─────────────────────────────────────────────────────

  async createGroup(authHeader: string, body: CreateHubGroupRequest): Promise<HubGroup> {
    return this.http.request<HubGroup>({
      method: 'POST',
      path: '/api/groups',
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

  async leaveGroup(authHeader: string, groupId: number): Promise<void> {
    await this.http.request<void>({
      method: 'DELETE',
      path: `/api/groups/${groupId}/leave`,
      headers: { Authorization: authHeader },
    });
  }

  async getMyGroups(authHeader: string): Promise<HubGroup[]> {
    return this.http.request<HubGroup[]>({
      method: 'GET',
      path: '/api/groups/my',
      headers: { Authorization: authHeader },
    });
  }

  // ── 목표대학반 자동 편입/탈퇴 ────────────────────────────────

  async matchTargetUniv(
    authHeader: string,
    body: MatchTargetUnivRequest,
  ): Promise<HubGroup> {
    return this.http.request<HubGroup>({
      method: 'POST',
      path: '/api/groups/target-univ/match',
      headers: { Authorization: authHeader },
      body,
    });
  }

  /**
   * 목표대학 그룹에서 탈퇴 (atomic, Hub이 hubUserId + targetUnivCode로 단일 삭제).
   * 호출자는 404(미가입)를 멱등성 차원에서 무시해도 안전 (Hub 합의됨).
   */
  async leaveTargetUniv(
    authHeader: string,
    targetUnivCode: string,
  ): Promise<{ targetUnivCode: string; deletedCount: number }> {
    return this.http.request<{ targetUnivCode: string; deletedCount: number }>({
      method: 'DELETE',
      path: `/api/groups/target-univ/${encodeURIComponent(targetUnivCode)}/leave`,
      headers: { Authorization: authHeader },
    });
  }
}
