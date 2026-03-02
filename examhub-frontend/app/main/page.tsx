"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getUser, type User } from "@/lib/auth/user"
import { api } from "@/lib/api/client"
import {
  FileText,
  BarChart3,
  GraduationCap,
  TrendingUp,
  Target,
  BookX,
  Zap,
  CheckCircle2,
  ArrowRight,
  ClipboardCheck,
  PieChart,
  Sparkles,
  Shield,
  ChevronRight,
  BookOpen,
  AlertCircle,
} from "lucide-react"

// ========== 타입 ==========
interface ScoreRecord {
  id: number
  memberId: number
  mockExamId: number
  mockExam?: { id: number; name: string; year: number; month: number; type: string }
  koreanGrade?: number
  koreanStandard?: number
  koreanPercentile?: number
  mathGrade?: number
  mathStandard?: number
  mathPercentile?: number
  englishGrade?: number
  inquiry1Grade?: number
  inquiry1Standard?: number
  inquiry2Grade?: number
  inquiry2Standard?: number
  historyGrade?: number
  totalStandardSum?: number
  totalPercentileSum?: number
  createdAt?: string
}

// ========== 대시보드 (로그인) ==========
function Dashboard({ user }: { user: User }) {
  const [scores, setScores] = useState<ScoreRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<ScoreRecord[]>(`/api/scores/student/${user.id}`)
        setScores(Array.isArray(res) ? res : [])
      } catch {
        setScores([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user.id])

  const calcAvgGrade = (s: ScoreRecord) => {
    const grades = [s.koreanGrade, s.mathGrade, s.englishGrade, s.inquiry1Grade, s.inquiry2Grade, s.historyGrade]
      .map(g => Number(g) || 0).filter(g => g > 0)
    return grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0
  }

  const gradeBarColor = (g: number) => {
    if (g <= 2) return '#22c55e'
    if (g <= 4) return '#3b82f6'
    if (g <= 6) return '#f59e0b'
    return '#ef4444'
  }

  const gradeBg = (g: number) => {
    if (g <= 2) return "bg-green-100 text-green-700"
    if (g <= 4) return "bg-blue-100 text-blue-700"
    if (g <= 6) return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  const latest = scores.length > 0 ? scores[0] : null
  const latestAvg = latest ? calcAvgGrade(latest) : 0
  const latestTotal = latest ? (Number(latest.totalStandardSum) || 0) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 환영 헤더 */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            안녕하세요, <span className="text-[#7b1e7a]">{user.name}</span>님! 👋
          </h1>
          <p className="text-gray-500 mt-1">오늘도 목표를 향해 한 걸음 더!</p>
        </div>

        {/* 빠른 액션 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/main/input" className="bg-gradient-to-br from-[#7b1e7a] to-[#9c3d9a] rounded-2xl p-5 text-white hover:shadow-lg hover:shadow-purple-200/50 transition-all hover:-translate-y-0.5">
            <FileText className="w-7 h-7 mb-3 opacity-80" />
            <div className="font-bold text-sm">모의고사 입력</div>
            <div className="text-xs text-white/70 mt-1">정답 입력 & 채점</div>
          </Link>
          <Link href="/main/score-analysis" className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white hover:shadow-lg hover:shadow-blue-200/50 transition-all hover:-translate-y-0.5">
            <BarChart3 className="w-7 h-7 mb-3 opacity-80" />
            <div className="font-bold text-sm">성적 분석</div>
            <div className="text-xs text-white/70 mt-1">과목별 분석</div>
          </Link>
          <Link href="/main/wrong-answers" className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white hover:shadow-lg hover:shadow-orange-200/50 transition-all hover:-translate-y-0.5">
            <BookX className="w-7 h-7 mb-3 opacity-80" />
            <div className="font-bold text-sm">오답 노트</div>
            <div className="text-xs text-white/70 mt-1">틀린 문제 복습</div>
          </Link>
          <button onClick={() => alert('3월 첫 모의고사 이후 서비스 실행됩니다')} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white hover:shadow-lg hover:shadow-emerald-200/50 transition-all hover:-translate-y-0.5 text-left">
            <GraduationCap className="w-7 h-7 mb-3 opacity-80" />
            <div className="font-bold text-sm">대학 예측</div>
            <div className="text-xs text-white/70 mt-1">합격 예측</div>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-400">데이터 로딩 중...</div>
          </div>
        ) : scores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-[#7b1e7a]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">아직 입력한 모의고사가 없습니다</h3>
            <p className="text-gray-500 mb-6">모의고사 정답을 입력하면 자동채점, 성적분석, 대학예측까지 한번에!</p>
            <Link href="/main/input" className="inline-flex items-center gap-2 px-6 py-3 bg-[#7b1e7a] text-white rounded-xl hover:bg-[#5a1559] transition-colors font-medium">
              <Zap className="w-5 h-5" />첫 모의고사 입력하기<ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 요약 통계 카드 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="text-xs text-gray-400 mb-1">응시 모의고사</div>
                <div className="text-3xl font-extrabold text-[#7b1e7a]">{scores.length}</div>
                <div className="text-xs text-gray-400 mt-1">회</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="text-xs text-gray-400 mb-1">최근 평균 등급</div>
                <div className={`text-3xl font-extrabold`} style={{ color: gradeBarColor(latestAvg) }}>{latestAvg.toFixed(1)}</div>
                <div className="text-xs text-gray-400 mt-1">등급</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="text-xs text-gray-400 mb-1">최근 표준점수 합</div>
                <div className="text-3xl font-extrabold text-gray-900">{latestTotal || '-'}</div>
                <div className="text-xs text-gray-400 mt-1">점</div>
              </div>
            </div>

            {/* 최근 시험 과목별 등급 차트 */}
            {latest && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">📊 최근 시험 과목별 등급</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{latest.mockExam?.name || `모의고사 #${latest.mockExamId}`} · {latest.mockExam?.year}년 {latest.mockExam?.month}월</p>
                  </div>
                  <Link href="/main/score-analysis" className="text-sm text-[#7b1e7a] hover:underline flex items-center gap-1 font-medium">
                    상세보기<ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-6">
                  {(() => {
                    const subjects = [
                      { name: "국어", grade: Number(latest.koreanGrade) || 0 },
                      { name: "수학", grade: Number(latest.mathGrade) || 0 },
                      { name: "영어", grade: Number(latest.englishGrade) || 0 },
                      { name: "탐구1", grade: Number(latest.inquiry1Grade) || 0 },
                      { name: "탐구2", grade: Number(latest.inquiry2Grade) || 0 },
                      { name: "한국사", grade: Number(latest.historyGrade) || 0 },
                    ].filter(s => s.grade > 0)

                    return (
                      <div className="flex items-end justify-center gap-6" style={{ height: '220px' }}>
                        {subjects.map((s, i) => {
                          const colors = ['#7b1e7a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']
                          // 등급이 낮을수록(좋을수록) 높은 바
                          const barHeight = Math.max(((10 - s.grade) / 9) * 100, 10)
                          return (
                            <div key={s.name} className="flex flex-col items-center gap-1" style={{ width: '56px' }}>
                              <span className="text-xs font-bold" style={{ color: colors[i % colors.length] }}>{s.grade}등급</span>
                              <div
                                className="w-10 rounded-t-lg transition-all duration-700"
                                style={{
                                  height: `${barHeight}%`,
                                  backgroundColor: colors[i % colors.length],
                                  opacity: 0.85,
                                }}
                              />
                              <span className="text-xs text-gray-600 text-center mt-1 font-medium">{s.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* 성적 추이 그래프 */}
            {scores.length >= 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">📈 성적 추이</h2>
                  <Link href="/main/score-analysis" className="text-sm text-[#7b1e7a] hover:underline flex items-center gap-1 font-medium">
                    상세보기<ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="p-6">
                  {/* 평균 등급 추이 */}
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-600 mb-4">평균 등급 추이</h3>
                    <div className="flex items-end gap-5 justify-center" style={{ height: '180px' }}>
                      {scores.slice().reverse().map((score) => {
                        const avg = calcAvgGrade(score)
                        // 등급이 낮을수록(좋을수록) 높은 바
                        const barHeight = avg > 0 ? Math.max(((10 - avg) / 9) * 100, 10) : 0
                        return (
                          <div key={score.id} className="flex flex-col items-center gap-1 flex-1 max-w-[80px]">
                            <span className="text-xs font-bold" style={{ color: gradeBarColor(avg) }}>{avg.toFixed(1)}</span>
                            <div
                              className="w-10 rounded-t-lg transition-all duration-500"
                              style={{
                                height: `${barHeight}%`,
                                backgroundColor: gradeBarColor(avg),
                                opacity: 0.85,
                              }}
                            />
                            <span className="text-[10px] text-gray-400 mt-1 text-center leading-tight">
                              {score.mockExam?.month || '?'}월
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 표준점수 합계 추이 */}
                  {scores.some(s => Number(s.totalStandardSum) > 0) && (
                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-gray-600 mb-4">표준점수 합계 추이</h3>
                      <div className="flex items-end gap-5 justify-center" style={{ height: '160px' }}>
                        {scores.slice().reverse().map((score) => {
                          const total = Number(score.totalStandardSum) || 0
                          const maxTotal = Math.max(...scores.map(s => Number(s.totalStandardSum) || 0), 1)
                          const barHeight = total > 0 ? Math.max((total / maxTotal) * 100, 8) : 0
                          return (
                            <div key={score.id} className="flex flex-col items-center gap-1 flex-1 max-w-[80px]">
                              <span className="text-xs font-bold text-gray-700">{total || '-'}</span>
                              <div
                                className="w-10 rounded-t-lg bg-gradient-to-t from-[#7b1e7a] to-[#c96ac7] transition-all duration-500"
                                style={{ height: `${barHeight}%` }}
                              />
                              <span className="text-[10px] text-gray-400 mt-1 text-center leading-tight">
                                {score.mockExam?.month || '?'}월
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 새 모의고사 CTA */}
            <div className="bg-gradient-to-r from-[#7b1e7a] to-[#9c3d9a] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white">
                <h3 className="text-lg font-bold">새 모의고사를 풀었나요?</h3>
                <p className="text-white/70 text-sm mt-1">정답을 입력하고 바로 성적을 분석해보세요!</p>
              </div>
              <Link href="/main/input" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#7b1e7a] rounded-xl hover:bg-gray-100 transition-colors font-bold shadow-lg whitespace-nowrap">
                <Zap className="w-5 h-5" />모의고사 입력하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ========== 프로모 페이지 (비로그인) ==========
function PromoPage() {
  return (
    <>
      {/* 히어로 섹션 - 3월 모의고사 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#7b1e7a] via-[#9c3d9a] to-[#5a1559]">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20">
            <Sparkles className="w-4 h-4" />
            2025년 3월 모의고사 시즌
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            3월 모의고사 준비는<br />
            <span className="bg-gradient-to-r from-amber-300 to-yellow-200 text-transparent bg-clip-text">ExamHub</span>와 함께!
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            과거 3월 모의고사를 푼 후, 정답을 ExamHub에 입력하면<br className="hidden md:block" />
            <strong className="text-white">자동채점, 성적분석, 대학예측, 오답저장</strong>까지!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/main/input" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#7b1e7a] rounded-2xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-2xl shadow-black/20 hover:scale-105">
              <Zap className="w-5 h-5" />지금 채점 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 3월 모의고사 채점 안내 */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">✏️ 이렇게 쉬워요</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              3월 모의고사 채점?<br /><span className="text-[#7b1e7a]">ExamHub에 정답만 입력하세요!</span>
            </h2>
            <p className="text-gray-500 text-lg">단 3단계로 완벽한 성적 분석을 받으세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-100/50 text-center group hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#7b1e7a] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">1</div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2">
                <ClipboardCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">모의고사 선택</h3>
              <p className="text-sm text-gray-500">시험 연도, 학년, 월을 선택하면<br />해당 모의고사가 자동 로드됩니다</p>
            </div>
            <div className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-100/50 text-center group hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#7b1e7a] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">2</div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">정답 입력</h3>
              <p className="text-sm text-gray-500">각 과목별 정답을 입력하거나<br />표준점수/등급을 직접 입력하세요</p>
            </div>
            <div className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-lg shadow-gray-100/50 text-center group hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#7b1e7a] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">3</div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">결과 확인</h3>
              <p className="text-sm text-gray-500">자동 채점 결과와 함께<br />성적분석 · 대학예측까지 바로 확인!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 기능 섹션 */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">🚀 핵심 기능</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              자동채점, 성적분석, 오답저장, 대학예측까지!
            </h2>
            <p className="text-gray-500 text-lg">ExamHub 하나면 모의고사 관리 끝!</p>
          </div>
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="w-full md:w-1/2">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200/50">
                  <Zap className="w-12 h-12 mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-3">⚡ 자동 채점</h3>
                  <p className="text-blue-100 leading-relaxed">OMR 답안을 입력하면 즉시 자동 채점!<br />과목별 점수, 등급, 백분위까지 한눈에 확인.</p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-blue-200" />실시간 자동 채점</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-blue-200" />표준점수 · 백분위 · 등급 자동 변환</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-blue-200" />전 과목 한 번에 처리</div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200/50">
                  <BarChart3 className="w-12 h-12 mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-3">📊 성적 분석</h3>
                  <p className="text-emerald-100 leading-relaxed">과목별 성취수준, 평균 등급, 백분위 그래프,<br />조합별 분석까지 데이터 기반 정밀 분석.</p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-200" />과목별 등급 · 백분위 시각화</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-200" />조합별 분석 (국수탐, 국영탐 등)</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-200" />성취수준 평가 및 학습 추천</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="w-full md:w-1/2">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-200/50">
                  <BookX className="w-12 h-12 mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-3">📝 오답 저장</h3>
                  <p className="text-orange-100 leading-relaxed">티린 문제를 자동으로 저장하고<br />과목별 · 단원별로 정리하여 효율적인 복습.</p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-orange-200" />틀린 문제 자동 저장</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-orange-200" />과목별 · 단원별 분류</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-orange-200" />복습 체크리스트</div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <div className="bg-gradient-to-br from-[#7b1e7a] to-[#5a1559] rounded-3xl p-8 text-white shadow-xl shadow-purple-200/50">
                  <GraduationCap className="w-12 h-12 mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-3">🎓 대학 예측</h3>
                  <p className="text-purple-200 leading-relaxed">내 성적으로 갈 수 있는 대학은?<br />합격 가능 대학 예측 및 목표 대학 비교.</p>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-purple-300" />성적 기반 대학 합격 예측</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-purple-300" />목표 대학 등급컷 비교</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-purple-300" />수시 · 정시 분석</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 왜 ExamHub인가 */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              왜 <span className="text-[#7b1e7a]">ExamHub</span>인가요?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">정확한 데이터</h4>
              <p className="text-sm text-gray-500">교육청/평가원 공식 정답과<br />변환표를 기반으로 분석합니다</p>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-green-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">빠르고 간편</h4>
              <p className="text-sm text-gray-500">정답만 입력하면 끝!<br />복잡한 수작업이 필요 없습니다</p>
            </div>
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-7 h-7 text-purple-600" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">통합 분석</h4>
              <p className="text-sm text-gray-500">채점부터 대학예측까지<br />한 곳에서 모두 해결합니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#7b1e7a] via-[#9c3d9a] to-[#5a1559] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-5">지금 바로 시작하세요!</h3>
          <p className="text-white/80 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
            3월 모의고사 정답만 입력하면<br />자동채점 · 성적분석 · 대학예측 · 오답저장까지!
          </p>
          <Link href="/main/input" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-[#7b1e7a] rounded-2xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-2xl shadow-black/20 hover:scale-105">
            <Zap className="w-6 h-6" />무료로 채점 시작하기<ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2025 ExamHub by T Skool. 모의고사 분석 서비스</p>
        </div>
      </footer>
    </>
  )
}

// ========== 메인 페이지 ==========
export default function MyExamPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const userData = await getUser()
      setUser(userData)
      setAuthLoading(false)
    }
    checkUser()
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    )
  }

  return user ? <Dashboard user={user} /> : <PromoPage />
}
