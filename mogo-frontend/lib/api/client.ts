/**
 * API Client 설정
 * Backend API와 통신하기 위한 기본 설정
 * SSO 토큰 자동 주입 지원
 */

import { getAccessToken } from '../auth/token-manager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * API 요청 헬퍼 함수
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // URL 생성
  let url = `${API_BASE_URL}${endpoint}`;

  // Query params 추가
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // 기본 헤더 설정
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // SSO 토큰 자동 주입 (Hub에서 로그인한 토큰 사용)
  const accessToken = getAccessToken();
  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || json.message || '요청에 실패했습니다.');
  }

  return json.data;
}

/**
 * API Client
 */
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export default api;








