"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getUser, type User } from "@/lib/auth/user"
import { api } from "@/lib/api/client"
import { ExamCategorySelector, useExamCategory } from "@/components/ExamCategorySelector"

/* ───── Types ───── */
interface ExamDataPoint {
  mockExamId: number
  examName: string
  year: number
  month: number
  grade?: number
  percentile?: number
  standardScore?: number
  rawScore?: number
  topCumulativeStd?: number
  topCumulativeRaw?: number
}

interface SubjectTrend {
  subject: string
  selection?: string
  dataPoints: ExamDataPoint[]
  avgGrade?: number
  bestGrade?: number
  worstGrade?: number
  trend?: "up" | "down" | "stable"
}

interface TrendAnalysis {
  studentId: number
  periodStart: string
  periodEnd: string
  totalExams: number
  subjects: SubjectTrend[]
  overallTrend?: ExamDataPoint[]
}

interface CumulativeStats {
  subject: string
  examCount: number
  avgGrade?: number
  avgPercentile?: number
  avgStandardScore?: number
  bestGrade?: number
  worstGrade?: number
  stdDevGrade?: number
}

interface CumulativeAnalysis {
  studentId: number
  totalExams: number
  subjectStats: CumulativeStats[]
  overallAvgGrade: number
  overallAvgStandardSum?: number
  stability: "high" | "medium" | "low"
  overallTrend: "improving" | "declining" | "stable"
}

/* ───── Helpers ───── */
const GRADE_COLORS = [
  "", // 0 unused
  "bg-emerald-500", // 1
  "bg-emerald-400", // 2
  "bg-blue-500",    // 3
  "bg-blue-400",    // 4
  "bg-yellow-500",  // 5
  "bg-yellow-400",  // 6
  "bg-orange-400",  // 7
  "bg-red-400",     // 8
  "bg-red-500",     // 9
]
const gradeTextColor = (g?: number | null) => {
  if (g == null) return "text-gray-400"
  if (g <= 2) return "text-emerald-600 font-bold"
  if (g <= 4) return "text-blue-600 font-bold"
  if (g <= 6) return "text-yellow-600 font-bold"
  return "text-red-600 font-bold"
}
const trendIcon = (t?: string) =>
  t === "up" ? "📈" : t === "down" ? "📉" : "➡️"
const trendLabel = (t?: string) =>
  t === "up" ? "상승" : t === "down" ? "하락" : "유지"
const stabilityLabel = (s: string) =>
  s === "high" ? "높음" : s === "medium" ? "보통" : "낮음"

/* ───── SVG Line Chart ───── */
function LineChart({
  datasets,
  labels,
  height = 200,
  yReverse = false,
  yMin,
  yMax,
  unit = "",
  horizontalLines,
}: {
  datasets: { label: string; data: (number | null)[]; color: string }[]
  labels: string[]
  height?: number
  yReverse?: boolean
  yMin?: number
  yMax?: number
  unit?: string
  horizontalLines?: { value: number; label: string; color: string }[]
}) {
  const W = 600, H = height, PX = 60, PY = 30
  const innerW = W - PX * 2, innerH = H - PY * 2

  // Calculate range
  const allVals = datasets.flatMap(d => d.data.filter(v => v != null) as number[])
  const hLineVals = horizontalLines?.map(h => h.value) ?? []
  const combined = [...allVals, ...hLineVals]
  const minV = yMin ?? Math.min(...combined)
  const maxV = yMax ?? Math.max(...combined)
  const range = maxV - minV || 1

  const toX = (i: number) => PX + (labels.length > 1 ? (i / (labels.length - 1)) * innerW : innerW / 2)
  const toY = (v: number) => {
    const ratio = (v - minV) / range
    return yReverse ? PY + ratio * innerH : PY + innerH - ratio * innerH
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: `${H}px` }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(r => {
        const y = PY + r * innerH
        const val = yReverse ? minV + r * range : maxV - r * range
        return (
          <g key={r}>
            <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PX - 8} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="11">
              {Number.isInteger(val) ? val : val.toFixed(1)}{unit}
            </text>
          </g>
        )
      })}

      {/* Horizontal reference lines */}
      {horizontalLines?.map((hl, i) => (
        <g key={`hl-${i}`}>
          <line x1={PX} y1={toY(hl.value)} x2={W - PX} y2={toY(hl.value)}
            stroke={hl.color} strokeWidth="2" strokeDasharray="6 4" />
          <text x={W - PX + 4} y={toY(hl.value) + 4} fill={hl.color} fontSize="10">
            {hl.label}
          </text>
        </g>
      ))}

      {/* X labels */}
      {labels.map((l, i) => (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fill="#6b7280" fontSize="11">
          {l}
        </text>
      ))}

      {/* Data lines */}
      {datasets.map((ds, di) => {
        const points = ds.data.map((v, i) => (v != null ? { x: toX(i), y: toY(v), v } : null))
        const validPoints = points.filter(Boolean) as { x: number; y: number; v: number }[]
        if (validPoints.length === 0) return null
        const pathD = validPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
        return (
          <g key={di}>
            <path d={pathD} fill="none" stroke={ds.color} strokeWidth="2.5" />
            {validPoints.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill={ds.color} stroke="white" strokeWidth="2" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill={ds.color} fontSize="11" fontWeight="bold">
                  {Number.isInteger(p.v) ? p.v : p.v.toFixed(1)}{unit}
                </text>
              </g>
            ))}
          </g>
        )
      })}

      {/* Legend */}
      {datasets.length > 1 && datasets.map((ds, i) => (
        <g key={`leg-${i}`} transform={`translate(${PX + i * 100}, ${PY - 14})`}>
          <rect width="12" height="12" rx="2" fill={ds.color} />
          <text x="16" y="10" fill="#374151" fontSize="11">{ds.label}</text>
        </g>
      ))}
    </svg>
  )
}

