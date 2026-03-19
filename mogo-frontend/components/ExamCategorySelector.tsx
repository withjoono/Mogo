"use client"

import { useState, useEffect } from "react"

export type ExamCategory = "official" | "private" | "teacher" | "school"

interface CategoryOption {
    id: ExamCategory
    label: string
    icon: string
    active: boolean
    description: string
}

const CATEGORIES: CategoryOption[] = [
    {
        id: "official",
        label: "공식 모의고사",
        icon: "🏛️",
        active: true,
        description: "교육청 · 평가원 · 수능",
    },
    {
        id: "private",
        label: "사설 모의고사",
        icon: "📚",
        active: false,
        description: "메가스터디 · 대성 · 이투스",
    },
    {
        id: "teacher",
        label: "선생님 테스트",
        icon: "👨‍🏫",
        active: false,
        description: "담당 선생님 출제 시험",
    },
]

const STORAGE_KEY = "examhub_selected_category"

interface ExamCategorySelectorProps {
    onCategoryChange?: (category: ExamCategory) => void
    selectedCategory?: ExamCategory
}

export function ExamCategorySelector({
    onCategoryChange,
    selectedCategory: controlledCategory,
}: ExamCategorySelectorProps) {
    const [selected, setSelected] = useState<ExamCategory>("official")

    useEffect(() => {
        if (controlledCategory) {
            setSelected(controlledCategory)
            return
        }
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && CATEGORIES.some((c) => c.id === stored)) {
            setSelected(stored as ExamCategory)
        }
    }, [controlledCategory])

    const handleSelect = (cat: CategoryOption) => {
        if (!cat.active) return
        setSelected(cat.id)
        localStorage.setItem(STORAGE_KEY, cat.id)
        onCategoryChange?.(cat.id)
    }

    const currentCategory = CATEGORIES.find((c) => c.id === selected)
    const isComingSoon = currentCategory && !currentCategory.active

    return (
        <div>
            {/* 카테고리 탭 바 */}
            <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleSelect(cat)}
                        className={`
              relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold
              transition-all duration-200
              ${selected === cat.id
                                ? "bg-[#7b1e7a] text-white shadow-lg shadow-purple-200/50"
                                : cat.active
                                    ? "bg-white text-gray-600 border border-gray-200 hover:border-[#7b1e7a] hover:text-[#7b1e7a]"
                                    : "bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed"
                            }
            `}
                    >
                        <span className="text-lg">{cat.icon}</span>
                        <div className="text-left">
                            <div className="flex items-center gap-1.5">
                                {cat.label}
                                {!cat.active && (
                                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[10px] rounded-full font-medium">
                                        준비중
                                    </span>
                                )}
                            </div>
                            <div
                                className={`text-[11px] font-normal ${selected === cat.id ? "text-white/70" : "text-gray-400"
                                    }`}
                            >
                                {cat.description}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* 준비 중 카테고리 선택 시 안내 */}
            {isComingSoon && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8 text-center mb-6">
                    <div className="text-5xl mb-4">{currentCategory.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {currentCategory.label}
                    </h3>
                    <p className="text-gray-500 mb-4">{currentCategory.description}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-500">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        서비스 준비 중입니다. 곧 만나보실 수 있습니다!
                    </div>
                </div>
            )}
        </div>
    )
}

/**
 * 현재 선택된 카테고리가 활성 상태인지 확인하는 훅
 */
export function useExamCategory() {
    const [category, setCategory] = useState<ExamCategory>("official")

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ExamCategory
        if (stored && CATEGORIES.some((c) => c.id === stored)) {
            setCategory(stored)
        }
    }, [])

    const isActive = CATEGORIES.find((c) => c.id === category)?.active ?? false

    return { category, setCategory, isActive }
}
