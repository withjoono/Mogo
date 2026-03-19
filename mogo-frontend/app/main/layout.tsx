"use client"

import { Navigation } from "@/components/navigation"

export default function ExamHubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 공통 네비게이션 */}
      <Navigation />

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
