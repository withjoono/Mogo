/**
 * 사용자 정보 관리
 * Hub 백엔드 /auth/me API를 사용하여 사용자 정보를 가져옵니다
 */

import { getAccessToken, clearTokens } from './token-manager';

export interface User {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  phone: string;
  member_type: string; // 'student' | 'teacher' | 'parent'
  profile_image_url: string | null;
}

const HUB_API_URL = process.env.NEXT_PUBLIC_HUB_API_URL || 'https://v2.ingipsy.com';

/**
 * 현재 로그인한 사용자 정보 가져오기
 * @returns 사용자 정보 또는 null (인증 실패 시)
 */
export async function getUser(): Promise<User | null> {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${HUB_API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // 토큰이 만료되었거나 유효하지 않음 → 로컬 토큰 정리
        console.warn('Token expired or invalid, clearing local tokens');
        clearTokens();
        clearUserCache();
      } else {
        console.error('Failed to fetch user info:', response.status);
      }
      return null;
    }

    const result = await response.json();

    // 백엔드는 { success: true, data: {...} } 형식으로 응답
    if (result.success && result.data) {
      return {
        id: result.data.id,
        email: result.data.email,
        name: result.data.nickname || result.data.email,
        nickname: result.data.nickname,
        phone: result.data.phone,
        member_type: result.data.member_type,
        profile_image_url: result.data.profile_image_url,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

/**
 * 클라이언트 사이드에서만 사용자 정보 가져오기 (동기)
 * 로컬 스토리지에 캐시된 정보 사용
 */
export function getUserFromCache(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const cachedUser = localStorage.getItem('examhub_user_cache');
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
  } catch (e) {
    console.error('Failed to parse cached user:', e);
  }

  return null;
}

/**
 * 사용자 정보 캐시에 저장
 */
export function cacheUser(user: User | null): void {
  if (typeof window === 'undefined') return;

  if (user) {
    localStorage.setItem('examhub_user_cache', JSON.stringify(user));
  } else {
    localStorage.removeItem('examhub_user_cache');
  }
}

/**
 * 사용자 정보 캐시 삭제
 */
export function clearUserCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('examhub_user_cache');
}
