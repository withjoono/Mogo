"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { LayoutGrid, ChevronDown, Menu, X, Bell, Users, User } from "lucide-react"
import { WonCircle } from "./icons"
import { getUser, cacheUser, clearUserCache, type User as UserType } from "@/lib/auth/user"
import { redirectToHubLogin, getHubUrl, getHubLoginUrl } from "@/lib/auth/hub-login"
import { clearTokens } from "@/lib/auth/token-manager"

interface MenuItem {
  name: string
  href: string
  children?: MenuItem[]
  comingSoon?: boolean
}

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUserState] = useState<UserType | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null)

  useEffect(() => {
    // 비동기로 사용자 정보 가져오기
    async function fetchUser() {
      const userData = await getUser()
      setUserState(userData)
      if (userData) {
        cacheUser(userData) // 캐시에 저장
        return
      }

      // SSO 코드가 URL에 있으면 SSOListener가 처리하도록 대기 (리다이렉트 하지 않음)
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('sso_code')) {
        return
      }

      // 비로그인 상태: 프로모 페이지를 그대로 노출 (자동 리다이렉트 하지 않음)
      // 사용자가 직접 "로그인" 버튼을 클릭하면 Hub 로그인으로 이동
    }
    fetchUser()
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogin = () => {
    redirectToHubLogin(window.location.pathname)
  }

  const handleLogout = () => {
    clearTokens()
    clearUserCache()
    setUserState(null)
    window.location.reload()
  }

  const goToHub = () => {
    window.location.href = getHubUrl()
  }

  // MogoMogo 메뉴 항목
  const menuItems: MenuItem[] = [
    { name: "MogoMogo 홈", href: "/" },
    { name: "입력", href: "/main/input" },
    { name: "성적분석", href: "/main/score-analysis" },
    {
      name: "대학예측",
      href: "/main/prediction",
      children: [
        { name: "목표대학 설정", href: "/main/target-university/settings", comingSoon: true },
        { name: "대학 예측", href: "/main/prediction", comingSoon: true },
      ],
    },
    { name: "누적분석", href: "/main/statistics" },
    { name: "취약분석", href: "/main/weakness-analysis" },
    { name: "오답노트", href: "/main/wrong-answers" },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Left Section - Logo & Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2" style={{ textDecoration: 'none' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--color-primary)' }}>MogoMogo</span>
            </Link>
          </div>

          {/* Center Section - Navigation Menu (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* 전체 서비스 아이콘 */}
            <button
              onClick={goToHub}
              className="flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
              title="전체 서비스"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            <div className="w-px h-5 bg-gray-200 mx-2" />

            {/* 메뉴 항목들 */}
            {menuItems.map((item) =>
              item.children ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setOpenSubmenu(item.name)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {item.name}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {openSubmenu === item.name && (
                    <div className="absolute left-0 top-full mt-0.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                      {item.children.map((child) =>
                        child.comingSoon ? (
                          <button
                            key={child.name}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7b1e7a] transition-colors"
                            onClick={() => {
                              setOpenSubmenu(null)
                              alert('3월 첫 모의고사 이후 서비스 실행됩니다')
                            }}
                          >
                            {child.name}
                          </button>
                        ) : (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7b1e7a] transition-colors"
                            onClick={() => setOpenSubmenu(null)}
                          >
                            {child.name}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Right Section - Icons & Login (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            {/* 결제 아이콘 */}
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
              title="결제"
            >
              <WonCircle className="h-5 w-5" />
            </button>

            {/* 알림 아이콘 */}
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="알림"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* 계정연동 아이콘 */}
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="계정연동"
            >
              <Users className="h-5 w-5" />
            </button>

            {/* 로그인/사용자 메뉴 */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={goToHub}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      T Skool
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="rounded-full bg-purple-700 hover:bg-purple-800 text-white px-4 py-1.5 text-sm font-medium transition-colors"
              >
                로그인
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* 모바일 아이콘들 */}
            <button
              className="p-2 text-gray-500 hover:text-[#7b1e7a]"
              title="알림"
            >
              <Bell className="w-5 h-5" />
            </button>

            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-[#7b1e7a] p-2"
              aria-label="메뉴 열기"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {
          isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {/* 전체 서비스 아이콘 */}
                <button
                  onClick={goToHub}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
                  title="전체 서비스"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>

                <div className="border-t border-gray-100 my-2" />

                {/* 메뉴 항목들 */}
                {menuItems.map((item) =>
                  item.children ? (
                    <div key={item.name}>
                      <button
                        onClick={() => setMobileOpenSubmenu(mobileOpenSubmenu === item.name ? null : item.name)}
                        className="flex items-center justify-between w-full px-3 py-2 text-base text-gray-700 hover:text-[#7b1e7a] hover:bg-gray-50 rounded-md"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${mobileOpenSubmenu === item.name ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileOpenSubmenu === item.name && (
                        <div className="pl-4 space-y-0.5">
                          {item.children.map((child) =>
                            child.comingSoon ? (
                              <button
                                key={child.name}
                                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-[#7b1e7a] hover:bg-gray-50 rounded-md"
                                onClick={() => {
                                  setIsMobileMenuOpen(false)
                                  alert('3월 첫 모의고사 이후 서비스 실행됩니다')
                                }}
                              >
                                {child.name}
                              </button>
                            ) : (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="block px-3 py-2 text-sm text-gray-600 hover:text-[#7b1e7a] hover:bg-gray-50 rounded-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {child.name}
                              </Link>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-3 py-2 text-base text-gray-700 hover:text-[#7b1e7a] hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                )}

                <div className="border-t border-gray-100 my-2" />

                {/* 모바일 추가 메뉴 */}
                <div className="flex items-center space-x-4 px-3 py-2">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-[#7b1e7a]">
                    <WonCircle className="w-5 h-5" />
                    <span className="text-sm">결제</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-700">
                    <Users className="w-5 h-5" />
                    <span className="text-sm">계정연동</span>
                  </button>
                </div>

                {/* 로그인/로그아웃 */}
                <div className="pt-2">
                  {user ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm text-gray-700">
                        <span className="font-medium">{user.name}</span>님
                      </div>
                      <button
                        onClick={goToHub}
                        className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                      >
                        T Skool
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                      >
                        로그아웃
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleLogin}
                      className="w-full bg-[#7b1e7a] hover:bg-[#5a1559] text-white px-4 py-2 rounded-full text-sm font-medium"
                    >
                      로그인
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        }
      </div >
    </nav >
  )
}
