"use client"

import { useState } from "react"
import { ChevronDown, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MockExamManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("2023년 6월 9월")
  const router = useRouter()

  const handleWrongAnswersClick = () => {
    router.push("/main/wrong-answers")
  }

  const examData = [
    {
      category: "국어 (화법과 작문)",
      subjects: [
        { name: "화법과 작문", score: "93점", grade: "3등급", percentage: "93%" },
        { name: "독서", score: "3등급", grade: "", percentage: "" },
        { name: "문학", score: "93%", grade: "", percentage: "" },
        { name: "언어와매체", score: "118점", grade: "", percentage: "" },
      ],
    },
    {
      category: "수학 (확률과 통계)",
      subjects: [
        { name: "확률과 통계", score: "93점", grade: "3등급", percentage: "93%" },
        { name: "미분", score: "3등급", grade: "", percentage: "" },
        { name: "적분", score: "93%", grade: "", percentage: "" },
        { name: "기하와벡터", score: "118점", grade: "", percentage: "" },
      ],
    },
    {
      category: "영어",
      subjects: [
        { name: "영어듣기", score: "93점", grade: "", percentage: "" },
        { name: "독해", score: "3등급", grade: "", percentage: "" },
      ],
    },
    {
      category: "한국사",
      subjects: [
        { name: "한국사", score: "93점", grade: "3등급", percentage: "93%" },
        { name: "통합", score: "3등급", grade: "", percentage: "" },
      ],
    },
    {
      category: "탐구 1 (생명과 윤리)",
      subjects: [
        { name: "생명과 윤리", score: "93점", grade: "", percentage: "" },
        { name: "윤리", score: "3등급", grade: "", percentage: "" },
        { name: "생명학", score: "93%", grade: "", percentage: "" },
        { name: "생명윤리", score: "118점", grade: "", percentage: "" },
      ],
    },
    {
      category: "탐구 2 (윤리와 사상)",
      subjects: [
        { name: "윤리와 사상", score: "93점", grade: "3등급", percentage: "93%" },
        { name: "윤리", score: "3등급", grade: "", percentage: "" },
        { name: "생명학", score: "93%", grade: "", percentage: "" },
        { name: "생명윤리", score: "118점", grade: "", percentage: "" },
      ],
    },
    {
      category: "제 2 외국어 (스페인어 I)",
      subjects: [
        { name: "스페인어", score: "93점", grade: "", percentage: "" },
        { name: "독일어", score: "3등급", grade: "", percentage: "" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>홈</span>
            <span>›</span>
            <span>모의고사</span>
            <span>›</span>
            <span className="text-[#7b1e7a] font-medium">모의고사 관리</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">모의고사 분석</h1>

        {/* Exam Selection */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">입학원 모의고사</span>
            <span className="text-[#7b1e7a] text-sm">📋</span>
          </div>

          <div className="mt-4 relative inline-block">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7b1e7a] focus:border-[#7b1e7a]"
            >
              <option value="2023년 6월 9월">2023년 6월 9월</option>
              <option value="2023년 3월 6월">2023년 3월 6월</option>
              <option value="2022년 9월 12월">2022년 9월 12월</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Exam Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {examData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>

              <div className="space-y-3">
                {category.subjects.map((subject, subjectIndex) => (
                  <div
                    key={subjectIndex}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">{subject.name}</div>
                      <div className="flex items-center space-x-4 mt-1">
                        {subject.score && <span className="text-[#7b1e7a] font-medium text-sm">{subject.score}</span>}
                        {subject.grade && <span className="text-gray-600 text-sm">{subject.grade}</span>}
                        {subject.percentage && (
                          <span className="text-[#7b1e7a] font-medium text-sm">{subject.percentage}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleWrongAnswersClick}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        오답보기
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Status Indicator */}
        <div className="mt-8 text-right">
          <span className="text-[#7b1e7a] text-sm font-medium">전체 상태 ●</span>
        </div>
      </div>
    </div>
  )
}
