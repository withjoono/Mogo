"use client"

import { useEffect, useState } from "react"
import { processSSOLogin } from "@/lib/utils/sso-helper"

export function SSOListener() {
    const [isSSOLoading, setIsSSOLoading] = useState(() => {
        if (typeof window === 'undefined') return false
        const params = new URLSearchParams(window.location.search)
        return !!params.get('sso_code')
    })

    useEffect(() => {
        const handleSSO = async () => {
            // SSO 로그인 처리 (URL에 sso_code가 있을 경우)
            const success = await processSSOLogin()

            // 성공 시 SSO 시도 플래그 초기화 후 페이지 새로고침하여 로그인 상단바(User Menu) 업데이트
            if (success) {
                sessionStorage.removeItem('examhub_sso_attempted')
                window.location.reload()
            }
            setIsSSOLoading(false)
        }

        handleSSO()
    }, []) // 마운트 시 1회 실행

    if (!isSSOLoading) return null

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(4px)',
        }}>
            <div style={{
                fontSize: '2.5rem',
                marginBottom: '1rem',
                animation: 'spin 1.2s linear infinite',
            }}>⏳</div>
            <p style={{
                fontSize: '1.1rem',
                color: '#374151',
                fontWeight: 500,
            }}>자동 로그인 중입니다...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
