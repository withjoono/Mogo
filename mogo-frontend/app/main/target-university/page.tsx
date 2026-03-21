"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TargetUniversityPage() {
  // Sample data for the chart
  const chartData = [
    { period: "정영학부", grape: 7, blue: 8 },
    { period: "정영학부", grape: 6, blue: 7 },
    { period: "정영학부", grape: 9, blue: 8 },
    { period: "정영학부", grape: 9, blue: 6 },
    { period: "정영학부", grape: 7, blue: 9 },
    { period: "정영학부", grape: 6, blue: 7 },
    { period: "정영학부", grape: 9, blue: 9 },
    { period: "정영학부", grape: 8, blue: 5 },
    { period: "정영학부", grape: 8, blue: 7 },
    { period: "정영학부", grape: 7, blue: 8 },
    { period: "정영학부", grape: 6, blue: 8 },
    { period: "정영학부", grape: 8, blue: 7 },
  ]

  const maxValue = 10
  const chartHeight = 300

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span>홈</span>
          <span>{">"}</span>
          <span>모의고사</span>
          <span>{">"}</span>
          <span className="text-gray-900 font-medium">목표대학</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">목표대학</h1>

        {/* Subtitle with emoji */}
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-xl font-semibold text-gray-800">목표대학 등급컷</h2>
          <span className="text-2xl">💯</span>
        </div>

        {/* University Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">경희대</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart Container */}
            <div className="bg-white p-6 rounded-lg">
              <div className="relative" style={{ height: `${chartHeight}px`, width: "100%" }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-4">
                  <span>1등급</span>
                  <span>2등급</span>
                  <span>3등급</span>
                  <span>4등급</span>
                  <span>5등급</span>
                  <span>6등급</span>
                  <span>7등급</span>
                  <span>8등급</span>
                  <span>9등급</span>
                </div>

                {/* Chart area */}
                <div className="ml-12 relative h-full">
                  <svg width="100%" height="100%" className="overflow-visible">
                    {/* Grid lines */}
                    {[...Array(9)].map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * (chartHeight / 8)}
                        x2="100%"
                        y2={i * (chartHeight / 8)}
                        stroke="#f3f4f6"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Orange line */}
                    <polyline
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      points={chartData
                        .map((point, index) => {
                          const x = (index / (chartData.length - 1)) * 100
                          const y = ((maxValue - point.grape) / maxValue) * 100
                          return `${x}%,${y}%`
                        })
                        .join(" ")}
                    />

                    {/* Blue line */}
                    <polyline
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      points={chartData
                        .map((point, index) => {
                          const x = (index / (chartData.length - 1)) * 100
                          const y = ((maxValue - point.blue) / maxValue) * 100
                          return `${x}%,${y}%`
                        })
                        .join(" ")}
                    />

                    {/* Orange dots */}
                    {chartData.map((point, index) => {
                      const x = (index / (chartData.length - 1)) * 100
                      const y = ((maxValue - point.grape) / maxValue) * 100
                      return (
                        <circle
                          key={`grape-${index}`}
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="4"
                          fill="#f97316"
                          stroke="white"
                          strokeWidth="2"
                        />
                      )
                    })}

                    {/* Blue dots */}
                    {chartData.map((point, index) => {
                      const x = (index / (chartData.length - 1)) * 100
                      const y = ((maxValue - point.blue) / maxValue) * 100
                      return (
                        <circle
                          key={`blue-${index}`}
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r="4"
                          fill="#3b82f6"
                          stroke="white"
                          strokeWidth="2"
                        />
                      )
                    })}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-gray-500 mt-4">
                  {chartData.map((point, index) => (
                    <span key={index} className="transform -rotate-45 origin-top-left">
                      {point.period}
                    </span>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-[#00e5e8]"></div>
                  <span className="text-sm text-gray-600">수시</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500"></div>
                  <span className="text-sm text-gray-600">정시</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-6">
              <Link href="/main/target-university/settings">
                <Button className="bg-[#00e5e8] hover:bg-[#00b8bb] text-white px-6 py-2 rounded-lg">
                  목표대학 설정하기 →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Information Note */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            • 목표대학 등급컷은 내 등급 비교로 모의고사 &gt; 목표대학 &gt; 전공예측에서 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