/* ───── Main Page ───── */
export default function StatisticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { category, setCategory, isActive } = useExamCategory()
  const [trend, setTrend] = useState<TrendAnalysis | null>(null)
  const [cumulative, setCumulative] = useState<CumulativeAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "heatmap" | "cumulative-pct">("overview")

  useEffect(() => {
    async function fetchUser() {
      const u = await getUser()
      setUser(u)
      setAuthLoading(false)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (authLoading || !user) return
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const yearParam = selectedYear !== "all" ? `?startYear=${selectedYear}&endYear=${selectedYear}` : ""
        const [trendRes, cumRes] = await Promise.all([
          api.get<{ success: boolean; data: TrendAnalysis }>(`/api/statistics/trend/${user!.id}${yearParam}`),
          api.get<{ success: boolean; data: CumulativeAnalysis }>(`/api/statistics/cumulative/${user!.id}${yearParam}`),
        ])
        setTrend((trendRes as any).data ?? trendRes)
        setCumulative((cumRes as any).data ?? cumRes)
      } catch (err) {
        console.error("Statistics fetch error:", err)
        setError(err instanceof Error ? err.message : "통계를 불러오는 데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [authLoading, user, selectedYear])

  // Derived
  const examLabels = useMemo(() =>
    trend?.overallTrend?.map(e => `${e.year.toString().slice(2)}.${e.month}월`) ?? []
    , [trend])

  const years = useMemo(() => {
    if (!trend?.overallTrend) return []
    const ySet = new Set(trend.overallTrend.map(e => e.year))
    return Array.from(ySet).sort()
  }, [trend])

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><span className="text-gray-500">로딩 중...</span></div>
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg border border-yellow-300 text-center">
          ⚠️ 성적 추이를 보려면 먼저 로그인해주세요.
        </div>
      </div>
    )
  }

  const noData = !loading && (!trend || trend.totalExams === 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span>홈</span><span>&gt;</span><span>모의고사 분석</span><span>&gt;</span>
          <span className="text-[#00e5e8] font-medium">성적 추이</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">성적 추이 분석</h1>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#00e5e8] focus:border-[#00e5e8]"
          >
            <option value="all">전체 기간</option>
            {years.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>

        <ExamCategorySelector onCategoryChange={setCategory} selectedCategory={category} />

        {!isActive ? null : (<>
          {error && <div className="bg-red-100 text-red-800 p-4 rounded-md border border-red-300 mb-6">{error}</div>}

          {loading ? (
            <div className="flex items-center justify-center py-20"><span className="text-gray-500">데이터 로딩 중...</span></div>
          ) : noData ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">아직 저장된 성적이 없습니다.</p>
              <button onClick={() => router.push("/main/input")} className="px-6 py-2 bg-[#00e5e8] text-white rounded-md hover:bg-[#00b8bb]">
                모의고사 입력하기
              </button>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              {cumulative && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <SummaryCard title="총 시험 횟수" value={`${cumulative.totalExams}회`} />
                  <SummaryCard title="전체 평균 등급" value={`${cumulative.overallAvgGrade.toFixed(1)}등급`}
                    color={gradeTextColor(Math.round(cumulative.overallAvgGrade))} />
                  <SummaryCard title="성적 안정성" value={stabilityLabel(cumulative.stability)}
                    sub={cumulative.stability === "high" ? "🟢" : cumulative.stability === "medium" ? "🟡" : "🔴"} />
                  <SummaryCard title="전체 추세"
                    value={`${trendIcon(cumulative.overallTrend === "improving" ? "up" : cumulative.overallTrend === "declining" ? "down" : "stable")} ${cumulative.overallTrend === "improving" ? "상승 중" : cumulative.overallTrend === "declining" ? "하락 중" : "유지"}`} />
                </div>
              )}

              {/* Tab nav */}
              <div className="flex border-b border-gray-200 mb-6">
                {([
                  ["overview", "📈 전체 추이"],
                  ["cumulative-pct", "🎯 상위누백 추이"],
                  ["heatmap", "🔥 등급 히트맵"],
                  ["subjects", "📚 과목별 분석"],
                ] as const).map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? "border-[#00e5e8] text-[#00e5e8]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "overview" && trend && <OverviewTab trend={trend} examLabels={examLabels} />}
              {activeTab === "cumulative-pct" && trend && <CumulativePctTab trend={trend} examLabels={examLabels} />}
              {activeTab === "heatmap" && trend && <HeatmapTab trend={trend} />}
              {activeTab === "subjects" && trend && cumulative && <SubjectsTab trend={trend} cumulative={cumulative} examLabels={examLabels} />}
            </>
          )}
        </>)}
      </div>
    </div>
  )
}

/* ───── Summary Card ───── */
function SummaryCard({ title, value, color, sub }: { title: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className={`text-xl font-bold ${color ?? "text-gray-900"}`}>
        {sub && <span className="mr-1">{sub}</span>}{value}
      </div>
    </div>
  )
}

/* ───── Tab 1: Overview ───── */
function OverviewTab({ trend, examLabels }: { trend: TrendAnalysis; examLabels: string[] }) {
  const ot = trend.overallTrend ?? []
  return (
    <div className="space-y-6">
      {/* 평균 등급 추이 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">평균 등급 추이</h2>
        <LineChart
          datasets={[{ label: "평균 등급", data: ot.map(e => e.grade ?? null), color: "#00e5e8" }]}
          labels={examLabels}
          yReverse yMin={1} yMax={9} unit="등급"
        />
      </div>

      {/* 표점합 추이 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">국수탐 표준점수 합계 추이</h2>
        <LineChart
          datasets={[{ label: "표점합", data: ot.map(e => e.standardScore ?? null), color: "#00e5e8" }]}
          labels={examLabels}
        />
      </div>

      {/* 전체 데이터 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">시험별 상세 데이터</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700 border-r border-gray-200">과목</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 border-r border-gray-200">지표</th>
                {examLabels.map((l, i) => (
                  <th key={i} className="px-4 py-3 text-center font-medium text-gray-700 border-r border-gray-200">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trend.subjects.map(subj => (
                ["등급", "표점", "백분위"].map((metric, mi) => (
                  <tr key={`${subj.subject}-${metric}`} className={`border-b border-gray-100 ${mi === 0 ? "border-t border-gray-200" : ""}`}>
                    {mi === 0 && (
                      <td rowSpan={3} className="px-4 py-2 font-medium text-gray-900 border-r border-gray-200 bg-gray-50 align-middle">
                        {subj.subject}
                        {subj.selection && <div className="text-xs text-gray-400">{subj.selection}</div>}
                      </td>
                    )}
                    <td className="px-4 py-2 text-gray-600 border-r border-gray-200 bg-gray-50 text-xs">{metric}</td>
                    {subj.dataPoints.map((dp, di) => {
                      const val = metric === "등급" ? dp.grade : metric === "표점" ? dp.standardScore : dp.percentile
                      return (
                        <td key={di} className={`px-4 py-2 text-center border-r border-gray-200 ${metric === "등급" ? gradeTextColor(val) : "text-gray-900"}`}>
                          {val ?? "-"}
                        </td>
                      )
                    })}
                  </tr>
                ))
              ))}
              {/* 합계 row */}
              <tr className="border-t-2 border-gray-300 bg-[#fdf5fd]">
                <td className="px-4 py-2 font-bold text-[#00e5e8] border-r border-gray-200">합계</td>
                <td className="px-4 py-2 text-gray-600 border-r border-gray-200 text-xs">표점합</td>
                {ot.map((e, i) => (
                  <td key={i} className="px-4 py-2 text-center font-bold text-[#00e5e8] border-r border-gray-200">{e.standardScore ?? "-"}</td>
                ))}
              </tr>
              <tr className="bg-[#fdf5fd]">
                <td className="px-4 py-2 border-r border-gray-200"></td>
                <td className="px-4 py-2 text-gray-600 border-r border-gray-200 text-xs">평균등급</td>
                {ot.map((e, i) => (
                  <td key={i} className={`px-4 py-2 text-center border-r border-gray-200 ${gradeTextColor(e.grade ? Math.round(e.grade) : null)}`}>
                    {e.grade?.toFixed(1) ?? "-"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ───── Tab 2: 상위누백 추이 ───── */
function CumulativePctTab({ trend, examLabels }: { trend: TrendAnalysis; examLabels: string[] }) {
  const ot = trend.overallTrend ?? []
  const stdData = ot.map(e => e.topCumulativeStd ?? null)
  const rawData = ot.map(e => e.topCumulativeRaw ?? null)
  const hasStd = stdData.some(v => v != null)
  const hasRaw = rawData.some(v => v != null)

  if (!hasStd && !hasRaw) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <p className="text-gray-600">아직 상위누적백분위 데이터가 없습니다.</p>
        <p className="text-sm text-gray-500 mt-2">표준점수와 영어등급이 입력되면 자동으로 계산됩니다.</p>
      </div>
    )
  }

  const datasets = []
  if (hasStd) datasets.push({ label: "상위누백 (표점)", data: stdData, color: "#00e5e8" })
  if (hasRaw) datasets.push({ label: "상위누백 (원점수)", data: rawData, color: "#9ca3af" })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">상위누적백분위 추이</h2>
        <p className="text-sm text-gray-500 mb-4">
          낮을수록 상위권 — 예: 상위 5% = 전체의 상위 5%에 해당
        </p>
        <LineChart
          datasets={datasets}
          labels={examLabels}
          yReverse yMin={0} yMax={100} unit="%"
          height={240}
        />
      </div>

      {/* 표+표점합 나란히 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700 border-r border-gray-200">지표</th>
                {examLabels.map((l, i) => (
                  <th key={i} className="px-4 py-3 text-center font-medium text-gray-700 border-r border-gray-200">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-200">표점합</td>
                {ot.map((e, i) => <td key={i} className="px-4 py-3 text-center border-r border-gray-200">{e.standardScore ?? "-"}</td>)}
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-200">평균등급</td>
                {ot.map((e, i) => <td key={i} className={`px-4 py-3 text-center border-r border-gray-200 ${gradeTextColor(e.grade ? Math.round(e.grade) : null)}`}>{e.grade?.toFixed(1) ?? "-"}</td>)}
              </tr>
              {hasStd && (
                <tr className="border-b bg-[#fdf5fd]">
                  <td className="px-4 py-3 font-bold text-[#00e5e8] border-r border-gray-200">상위누백 (표점)</td>
                  {ot.map((e, i) => <td key={i} className="px-4 py-3 text-center font-bold text-[#00e5e8] border-r border-gray-200">{e.topCumulativeStd != null ? `${Number(e.topCumulativeStd).toFixed(2)}%` : "-"}</td>)}
                </tr>
              )}
              {hasRaw && (
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-600 border-r border-gray-200">상위누백 (원점수)</td>
                  {ot.map((e, i) => <td key={i} className="px-4 py-3 text-center text-gray-600 border-r border-gray-200">{e.topCumulativeRaw != null ? `${Number(e.topCumulativeRaw).toFixed(2)}%` : "-"}</td>)}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ───── Tab 3: Heatmap ───── */
function HeatmapTab({ trend }: { trend: TrendAnalysis }) {
  const subjects = trend.subjects
  const exams = trend.overallTrend ?? []
  if (exams.length === 0) return <div className="text-center text-gray-500 py-12">데이터 없음</div>

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">과목별 등급 변동 히트맵</h2>
      <p className="text-sm text-gray-500 mb-4">숫자와 색상으로 등급 변화를 한눈에 파악</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b-2 border-gray-300 min-w-[100px]">과목</th>
              {exams.map((e, i) => (
                <th key={i} className="px-3 py-3 text-center text-sm font-medium text-gray-700 border-b-2 border-gray-300 min-w-[70px]">
                  {`${e.year.toString().slice(2)}.${e.month}월`}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b-2 border-gray-300">추세</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subj => {
              // Build a map from examId to grade
              const gradeMap = new Map(subj.dataPoints.map(dp => [dp.mockExamId, dp.grade]))
              return (
                <tr key={subj.subject} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {subj.subject}
                    {subj.selection && <span className="text-xs text-gray-400 ml-1">({subj.selection})</span>}
                  </td>
                  {exams.map((e, i) => {
                    const grade = gradeMap.get(e.mockExamId)
                    const prevGrade = i > 0 ? gradeMap.get(exams[i - 1].mockExamId) : undefined
                    const delta = grade != null && prevGrade != null ? prevGrade - grade : undefined
                    return (
                      <td key={i} className="px-3 py-3 text-center">
                        {grade != null ? (
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg ${GRADE_COLORS[grade] ?? "bg-gray-300"}`}>
                              {grade}
                            </div>
                            {delta != null && delta !== 0 && (
                              <span className={`text-xs mt-1 ${delta > 0 ? "text-emerald-600" : "text-red-600"}`}>
                                {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm px-2 py-1 rounded-full ${subj.trend === "up" ? "bg-emerald-100 text-emerald-700" : subj.trend === "down" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                      {trendIcon(subj.trend)} {trendLabel(subj.trend)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ───── Tab 4: 과목별 분석 ───── */
function SubjectsTab({ trend, cumulative, examLabels }: { trend: TrendAnalysis; cumulative: CumulativeAnalysis; examLabels: string[] }) {
  const [selectedSubject, setSelectedSubject] = useState(trend.subjects[0]?.subject ?? "")
  const subj = trend.subjects.find(s => s.subject === selectedSubject)
  const stats = cumulative.subjectStats.find(s => s.subject === selectedSubject)

  return (
    <div className="space-y-6">
      {/* Subject selector */}
      <div className="flex flex-wrap gap-2">
        {trend.subjects.map(s => (
          <button key={s.subject} onClick={() => setSelectedSubject(s.subject)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSubject === s.subject ? "bg-[#00e5e8] text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
            {s.subject} {s.selection ? `(${s.selection})` : ""}
          </button>
        ))}
      </div>

      {subj && (
        <>
          {/* 등급 추이 차트 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{subj.subject} 등급 추이</h2>
              <span className={`text-sm px-3 py-1 rounded-full ${subj.trend === "up" ? "bg-emerald-100 text-emerald-700" : subj.trend === "down" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                {trendIcon(subj.trend)} {trendLabel(subj.trend)}
              </span>
            </div>
            <LineChart
              datasets={[
                { label: "등급", data: subj.dataPoints.map(dp => dp.grade ?? null), color: "#00e5e8" },
              ]}
              labels={examLabels}
              yReverse yMin={1} yMax={9} unit="등급"
            />
          </div>

          {/* 표점/백분위 차트 */}
          {subj.dataPoints.some(dp => dp.standardScore != null) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{subj.subject} 표준점수 / 백분위</h2>
              <LineChart
                datasets={[
                  { label: "표준점수", data: subj.dataPoints.map(dp => dp.standardScore ?? null), color: "#00e5e8" },
                  { label: "백분위", data: subj.dataPoints.map(dp => dp.percentile ?? null), color: "#9333ea" },
                ]}
                labels={examLabels}
              />
            </div>
          )}

          {/* 통계 요약 */}
          {stats && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{subj.subject} 누적 통계</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label="시험 횟수" value={`${stats.examCount}회`} />
                <StatBox label="평균 등급" value={stats.avgGrade != null ? `${stats.avgGrade.toFixed(1)}등급` : "-"} color={gradeTextColor(stats.avgGrade ? Math.round(stats.avgGrade) : null)} />
                <StatBox label="최고 등급" value={stats.bestGrade != null ? `${stats.bestGrade}등급` : "-"} color={gradeTextColor(stats.bestGrade)} />
                <StatBox label="등급 편차" value={stats.stdDevGrade != null ? `±${stats.stdDevGrade.toFixed(2)}` : "-"} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-bold ${color ?? "text-gray-900"}`}>{value}</div>
    </div>
  )
}
