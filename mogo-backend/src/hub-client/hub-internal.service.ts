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

  async getGroupMembers(groupId: number): Promise<HubGroupMember[]> {
    const headers = this.serviceHeadersOrNull();
    if (!headers) return [];
    return this.http.request<HubGroupMember[]>({
      method: 'GET',
      path: `/api/internal/groups/${groupId}/members`,
      headers,
    });
  }
}
