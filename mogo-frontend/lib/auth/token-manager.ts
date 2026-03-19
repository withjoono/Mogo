/**
 * 토큰 관리 유틸리티
 * SSO 토큰 저장, 조회, 삭제 관리
 *
 * SSO 및 Zustand persist storage와의 호환성을 위한 fallback 로직 포함
 */

const ACCESS_TOKEN_KEY = 'examhub_access_token';
const REFRESH_TOKEN_KEY = 'examhub_refresh_token';
const TOKEN_EXPIRY_KEY = 'examhub_token_expiry';
const AUTH_STORAGE_KEY = 'auth-storage';

/**
 * Zustand persist storage에서 토큰 추출 (fallback용)
 */
const getTokenFromAuthStorage = (tokenKey: 'accessToken' | 'refreshToken'): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const authStorage = localStorage.getItem(AUTH_STORAGE_KEY);
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.[tokenKey] || null;
    }
  } catch (e) {
    console.error('Failed to parse auth-storage:', e);
  }
  return null;
};

/**
 * 토큰 저장
 * @param accessToken - 액세스 토큰
 * @param refreshToken - 리프레시 토큰
 * @param expiresIn - 만료 시간(초)
 */
export function setTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number = 7200
): void {
  if (typeof window === 'undefined') return;

  const expiryTime = Date.now() + expiresIn * 1000;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime));
}

/**
 * 액세스 토큰 조회
 * 1. 먼저 직접 저장된 토큰 확인
 * 2. 없으면 Zustand persist storage에서 확인 (SSO 호환성)
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. 직접 저장된 토큰 확인
  const directToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (directToken) {
    return directToken;
  }

  // 2. Zustand persist storage에서 확인 (fallback)
  return getTokenFromAuthStorage('accessToken');
}

/**
 * 리프레시 토큰 조회
 * 1. 먼저 직접 저장된 토큰 확인
 * 2. 없으면 Zustand persist storage에서 확인 (SSO 호환성)
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. 직접 저장된 토큰 확인
  const directToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (directToken) {
    return directToken;
  }

  // 2. Zustand persist storage에서 확인 (fallback)
  return getTokenFromAuthStorage('refreshToken');
}

/**
 * 토큰 만료 여부 확인
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;

  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) return true;

  return Date.now() > parseInt(expiryTime, 10);
}

/**
 * 토큰 삭제 (로그아웃)
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * 토큰 존재 여부 확인
 */
export function hasTokens(): boolean {
  return !!getAccessToken() && !!getRefreshToken();
}
