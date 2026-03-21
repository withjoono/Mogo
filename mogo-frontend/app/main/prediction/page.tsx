"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Loader2 } from "lucide-react"
import { useUniversityOptions, useFilteredUniversities } from "@/lib/hooks"

// 대학별 점수 데이터 (더미 - API 연동 전)
const dummyUniversityData = [
  { name: "경희대", minScore: 650, maxScore: 720 },
  { name: "고려대", minScore: 680, maxScore: 750 },
  { name: "서울대", minScore: 720, maxScore: 820 },
  { name: "연세대", minScore: 700, maxScore: 780 },
  { name: "성균관대", minScore: 680, maxScore: 750 },
  { name: "한양대", minScore: 660, maxScore: 740 },
  { name: "중앙대", minScore: 620, maxScore: 700 },
  { name: "경북대", minScore: 600, maxScore: 680 },
  { name: "부산대", minScore: 590, maxScore: 670 },
  { name: "전남대", minScore: 580, maxScore: 660 },
  { name: "충남대", minScore: 570, maxScore: 650 },
  { name: "전북대", minScore: 560, maxScore: 640 },
]

const myScore = 700 // 내 성적 (파란 선) - 실제로는 API에서 조회

export default function MockAnalysisPredictionPage() {
  // API 훅 사용
  const { regions, categories, loading: optionsLoading } = useUniversityOptions()
  const { universities, loading: universitiesLoading, filter } = useFilteredUniversities()
  
  const [selectedRegion, setSelectedRegion] = useState("전체")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedUniversities, setSelectedUniversities] = useState<number[]>([])

  // 필터 변경시 대학 목록 새로고침
  useEffect(() => {
    filter({ region: selectedRegion, category: selectedCategory })
  }, [selectedRegion, selectedCategory])

  const toggleUniversity = (index: number) => {
    setSelectedUniversities((prev) => 
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  // 차트 데이터 생성 (API 데이터 또는 더미 데이터 사용)
  const chartData = universities.length > 0 
    ? universities.slice(0, 12).map((u) => ({
        name: u.shortName || u.name,
        minScore: 600, // 실제로는 입결 데이터에서 계산
        maxScore: 750,
      }))
    : dummyUniversityData

  // 로딩 상태 확인
  const isLoading = optionsLoading || universitiesLoading

  // fallback regions/categories
  const displayRegions = regions.length > 0 ? regions : [
    "전체", "서울", "경기", "인천", "대전", "세종", "충남", "충북",
    "광주", "전남", "전북", "부산", "울산", "경남", "제주",
  ]
  
  const displayCategories = categories.length > 0 ? categories : [
    "전체", "자연", "인문", "예체능", "융합"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            🌳 모의고사 분석 - 대학 예측
          </h1>
          <p className="text-gray-600 mb-4">
            대학별 계산식에 따른 나의 점수를 확인해 보고 대학이 합격하기 쉬운 대학을 찾아보세요.
          </p>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#00e5e8] text-white border-[#00e5e8] hover:bg-[#00b8bb]"
            >
              대학별 합격
            </Button>
            <ChevronRight className="w-4 h-4" />
            <span>학과별 합격</span>
            <ChevronRight className="w-4 h-4" />
            <span>위험도 확인</span>
            <ChevronRight className="w-4 h-4" />
            <span>대학 합격 점수별 비교</span>
          </div>
        </div>

        {/* Region Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-500">🗺️</span>
              <span className="font-medium">지역 선택</span>
              {optionsLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            <div className="flex flex-wrap gap-2">
              {displayRegions.map((region) => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRegion(region)}
                  className={selectedRegion === region ? "bg-[#00e5e8] hover:bg-[#00b8bb]" : ""}
                >
                  {region}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#00e5e8]">🔧</span>
              <span className="font-medium">계열 선택</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-[#00e5e8] hover:bg-[#00b8bb]" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                학교 검색 결과
                {universitiesLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                {universities.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({universities.length}개 대학)
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                ⭐ 차트에서는
                <span className="text-[#00e5e8] font-medium">합격할 대학 비교를</span>
                위해 총점과 점수가
                <span className="text-[#00e5e8] font-medium">1000점으로 통일</span>
                되어 있습니다.
              </p>
            </div>

            {/* University Comparison Chart */}
            <div className="relative h-80 bg-white border rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
                <span>1000</span>
                <span>800</span>
                <span>600</span>
                <span>400</span>
                <span>200</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-8 h-full relative">
                {/* My Score Line */}
                <div
                  className="absolute w-full border-t-2 border-blue-500 z-10"
                  style={{ top: `${100 - (myScore / 1000) * 100}%` }}
                >
                  <span className="bg-blue-500 text-white px-2 py-1 text-xs rounded absolute -top-6 left-0">
                    내 성적
                  </span>
                </div>

                {/* University Bars */}
                <div className="flex items-end justify-between h-full pt-8 pb-12">
                  {chartData.map((university, index) => {
                    const barHeight = ((university.maxScore - university.minScore) / 1000) * 100
                    const barBottom = (university.minScore / 1000) * 100
                    const isSelected = selectedUniversities.includes(index)

                    return (
                      <div key={index} className="flex flex-col items-center relative h-full">
                        {/* Bar */}
                        <div
                          className="relative w-8 cursor-pointer"
                          style={{ height: "100%" }}
                          onClick={() => toggleUniversity(index)}
                        >
                          <div
                            className={`absolute w-full rounded ${
                              isSelected ? "bg-red-600" : "bg-[#00e5e8]"
                            } hover:bg-red-600 transition-colors`}
                            style={{
                              height: `${barHeight}%`,
                              bottom: `${barBottom}%`,
                            }}
                          />
                        </div>

                        {/* University Name and Selector */}
                        <div className="absolute -bottom-8 flex flex-col items-center">
                          <button
                            onClick={() => toggleUniversity(index)}
                            className={`w-4 h-4 rounded-full border-2 mb-1 ${
                              isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"
                            }`}
                          />
                          <span className="text-xs text-gray-600 whitespace-nowrap">{university.name}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex justify-center mt-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-blue-500"></div>
                <span className="text-sm">내 성적</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-[#00e5e8]"></div>
                <span className="text-sm">대학 점수 범위</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Info Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-500">📊</span>
              <span className="font-medium">수험생 정보</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>수험생 정보를 입력하시면 더 정확한 합격 예측을 제공해드립니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
