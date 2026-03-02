"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser, type User } from "@/lib/auth/user"
import { api } from "@/lib/api/client"

interface MockExamInfo {
  id: number
  name: string
  year: number
  month: number
}

interface ScoreRecord {
  id: number
  studentId: number
  mockExamId: number
  mockExam?: MockExamInfo
  koreanSelection?: string
  koreanRaw?: number
  koreanStandard?: number
  koreanPercentile?: number
  koreanGrade?: number
  englishRaw?: number
  englishGrade?: number
  mathSelection?: string
  mathRaw?: number
  mathStandard?: number
  mathPercentile?: number
  mathGrade?: number
  inquiry1Selection?: string
  inquiry1Raw?: number
  inquiry1Standard?: number
  inquiry1Percentile?: number
  inquiry1Grade?: number
  inquiry2Selection?: string
  inquiry2Raw?: number
  inquiry2Standard?: number
  inquiry2Percentile?: number
  inquiry2Grade?: number
  historyRaw?: number
  historyGrade?: number
  foreignSelection?: string
  foreignRaw?: number
  foreignGrade?: number
  totalStandardSum?: number
  totalPercentileSum?: number
}

interface SubjectScore {
  subject: string
  selection?: string
  raw?: number
  standard?: number
  percentile?: number
  grade?: number
}

interface ScoreSummary {
  scoreId: number
  mockExamName: string
  year: number
  month: number
  subjects: SubjectScore[]
  totalStandardSum?: number
  totalPercentileSum?: number
  overallGrade?: number
}

interface AchievementItem {
  subject: string
  grade: number
  percentile?: number
  status: string
  message: string
}

interface AchievementAnalysis {
  scoreId: number
  achievements: AchievementItem[]
  overallGrade: number
  recommendation: string
}

interface CombinationResult {
  name: string
  subjects: string[]
  totalStandard: number
  totalPercentile: number
  estimatedGrade: string
}

interface CombinationAnalysis {
  scoreId: number
  combinations: CombinationResult[]
}

export default function MockExamScoreAnalysisPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([])
  const [selectedScoreId, setSelectedScoreId] = useState<number | null>(null)
  const [selectedScore, setSelectedScore] = useState<ScoreRecord | null>(null)
  const [summary, setSummary] = useState<ScoreSummary | null>(null)
  const [achievement, setAchievement] = useState<AchievementAnalysis | null>(null)
  const [combination, setCombination] = useState<CombinationAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // SSO 인증
  useEffect(() => {
    async function fetchUser() {
      const userData = await getUser()
      setUser(userData)
      setAuthLoading(false)
    }
    fetchUser()
  }, [])

  // 점수 목록 로드
  useEffect(() => {
    if (authLoading || !user) return
    async function fetchScores() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get<ScoreRecord[]>(`/api/scores/student/${user!.id}`)
        const records = Array.isArray(res) ? res : []
        setScoreRecords(records)
        // 최근 점수 자동 선택
        if (records.length > 0) {
          setSelectedScoreId(records[0].id)
          setSelectedScore(records[0])
        }
      } catch (err) {
        console.error('점수 로드 실패:', err)
        setError(err instanceof Error ? err.message : '점수를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchScores()
  }, [authLoading, user])

  // 분석 데이터 로드 (선택한 점수 변경 시)
  useEffect(() => {
    if (!selectedScoreId) return
    async function fetchAnalysis() {
      setAnalysisLoading(true)
      try {
        const [summaryRes, achievementRes, combinationRes] = await Promise.allSettled([
          api.get<ScoreSummary>(`/api/analysis/summary/${selectedScoreId}`),
          api.get<AchievementAnalysis>(`/api/analysis/achievement/${selectedScoreId}`),
          api.get<CombinationAnalysis>(`/api/analysis/combination/${selectedScoreId}`),
        ])
        if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value)
        if (achievementRes.status === 'fulfilled') setAchievement(achievementRes.value)
        if (combinationRes.status === 'fulfilled') setCombination(combinationRes.value)
      } catch (err) {
        console.error('분석 데이터 로드 실패:', err)
      } finally {
        setAnalysisLoading(false)
      }
    }
    fetchAnalysis()
  }, [selectedScoreId])

  // 점수 레코드에서 과목별 표시용 데이터 추출
  const extractScoreTable = (score: ScoreRecord) => {
    const rows = [
      {
        label: "원점수",
        korean: score.koreanRaw,
        math: score.mathRaw,
        english: score.englishRaw,
        inquiry1: score.inquiry1Raw,
        inquiry2: score.inquiry2Raw,
        history: score.historyRaw,
        foreign: score.foreignRaw,
      },
      {
        label: "표준점수",
        korean: score.koreanStandard,
        math: score.mathStandard,
        english: null,
        inquiry1: score.inquiry1Standard,
        inquiry2: score.inquiry2Standard,
        history: null,
        foreign: null,
      },
      {
        label: "백분위",
        korean: score.koreanPercentile,
        math: score.mathPercentile,
        english: null,
        inquiry1: score.inquiry1Percentile,
        inquiry2: score.inquiry2Percentile,
        history: null,
        foreign: null,
      },
      {
        label: "등급",
        korean: score.koreanGrade,
        math: score.mathGrade,
        english: score.englishGrade,
        inquiry1: score.inquiry1Grade,
        inquiry2: score.inquiry2Grade,
        history: score.historyGrade,
        foreign: score.foreignGrade,
      },
    ]
    return rows
  }

  const gradeColor = (grade?: number | null) => {
    if (grade == null) return 'text-gray-400'
    if (grade <= 2) return 'text-green-600 font-bold'
    if (grade <= 4) return 'text-blue-600 font-bold'
    if (grade <= 6) return 'text-yellow-600 font-bold'
    return 'text-red-600 font-bold'
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'average': return 'bg-yellow-100 text-yellow-800'
      case 'belowAverage': return 'bg-orange-100 text-orange-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return '우수'
      case 'good': return '양호'
      case 'average': return '보통'
      case 'belowAverage': return '미흡'
      default: return '노력 필요'
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">성적 분석</h1>
          <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg border border-yellow-300 text-center">
            ⚠️ 성적 분석을 보려면 먼저 로그인해주세요.
            <br />
            <span className="text-sm">상단 네비게이션 바에서 로그인할 수 있습니다.</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span>홈</span>
          <span>&gt;</span>
          <span>모의고사 분석</span>
          <span>&gt;</span>
          <span className="text-[#7b1e7a] font-medium">성적분석</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">성적 분석</h1>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md border border-red-300 mb-6">{error}</div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">데이터 로딩 중...</div>
          </div>
        ) : scoreRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-600 mb-4">아직 저장된 성적이 없습니다.</p>
            <p className="text-sm text-gray-500 mb-6">모의고사를 채점하면 성적이 자동으로 기록됩니다.</p>
            <button
              onClick={() => router.push('/main/input')}
              className="px-6 py-2 bg-[#7b1e7a] text-white rounded-md hover:bg-[#5a165a] transition-colors"
            >
              모의고사 입력하기
            </button>
          </div>
        ) : (
          <>
            {/* 모의고사 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">모의고사 선택</label>
              <select
                value={selectedScoreId ?? ''}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  setSelectedScoreId(id)
                  setSelectedScore(scoreRecords.find(s => s.id === id) || null)
                }}
                className="border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-900 focus:ring-[#7b1e7a] focus:border-[#7b1e7a]"
              >
                {scoreRecords.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.mockExam?.name ?? `모의고사 #${s.mockExamId}`} ({s.mockExam?.year}년 {s.mockExam?.month}월)
                  </option>
                ))}
              </select>
            </div>

            {analysisLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">분석 중...</div>
              </div>
            ) : (
              <>
                {/* 내 성적 테이블 */}
                {selectedScore && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 내 성적</h2>
                      {selectedScore.totalStandardSum && (
                        <div className="flex space-x-4 mb-4">
                          <span className="text-sm bg-[#f5e6f5] text-[#7b1e7a] px-3 py-1 rounded-full">
                            표준점수 합계: <strong>{selectedScore.totalStandardSum}</strong>
                          </span>
                          {selectedScore.totalPercentileSum && (
                            <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                              백분위 합계: <strong>{Number(selectedScore.totalPercentileSum).toFixed(1)}</strong>
                            </span>
                          )}
                        </div>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 text-sm font-medium text-gray-700">구분</th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">
                                국어
                                {selectedScore.koreanSelection && <div className="text-xs text-gray-400">{selectedScore.koreanSelection}</div>}
                              </th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">
                                수학
                                {selectedScore.mathSelection && <div className="text-xs text-gray-400">{selectedScore.mathSelection}</div>}
                              </th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">영어</th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">
                                탐구1
                                {selectedScore.inquiry1Selection && <div className="text-xs text-gray-400">{selectedScore.inquiry1Selection}</div>}
                              </th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">
                                탐구2
                                {selectedScore.inquiry2Selection && <div className="text-xs text-gray-400">{selectedScore.inquiry2Selection}</div>}
                              </th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">한국사</th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">
                                제2외국어
                                {selectedScore.foreignSelection && <div className="text-xs text-gray-400">{selectedScore.foreignSelection}</div>}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {extractScoreTable(selectedScore).map((row, i) => (
                              <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="p-3 text-sm font-medium text-gray-900 bg-gray-100">{row.label}</td>
                                <td className={`p-3 text-sm text-center ${row.label === '등급' ? gradeColor(row.korean as number) : 'text-gray-900'}`}>
                                  {row.korean ?? '-'}
                                </td>
                                <td className={`p-3 text-sm text-center ${row.label === '등급' ? gradeColor(row.math as number) : 'text-gray-900'}`}>
                                  {row.math ?? '-'}
                                </td>
                                <td className={`p-3 text-sm text-center ${row.label === '등급' ? gradeColor(row.english as number) : 'text-gray-900'}`}>
                                  {row.english ?? '-'}
                                </td>
                                <td className={`p-3 text-sm text-center ${row.label === '등급' ? gradeColor(row.inquiry1 as number) : 'text-gray-900'}`}>
                                  {row.inquiry1 ?? '-'}
                                </td>
                                <td className={`p-3 text-sm text-center ${row.label === '등급' ? gradeColor(row.inquiry2 as number) : 'text-gray-900'}`}>
                                  {row.inquiry2 ?? '-'}
                                </td>
                                <td className={`p-3 text-sm text-center ${row.label === '등급' ? gradeColor(row.history as number) : 'text-gray-900'}`}>
                                  {row.history ?? '-'}
                                </td>
                                <td className={`p-3 text-sm text-center ${row.label === '등급' ? gradeColor(row.foreign as number) : 'text-gray-900'}`}>
                                  {row.foreign ?? '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 성취수준 분석 */}
                {achievement && achievement.achievements.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 성취수준 분석</h2>

                      {/* 전체 등급 & 추천 */}
                      <div className="bg-[#fdf5fd] border border-[#d4a5d3] rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-600">전체 평균 등급</span>
                            <span className={`ml-3 text-2xl font-bold ${gradeColor(Math.round(achievement.overallGrade))}`}>
                              {(achievement.overallGrade ?? 0).toFixed(1)}등급
                            </span>
                          </div>
                        </div>
                        {achievement.recommendation && (
                          <p className="mt-3 text-sm text-gray-700">{achievement.recommendation}</p>
                        )}
                      </div>

                      {/* 과목별 성취 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievement.achievements.map((item, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{item.subject}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${statusColor(item.status)}`}>
                                {statusLabel(item.status)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`text-xl ${gradeColor(item.grade)}`}>{item.grade}등급</span>
                              {item.percentile != null && (
                                <span className="text-sm text-gray-500">백분위 {item.percentile}</span>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">{item.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 조합별 분석 */}
                {combination && combination.combinations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">🔀 조합별 분석</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-3 text-sm font-medium text-gray-700">조합</th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">표준점수 합</th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">백분위 합</th>
                              <th className="text-center p-3 text-sm font-medium text-gray-700">추정 등급</th>
                            </tr>
                          </thead>
                          <tbody>
                            {combination.combinations.map((c, i) => (
                              <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="p-3 text-sm font-medium text-gray-900">{c.name}</td>
                                <td className="p-3 text-sm text-center text-gray-900">{c.totalStandard}</td>
                                <td className="p-3 text-sm text-center text-gray-900">{(c.totalPercentile ?? 0).toFixed(1)}</td>
                                <td className="p-3 text-sm text-center">
                                  <span className="px-2 py-1 rounded-full bg-[#f5e6f5] text-[#7b1e7a] font-bold">
                                    {c.estimatedGrade}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 과목별 성적 시각화 (바 차트) */}
                {summary && summary.subjects.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 과목별 백분위</h2>
                      <div className="space-y-3">
                        {summary.subjects
                          .filter(s => s.percentile != null)
                          .map((s, i) => (
                            <div key={i} className="flex items-center space-x-4">
                              <div className="w-20 text-sm text-gray-700 text-right font-medium">{s.subject}</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-7 relative">
                                <div
                                  className="bg-[#7b1e7a] h-7 rounded-full flex items-center justify-end pr-3 transition-all"
                                  style={{ width: `${Math.max(s.percentile!, 8)}%` }}
                                >
                                  <span className="text-xs text-white font-medium">{s.percentile}</span>
                                </div>
                              </div>
                              <div className={`w-12 text-center text-sm ${gradeColor(s.grade)}`}>
                                {s.grade != null ? `${s.grade}등급` : '-'}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 모든 분석 결과가 비어있을 때 */}
                {!summary && !achievement && !combination && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-gray-600">선택한 모의고사의 분석 데이터가 아직 없습니다.</p>
                    <p className="text-sm text-gray-500 mt-2">성적을 입력하면 자동으로 분석됩니다.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
