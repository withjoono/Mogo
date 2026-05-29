import { Injectable, Logger } from '@nestjs/common';
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
 * 토큰 미주입 정책: 빈 배열 반환 + 1회 warn 로깅 (graceful degrade).
 *   리더보드 등 부가 기능이 토큰 설정 전까진 빈 데이터만 보여줌, 핵심 흐름은 동작.
 */
@Injectable()
export class HubInternalService {
  private readonly logger = new Logger(HubInternalService.name);
  private warnedMissingToken = false;

  constructor(private readonly http: HubHttpService) {}

  private serviceHeadersOrNull(): Record<string, string> | null {
    const token = process.env.HUB_SERVICE_TOKEN;
    if (!token) {
      if (!this.warnedMissingToken) {
        this.logger.warn(
          'HUB_SERVICE_TOKEN not configured — internal Hub calls will return empty results. ' +
          'Configure via GCP Secret Manager / App Engine env to enable leaderboard fan-out.',
        );
        this.warnedMissingToken = true;
      }
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
      'X-Service-Id': 'mogo',
    };
  }

  async getUserGroups(hubUserId: string): Promise<HubGroup[]> {
    const headers = this.serviceHeadersOrNull();
    if (!headers) return [];
    return this.http.request<HubGroup[]>({
      method: 'GET',
      path: `/api/internal/users/${encodeURIComponent(hubUserId)}/groups`,
      headers,
    });
  }

  async getGroupMembers(
    groupId: string | number,
    groupType: 'teacher' | 'study' | 'aim_univ' | 'aim-univ' = 'study',
  ): Promise<HubGroupMember[]> {
    const headers = this.serviceHeadersOrNull();
    if (!headers) return [];
    const typeSegment = groupType === 'aim_univ' ? 'aim-univ' : groupType;
    const result = await this.http.request<any>({
      method: 'GET',
      path: `/api/internal/groups/${typeSegment}/${groupId}/members`,
      headers,
    });
    // Hub returns { requestedBy, groupId, groupName, groupType, members: [...] }
    if (result && !Array.isArray(result) && Array.isArray(result.members)) {
      return result.members as HubGroupMember[];
    }
    return Array.isArray(result) ? result : [];
  }

  /**
   * Hub 대시보드 알림 적재 (fire-and-forget).
   *
   * 채점 완료 등 이벤트 시 사용자의 Hub 대시보드 "나의 앱" 카드에 표시될 알림을 보낸다.
   * 알림 전송 실패가 핵심 흐름(채점 저장 등)을 막으면 안 되므로 에러는 삼키고 로깅만 한다.
   * 토큰 미설정 시에도 graceful skip.
   */
  async sendNotification(payload: {
    hubUserId: string;
    type: string;
    title: string;
    body?: string;
    linkPath?: string;
  }): Promise<void> {
    const headers = this.serviceHeadersOrNull();
    if (!headers) return;
    try {
      await this.http.request({
        method: 'POST',
        path: '/api/internal/notifications',
        headers,
        body: payload,
      });
    } catch (err) {
      this.logger.warn(`Hub 알림 전송 실패 (무시됨): ${(err as Error).message}`);
    }
  }
}
