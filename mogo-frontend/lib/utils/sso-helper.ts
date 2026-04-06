/**
 * SSO 헬퍼 - geobuk-shared/auth 위임
 */
import { processSSOCode, hasSSOCode } from 'geobuk-shared/auth';

export { hasSSOCode };

export async function processSSOLogin(): Promise<boolean> {
  return processSSOCode({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4009',
  });
}
