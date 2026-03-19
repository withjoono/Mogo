"use client"

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Query Parameter 보존 (SSO 코드 유실 방지)
    const queryString = searchParams.toString()
    const destination = queryString ? `/main?${queryString}` : '/main'

    router.replace(destination)
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">로딩 중...</div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-500">로딩 중...</div></div>}>
      <HomePageContent />
    </Suspense>
  )
}
