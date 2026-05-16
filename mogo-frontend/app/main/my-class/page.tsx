"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api/client"
import { getUser, type User } from "@/lib/auth/user"
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import {
  TrendingUp, TrendingDown, Minus, Plus, Users, LogIn,
  Trophy, X, Crown, RefreshCw, Copy, Check,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface MyTarget {
  id: number
  departmentCode: string
  universityName?: string
  departmentName?: string
  priority: number
}

interface Exam {
  id: number
  name: string
  year: number
  month: number
}

interface MyTrendEntry {
  examId: number
  totalStandardSum: number | null
}

interface TrendBand {
  examId: number
  avg: number
  top10: number
  bot10: number
  count: number
}

interface TargetTrendData {
  exams: Exam[]
  myTrend: MyTrendEntry[]
  bands: TrendBand[]
}

interface RankingEntry {
  rank: number | null
  isMe: boolean
  totalStandardSum: number | null
  totalPercentileSum?: number | null
  gradeSum?: number | null
  koreanStandard?: number | null
  mathStandard?: number | null
  inquiry1Standard?: number | null
  inquiry2Standard?: number | null
  englishGrade?: number | null
  historyGrade?: number | null
  koreanPercentile?: number | null
  mathPercentile?: number | null
}

interface TargetRankingData {
  total: number
  scoredTotal?: number
  examId: number | null
  examName: string | null
  myRank: number | null
  myScore: number | null
  ranking: RankingEntry[]
}

interface GroupStudy {
  id: number
  classCode: string // Hub inviteCode 매핑 (백엔드에서 변환됨)
  name: string
  description?: string
  maxMembers?: number // Hub 응답에 없을 수 있음 (그룹 타입에 따라)
  memberCount: number
  myRole: string
}

// Hub의 grade 필드는 string (≤10자). user.grade("H3" 등)를 그대로 전송.

interface GroupMemberTrend {
  memberId: number
  isMe: boolean
  name: string
  role: string
  data: MyTrendEntry[]
}

interface GroupTrendData {
  exams: Exam[]
  trendsByMember: GroupMemberTrend[]
}

interface GroupRankingEntry {
  rank: number | null
  isMe: boolean
  memberId: number
  name: string
  role: string
  totalStandardSum: number | null
  totalPercentileSum: number | null
  gradeSum: number | null
  change: number | null
  koreanStandard: number | null
  mathStandard: number | null
  englishGrade: number | null
  latestExamName: string | null
}

interface GroupRankingData {
  classId: number
  examId: number | null
  examName: string | null
  ranking: GroupRankingEntry[]
}

// ── Color palette ─────────────────────────────────────────────────────────────

const MEMBER_COLORS = [
  "#00e5e8", "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4",
]

// ── Small helpers ─────────────────────────────────────────────────────────────

function shortExamLabel(exam: Exam) {
  return `${String(exam.year).slice(2)}/${exam.month}월`
}

function ChangeChip({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-gray-300 text-xs">-</span>
  if (value > 0) return (
    <span className="inline-flex items-center gap-0.5 text-emerald-600 text-xs font-medium">
      <TrendingUp className="w-3 h-3" />{value > 0 ? `+${value}` : value}
    </span>
  )
  if (value < 0) return (
    <span className="inline-flex items-center gap-0.5 text-red-500 text-xs font-medium">
      <TrendingDown className="w-3 h-3" />{value}
    </span>
  )
  return <span className="inline-flex items-center gap-0.5 text-gray-400 text-xs"><Minus className="w-3 h-3" />0</span>
}

function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return <span className="text-gray-300 text-sm">-</span>
  if (rank === 1) return <span className="text-lg">🥇</span>
  if (rank === 2) return <span className="text-lg">🥈</span>
  if (rank === 3) return <span className="text-lg">🥉</span>
  return <span className="text-sm text-gray-600 font-medium">{rank}위</span>
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MyClassPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<"target" | "group">("target")

  // ── 목표대학 반 state ──
  const [myTargets, setMyTargets] = useState<MyTarget[]>([])
  const [selectedTarget, setSelectedTarget] = useState<MyTarget | null>(null)
  const [targetTrend, setTargetTrend] = useState<TargetTrendData | null>(null)
  const [targetRanking, setTargetRanking] = useState<TargetRankingData | null>(null)
  const [targetLoading, setTargetLoading] = useState(false)

  // ── 그룹 스터디 state ──
  const [myGroups, setMyGroups] = useState<GroupStudy[]>([])
  const [selectedGroup, setSelectedGroup] = useState<GroupStudy | null>(null)
  const [groupTrend, setGroupTrend] = useState<GroupTrendData | null>(null)
  const [groupRanking, setGroupRanking] = useState<GroupRankingData | null>(null)
  const [groupLoading, setGroupLoading] = useState(false)

  // ── Modal state ──
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: "" })
  const [joinCode, setJoinCode] = useState("")
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState("")
  const [copiedCode, setCopiedCode] = useState(false)

  // ── Copy invite code ──
  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 1500)
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea")
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 1500)
    }
  }

  // ── Init user ──
  useEffect(() => {
    getUser().then(setUser)
  }, [])

  // ── Load targets on user ready ──
  useEffect(() => {
    if (!user) return
    api.get<{ targets: MyTarget[] }>(`/api/targets/${user.id}`)
      .then((res) => {
        if (res?.targets?.length) {
          const sorted = [...res.targets].sort((a, b) => a.priority - b.priority)
          setMyTargets(sorted)
          setSelectedTarget(sorted[0])
        }
      })
      .catch(() => {})
  }, [user])

  // ── Load target class data ──
  const loadTargetData = useCallback(async () => {
    if (!user || !selectedTarget?.departmentCode) return
    setTargetLoading(true)
    try {
      const [trend, ranking] = await Promise.all([
        api.get<TargetTrendData>(
          `/api/my-class/target-class/${selectedTarget.departmentCode}/trend`,
          { memberId: user.id }
        ),
        api.get<TargetRankingData>(
          `/api/my-class/target-class/${selectedTarget.departmentCode}/ranking`,
          { memberId: user.id }
        ),
      ])
      setTargetTrend(trend)
      setTargetRanking(ranking)
    } catch { /* ignore */ }
    setTargetLoading(false)
  }, [user, selectedTarget])

  useEffect(() => {
    if (tab === "target") loadTargetData()
  }, [tab, loadTargetData])

  // ── Load my groups ──
  const loadMyGroups = useCallback(async () => {
    if (!user) return
    try {
      // 인증은 Authorization Bearer 헤더로 (api client 자동 주입)
      const groups = await api.get<GroupStudy[]>(`/api/my-class/group-study`)
      if (groups) {
        setMyGroups(groups)
        if (!selectedGroup && groups.length > 0) setSelectedGroup(groups[0])
      }
    } catch { /* ignore */ }
  }, [user, selectedGroup])

  useEffect(() => {
    if (tab === "group") loadMyGroups()
  }, [tab, loadMyGroups])

  // ── Load selected group data ──
  const loadGroupData = useCallback(async () => {
    if (!user || !selectedGroup) return
    setGroupLoading(true)
    try {
      const [trend, ranking] = await Promise.all([
        api.get<GroupTrendData>(`/api/my-class/group-study/${selectedGroup.id}/trend`),
        api.get<GroupRankingData>(`/api/my-class/group-study/${selectedGroup.id}/ranking`),
      ])
      setGroupTrend(trend)
      setGroupRanking(ranking)
    } catch { /* ignore */ }
    setGroupLoading(false)
  }, [user, selectedGroup])

  useEffect(() => {
    if (selectedGroup) loadGroupData()
  }, [selectedGroup, loadGroupData])

  // ── Create group ──
  const handleCreate = async () => {
    if (!user || !createForm.name.trim()) return
    setModalLoading(true)
    setModalError("")
    try {
      // Hub /api/groups 계약: { groupType, name, grade? (string, ≤10자) }
      // description/maxMembers는 Hub에서 받지 않음 (백엔드에서 자동 무시)
      const g = await api.post<GroupStudy>(`/api/my-class/group-study`, {
        name: createForm.name.trim(),
        grade: user.grade,
      })
      if (g) {
        setShowCreateModal(false)
        setCreateForm({ name: "" })
        await loadMyGroups()
        setSelectedGroup(g)
      }
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "생성에 실패했습니다.")
    }
    setModalLoading(false)
  }

  // ── Join group ──
  const handleJoin = async () => {
    if (!user || !joinCode.trim()) return
    setModalLoading(true)
    setModalError("")
    try {
      // 백엔드가 classCode → Hub inviteCode로 매핑
      const g = await api.post<GroupStudy>(`/api/my-class/group-study/join`, {
        classCode: joinCode.trim().toUpperCase(),
      })
      if (g) {
        setShowJoinModal(false)
        setJoinCode("")
        await loadMyGroups()
        const joined = myGroups.find((gr) => gr.id === g.id) ?? g
        setSelectedGroup(joined)
      }
    } catch (e: unknown) {
      setModalError(e instanceof Error ? e.message : "참여에 실패했습니다.")
    }
    setModalLoading(false)
  }

  // ── Leave group ──
  const handleLeave = async () => {
    if (!user || !selectedGroup) return
    if (!confirm(selectedGroup.myRole === "leader" ? "그룹 스터디를 삭제하시겠습니까? 모든 멤버가 탈퇴됩니다." : "그룹 스터디를 나가시겠습니까?")) return
    try {
      await api.delete(`/api/my-class/group-study/${selectedGroup.id}/leave`)
      setSelectedGroup(null)
      setGroupTrend(null)
      setGroupRanking(null)
      await loadMyGroups()
    } catch { /* ignore */ }
  }

  // ── Build chart data for target trend ──
  function buildTargetChartData() {
    if (!targetTrend) return []
    const myMap = new Map(targetTrend.myTrend.map((m) => [m.examId, m.totalStandardSum]))
    const bandMap = new Map(targetTrend.bands.map((b) => [b.examId, b]))
    return targetTrend.exams.map((e) => {
      const b = bandMap.get(e.id)
      return {
        label: shortExamLabel(e),
        내점수: myMap.get(e.id) ?? null,
        평균: b?.avg ?? null,
        상위10: b?.top10 ?? null,
        하위10: b?.bot10 ?? null,
      }
    })
  }

  // ── Build chart data for group trend ──
  function buildGroupChartData() {
    if (!groupTrend) return { data: [], members: [] as GroupMemberTrend[] }
    const members = groupTrend.trendsByMember
    const data = groupTrend.exams.map((e) => {
      const row: Record<string, string | number | null> = { label: shortExamLabel(e) }
      members.forEach((m) => {
        const entry = m.data.find((d) => d.examId === e.id)
        row[m.name] = entry?.totalStandardSum ?? null
      })
      return row
    })
    return { data, members }
  }

  // ── Loading / unauth guard ──
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">로그인이 필요한 페이지입니다.</p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"
          >
            홈으로
          </button>
        </div>
      </div>
    )
  }

  const targetChartData = buildTargetChartData()
  const { data: groupChartData, members: groupMembers } = buildGroupChartData()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">마이클래스</h1>
          <p className="text-sm text-gray-500 mt-0.5">같은 목표를 향한 학생들과 성적을 비교해보세요</p>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-2xl bg-gray-100 p-1.5 gap-1.5 mb-6 w-fit">
          {(["target", "group"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "target" ? <><Trophy className="w-4 h-4" />목표대학 반</> : <><Users className="w-4 h-4" />그룹 스터디</>}
            </button>
          ))}
        </div>

        {/* ── 목표대학 반 ── */}
        {tab === "target" && (
          <div className="space-y-5">
            {myTargets.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">목표대학을 먼저 설정해주세요.</p>
                <a
                  href="/main/target-university/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"
                >
                  목표대학 설정하기
                </a>
              </div>
            ) : (
              <>
                {/* Target selector */}
                {myTargets.length > 1 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">목표 선택:</span>
                    {myTargets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTarget(t)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          selectedTarget?.id === t.id
                            ? "bg-cyan-600 text-white border-cyan-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-cyan-400"
                        }`}
                      >
                        {t.universityName} {t.departmentName}
                      </button>
                    ))}
                  </div>
                )}

                {/* Target info card */}
                {selectedTarget && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-cyan-500" />
                        <span className="font-semibold text-gray-800">
                          {selectedTarget.universityName ?? "대학 미설정"}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {selectedTarget.departmentName ?? "학과 미설정"}
                        </span>
                      </div>
                      {targetRanking && (
                        <p className="text-xs text-gray-400 mt-1">
                          같은 목표 학생 {targetRanking.total}명 중
                          {targetRanking.myRank ? ` 내 순위: ${targetRanking.myRank}위` : " 내 성적 없음"}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={loadTargetData}
                      className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {targetLoading ? (
                  <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                    <div className="animate-spin w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : (
                  <>
                    {/* Trend Chart */}
                    {targetChartData.length > 0 ? (
                      <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">성적 추이 비교</h2>
                        <div className="flex items-center gap-4 mb-3 flex-wrap">
                          <LegendDot color="#00e5e8" label="내 점수" thick />
                          <LegendDot color="#22c55e" label="상위 10%" dashed />
                          <LegendDot color="#94a3b8" label="평균" dashed />
                          <LegendDot color="#f97316" label="하위 10%" dashed />
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                          <LineChart data={targetChartData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                            <Tooltip
                              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              formatter={(value: any, name: any) =>
                                value != null ? [value.toLocaleString(), name] : ["-", name]
                              }
                            />
                            <Line dataKey="상위10" stroke="#22c55e" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                            <Line dataKey="평균" stroke="#94a3b8" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                            <Line dataKey="하위10" stroke="#f97316" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                            <Line dataKey="내점수" stroke="#00e5e8" strokeWidth={2.5} dot={{ r: 4, fill: "#00e5e8" }} activeDot={{ r: 6 }} connectNulls />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-400 text-sm">
                        아직 성적 데이터가 없습니다.
                      </div>
                    )}

                    {/* Comparison Charts */}
                    {targetRanking && targetRanking.ranking.length > 0 && (
                      <ScoreComparisonCharts
                        stdData={(targetRanking.ranking)
                          .filter(r => r.totalStandardSum != null)
                          .map((r, i) => ({ label: r.isMe ? "나" : `${i + 1}`, value: r.totalStandardSum!, isMe: r.isMe }))}
                        gradeData={[...targetRanking.ranking]
                          .filter(r => r.gradeSum != null)
                          .sort((a, b) => (a.gradeSum ?? 999) - (b.gradeSum ?? 999))
                          .map((r, i) => ({ label: r.isMe ? "나" : `${i + 1}`, value: r.gradeSum!, isMe: r.isMe }))}
                      />
                    )}

                    {/* Ranking Table */}
                    {targetRanking && targetRanking.ranking.length > 0 && (
                      <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-sm font-semibold text-gray-700">
                            익명 랭킹
                            {targetRanking.examName && (
                              <span className="ml-2 text-xs text-gray-400 font-normal">
                                ({targetRanking.examName} 기준)
                              </span>
                            )}
                          </h2>
                          <span className="text-xs text-gray-400">{targetRanking.scoredTotal ?? targetRanking.total}명 성적 제출</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="text-left py-2 px-2 text-xs text-gray-400 font-medium">표점합 등수</th>
                                <th className="text-right py-2 px-2 text-xs text-gray-400 font-medium">표점합</th>
                                <th className="text-right py-2 px-2 text-xs text-gray-400 font-medium">백분위합</th>
                                <th className="text-right py-2 px-2 text-xs text-gray-400 font-medium">등급합</th>
                              </tr>
                            </thead>
                            <tbody>
                              {targetRanking.ranking.map((r, i) => (
                                <tr
                                  key={i}
                                  className={`border-b border-gray-50 ${r.isMe ? "bg-cyan-50" : "hover:bg-gray-50"}`}
                                >
                                  <td className="py-2.5 px-2">
                                    <div className="flex items-center gap-1.5">
                                      <RankBadge rank={r.rank} />
                                      {r.isMe && (
                                        <span className="text-[10px] font-semibold text-cyan-600 bg-cyan-100 px-1.5 py-0.5 rounded-full">나</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className={`py-2.5 px-2 text-right font-semibold ${r.isMe ? "text-cyan-700" : "text-gray-700"}`}>
                                    {r.totalStandardSum ?? "-"}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-gray-500">
                                    {r.totalPercentileSum != null ? r.totalPercentileSum.toFixed(1) : "-"}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-gray-500">
                                    {r.gradeSum ?? "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ── 그룹 스터디 ── */}
        {tab === "group" && (
          <div className="space-y-5">
            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowCreateModal(true); setModalError("") }}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl text-sm font-medium hover:bg-cyan-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                그룹 만들기
              </button>
              <button
                onClick={() => { setShowJoinModal(true); setJoinCode(""); setModalError("") }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                코드로 참여
              </button>
            </div>

            {myGroups.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">아직 참여한 그룹 스터디가 없습니다.</p>
                <p className="text-xs text-gray-400 mt-1">그룹을 만들거나 코드로 참여해보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Group list sidebar */}
                <div className="md:col-span-1 space-y-2">
                  {myGroups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroup(g)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        selectedGroup?.id === g.id
                          ? "bg-cyan-50 border-cyan-300"
                          : "bg-white border-gray-200 hover:border-cyan-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {g.myRole === "leader" && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        <span className="text-sm font-medium text-gray-800 truncate">{g.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{g.memberCount}{g.maxMembers ? `/${g.maxMembers}` : ""}명</span>
                        {g.classCode && (
                          <span className="font-mono tracking-wider text-[10px]">{g.classCode}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Group detail */}
                <div className="md:col-span-3 space-y-4">
                  {selectedGroup && (
                    <>
                      {/* Group header */}
                      <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {selectedGroup.myRole === "leader" && <Crown className="w-4 h-4 text-amber-500" />}
                            <span className="font-semibold text-gray-800">{selectedGroup.name}</span>
                          </div>
                          {selectedGroup.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{selectedGroup.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={loadGroupData}
                            className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleLeave}
                            className="px-3 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            {selectedGroup.myRole === "leader" ? "그룹 삭제" : "탈퇴"}
                          </button>
                        </div>
                      </div>

                      {/* Invite code share card */}
                      {selectedGroup.classCode && (
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl p-4">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="min-w-0">
                              <p className="text-xs text-cyan-700 font-medium mb-1">초대 코드</p>
                              <p className="text-2xl font-bold font-mono tracking-widest text-gray-800 break-all">
                                {selectedGroup.classCode}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-1">
                                이 코드를 친구에게 공유하면 「코드로 참여」로 함께할 수 있어요
                              </p>
                            </div>
                            <button
                              onClick={() => copyInviteCode(selectedGroup.classCode)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
                                copiedCode
                                  ? "bg-emerald-500 text-white"
                                  : "bg-white text-cyan-700 border border-cyan-300 hover:bg-cyan-50"
                              }`}
                            >
                              {copiedCode ? (
                                <><Check className="w-4 h-4" />복사됨</>
                              ) : (
                                <><Copy className="w-4 h-4" />코드 복사</>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {groupLoading ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                          <div className="animate-spin w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto" />
                        </div>
                      ) : (
                        <>
                          {/* Group trend chart */}
                          {groupChartData.length > 0 ? (
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                              <h2 className="text-sm font-semibold text-gray-700 mb-4">멤버 성적 추이</h2>
                              <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={groupChartData} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                  <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                                  <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any, name: any) =>
                                      value != null ? [value.toLocaleString(), name] : ["-", name]
                                    }
                                  />
                                  <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: 11 }}
                                  />
                                  {groupMembers.map((m, idx) => (
                                    <Line
                                      key={m.memberId}
                                      dataKey={m.name}
                                      stroke={MEMBER_COLORS[idx % MEMBER_COLORS.length]}
                                      strokeWidth={m.isMe ? 2.5 : 1.5}
                                      dot={m.isMe ? { r: 4 } : { r: 2 }}
                                      activeDot={{ r: 5 }}
                                      connectNulls
                                    />
                                  ))}
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm text-gray-400 text-sm">
                              아직 성적 데이터가 없습니다.
                            </div>
                          )}

                          {/* Group comparison charts */}
                          {groupRanking && groupRanking.ranking.length > 0 && (
                            <ScoreComparisonCharts
                              stdData={groupRanking.ranking
                                .filter(r => r.totalStandardSum != null)
                                .map(r => ({ label: r.name, value: r.totalStandardSum!, isMe: r.isMe }))}
                              gradeData={[...groupRanking.ranking]
                                .filter(r => r.gradeSum != null)
                                .sort((a, b) => (a.gradeSum ?? 999) - (b.gradeSum ?? 999))
                                .map(r => ({ label: r.name, value: r.gradeSum!, isMe: r.isMe }))}
                            />
                          )}

                          {/* Group ranking table */}
                          {groupRanking && groupRanking.ranking.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-gray-700">
                                  멤버 랭킹
                                  {groupRanking.examName && (
                                    <span className="ml-2 text-xs text-gray-400 font-normal">
                                      ({groupRanking.examName} 기준)
                                    </span>
                                  )}
                                </h2>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-100">
                                      <th className="text-left py-2 px-2 text-xs text-gray-400 font-medium">표점합 등수</th>
                                      <th className="text-left py-2 px-2 text-xs text-gray-400 font-medium">이름</th>
                                      <th className="text-right py-2 px-2 text-xs text-gray-400 font-medium">표점합</th>
                                      <th className="text-right py-2 px-2 text-xs text-gray-400 font-medium">백분위합</th>
                                      <th className="text-right py-2 px-2 text-xs text-gray-400 font-medium">등급합</th>
                                      <th className="text-right py-2 px-2 text-xs text-gray-400 font-medium">변화</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {groupRanking.ranking.map((r, i) => (
                                      <tr
                                        key={i}
                                        className={`border-b border-gray-50 ${r.isMe ? "bg-cyan-50" : "hover:bg-gray-50"}`}
                                      >
                                        <td className="py-2.5 px-2">
                                          <RankBadge rank={r.rank} />
                                        </td>
                                        <td className="py-2.5 px-2">
                                          <div className="flex items-center gap-1.5">
                                            {r.role === "leader" && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                                            <span className={`font-medium ${r.isMe ? "text-cyan-700" : "text-gray-700"}`}>
                                              {r.name}
                                            </span>
                                          </div>
                                        </td>
                                        <td className={`py-2.5 px-2 text-right font-semibold ${r.isMe ? "text-cyan-700" : "text-gray-700"}`}>
                                          {r.totalStandardSum ?? "-"}
                                        </td>
                                        <td className="py-2.5 px-2 text-right text-gray-500">
                                          {r.totalPercentileSum != null ? r.totalPercentileSum.toFixed(1) : "-"}
                                        </td>
                                        <td className="py-2.5 px-2 text-right text-gray-500">
                                          {r.gradeSum ?? "-"}
                                        </td>
                                        <td className="py-2.5 px-2 text-right">
                                          <ChangeChip value={r.change} />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)} title="그룹 스터디 만들기">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">그룹 이름 *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300"
                placeholder="예) 서울대 의대 목표반"
                value={createForm.name}
                onChange={(e) => setCreateForm({ name: e.target.value })}
                maxLength={50}
              />
            </div>
            <p className="text-[11px] text-gray-400">
              학년은 프로필 정보({user.grade ?? "—"})를 기준으로 자동 설정됩니다.
            </p>
            {modalError && <p className="text-xs text-red-500">{modalError}</p>}
            <button
              onClick={handleCreate}
              disabled={modalLoading || !createForm.name.trim()}
              className="w-full py-2.5 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {modalLoading ? "생성 중..." : "그룹 만들기"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Join Modal ── */}
      {showJoinModal && (
        <Modal onClose={() => setShowJoinModal(false)} title="코드로 참여하기">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">초대 코드</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-cyan-300"
                placeholder="ABC12345"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
            </div>
            {modalError && <p className="text-xs text-red-500">{modalError}</p>}
            <button
              onClick={handleJoin}
              disabled={modalLoading || joinCode.length < 6}
              className="w-full py-2.5 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {modalLoading ? "참여 중..." : "참여하기"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

interface ChartBarEntry { label: string; value: number; isMe: boolean }

function ScoreComparisonCharts({
  stdData,
  gradeData,
}: {
  stdData: ChartBarEntry[]
  gradeData: ChartBarEntry[]
}) {
  if (stdData.length === 0 && gradeData.length === 0) return null

  const barSize = Math.max(16, Math.min(36, Math.floor(280 / Math.max(stdData.length, gradeData.length, 1))))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stdData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">표점합 비교</h2>
            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">높을수록 우수 ↑</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stdData} margin={{ top: 4, right: 4, left: -18, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [value, "표점합"]}
              />
              <Bar dataKey="value" name="표점합" radius={[3, 3, 0, 0]} maxBarSize={barSize}>
                {stdData.map((d, i) => (
                  <Cell key={i} fill={d.isMe ? "#00e5e8" : "#cbd5e1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center text-[10px] text-gray-300 mt-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#00e5e8] align-middle mr-1" />나
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#cbd5e1] align-middle ml-3 mr-1" />타인
          </p>
        </div>
      )}

      {gradeData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">등급합 비교</h2>
            <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">낮을수록 우수 ↓</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gradeData} margin={{ top: 4, right: 4, left: -18, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [value, "등급합"]}
              />
              <Bar dataKey="value" name="등급합" radius={[3, 3, 0, 0]} maxBarSize={barSize}>
                {gradeData.map((d, i) => (
                  <Cell key={i} fill={d.isMe ? "#00e5e8" : "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center text-[10px] text-gray-300 mt-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#00e5e8] align-middle mr-1" />나
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#94a3b8] align-middle ml-3 mr-1" />타인
          </p>
        </div>
      )}
    </div>
  )
}

function LegendDot({ color, label, thick, dashed }: { color: string; label: string; thick?: boolean; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="24" height="10">
        <line
          x1="0" y1="5" x2="24" y2="5"
          stroke={color}
          strokeWidth={thick ? 2.5 : 1.5}
          strokeDasharray={dashed ? "4 3" : undefined}
        />
      </svg>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
