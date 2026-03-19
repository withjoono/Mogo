/**
 * Hub 중앙 인증 서버 API 클라이언트
 * 
 * Susi 앱의 hubApiClient와 동일한 패턴으로 구현
 * Hub(GB-Back-Nest)의 인증 관련 API를 호출합니다.
 */

import { getAccessToken, clearTokens } from '../auth/token-manager';

const HUB_API_URL = process.env.NEXT_PUBLIC_HUB_API_URL || 'http://localhost:4000';

/**
 * Hub API 응답에서 실제 데이터 추출
 * Hub API는 { data: ... } 또는 직접 데이터를 반환할 수 있음
 */
const extractHubApiData = <T>(responseData: unknown): T => {
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return (responseData as { data: T }).data;
    }
    return responseData as T;
};

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Hub API 요청 헬퍼 함수
 */
async function request<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T | null> {
    const { params, ...fetchOptions } = options;

    let url = `${HUB_API_URL}${endpoint}`;

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

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    // SSO 토큰 자동 주입
    const accessToken = getAccessToken();
    if (accessToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
            credentials: 'include', // 쿠키 전송 활성화 (Susi와 동일)
        });

        // 401 Unauthorized: 토큰 만료 또는 유효하지 않음
        if (response.status === 401) {
            clearTokens();
            return null;
        }

        // 404 또는 기타 에러
        if (!response.ok) {
            console.warn(`[hubApi] Request failed: ${response.status} ${response.statusText}`);
            return null;
        }

        const json = await response.json();
        return extractHubApiData<T>(json);
    } catch (error) {
        console.warn('[hubApi] Request error:', error);
        return null;
    }
}

export const hubApi = {
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

export default hubApi;
