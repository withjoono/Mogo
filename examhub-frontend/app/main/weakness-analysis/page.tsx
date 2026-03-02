"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser, type User } from "@/lib/auth/user"
import { api } from "@/lib/api/client"

interface DimensionStat {
    label: string
    totalCount: number
    wrongCount: number
    wrongRate: number
}

interface WeaknessData {
    subject: string
    totalCount: number
    wrongCount: number
    wrongRate: number
    bySubSubject: DimensionStat[]
    byDifficulty: DimensionStat[]
    byQuestionType: DimensionStat[]
    byQuestionForm: DimensionStat[]
    byMajorChapter: DimensionStat[]
    byScore: DimensionStat[]
}

// ===== 차트 컴포넌트들 =====

/** 수평 바 차트 */
function HorizontalBarChart({
    title,
    emoji,
    data,
    accentColor,
}: {
    title: string
    emoji: string
    data: DimensionStat[]
    accentColor: string
}) {
    if (data.length === 0) return null
    const maxRate = Math.max(...data.map((d) => d.wrongRate), 1)

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                    {emoji} {title}
                </h3>
            </div>
            <div className="p-5 space-y-3">
                {data.map((d) => (
                    <div key={d.label} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">
                                {d.label}
                            </span>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">
                                    {d.wrongCount}/{d.totalCount}
                                </span>
                                <span
                                    className="font-bold"
                                    style={{
                                        color:
                                            d.wrongRate >= 60
                                                ? "#ef4444"
                                                : d.wrongRate >= 40
                                                    ? "#f59e0b"
                                                    : "#22c55e",
                                    }}
                                >
                                    {d.wrongRate}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${(d.wrongRate / maxRate) * 100}%`,
                                    backgroundColor:
                                        d.wrongRate >= 60
                                            ? "#ef4444"
                                            : d.wrongRate >= 40
                                                ? "#f59e0b"
                                                : "#22c55e",
                                    minWidth: d.wrongRate > 0 ? "8px" : "0",
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** 도넛 차트 */
function DonutChart({
    title,
    emoji,
    data,
}: {
    title: string
    emoji: string
    data: DimensionStat[]
}) {
    if (data.length === 0) return null
    const colors = ["#7b1e7a", "#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#6366f1", "#ec4899", "#14b8a6", "#8b5cf6", "#f97316"]
    const total = data.reduce((s, d) => s + d.totalCount, 0)
    const r = 60
    const cx = 80
    const cy = 80
    let cumAngle = -90

    const slices = data.map((d, i) => {
        const angle = total > 0 ? (d.totalCount / total) * 360 : 0
        const startAngle = cumAngle
        cumAngle += angle
        const endAngle = cumAngle
        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180
        const x1 = cx + r * Math.cos(startRad)
        const y1 = cy + r * Math.sin(startRad)
        const x2 = cx + r * Math.cos(endRad)
        const y2 = cy + r * Math.sin(endRad)
        const largeArc = angle > 180 ? 1 : 0
        const path =
            angle >= 360
                ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`
                : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
        return { ...d, path, color: colors[i % colors.length] }
    })

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900">
                    {emoji} {title}
                </h3>
            </div>
            <div className="p-5 flex flex-col md:flex-row items-center gap-4">
                <svg viewBox="0 0 160 160" className="w-40 h-40 flex-shrink-0">
                    {slices.map((s, i) => (
                        <path key={i} d={s.path} fill={s.color} opacity={0.85} />
                    ))}
                    <circle cx={cx} cy={cy} r={35} fill="white" />
                    <text
                        x={cx}
                        y={cy - 4}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="bold"
                        fill="#374151"
                    >
                        {total}문제
                    </text>
                    <text
                        x={cx}
                        y={cy + 12}
                        textAnchor="middle"
                        fontSize={9}
                        fill="#9ca3af"
                    >
                        총 문항수
                    </text>
                </svg>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {slices.map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: s.color }}
                            />
                            <span className="text-sm text-gray-600">
                                {s.label}{" "}
                                <span className="font-medium text-gray-800">
                                    ({s.totalCount})
                                </span>
                                <span
                                    className="ml-1 font-bold"
                                    style={{
                                        color:
                                            s.wrongRate >= 60
                                                ? "#ef4444"
                                                : s.wrongRate >= 40
                                                    ? "#f59e0b"
                                                    : "#22c55e",
                                    }}
                                >
                                    오답 {s.wrongRate}%
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** 레이더 차트 (오각형/육각형) */
function RadarChart({
    data,
}: {
    data: { label: string; wrongRate: number }[]
}) {
    if (data.length < 3) return null
    const n = data.length
    const cx = 130
    const cy = 130
    const R = 100
    const levels = [20, 40, 60, 80, 100]

    const getPoint = (index: number, value: number) => {
        const angle = (2 * Math.PI * index) / n - Math.PI / 2
        const r = (value / 100) * R
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
    }

    const polygon = data
        .map((d, i) => {
            const p = getPoint(i, d.wrongRate)
            return `${p.x},${p.y}`
        })
        .join(" ")

    return (
        <svg viewBox="0 0 260 260" className="w-full max-w-xs mx-auto">
            {/* 배경 격자 */}
            {levels.map((lv) => (
                <polygon
                    key={lv}
                    points={data
                        .map((_, i) => {
                            const p = getPoint(i, lv)
                            return `${p.x},${p.y}`
                        })
                        .join(" ")}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={1}
                />
            ))}
            {/* 축 선 */}
            {data.map((_, i) => {
                const p = getPoint(i, 100)
                return (
                    <line
                        key={i}
                        x1={cx}
                        y1={cy}
                        x2={p.x}
                        y2={p.y}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                    />
                )
            })}
            {/* 데이터 다각형 */}
            <polygon
                points={polygon}
                fill="rgba(123, 30, 122, 0.15)"
                stroke="#7b1e7a"
                strokeWidth={2}
            />
            {/* 데이터 점 + 라벨 */}
            {data.map((d, i) => {
                const p = getPoint(i, d.wrongRate)
                const lp = getPoint(i, 115)
                return (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r={4} fill="#7b1e7a" />
                        <text
                            x={lp.x}
                            y={lp.y + 4}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight="500"
                            fill="#374151"
                        >
                            {d.label}
                        </text>
                        <text
                            x={p.x}
                            y={p.y - 8}
                            textAnchor="middle"
                            fontSize={9}
                            fontWeight="bold"
                            fill="#7b1e7a"
                        >
                            {d.wrongRate}%
                        </text>
                    </g>
                )
            })}
        </svg>
    )
}

// ===== 메인 페이지 =====

export default function WeaknessAnalysisPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [authLoading, setAuthLoading] = useState(true)

    const [subjects, setSubjects] = useState<string[]>([])
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [data, setData] = useState<WeaknessData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 인증
    useEffect(() => {
        async function fetchUser() {
            const userData = await getUser()
            setUser(userData)
            setAuthLoading(false)
        }
        fetchUser()
    }, [])

    // 과목 목록 로드
    useEffect(() => {
        if (authLoading || !user) return
        async function loadSubjects() {
            try {
                const res = await api.get<string[]>(
                    `/api/weakness-analysis/student/${user!.id}/subjects`
                )
                const list = Array.isArray(res) ? res : []
                setSubjects(list)
                if (list.length > 0 && !selectedSubject) {
                    setSelectedSubject(list[0])
                }
            } catch (err) {
                console.error("과목 로드 실패:", err)
            }
        }
        loadSubjects()
    }, [authLoading, user])

    // 과목별 분석 데이터 로드
    useEffect(() => {
        if (!user || !selectedSubject) return
        async function loadAnalysis() {
            setIsLoading(true)
            setError(null)
            try {
                const res = await api.get<WeaknessData>(
                    `/api/weakness-analysis/student/${user!.id}/subject/${encodeURIComponent(selectedSubject)}`
                )
                setData(res)
            } catch (err) {
                console.error("분석 실패:", err)
                setError("분석 데이터를 불러오는데 실패했습니다.")
                setData(null)
            } finally {
                setIsLoading(false)
            }
        }
        loadAnalysis()
    }, [user, selectedSubject])

    // 로딩
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-400">로딩 중...</div>
            </div>
        )
    }

    // 미로그인
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 py-12 text-center">
                    <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg border border-yellow-300">
                        ⚠️ 취약분석을 보려면 먼저 로그인해주세요.
                    </div>
                </div>
            </div>
        )
    }

    // 레이더 차트에 쓸 상위 차원 요약
    const radarData = data
        ? [
            {
                label: "세부과목",
                wrongRate:
                    data.bySubSubject.length > 0
                        ? Math.round(
                            data.bySubSubject.reduce((s, d) => s + d.wrongRate, 0) /
                            data.bySubSubject.length
                        )
                        : 0,
            },
            {
                label: "난이도",
                wrongRate:
                    data.byDifficulty.length > 0
                        ? Math.round(
                            data.byDifficulty.reduce((s, d) => s + d.wrongRate, 0) /
                            data.byDifficulty.length
                        )
                        : 0,
            },
            {
                label: "유형",
                wrongRate:
                    data.byQuestionType.length > 0
                        ? Math.round(
                            data.byQuestionType.reduce((s, d) => s + d.wrongRate, 0) /
                            data.byQuestionType.length
                        )
                        : 0,
            },
            {
                label: "문제형태",
                wrongRate:
                    data.byQuestionForm.length > 0
                        ? Math.round(
                            data.byQuestionForm.reduce((s, d) => s + d.wrongRate, 0) /
                            data.byQuestionForm.length
                        )
                        : 0,
            },
            {
                label: "단원",
                wrongRate:
                    data.byMajorChapter.length > 0
                        ? Math.round(
                            data.byMajorChapter.reduce((s, d) => s + d.wrongRate, 0) /
                            data.byMajorChapter.length
                        )
                        : 0,
            },
            {
                label: "배점",
                wrongRate:
                    data.byScore.length > 0
                        ? Math.round(
                            data.byScore.reduce((s, d) => s + d.wrongRate, 0) /
                            data.byScore.length
                        )
                        : 0,
            },
        ]
        : []

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-[#7b1e7a] to-[#9c3d9a]">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <nav className="text-sm text-white/60 mb-2">
                        <span>홈</span> &gt; <span>모의고사</span> &gt;{" "}
                        <span className="text-white">취약분석</span>
                    </nav>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                        📊 취약점 분석
                    </h1>
                    <p className="text-white/70 mt-1 text-sm">
                        과목별 세부 취약점을 한눈에 파악하세요
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* 과목 선택 */}
                {subjects.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                        <div className="text-5xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            분석할 데이터가 없습니다
                        </h3>
                        <p className="text-gray-500 mb-6">
                            모의고사 정답을 먼저 입력해주세요
                        </p>
                        <button
                            onClick={() => router.push("/main/input")}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7b1e7a] text-white rounded-xl hover:bg-[#5a1559] transition-colors font-medium"
                        >
                            모의고사 입력하기
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 과목 탭 */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {subjects.map((subj) => (
                                <button
                                    key={subj}
                                    onClick={() => setSelectedSubject(subj)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${selectedSubject === subj
                                            ? "bg-[#7b1e7a] text-white shadow-lg shadow-purple-200/50"
                                            : "bg-white text-gray-600 border border-gray-200 hover:border-[#7b1e7a] hover:text-[#7b1e7a]"
                                        }`}
                                >
                                    {subj}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="bg-red-100 text-red-800 p-4 rounded-md border border-red-300 mb-6">
                                {error}
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-gray-400">분석 중...</div>
                            </div>
                        ) : data ? (
                            <div className="space-y-8">
                                {/* 전체 요약 카드 */}
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-md p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        {/* 레이더 차트 */}
                                        <div className="w-full md:w-1/2">
                                            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
                                                🎯 {data.subject} 종합 취약점 맵
                                            </h2>
                                            <RadarChart data={radarData} />
                                        </div>

                                        {/* 요약 수치 */}
                                        <div className="w-full md:w-1/2 space-y-4">
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                                                    <div className="text-2xl font-extrabold text-gray-900">
                                                        {data.totalCount}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        전체 문항
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                                                    <div className="text-2xl font-extrabold text-red-500">
                                                        {data.wrongCount}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        오답 수
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                                                    <div
                                                        className="text-2xl font-extrabold"
                                                        style={{
                                                            color:
                                                                data.wrongRate >= 50
                                                                    ? "#ef4444"
                                                                    : data.wrongRate >= 30
                                                                        ? "#f59e0b"
                                                                        : "#22c55e",
                                                        }}
                                                    >
                                                        {data.wrongRate}%
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        오답률
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 가장 취약한 영역 */}
                                            {data.byQuestionType.length > 0 && (
                                                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                                    <div className="text-sm font-bold text-red-700 mb-1">
                                                        ⚠️ 가장 취약한 유형
                                                    </div>
                                                    <div className="text-lg font-extrabold text-red-600">
                                                        {data.byQuestionType[0].label}
                                                    </div>
                                                    <div className="text-sm text-red-500">
                                                        오답률 {data.byQuestionType[0].wrongRate}% (
                                                        {data.byQuestionType[0].wrongCount}/
                                                        {data.byQuestionType[0].totalCount})
                                                    </div>
                                                </div>
                                            )}

                                            {data.byMajorChapter.length > 0 && (
                                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                                    <div className="text-sm font-bold text-orange-700 mb-1">
                                                        📚 가장 취약한 단원
                                                    </div>
                                                    <div className="text-lg font-extrabold text-orange-600">
                                                        {data.byMajorChapter[0].label}
                                                    </div>
                                                    <div className="text-sm text-orange-500">
                                                        오답률 {data.byMajorChapter[0].wrongRate}% (
                                                        {data.byMajorChapter[0].wrongCount}/
                                                        {data.byMajorChapter[0].totalCount})
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 차트 그리드 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* 세부과목별 */}
                                    <HorizontalBarChart
                                        title="세부과목별 오답률"
                                        emoji="📘"
                                        data={data.bySubSubject}
                                        accentColor="#3b82f6"
                                    />

                                    {/* 난이도별 */}
                                    <DonutChart
                                        title="난이도별 분포 및 오답률"
                                        emoji="🎯"
                                        data={data.byDifficulty}
                                    />

                                    {/* 유형별 */}
                                    <HorizontalBarChart
                                        title="유형별 오답률"
                                        emoji="🔍"
                                        data={data.byQuestionType}
                                        accentColor="#7b1e7a"
                                    />

                                    {/* 문제형태별 */}
                                    <DonutChart
                                        title="문제형태별 분포 및 오답률"
                                        emoji="📝"
                                        data={data.byQuestionForm}
                                    />

                                    {/* 대단원별 */}
                                    <HorizontalBarChart
                                        title="대단원별 오답률"
                                        emoji="📚"
                                        data={data.byMajorChapter}
                                        accentColor="#f59e0b"
                                    />

                                    {/* 배점별 */}
                                    <HorizontalBarChart
                                        title="배점별 오답률"
                                        emoji="💯"
                                        data={data.byScore}
                                        accentColor="#ef4444"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
                                <div className="text-4xl mb-3">📊</div>
                                <p className="text-gray-500">
                                    과목을 선택하면 취약분석이 표시됩니다
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
