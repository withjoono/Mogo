import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HubHttpService } from './hub-http.service';
import { HubGroup, HubGroupMember } from './types/hub-group.types';

/**
 * 서비스간 Hub API 호출 (service JWT + X-Service-Id).
 *
 * 인증 모델:
 *   - HUB_SERVICE_TOKEN (Hub이 발급한 mogo 전용 1년 토큰)
 *   - X-Service-Id: mogo
 *   - Hub의 ServiceAuthGuard가 검증 (화이트리스트 mogo|studyplanner)
 *
 * 용도: 리더보드 fan-out — Hub은 점수를 보관하지 않으므로,
 *   Mogo가 멤버 ID 목록만 Hub에서 받아와 자기 DB에서 점수 SELECT 후 정렬.
 */
@Injectable()
export class HubInternalService {
  constructor(private readonly http: HubHttpService) {}

  private get serviceHeaders(): Record<string, string> {
    const token = process.env.HUB_SERVICE_TOKEN;
    if (!token) {
      throw new InternalServerErrorException('HUB_SERVICE_TOKEN not configured');
    }
    return {
      Authorization: `Bearer ${token}`,
      'X-Service-Id': 'mogo',
    };
  }

  /**
   * 특정 사용자가 속한 그룹 목록 (모든 type 포함).
   * TODO(hub-contract): 가이드의 경로는 `/api/internal/users/<me>/groups`였는데
   * service token엔 "me"가 없으므로 hubUserId를 path param으로 받는다고 가정.
   */
  async getUserGroups(hubUserId: string): Promise<HubGroup[]> {
    return this.http.request<HubGroup[]>({
      method: 'GET',
      path: `/api/internal/users/${encodeURIComponent(hubUserId)}/groups`,
      headers: this.serviceHeaders,
    });
  }

  /**
   * 특정 그룹의 멤버 hubUserId 목록.
   * Mogo는 이 ID들을 mogo memberId로 변환(toMogoMemberId)해서 점수 SELECT.
   */
  async getGroupMembers(groupId: number): Promise<HubGroupMember[]> {
    return this.http.request<HubGroupMember[]>({
      method: 'GET',
      path: `/api/internal/groups/${groupId}/members`,
      headers: this.serviceHeaders,
    });
  }
}
