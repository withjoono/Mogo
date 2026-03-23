"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, XCircle, RotateCcw, BookOpen, Save, Pencil, BarChart3, ArrowRight } from "lucide-react"
import { getUser, type User } from "@/lib/auth/user"
import { mockExamApi } from "@/lib/api/mock-exam"
import { api } from "@/lib/api/client"

// 채점 결과 맵 타입
interface GradeResultEntry {
  isCorrect: boolean
  correctAnswer: number
  selectedAnswer: number
  earnedScore: number
}

function MockExamFormPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUser()
      setUser(userData)
      setAuthLoading(false)
    }
    fetchUser()
  }, [])

  const isLoggedIn = !!user
  const studentId = user?.id ?? null

  const year = searchParams.get("year") || ""
  const grade = searchParams.get("grade") || ""
  const month = searchParams.get("month") || ""

  const [mockExamId, setMockExamId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [gradeResults, setGradeResults] = useState<any[]>([])
  const [gradeResultMap, setGradeResultMap] = useState<Record<string, GradeResultEntry>>({})
  const [isGraded, setIsGraded] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [enteredSubjects, setEnteredSubjects] = useState<Set<string>>(new Set())

  // 쿼리 파라미터 없으면 모의고사 선택 페이지로 리다이렉트
  useEffect(() => {
    if (!year || !grade || !month) {
      router.replace('/main/input')
    }
  }, [year, grade, month, router])

  // 모의고사 ID 조회
  useEffect(() => {
    async function fetchMockExam() {
      if (!year || !grade || !month) return

      try {
        const monthNum = parseInt(month.replace('월', ''))
        const exams = await mockExamApi.search({
          year: parseInt(year),
          grade,
          month: monthNum,
        })
        if (exams && exams.length > 0) {
          setMockExamId(exams[0].id)
        }
      } catch (error) {
        console.error('모의고사 조회 실패:', error)
      }
    }
    fetchMockExam()
  }, [year, grade, month])

  // 이미 입력된 과목 조회
  useEffect(() => {
    async function fetchEnteredSubjects() {
      if (!studentId || !mockExamId) return
      try {
        const res = await api.get<any>(`/api/wrong-answers/student/${studentId}?mockExamId=${mockExamId}&wrongOnly=false&limit=100`)
        if (res && res.items && res.items.length > 0) {
          const subjectSet = new Set<string>()
          res.items.forEach((item: any) => {
            subjectSet.add(item.subjectName || item.subjectAreaName)
          })
          setEnteredSubjects(subjectSet)
        }
      } catch (e) {
        // 답안 없음
      }
    }
    fetchEnteredSubjects()
  }, [studentId, mockExamId])

  const getSubjects = () => {
    if (grade === "고1") {
      return ["국어", "수학", "영어", "한국사", "통합사회", "통합과학", "제2외국어"]
    }
    return ["국어", "수학", "영어", "한국사", "탐구1", "탐구2", "제2외국어"]
  }

  const subjects = getSubjects()

  const [selectedSubject, setSelectedSubject] = useState("국어")
  const [answers, setAnswers] = useState<{ [key: string]: number | string }>({})
  const [inquiry1Subject, setInquiry1Subject] = useState("")
  const [inquiry2Subject, setInquiry2Subject] = useState("")
  const [koreanSelection, setKoreanSelection] = useState("")
  const [mathSelection, setMathSelection] = useState("")

  const koreanSubjects = ["화법과작문", "언어와매체"]
  const mathSubjects = ["확률과통계", "미적분", "기하"]
  const [secondForeignLanguage, setSecondForeignLanguage] = useState("")

  const inquirySubjects = {
    사회탐구: ["생활과윤리", "윤리와사상", "한국지리", "세계지리", "동아시아사", "세계사", "경제", "정치와법", "사회문화"],
    과학탐구: ["물리학 I", "물리학 II", "화학 I", "화학 II", "생명과학 I", "생명과학 II", "지구과학 I", "지구과학 II"],
  }

  const secondForeignLanguageSubjects = [
    "독일어",
    "프랑스어",
    "스페인어",
    "중국어",
    "일본어",
    "러시아어",
    "아랍어",
    "베트남어",
    "한문",
  ]

  const getQuestionsForSubject = (subject: string) => {
    if (subject === "국어" || subject === "영어") {
      return Array.from({ length: 45 }, (_, i) => i + 1)
    }
    if (subject === "수학") {
      return Array.from({ length: 30 }, (_, i) => i + 1)
    }
    if (
      subject === "한국사" ||
      subject === "탐구1" ||
      subject === "탐구2" ||
      subject === "통합사회" ||
      subject === "통합과학"
    ) {
      return Array.from({ length: 20 }, (_, i) => i + 1)
    }
    if (subject === "제2외국어") {
      return Array.from({ length: 30 }, (_, i) => i + 1)
    }
    return Array.from({ length: 7 }, (_, i) => i + 1)
  }

  const getMathInputType = (questionNum: number) => {
    if (grade === "고2") {
      // 고2: 1-21번은 5지선다, 22-30번은 3자리 숫자입력
      if (questionNum >= 1 && questionNum <= 21) {
        return "multiple-choice"
      }
      if (questionNum >= 22 && questionNum <= 30) {
        return "number-input"
      }
    } else {
      // 고3 (기존 로직): 1-15번, 23-28번은 5지선다, 16-22번, 29-30번은 3자리 숫자입력
      if ((questionNum >= 1 && questionNum <= 15) || (questionNum >= 23 && questionNum <= 28)) {
        return "multiple-choice"
      }
      if ((questionNum >= 16 && questionNum <= 22) || (questionNum >= 29 && questionNum <= 30)) {
        return "number-input"
      }
    }
    return "multiple-choice"
  }

  const questions = getQuestionsForSubject(selectedSubject)
  const answerOptions = [1, 2, 3, 4, 5]

  const handleAnswerSelect = (questionNum: number, answer: number) => {
    const key = `${selectedSubject}-${questionNum}`
    setAnswers((prev) => ({
      ...prev,
      [key]: answer,
    }))
  }

  const handleNumberInput = (questionNum: number, value: string) => {
    const key = `${selectedSubject}-${questionNum}`
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    // 로그인 확인
    if (!isLoggedIn || !studentId) {
      setSaveMessage({ type: 'error', text: '로그인이 필요합니다. 상단 네비게이션 바에서 로그인해주세요.' })
      return
    }

    // 모의고사 ID 확인
    if (!mockExamId) {
      setSaveMessage({ type: 'error', text: '모의고사 정보를 찾을 수 없습니다.' })
      return
    }

    // 답안이 없으면
    if (Object.keys(answers).length === 0) {
      setSaveMessage({ type: 'error', text: '입력된 답안이 없습니다.' })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      // 과목별로 답안 그룹화
      const answersBySubject: Record<string, { questionNumber: number; selectedAnswer: number }[]> = {}

      Object.entries(answers).forEach(([key, value]) => {
        const [subject, questionNumStr] = key.split('-')
        const questionNumber = parseInt(questionNumStr)
        const selectedAnswer = typeof value === 'string' ? parseInt(value) : value

        // 빈 값이거나 NaN이면 스킵 (단답형 문제 빈 입력 등)
        if (isNaN(selectedAnswer) || (typeof value === 'string' && value.trim() === '')) return

        if (!answersBySubject[subject]) {
          answersBySubject[subject] = []
        }
        answersBySubject[subject].push({ questionNumber, selectedAnswer })
      })

      // 각 과목별로 API 호출 & 결과 수집
      const allResults: any[] = []
      for (const [subjectAreaName, subjectAnswers] of Object.entries(answersBySubject)) {
        // 세부과목 처리
        let actualSubjectName: string | undefined
        if (subjectAreaName === '국어' && grade === '고3' && koreanSelection) {
          actualSubjectName = koreanSelection
        } else if (subjectAreaName === '수학' && grade === '고3' && mathSelection) {
          actualSubjectName = mathSelection
        } else if (subjectAreaName === '탐구1') {
          actualSubjectName = inquiry1Subject
        } else if (subjectAreaName === '탐구2') {
          actualSubjectName = inquiry2Subject
        } else if (subjectAreaName === '제2외국어') {
          actualSubjectName = secondForeignLanguage
        }

        // 탐구 과목의 subjectAreaName을 DB값에 맞게 변환
        let apiSubjectAreaName = subjectAreaName
        if (subjectAreaName === '탐구1' || subjectAreaName === '탐구2') {
          const selected = subjectAreaName === '탐구1' ? inquiry1Subject : inquiry2Subject
          const isSocial = inquirySubjects.사회탐구.includes(selected)
          apiSubjectAreaName = isSocial ? '사회탐구' : '과학탐구'
        }

        const res = await api.post<any>('/api/wrong-answers/grade', {
          studentId,
          mockExamId,
          subjectAreaName: apiSubjectAreaName,
          subjectName: actualSubjectName,
          answers: subjectAnswers,
        })
        if (res) {
          allResults.push({ ...res, displayName: actualSubjectName || subjectAreaName })
        }
      }

      setGradeResults(allResults)

      // 인라인 표시를 위한 과목-문번 → 결과 맵 생성
      const newMap: Record<string, GradeResultEntry> = {}
      for (const result of allResults) {
        const subjectKey = result.displayName || result.subjectAreaName || ''
        // 결과에서 서버 subjectAreaName과 프론트 탭 이름 모두 매핑
        if (result.results) {
          for (const r of result.results) {
            // 프론트 탭 이름 기준으로 키 생성
            // subjectAreaName으로도 보조 키 생성 (탐구 등 세부과목일 때 탭 이름은 "탐구1" 등)
            const keys = new Set<string>()
            // 원래 과목 영역명 (API 호출 시 사용)
            Object.entries(answersBySubject).forEach(([tabName]) => {
              const answerKey = `${tabName}-${r.questionNumber}`
              if (answers[answerKey] !== undefined) {
                keys.add(tabName)
              }
            })
            // 못 찾으면 displayName fallback
            if (keys.size === 0) keys.add(subjectKey)
            for (const k of keys) {
              newMap[`${k}-${r.questionNumber}`] = {
                isCorrect: r.isCorrect,
                correctAnswer: r.correctAnswer,
                selectedAnswer: r.selectedAnswer,
                earnedScore: r.earnedScore,
              }
            }
          }
        }
      }
      setGradeResultMap(newMap)
      setIsGraded(true)
      setSaveMessage({ type: 'success', text: '채점이 완료되었습니다! 저장 버튼을 눌러 결과를 저장하세요.' })
    } catch (error) {
      console.error('저장 실패:', error)
      setSaveMessage({ type: 'error', text: error instanceof Error ? error.message : '저장에 실패했습니다.' })
    } finally {
      setIsSaving(false)
    }
  }

  // 저장만 (채점 인라인 표시 없이 DB 저장)
  const handleSaveOnly = async () => {
    if (!isLoggedIn || !studentId) {
      setSaveMessage({ type: 'error', text: '로그인이 필요합니다.' })
      return
    }
    if (!mockExamId) {
      setSaveMessage({ type: 'error', text: '모의고사 정보를 찾을 수 없습니다.' })
      return
    }
    if (Object.keys(answers).length === 0) {
      setSaveMessage({ type: 'error', text: '입력된 답안이 없습니다.' })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const answersBySubject: Record<string, { questionNumber: number; selectedAnswer: number }[]> = {}
      Object.entries(answers).forEach(([key, value]) => {
        const [subject, questionNumStr] = key.split('-')
        const questionNumber = parseInt(questionNumStr)
        const selectedAnswer = typeof value === 'string' ? parseInt(value) : value

        // 빈 값이거나 NaN이면 스킵 (단답형 문제 빈 입력 등)
        if (isNaN(selectedAnswer) || (typeof value === 'string' && value.trim() === '')) return

        if (!answersBySubject[subject]) answersBySubject[subject] = []
        answersBySubject[subject].push({ questionNumber, selectedAnswer })
      })

      for (const [subjectAreaName, subjectAnswers] of Object.entries(answersBySubject)) {
        let actualSubjectName: string | undefined
        if (subjectAreaName === '국어' && grade === '고3' && koreanSelection) actualSubjectName = koreanSelection
        else if (subjectAreaName === '수학' && grade === '고3' && mathSelection) actualSubjectName = mathSelection
        else if (subjectAreaName === '탐구1') actualSubjectName = inquiry1Subject
        else if (subjectAreaName === '탐구2') actualSubjectName = inquiry2Subject
        else if (subjectAreaName === '제2외국어') actualSubjectName = secondForeignLanguage

        let apiSubjectAreaName = subjectAreaName
        if (subjectAreaName === '탐구1' || subjectAreaName === '탐구2') {
          const selected = subjectAreaName === '탐구1' ? inquiry1Subject : inquiry2Subject
          const isSocial = inquirySubjects.사회탐구.includes(selected)
          apiSubjectAreaName = isSocial ? '사회탐구' : '과학탐구'
        }

        await api.post<any>('/api/wrong-answers/grade', {
          studentId,
          mockExamId,
          subjectAreaName: apiSubjectAreaName,
          subjectName: actualSubjectName,
          answers: subjectAnswers,
        })
      }

      setSaveMessage({ type: 'success', text: '답안이 저장되었습니다!' })
      setIsSaved(true)
    } catch (error) {
      console.error('저장 실패:', error)
      setSaveMessage({ type: 'error', text: error instanceof Error ? error.message : '저장에 실패했습니다.' })
    } finally {
      setIsSaving(false)
    }
  }

  // 초기화 핸들러 (답안 초기화)
  const handleReset = useCallback(() => {
    setAnswers({})
    setGradeResults([])
    setGradeResultMap({})
    setIsGraded(false)
    setIsSaved(false)
    setSaveMessage(null)
  }, [])

  // 수정하기 핸들러 (답안 유지, 채점 결과만 해제)
  const handleEdit = useCallback(() => {
    setGradeResults([])
    setGradeResultMap({})
    setIsGraded(false)
    setIsSaved(false)
    setSaveMessage(null)
  }, [])

  // 문제별 인라인 채점 아이콘 렌더링
  const renderGradeIndicator = (questionNum: number) => {
    const key = `${selectedSubject}-${questionNum}`
    const result = gradeResultMap[key]
    if (!isGraded || !result) return null

    if (result.isCorrect) {
      return (
        <div className="flex items-center justify-center w-6 flex-shrink-0" title="정답">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
        </div>
      )
    } else {
      return (
        <div className="flex items-center justify-center w-6 flex-shrink-0" title="오답">
          <XCircle className="w-5 h-5 text-red-500" strokeWidth={2.5} />
        </div>
      )
    }
  }

  // 선택지 버튼 스타일 결정
  const getOptionStyle = (questionNum: number, option: number, selectedAnswer: number | string | undefined) => {
    const key = `${selectedSubject}-${questionNum}`
    const result = gradeResultMap[key]

    // 채점 전: 기존 스타일
    if (!isGraded || !result) {
      if (selectedAnswer === option) {
        return "bg-[#00e5e8] border-[#00e5e8] text-white"
      }
      return "bg-white border-gray-300 text-gray-700 hover:border-[#d4a5d3]"
    }

    // 채점 후
    const isSelected = selectedAnswer === option
    const isCorrectOption = result.correctAnswer === option

    if (result.isCorrect && isSelected) {
      // 정답 선택
      return "bg-emerald-500 border-emerald-500 text-white ring-2 ring-emerald-200"
    }
    if (!result.isCorrect) {
      if (isSelected) {
        // 오답으로 선택한 번호
        return "bg-red-500 border-red-500 text-white ring-2 ring-red-200"
      }
      if (isCorrectOption) {
        // 실제 정답 번호 (초록 테두리)
        return "bg-white border-emerald-500 text-emerald-600 ring-2 ring-emerald-200 font-bold"
      }
    }
    // 나머지 옵션
    return "bg-white border-gray-200 text-gray-400"
  }

  const renderMathQuestion = (questionNum: number) => {
    const key = `${selectedSubject}-${questionNum}`
    const selectedAnswer = answers[key]
    const inputType = getMathInputType(questionNum)
    const result = gradeResultMap[key]

    if (inputType === "number-input") {
      // 숫자 입력 문항의 채점 결과 스타일
      let inputStyle = "w-16 h-10 border-2 border-gray-300 rounded text-center font-medium focus:border-[#00e5e8] focus:outline-none"
      if (isGraded && result) {
        inputStyle = result.isCorrect
          ? "w-16 h-10 border-2 border-emerald-500 rounded text-center font-medium bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
          : "w-16 h-10 border-2 border-red-500 rounded text-center font-medium bg-red-50 text-red-700 ring-2 ring-red-200"
      }

      return (
        <div key={questionNum} className="flex items-center space-x-2 mb-4">
          {renderGradeIndicator(questionNum)}
          <div className={`w-8 text-center font-medium ${
            isGraded && result
              ? result.isCorrect ? 'text-emerald-600' : 'text-red-600'
              : 'text-gray-700'
          }`}>{questionNum}.</div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              maxLength={3}
              value={selectedAnswer || ""}
              onChange={(e) => handleNumberInput(questionNum, e.target.value)}
              className={inputStyle}
              placeholder="000"
              disabled={isGraded}
            />
            {isGraded && result && !result.isCorrect && (
              <span className="text-sm text-emerald-600 font-semibold ml-1">정답: {result.correctAnswer}</span>
            )}
          </div>
        </div>
      )
    }

    return (
      <div key={questionNum} className="flex items-center space-x-2 mb-4">
        {renderGradeIndicator(questionNum)}
        <div className={`w-8 text-center font-medium ${
          isGraded && result
            ? result.isCorrect ? 'text-emerald-600' : 'text-red-600'
            : 'text-gray-700'
        }`}>{questionNum}.</div>
        <div className="flex space-x-2">
          {answerOptions.map((option) => (
            <button
              key={option}
              onClick={() => !isGraded && handleAnswerSelect(questionNum, option)}
              disabled={isGraded}
              className={`w-10 h-10 rounded-full border-2 font-medium text-sm transition-all duration-300 ${
                getOptionStyle(questionNum, option, selectedAnswer)
              } ${isGraded ? 'cursor-default' : ''}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderRegularQuestion = (questionNum: number) => {
    const key = `${selectedSubject}-${questionNum}`
    const selectedAnswer = answers[key]
    const result = gradeResultMap[key]

    return (
      <div key={questionNum} className={`flex items-center space-x-2 mb-3 py-1 px-2 rounded-lg transition-all duration-300 ${
        isGraded && result
          ? result.isCorrect
            ? 'bg-emerald-50/50'
            : 'bg-red-50/50'
          : ''
      }`}>
        {renderGradeIndicator(questionNum)}
        <div className={`w-8 text-center font-medium ${
          isGraded && result
            ? result.isCorrect ? 'text-emerald-600' : 'text-red-600'
            : 'text-gray-700'
        }`}>{questionNum}.</div>
        <div className="flex space-x-2">
          {answerOptions.map((option) => (
            <button
              key={option}
              onClick={() => !isGraded && handleAnswerSelect(questionNum, option)}
              disabled={isGraded}
              className={`w-10 h-10 rounded-full border-2 font-medium text-sm transition-all duration-300 ${
                getOptionStyle(questionNum, option, selectedAnswer)
              } ${isGraded ? 'cursor-default' : ''}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderKoreanEnglishQuestions = () => {
    const sections = [
      { start: 1, end: 10, title: "1-10번", color: "blue" },
      { start: 11, end: 20, title: "11-20번", color: "green" },
      { start: 21, end: 30, title: "21-30번", color: "purple" },
      { start: 31, end: 40, title: "31-40번", color: "indigo" },
      { start: 41, end: 45, title: "41-45번", color: "pink" },
    ]

    return (
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`bg-${section.color}-50 border border-${section.color}-200 rounded-lg p-4`}
          >
            <h4 className={`text-sm font-medium text-${section.color}-800 mb-3`}>{section.title}</h4>
            <div className="grid grid-cols-2 gap-2">
              {questions.slice(section.start - 1, section.end).map(renderRegularQuestion)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderInquiryDropdown = (inquiryType: "탐구1" | "탐구2") => {
    const selectedSubject = inquiryType === "탐구1" ? inquiry1Subject : inquiry2Subject
    const setSelectedSubject = inquiryType === "탐구1" ? setInquiry1Subject : setInquiry2Subject

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">과목 선택</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5e8] focus:border-[#00e5e8]"
          >
            <option value="">과목을 선택하세요</option>
            <optgroup label="사회탐구">
              {inquirySubjects.사회탐구.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </optgroup>
            <optgroup label="과학탐구">
              {inquirySubjects.과학탐구.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {selectedSubject && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">{selectedSubject}</h4>
            {render20QuestionSubject()}
          </div>
        )}
      </div>
    )
  }

  const render20QuestionSubject = () => {
    const sections = [
      { start: 1, end: 10, title: "1-10번", color: "blue" },
      { start: 11, end: 20, title: "11-20번", color: "green" },
    ]

    return (
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`bg-${section.color}-50 border border-${section.color}-200 rounded-lg p-4`}
          >
            <h4 className={`text-sm font-medium text-${section.color}-800 mb-3`}>{section.title}</h4>
            <div className="grid grid-cols-2 gap-2">
              {questions.slice(section.start - 1, section.end).map(renderRegularQuestion)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const render30QuestionSubject = () => {
    const sections = [
      { start: 1, end: 10, title: "1-10번", color: "blue" },
      { start: 11, end: 20, title: "11-20번", color: "green" },
      { start: 21, end: 30, title: "21-30번", color: "purple" },
    ]

    return (
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`bg-${section.color}-50 border border-${section.color}-200 rounded-lg p-4`}
          >
            <h4 className={`text-sm font-medium text-${section.color}-800 mb-3`}>{section.title}</h4>
            <div className="grid grid-cols-2 gap-2">
              {questions.slice(section.start - 1, section.end).map(renderRegularQuestion)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderSecondForeignLanguageDropdown = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">과목 선택</label>
          <select
            value={secondForeignLanguage}
            onChange={(e) => setSecondForeignLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5e8] focus:border-[#00e5e8]"
          >
            <option value="">과목을 선택하세요</option>
            {secondForeignLanguageSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {secondForeignLanguage && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">{secondForeignLanguage}</h4>
            {render30QuestionSubject()}
          </div>
        )}
      </div>
    )
  }

  const renderGrade2MathQuestions = () => {
    const sections = [
      { start: 1, end: 10, title: "1-10번 (5지 선다)", color: "blue" },
      { start: 11, end: 21, title: "11-21번 (5지 선다)", color: "green" },
      { start: 22, end: 30, title: "22-30번 (3자리 숫자 입력)", color: "purple" },
    ]

    return (
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`bg-${section.color}-50 border border-${section.color}-200 rounded-lg p-4`}
          >
            <h4 className={`text-sm font-medium text-${section.color}-800 mb-3`}>{section.title}</h4>
            <div className="grid grid-cols-2 gap-2">
              {questions.slice(section.start - 1, section.end).map(renderMathQuestion)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderGrade3MathQuestions = () => {
    const sections = [
      { start: 1, end: 15, title: "1-15번 (5지 선다)", color: "pink" },
      { start: 16, end: 22, title: "16-22번 (3자리 숫자 입력)", color: "blue" },
      { start: 23, end: 28, title: "23-28번 (5지 선다)", color: "green" },
      { start: 29, end: 30, title: "29-30번 (3자리 숫자 입력)", color: "purple" },
    ]

    return (
      <div className="grid grid-cols-1 gap-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className={`bg-${section.color}-50 border border-${section.color}-200 rounded-lg p-4`}
          >
            <h4 className={`text-sm font-medium text-${section.color}-800 mb-3`}>{section.title}</h4>
            <div className="grid grid-cols-2 gap-2">
              {questions.slice(section.start - 1, section.end).map(renderMathQuestion)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderIntegratedSubject = (subjectName: string) => {
    return (
      <div className="mt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">{subjectName}</h4>
        {render20QuestionSubject()}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>홈</span>
            <span>›</span>
            <span>모의고사</span>
            <span>›</span>
            <span className="text-[#00e5e8]">모의고사 입력</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">모의고사 입력</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            {year && grade && month ? (
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                {year}년 {grade} {month} 모의고사
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">필수</span>
              </h2>
            ) : (
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                모의고사 정보를 선택해주세요
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">정보 필요</span>
              </h2>
            )}
          </div>

          <div className="flex">
            {/* Subject Sidebar */}
            <div className="w-80 bg-gray-50 border-r border-gray-200">
              <div className="p-4">
                {subjects.map((subject) => {
                  // 이 과목이 이미 DB에 저장되어 있는지 확인
                  const isEntered = enteredSubjects.has(subject) ||
                    // 탐구/국어/수학 등은 세부과목명으로 저장되므로 매핑 체크
                    (subject === '국어' && (enteredSubjects.has('화법과작문') || enteredSubjects.has('언어와매체'))) ||
                    (subject === '수학' && (enteredSubjects.has('확률과통계') || enteredSubjects.has('미적분') || enteredSubjects.has('기하'))) ||
                    (subject === '탐구1' && Array.from(enteredSubjects).some(s =>
                      [...(inquirySubjects.사회탐구 || []), ...(inquirySubjects.과학탐구 || [])].includes(s)
                    )) ||
                    (subject === '탐구2' && Array.from(enteredSubjects).filter(s =>
                      [...(inquirySubjects.사회탐구 || []), ...(inquirySubjects.과학탐구 || [])].includes(s)
                    ).length >= 2)
                  return (
                    <button
                      key={subject}
                      onClick={() => {
                        if (subject !== selectedSubject) {
                          setIsGraded(false)
                          setIsSaved(false)
                          setGradeResults([])
                          setGradeResultMap({})
                          setSaveMessage(null)
                        }
                        setSelectedSubject(subject)
                      }}
                      className={`w-full text-left px-4 py-3 mb-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between ${selectedSubject === subject
                        ? "bg-[#e0fffe] text-[#00e5e8] border border-[#d4a5d3]"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      <span>{subject}</span>
                      {isEntered && (
                        <span className="text-emerald-500 text-xs font-bold">✅</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {selectedSubject}
                  {selectedSubject === "국어" && grade === "고3" && koreanSelection && (
                    <span className="ml-2 text-sm text-[#00e5e8] font-normal">({koreanSelection})</span>
                  )}
                  {selectedSubject === "수학" && grade === "고3" && mathSelection && (
                    <span className="ml-2 text-sm text-[#00e5e8] font-normal">({mathSelection})</span>
                  )}
                </h3>

                <div className="space-y-6">
                  {selectedSubject === "국어" && grade === "고3" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">선택과목</label>
                        <select
                          value={koreanSelection}
                          onChange={(e) => setKoreanSelection(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5e8] focus:border-[#00e5e8]"
                        >
                          <option value="">선택과목을 선택하세요</option>
                          {koreanSubjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      {koreanSelection && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-4">{koreanSelection}</h4>
                          {renderKoreanEnglishQuestions()}
                        </div>
                      )}
                    </div>
                  ) : selectedSubject === "수학" && grade === "고3" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">선택과목</label>
                        <select
                          value={mathSelection}
                          onChange={(e) => setMathSelection(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00e5e8] focus:border-[#00e5e8]"
                        >
                          <option value="">선택과목을 선택하세요</option>
                          {mathSubjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      {mathSelection && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium text-gray-900 mb-4">{mathSelection}</h4>
                          {renderGrade3MathQuestions()}
                        </div>
                      )}
                    </div>
                  ) : selectedSubject === "수학" ? (
                    grade === "고2" ? (
                      renderGrade2MathQuestions()
                    ) : (
                      renderGrade3MathQuestions()
                    )
                  ) : selectedSubject === "국어" || selectedSubject === "영어" ? (
                    renderKoreanEnglishQuestions()
                  ) : selectedSubject === "탐구1" ? (
                    renderInquiryDropdown("탐구1")
                  ) : selectedSubject === "탐구2" ? (
                    renderInquiryDropdown("탐구2")
                  ) : selectedSubject === "통합사회" ? (
                    renderIntegratedSubject("통합사회")
                  ) : selectedSubject === "통합과학" ? (
                    renderIntegratedSubject("통합과학")
                  ) : selectedSubject === "한국사" ? (
                    render20QuestionSubject()
                  ) : selectedSubject === "제2외국어" ? (
                    renderSecondForeignLanguageDropdown()
                  ) : (
                    <div className="space-y-3">{questions.map(renderRegularQuestion)}</div>
                  )}
                </div>

                {/* 채점 결과 요약 바 + 버튼 영역 */}
                <div className="mt-8 space-y-4">
                  {/* 인라인 채점 완료 시 — 컴팩트 요약 바 */}
                  {isGraded && gradeResults.length > 0 && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 shadow-lg">
                      {/* 과목별 결과 칩 */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {gradeResults.map((result: any, idx: number) => {
                          const rate = result.correctRate
                          const rateColor = rate >= 80 ? 'text-emerald-400' : rate >= 60 ? 'text-yellow-400' : 'text-red-400'
                          const ringColor = rate >= 80 ? 'ring-emerald-500/30' : rate >= 60 ? 'ring-yellow-500/30' : 'ring-red-500/30'
                          return (
                            <div key={idx} className={`bg-white/10 backdrop-blur rounded-lg px-4 py-3 ring-1 ${ringColor} min-w-[140px]`}>
                              <div className="text-xs text-gray-400 mb-1">{result.displayName}</div>
                              <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-bold ${rateColor}`}>{result.earnedScore}<span className="text-sm">/{result.totalScore}점</span></span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {result.correctCount}/{result.totalQuestions}개 정답
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10 flex-wrap gap-2">
                        {/* 좌측: 수정, 초기화, 저장 */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            수정
                          </button>
                          <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                            초기화
                          </button>
                          {!isSaved && (
                            <button
                              onClick={() => {
                                setIsSaved(true)
                                setSaveMessage({ type: 'success', text: '저장되었습니다!' })
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Save className="w-4 h-4" />
                              저장
                            </button>
                          )}
                        </div>
                        {/* 우측: 저장 후에만 표시 — 타 과목 채점, 성적 분석, 오답노트 */}
                        {isSaved && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                handleEdit()
                                const currentIdx = subjects.indexOf(selectedSubject)
                                if (currentIdx < subjects.length - 1) {
                                  setSelectedSubject(subjects[currentIdx + 1])
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <ArrowRight className="w-4 h-4" />
                              타 과목 채점
                            </button>
                            <button
                              onClick={() => router.push('/main/score-analysis')}
                              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <BarChart3 className="w-4 h-4" />
                              성적 분석
                            </button>
                            <button
                              onClick={() => router.push('/main/wrong-answers')}
                              className="flex items-center gap-2 px-4 py-2.5 bg-[#00e5e8] hover:bg-[#00b8bb] text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <BookOpen className="w-4 h-4" />
                              오답노트
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 에러 메시지 */}
                  {saveMessage?.type === 'error' && (
                    <div className="bg-red-100 text-red-800 p-4 rounded-md border border-red-300">
                      {saveMessage.text}
                    </div>
                  )}

                  {/* 저장 성공 메시지 */}
                  {saveMessage?.type === 'success' && !isGraded && (
                    <div className="bg-emerald-100 text-emerald-800 p-4 rounded-md border border-emerald-300">
                      ✅ {saveMessage.text}
                    </div>
                  )}

                  {/* 로그인 안내 */}
                  {!authLoading && !isLoggedIn && (
                    <div className="bg-orange-500 text-white p-4 rounded-md shadow-md">
                      ⚠️ 답안을 저장하려면 상단 네비게이션 바에서 먼저 로그인해주세요.
                    </div>
                  )}

                  {/* 모의고사 정보 */}
                  {mockExamId && (
                    <div className="text-sm text-gray-500">
                      모의고사 ID: {mockExamId} | 학생 ID: {studentId || '미로그인'}
                    </div>
                  )}

                  {/* 채점 전 — 채점하기 버튼만 */}
                  {!isGraded && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={isSaving || !isLoggedIn}
                        className={`flex items-center gap-2 px-8 py-3 rounded-md font-medium transition-colors ${isSaving || !isLoggedIn
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#00e5e8] hover:bg-[#00b8bb] text-white shadow-lg hover:shadow-xl'
                          }`}
                      >
                        {isSaving ? '채점 중...' : '채점하기'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MockExamFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-500">로딩 중...</div></div>}>
      <MockExamFormPageContent />
    </Suspense>
  )
}
