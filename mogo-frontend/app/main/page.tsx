"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getUser, type User } from "@/lib/auth/user"
import { api } from "@/lib/api/client"
import { Footer } from "@/components/footer"
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
  Search,
  Mountain,
  Crosshair,
  Handshake,
  Users,
  Building2,
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
  inquiry1Percentile?: number
  inquiry2Grade?: number
  inquiry2Standard?: number
  inquiry2Percentile?: number
  historyGrade?: number
  totalStandardSum?: number
  totalPercentileSum?: number
  createdAt?: string
}

// ========== 대시보드 (로그인) ==========
function Dashboard({ user }: { user: User }) {
  const [scores, setScores] = useState<ScoreRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState('국어')

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
              <div className="bg-white rounded-2xl border border-gray-200 border-b-4 border-b-[#7b1e7a]/30 p-5 text-center shadow-md">
                <div className="text-xs text-gray-400 mb-1">응시 모의고사</div>
                <div className="text-3xl font-extrabold text-[#7b1e7a]">{scores.length}</div>
                <div className="text-xs text-gray-400 mt-1">회</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 border-b-4 border-b-blue-300 p-5 text-center shadow-md">
                <div className="text-xs text-gray-400 mb-1">최근 평균 등급</div>
                <div className={`text-3xl font-extrabold`} style={{ color: gradeBarColor(latestAvg) }}>{latestAvg.toFixed(1)}</div>
                <div className="text-xs text-gray-400 mt-1">등급</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 border-b-4 border-b-emerald-300 p-5 text-center shadow-md">
                <div className="text-xs text-gray-400 mb-1">최근 표준점수 합</div>
                <div className="text-3xl font-extrabold text-gray-900">{latestTotal || '-'}</div>
                <div className="text-xs text-gray-400 mt-1">점</div>
              </div>
            </div>

            {/* 최근 시험 과목별 등급 차트 - SVG */}
            {latest && (() => {
              const subjects = [
                { name: "국어", grade: Number(latest.koreanGrade) || 0 },
                { name: "수학", grade: Number(latest.mathGrade) || 0 },
                { name: "영어", grade: Number(latest.englishGrade) || 0 },
                { name: "탐구1", grade: Number(latest.inquiry1Grade) || 0 },
                { name: "탐구2", grade: Number(latest.inquiry2Grade) || 0 },
                { name: "한국사", grade: Number(latest.historyGrade) || 0 },
              ].filter(s => s.grade > 0)
              const colors = ['#7b1e7a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']
              const svgW = 360
              const svgH = 200
              const barW = 36
              const gap = (svgW - subjects.length * barW) / (subjects.length + 1)
              return (
                <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 border-b-4 border-b-purple-300 shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">📊 최근 시험 과목별 등급</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{latest.mockExam?.name || `모의고사 #${latest.mockExamId}`} · {latest.mockExam?.year}년 {latest.mockExam?.month}월</p>
                    </div>
                    <Link href="/main/score-analysis" className="text-sm text-[#7b1e7a] hover:underline flex items-center gap-1 font-medium">
                      상세보기<ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="p-6 flex justify-center">
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxWidth: '500px', maxHeight: '260px' }}>
                      {[1, 3, 5, 7, 9].map(g => {
                        const y = 20 + ((10 - g) / 9) * 150
                        return (
                          <g key={g}>
                            <line x1={0} y1={y} x2={svgW} y2={y} stroke="#f3f4f6" strokeWidth={1} strokeDasharray="4,4" />
                            <text x={svgW - 2} y={y - 3} textAnchor="end" fontSize={8} fill="#d1d5db">{g}등급</text>
                          </g>
                        )
                      })}
                      {subjects.map((s, i) => {
                        const barHeight = Math.max(((10 - s.grade) / 9) * 150, 12)
                        const x = gap + i * (barW + gap)
                        const y = 20 + 150 - barHeight
                        return (
                          <g key={s.name}>
                            <rect x={x} y={y} width={barW} height={barHeight} rx={6} fill={colors[i % colors.length]} opacity={0.9} />
                            <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight="bold" fill={colors[i % colors.length]}>{s.grade}등급</text>
                            <text x={x + barW / 2} y={svgH - 5} textAnchor="middle" fontSize={10} fill="#6b7280" fontWeight="500">{s.name}</text>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                </div>
              )
            })()}

            {/* 성적 추이 그래프 */}
            {scores.length >= 1 && (() => {
              const ordered = scores.slice().reverse()
              const chartW = 400
              const chartH = 200
              const padL = 45
              const padR = 20
              const padT = 20
              const padB = 30
              const w = chartW - padL - padR
              const h = chartH - padT - padB
              const n = ordered.length

              // helper: SVG line chart
              const LineChart = ({
                title,
                datasets,
                yMin,
                yMax,
                yLabel,
                invertY,
                yTicks,
              }: {
                title: string
                datasets: { name: string; color: string; data: (number | null)[] }[]
                yMin: number
                yMax: number
                yLabel: string
                invertY?: boolean
                yTicks?: number[]
              }) => {
                const ticks = yTicks || Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4)
                const getX = (i: number) => padL + (n > 1 ? (i / (n - 1)) * w : w / 2)
                const getY = (v: number) => {
                  const ratio = (v - yMin) / (yMax - yMin)
                  return invertY ? padT + ratio * h : padT + (1 - ratio) * h
                }

                return (
                  <div className="mb-8 last:mb-0">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">{title}</h3>
                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: '240px' }}>
                      {/* 배경 그리드 */}
                      {ticks.map((t) => (
                        <g key={t}>
                          <line x1={padL} y1={getY(t)} x2={chartW - padR} y2={getY(t)} stroke="#e5e7eb" strokeWidth={1} />
                          <text x={padL - 6} y={getY(t) + 4} textAnchor="end" fontSize={10} fill="#9ca3af">{invertY ? t : t.toFixed(0)}</text>
                        </g>
                      ))}
                      {/* X축 라벨 */}
                      {ordered.map((s, i) => (
                        <text key={s.id} x={getX(i)} y={chartH - 5} textAnchor="middle" fontSize={10} fill="#9ca3af">
                          {s.mockExam?.month || '?'}월
                        </text>
                      ))}
                      {/* Y축 라벨 */}
                      <text x={8} y={padT + h / 2} textAnchor="middle" fontSize={9} fill="#9ca3af" transform={`rotate(-90, 8, ${padT + h / 2})`}>{yLabel}</text>
                      {/* 데이터 선 */}
                      {datasets.map((ds) => {
                        const points = ds.data.map((v, i) => v != null ? { x: getX(i), y: getY(v), v } : null)
                        const validPoints = points.filter(p => p != null) as { x: number; y: number; v: number }[]
                        if (validPoints.length === 0) return null
                        const pathD = validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                        return (
                          <g key={ds.name}>
                            <polyline fill="none" stroke={ds.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" points={validPoints.map(p => `${p.x},${p.y}`).join(' ')} />
                            {validPoints.map((p, i) => (
                              <g key={i}>
                                <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={ds.color} strokeWidth={2} />
                                <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={9} fontWeight="bold" fill={ds.color}>
                                  {invertY ? p.v.toFixed(1) : Math.round(p.v)}
                                </text>
                              </g>
                            ))}
                          </g>
                        )
                      })}
                    </svg>
                    {/* 범례 */}
                    {datasets.length > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-2">
                        {datasets.map(ds => (
                          <div key={ds.name} className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ds.color }} />
                            <span className="text-xs text-gray-500">{ds.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // 차트 1: 과목별 백분위 추이
              const subjectPercentileData = [
                { name: '국어', color: '#7b1e7a', data: ordered.map(s => Number(s.koreanPercentile) || null) },
                { name: '수학', color: '#3b82f6', data: ordered.map(s => Number(s.mathPercentile) || null) },
                { name: '탐구1', color: '#f59e0b', data: ordered.map(s => Number(s.inquiry1Standard) ? (Number(s.inquiry1Percentile) || null) : null) },
                { name: '탐구2', color: '#ef4444', data: ordered.map(s => Number(s.inquiry2Standard) ? (Number(s.inquiry2Percentile) || null) : null) },
              ].filter(ds => ds.data.some(v => v != null))

              // 차트 2: 백분위 평균 추이
              const avgPercentileData = ordered.map(s => {
                const vals = [
                  Number(s.koreanPercentile) || 0,
                  Number(s.mathPercentile) || 0,
                  Number(s.inquiry1Percentile) || 0,
                  Number(s.inquiry2Percentile) || 0,
                ].filter(v => v > 0)
                return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
              })

              // 차트 3: 국영수탐 평균등급 추이
              const avgGradeData = ordered.map(s => {
                const vals = [
                  Number(s.koreanGrade) || 0,
                  Number(s.mathGrade) || 0,
                  Number(s.englishGrade) || 0,
                  Number(s.inquiry1Grade) || 0,
                  Number(s.inquiry2Grade) || 0,
                ].filter(v => v > 0)
                return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
              })

              // 과목별 백분위 데이터
              const allSubjectPercentiles: { [key: string]: { color: string; data: (number | null)[] } } = {
                '국어': { color: '#7b1e7a', data: ordered.map(s => Number(s.koreanPercentile) || null) },
                '수학': { color: '#3b82f6', data: ordered.map(s => Number(s.mathPercentile) || null) },
                '탐구1': { color: '#f59e0b', data: ordered.map(s => Number(s.inquiry1Percentile) || null) },
                '탐구2': { color: '#ef4444', data: ordered.map(s => Number(s.inquiry2Percentile) || null) },
              }
              const availableSubjects = Object.entries(allSubjectPercentiles).filter(([, v]) => v.data.some(d => d != null)).map(([k]) => k)
              const selectedDs = allSubjectPercentiles[selectedSubject]

              return (
                <div className="space-y-6">
                  {/* 차트 1: 과목별 백분위 추이 */}
                  <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 border-b-4 border-b-blue-300 shadow-md overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-base font-bold text-gray-900">📊 과목별 백분위 추이</h2>
                      <select
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#7b1e7a]/30"
                      >
                        {availableSubjects.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="p-5">
                      {selectedDs && (
                        <LineChart
                          title=""
                          datasets={[{ name: selectedSubject, color: selectedDs.color, data: selectedDs.data }]}
                          yMin={0}
                          yMax={100}
                          yLabel="백분위"
                          yTicks={[0, 25, 50, 75, 100]}
                        />
                      )}
                    </div>
                  </div>

                  {/* 차트 2: 백분위 평균 추이 */}
                  <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 border-b-4 border-b-emerald-300 shadow-md overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-base font-bold text-gray-900">📈 백분위 평균 추이</h2>
                      <Link href="/main/score-analysis" className="text-sm text-[#7b1e7a] hover:underline flex items-center gap-1 font-medium">
                        상세보기<ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="p-5">
                      <LineChart
                        title=""
                        datasets={[{ name: '평균 백분위', color: '#10b981', data: avgPercentileData }]}
                        yMin={0}
                        yMax={100}
                        yLabel="백분위"
                        yTicks={[0, 25, 50, 75, 100]}
                      />
                    </div>
                  </div>

                  {/* 차트 3: 국영수탐 평균등급 추이 */}
                  <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 border-b-4 border-b-amber-300 shadow-md overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="text-base font-bold text-gray-900">🎯 국영수탐 평균등급 추이</h2>
                      <Link href="/main/score-analysis" className="text-sm text-[#7b1e7a] hover:underline flex items-center gap-1 font-medium">
                        상세보기<ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="p-5">
                      <LineChart
                        title=""
                        datasets={[{ name: '평균 등급', color: '#7b1e7a', data: avgGradeData }]}
                        yMin={1}
                        yMax={9}
                        yLabel="등급"
                        invertY
                        yTicks={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                      />
                    </div>
                  </div>
                </div>
              )
            })()}

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
      <Footer />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 자동 채점 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <Zap className="w-10 h-10 text-white/90 mb-3" />
                <h3 className="text-xl font-bold text-white">⚡ 자동 채점</h3>
                <p className="text-blue-100 text-sm mt-1">정답 입력만으로 즉시 채점 완료</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  OMR 답안을 입력하면 즉시 자동 채점!<br />
                  과목별 점수, 등급, 백분위까지 한눈에 확인.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-blue-400" />실시간 자동 채점</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-blue-400" />표준점수 · 백분위 · 등급 자동 변환</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-blue-400" />전 과목 한 번에 처리</div>
                </div>
              </div>
            </div>

            {/* 성적 분석 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                <BarChart3 className="w-10 h-10 text-white/90 mb-3" />
                <h3 className="text-xl font-bold text-white">📊 성적 분석</h3>
                <p className="text-emerald-100 text-sm mt-1">데이터 기반 정밀 분석</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  과목별 성취수준, 평균 등급, 백분위 그래프,<br />
                  조합별 분석까지 데이터 기반 정밀 분석.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-emerald-400" />과목별 등급 · 백분위 시각화</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-emerald-400" />조합별 분석 (국수탐, 국영탐 등)</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-emerald-400" />성취수준 평가 및 학습 추천</div>
                </div>
              </div>
            </div>

            {/* 오답 저장 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6">
                <BookX className="w-10 h-10 text-white/90 mb-3" />
                <h3 className="text-xl font-bold text-white">📝 오답 저장</h3>
                <p className="text-orange-100 text-sm mt-1">틀린 문제를 자동으로 정리</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  틀린 문제를 자동으로 저장하고<br />
                  과목별 · 단원별로 정리하여 효율적인 복습.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-orange-400" />틀린 문제 자동 저장</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-orange-400" />과목별 · 단원별 분류</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-orange-400" />복습 체크리스트</div>
                </div>
              </div>
            </div>

            {/* 대학 예측 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-[#7b1e7a] to-[#5a1559] p-6">
                <GraduationCap className="w-10 h-10 text-white/90 mb-3" />
                <h3 className="text-xl font-bold text-white">🎓 대학 예측</h3>
                <p className="text-purple-200 text-sm mt-1">합격 가능 대학 예측 및 비교</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  내 성적으로 갈 수 있는 대학은?<br />
                  합격 가능 대학 예측 및 목표 대학 비교.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-purple-400" />성적 기반 대학 합격 예측</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-purple-400" />목표 대학 등급컷 비교</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-purple-400" />수시 · 정시 분석</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 모토 배너 */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-[#7b1e7a] via-[#9c3d9a] to-[#7b1e7a] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="mb-4">
            <span className="text-5xl md:text-6xl">🔥</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            &ldquo;<span className="bg-gradient-to-r from-amber-300 to-yellow-200 text-transparent bg-clip-text">내가 푸는 단 한 문제도 버리지 않도록!</span>&rdquo;
          </h2>
          <p className="text-white/70 text-sm md:text-base max-w-lg mx-auto">
            ExamHub는 당신이 풀었던 모든 문제를 기억하고, 분석하고, 성장의 발판으로 만듭니다.
          </p>
        </div>
      </section>

      {/* 추가 기능 홍보 */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-4">✨ 더 강력한 기능들</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              단순 채점을 넘어,<br /><span className="text-[#7b1e7a]">진짜 실력 향상까지</span>
            </h2>
            <p className="text-gray-500 text-lg">ExamHub만의 심층 분석 도구들을 만나보세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 취약분석 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6">
                <Search className="w-10 h-10 text-white/90 mb-3" />
                <h3 className="text-xl font-bold text-white">🔍 취약점 분석</h3>
                <p className="text-red-100 text-sm mt-1">나의 약점을 정확히 파악하세요</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  세부과목별·난이도별·유형별·문제형태별·단원별·배점별로<br />
                  오답 패턴을 레이더 차트와 바 차트로 시각화합니다.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-red-400" />6가지 차원의 다차원 취약점 분석</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-red-400" />레이더 차트로 취약점 한눈에 파악</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-red-400" />가장 취약한 유형·단원 자동 감지</div>
                </div>
              </div>
            </div>

            {/* 오답노트 활용 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
                <BookOpen className="w-10 h-10 text-white/90 mb-3" />
                <h3 className="text-xl font-bold text-white">📖 오답노트 활용</h3>
                <p className="text-orange-100 text-sm mt-1">틀린 문제를 다시 풀어 완전 정복</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  시험별·과목별·유형별·난이도별·배점별로 오답을 정리하고,<br />
                  선별된 문제로 다시 시험을 볼 수 있습니다.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-orange-400" />시험별·범위별 오답 문항 자동 정리</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-orange-400" />오답 문제로 재시험 구성 (예정)</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-orange-400" />복습 횟수·북마크 관리</div>
                </div>
              </div>
            </div>

            {/* 목표대학 기능 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                <Mountain className="w-10 h-10 text-white/90 mb-3" />
                <h3 className="text-xl font-bold text-white">⛰️ 목표대학 설정</h3>
                <p className="text-emerald-100 text-sm mt-1">고지를 보고 달려라!</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  목표 대학을 설정하면, 매 시험마다 목표 대학 등급컷과<br />
                  내 성적의 거리를 시각적으로 보여줍니다.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-emerald-400" />목표 대학 등급컷 vs 내 성적 비교</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-emerald-400" />시험별 접근도 추이 그래프</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-emerald-400" />부족한 과목 자동 안내</div>
                </div>
              </div>
            </div>

            {/* 대학 예측 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="bg-gradient-to-r from-[#7b1e7a] to-[#5a1559] p-6">
                <Crosshair className="w-10 h-10 text-white/90 mb-3" />
                <h3 className="text-xl font-bold text-white">🎯 대학 합격 예측</h3>
                <p className="text-purple-200 text-sm mt-1">내 성적으로 어디까지 갈 수 있을까?</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  최신 입시 데이터를 기반으로 합격 가능 대학을 예측하고,<br />
                  안정·적정·소신 지원 대학까지 분류합니다.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-purple-400" />정시 합격 가능 대학 자동 분류</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-purple-400" />안정·적정·소신 3단계 지원 가이드</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-purple-400" />시험별 예측 변화 추이 확인</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 사설모의고사 협업 제안 */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-400/20 rounded-full text-amber-300 text-sm font-bold mb-5">
                  <Handshake className="w-4 h-4" />
                  파트너 모집
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
                  사설 모의고사 기관이신가요?<br />
                  <span className="text-amber-300">ExamHub와 함께하세요!</span>
                </h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                  귀사의 모의고사를 ExamHub 플랫폼에 등록하면,<br />
                  학생들이 자동채점·성적분석·취약분석까지 원스톱으로 이용할 수 있습니다.<br />
                  사설 모의고사의 가치를 극대화하고, 더 많은 학생에게 도달하세요.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                    <div className="w-10 h-10 bg-amber-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">학생 유치</div>
                      <div className="text-gray-400 text-xs">플랫폼 노출 확대</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                    <div className="w-10 h-10 bg-emerald-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">분석 제공</div>
                      <div className="text-gray-400 text-xs">자동 성적분석 포함</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                    <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">브랜드 강화</div>
                      <div className="text-gray-400 text-xs">전문 플랫폼 파트너</div>
                    </div>
                  </div>
                </div>
                <a href="mailto:contact@examhub.kr" className="inline-flex items-center gap-2 px-7 py-3.5 bg-amber-400 text-gray-900 rounded-xl hover:bg-amber-300 transition-colors font-bold text-sm shadow-lg">
                  <Handshake className="w-5 h-5" />협업 문의하기<ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 데이터 활용 안내 - 거북쌤 말풍선 */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-6 md:gap-10">
            {/* 거북쌤 로고 (좌측) */}
            <div className="flex-shrink-0">
              <img
                src="/images/mascot.png"
                alt="거북쌤 마스코트"
                className="w-28 h-28 md:w-40 md:h-40 drop-shadow-xl"
              />
            </div>
            {/* 말풍선 (우측) */}
            <div className="relative flex-1">
              <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[14px] border-r-white hidden md:block" style={{ filter: 'drop-shadow(-2px 0 1px rgba(0,0,0,0.05))' }} />
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8">
                <p className="text-gray-700 text-base md:text-lg leading-relaxed font-medium mb-4">
                  현재는 비록 위의 기능들만 제공하지만
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-600 text-base md:text-lg">
                    <span className="text-[#7b1e7a] font-bold mt-0.5">-</span>
                    <span>점수보다, <strong className="text-gray-900">정답을 입력해 놓으면,</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-600 text-base md:text-lg">
                    <span className="text-[#7b1e7a] font-bold mt-0.5">-</span>
                    <span><strong className="text-gray-900">AI가 이 데이터들을 이용해서,</strong> 곧 생각지도 못한 도움을 주게 될 것입니다</span>
                  </li>
                </ul>
              </div>
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
      <Footer />
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
