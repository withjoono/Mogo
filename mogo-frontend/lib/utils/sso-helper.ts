/**
 * SSO (Single Sign-On) 헬퍼 유틸리티
 * Backend Token Exchange 방식으로 안전하게 구현
 * Susi의 sso-helper.ts와 동일한 패턴
 *
 * 보안 향상:
 * - Hub에서 일회용 SSO 코드 받기
 * - Mogo Backend가 Hub Backend에 코드 검증 및 토큰 교환
 * - 코드는 즉시 URL에서 제거 (서버 로그 노출 최소화)
 */

import { setTokens } from '../auth/token-manager';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4009';

/**
 * SSO 코드 처리 (Backend Token Exchange)
 * URL에서 SSO 코드를 추출하여 Mogo Backend에 토큰 교환 요청
 *
 * @returns 토큰 처리 성공 여부
 */
export async function processSSOLogin(): Promise<boolean> {
    const params = new URLSearchParams(window.location.search);
    const ssoCode = params.get('sso_code');

    if (!ssoCode) {
        // SSO 코드가 없으면 일반 로그인 상태
        return false;
    }

    console.log('✅ SSO 코드 감지:', ssoCode.substring(0, 20) + '...');

    try {
        // Mogo Backend에 코드 교환 요청 (Hub Backend와 통신)
        const response = await fetch(`${API_URL}/auth/sso/exchange`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: ssoCode }),
            credentials: 'include',
        });

        const result = await response.json();
        const tokenData = result.data || result;

        console.log('📥 SSO 코드 교환 응답:', result);

        if (!response.ok || !result.success) {
            console.error('❌ SSO 코드 교환 실패:', result);
            cleanupSSOCode();
            return false;
        }

        if (!tokenData.accessToken) {
            console.error('❌ SSO 응답에 accessToken이 없음:', tokenData);
            cleanupSSOCode();
            return false;
        }

        console.log('✅ SSO 코드 교환 성공 - 토큰을 받았습니다');

        // 토큰 저장
        setTokens(
            tokenData.accessToken,
            tokenData.refreshToken,
            tokenData.tokenExpiry || 7200
        );

        // ⚠️ 보안: URL에서 코드 제거하여 브라우저 히스토리에 남지 않도록 함
        cleanupSSOCode();

        console.log('✅ SSO 자동 로그인 완료 - URL에서 코드 제거됨');
        return true;
    } catch (error) {
        console.error('❌ SSO 코드 교환 에러:', error);
        cleanupSSOCode();
        return false;
    }
}

/**
 * URL에서 SSO 코드 파라미터 제거
 */
function cleanupSSOCode(): void {
    const params = new URLSearchParams(window.location.search);
    params.delete('sso_code');

    // URL 업데이트 (히스토리에 추가하지 않고 현재 URL 교체)
    const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
    console.log('🧹 URL에서 SSO 코드 제거됨');
}
