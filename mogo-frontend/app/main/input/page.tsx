"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Loader2, CheckCircle, XCircle, FileText, BookOpen, PenLine } from "lucide-react"
import { api } from "@/lib/api/client"
import { getUser } from "@/lib/auth/user"
import { ExamCategorySelector, useExamCategory } from "@/components/ExamCategorySelector"

const gradeToCode = (grade: string): string => {
  const mapping: Record<string, string> = { "고1": "H1", "고2": "H2", "고3": "H3" }
  return mapping[grade] || grade
}

interface MockExamItem {
  id: number
  code: string
  name: string
  grade: string | null
  year: number | null
  month: number | null
  type: string | null
  isStandardScoreReleased?: boolean
}

export default function MockExamInputPage() {
  const router = useRouter()
  const { category, setCategory, isActive } = useExamCategory()
  const [selectedGrade, setSelectedGrade] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedExamId, setSelectedExamId] = useState("")

  const [allExams, setAllExams] = useState<MockExamItem[]>([])
  const [loadingExams, setLoadingExams] = useState(true)

  const [enteredScoreSubjects, setEnteredScoreSubjects] = useState<string[]>([])
  const [enteredAnswerSubjects, setEnteredAnswerSubjects] = useState<string[]>([])
  const [checkingData, setCheckingData] = useState(false)

  const grades = ["고1", "고2", "고3"]

  useEffect(() => {
    async function fetchAllExams() {
      try {
        setLoadingExams(true)
        const res = await api.get<MockExamItem[]>("/api/mock-exams")
        if (res && Array.isArray(res)) setAllExams(res)
      } catch (e) {
        console.error("Failed to fetch mock exams:", e)
      } finally {
        setLoadingExams(false)
      }
    }
    fetchAllExams()
  }, [])

  const filteredByGrade = useMemo(() => {
    if (!selectedGrade) return []
    const code = gradeToCode(selectedGrade)
    return allExams.filter((e) => e.grade === code)
  }, [selectedGrade, allExams])

  const availableYears = useMemo(() => {
    const years = new Set(filteredByGrade.map((e) => e.year).filter(Boolean) as number[])
    return Array.from(years).sort((a, b) => b - a)
  }, [filteredByGrade])

  const filteredExams = useMemo(() => {
    if (!selectedYear) return []
    const year = parseInt(selectedYear, 10)
    return filteredByGrade
      .filter((e) => e.year === year)
      .sort((a, b) => (a.month || 0) - (b.month || 0))
  }, [selectedYear, filteredByGrade])

  const selectedExam = useMemo(() => {
    if (!selectedExamId) return null
    return allExams.find((e) => e.id === parseInt(selectedExamId, 10)) || null
  }, [selectedExamId, allExams])

  useEffect(() => {
    setSelectedYear("")
    setSelectedExamId("")
    setEnteredScoreSubjects([])
    setEnteredAnswerSubjects([])
  }, [selectedGrade])

  useEffect(() => {
    setSelectedExamId("")
    setEnteredScoreSubjects([])
    setEnteredAnswerSubjects([])
  }, [selectedYear])

  useEffect(() => {
    async function checkExistingData() {
      if (!selectedExam) return
      try {
        setCheckingData(true)
        setEnteredScoreSubjects([])
        setEnteredAnswerSubjects([])
        const user = await getUser()
        if (!user) return

        try {
          const scoreRes = await api.get<any>(`/api/scores/student/${user.id}/exam/${selectedExam.id}`)
          if (scoreRes?.data) {
            const scores = scoreRes.data
            const subjects: string[] = []
            if (scores.koreanRawScore != null) subjects.push("국어")
            if (scores.mathRawScore != null) subjects.push("수학")
            if (scores.englishRawScore != null) subjects.push("영어")
            if (scores.historyRawScore != null) subjects.push("한국사")
            if (scores.inquiry1RawScore != null) subjects.push(scores.inquiry1Selection || "탐구1")
            if (scores.inquiry2RawScore != null) subjects.push(scores.inquiry2Selection || "탐구2")
            if (scores.foreignRawScore != null) subjects.push(scores.foreignSelection || "제2외국어")
            setEnteredScoreSubjects(subjects)
          }
        } catch {}

        try {
          const answerRes = await api.get<any>(`/api/wrong-answers/student/${user.id}?mockExamId=${selectedExam.id}&wrongOnly=false&limit=100`)
          if (answerRes?.items?.length > 0) {
            const subjectSet = new Set<string>()
            answerRes.items.forEach((item: any) => subjectSet.add(item.subjectName || item.subjectAreaName))
            setEnteredAnswerSubjects(Array.from(subjectSet))
          }
        } catch {}
      } catch (error) {
        console.error("Failed to check existing data:", error)
      } finally {
        setCheckingData(false)
      }
    }
    if (selectedExam) checkExistingData()
  }, [selectedExam])

  const handleScoreInput = () => {
    if (!selectedExam) return
    const params = new URLSearchParams({
      year: String(selectedExam.year),
      grade: selectedGrade,
      month: String(selectedExam.month),
      mockExamId: String(selectedExam.id),
    })
    router.push(`/main/input/score?${params.toString()}`)
  }

  const handleAnswerInput = () => {
    if (!selectedExam) return
    const params = new URLSearchParams({
      year: String(selectedExam.year),
      grade: selectedGrade,
      month: String(selectedExam.month),
      mockExamId: String(selectedExam.id),
    })
    router.push(`/main/input/form?${params.toString()}`)
  }

  const selectClass = (disabled: boolean) =>
    `w-full px-4 py-3 border rounded-xl bg-white text-sm font-medium appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-[#00e5e8]/40 focus:border-[#00e5e8] ${
      disabled
        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
        : "border-gray-300 text-gray-800 hover:border-gray-400 cursor-pointer"
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>홈</span>
            <span>›</span>
            <span>모의고사</span>
            <span>›</span>
            <span className="text-[#00b8bb] font-medium">입력</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* 페이지 타이틀 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">모의고사 입력</h1>
          <p className="text-sm text-gray-500 mt-1">시험을 선택하고 점수 또는 정답을 입력하세요</p>
        </div>

        {/* 카테고리 탭 */}
        <ExamCategorySelector onCategoryChange={setCategory} selectedCategory={category} />

        {isActive && (
          <div className="space-y-4">
            {/* 시험 선택 카드 */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#00b8bb]" />
                  시험 선택
                  <span className="ml-1 px-1.5 py-0.5 bg-[#00e5e8]/10 text-[#00a0a3] text-[10px] rounded font-medium">필수</span>
                </h2>
              </div>

              <div className="p-6">
                {loadingExams ? (
                  <div className="flex items-center justify-center gap-2 text-gray-400 py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-[#00e5e8]" />
                    <span className="text-sm">모의고사 목록 불러오는 중...</span>
                  </div>
                ) : allExams.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 text-amber-600 py-8">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm">등록된 모의고사가 없습니다. 서버 연결을 확인해주세요.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* 학년 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">학년</label>
                      <div className="relative">
                        <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                          className={selectClass(false)}
                        >
                          <option value="">학년 선택</option>
                          {grades.map((grade) => {
                            const code = gradeToCode(grade)
                            const count = allExams.filter((e) => e.grade === code).length
                            return (
                              <option key={grade} value={grade} disabled={count === 0}>
                                {grade} ({count}개)
                              </option>
                            )
                          })}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* 연도 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">연도</label>
                      <div className="relative">
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          disabled={!selectedGrade || availableYears.length === 0}
                          className={selectClass(!selectedGrade || availableYears.length === 0)}
                        >
                          <option value="">
                            {!selectedGrade ? "학년 먼저 선택" : availableYears.length === 0 ? "등록된 시험 없음" : "연도 선택"}
                          </option>
                          {availableYears.map((year) => (
                            <option key={year} value={String(year)}>{year}년</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* 시험 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">시험</label>
                      <div className="relative">
                        <select
                          value={selectedExamId}
                          onChange={(e) => setSelectedExamId(e.target.value)}
                          disabled={!selectedYear || filteredExams.length === 0}
                          className={selectClass(!selectedYear || filteredExams.length === 0)}
                        >
                          <option value="">
                            {!selectedYear ? "연도 먼저 선택" : filteredExams.length === 0 ? "등록된 시험 없음" : "시험 선택"}
                          </option>
                          {filteredExams.map((exam) => (
                            <option key={exam.id} value={String(exam.id)}>
                              {exam.month}월 — {exam.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 선택된 시험 상태 */}
                {selectedExam && (
                  <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-emerald-700 mb-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold text-sm">{selectedExam.name}</span>
                      <span className="text-xs text-emerald-500">({selectedExam.code})</span>
                    </div>

                    {checkingData ? (
                      <div className="flex items-center gap-2 text-gray-400 text-xs pl-6">
                        <Loader2 className="w-3 h-3 animate-spin" /> 기존 입력 기록 확인 중...
                      </div>
                    ) : (enteredScoreSubjects.length > 0 || enteredAnswerSubjects.length > 0) ? (
                      <div className="pl-6 space-y-2 mt-1">
                        {enteredScoreSubjects.length > 0 && (
                          <div>
                            <span className="text-xs text-blue-600 font-medium">📊 점수 입력됨 </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {enteredScoreSubjects.map((s) => (
                                <span key={s} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {enteredAnswerSubjects.length > 0 && (
                          <div>
                            <span className="text-xs text-cyan-600 font-medium">✏️ 답안 입력됨 </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {enteredAnswerSubjects.map((s) => (
                                <span key={s} className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="pl-6 text-xs text-gray-500">아직 입력된 기록이 없습니다.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 입력 방식 선택 */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-[#00b8bb]" />
                  입력 방식
                </h2>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 점수 입력 */}
                <button
                  onClick={handleScoreInput}
                  disabled={!selectedExam}
                  className={`group relative flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedExam
                      ? "border-[#00e5e8] bg-[#00e5e8]/5 hover:bg-[#00e5e8]/10 hover:shadow-md hover:shadow-[#00e5e8]/20 cursor-pointer"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedExam ? "bg-[#00e5e8]/20" : "bg-gray-200"}`}>
                    <FileText className={`w-5 h-5 ${selectedExam ? "text-[#00a0a3]" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                      {enteredScoreSubjects.length > 0 ? "점수 수정" : (selectedExam?.isStandardScoreReleased ? "표준점수 입력" : "점수 입력")}
                      {enteredScoreSubjects.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full font-bold">
                          {enteredScoreSubjects.length}과목
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedExam?.isStandardScoreReleased
                        ? "국어·수학·탐구 표준점수와 백분위를 입력합니다"
                        : "원점수를 직접 입력합니다"}
                    </p>
                  </div>
                </button>

                {/* 정답 입력 */}
                {!selectedExam?.isStandardScoreReleased ? (
                  <button
                    onClick={handleAnswerInput}
                    disabled={!selectedExam}
                    className={`group relative flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedExam
                        ? "border-[#00e5e8] bg-[#00e5e8]/5 hover:bg-[#00e5e8]/10 hover:shadow-md hover:shadow-[#00e5e8]/20 cursor-pointer"
                        : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedExam ? "bg-[#00e5e8]/20" : "bg-gray-200"}`}>
                      <PenLine className={`w-5 h-5 ${selectedExam ? "text-[#00a0a3]" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        {enteredAnswerSubjects.length > 0 ? "정답 수정 / 계속 입력" : "정답 입력"}
                        {enteredAnswerSubjects.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded-full font-bold">
                            {enteredAnswerSubjects.length}과목 완료
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">문항별 내가 쓴 답을 입력해 자동 채점합니다</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex flex-col items-start gap-3 p-5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 opacity-60">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                      <PenLine className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-500 text-sm">정답 입력</div>
                      <p className="text-xs text-gray-400 mt-0.5">표준점수 발표 후 답안 입력 불필요</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
