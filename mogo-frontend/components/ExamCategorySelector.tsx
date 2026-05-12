"use client"

import { useState, useEffect } from "react"

export type ExamCategory = "official" | "private"

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
]

const STORAGE_KEY = "mogo_selected_category"

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
            // teacher 카테고리가 저장된 경우 official로 리셋
            const valid = CATEGORIES.some((c) => c.id === controlledCategory)
            setSelected(valid ? controlledCategory : "official")
            return
        }
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && CATEGORIES.some((c) => c.id === stored)) {
            setSelected(stored as ExamCategory)
        } else if (stored) {
            // 유효하지 않은 카테고리(teacher 등) 리셋
            localStorage.setItem(STORAGE_KEY, "official")
            setSelected("official")
        }
    }, [controlledCategory])

    const handleSelect = (cat: CategoryOption) => {
        if (!cat.active) return
        setSelected(cat.id)
        localStorage.setItem(STORAGE_KEY, cat.id)
        onCategoryChange?.(cat.id)
    }

    return (
        <div className="mb-6">
            {/* 탭 바 */}
            <div className="flex rounded-2xl bg-gray-100 p-1.5 gap-1.5">
                {CATEGORIES.map((cat) => {
                    const isSelected = selected === cat.id
                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleSelect(cat)}
                            disabled={!cat.active}
                            className={`
                                flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl
                                text-sm font-semibold transition-all duration-200
                                ${isSelected
                                    ? "bg-white text-[#00b8bb] shadow-md shadow-gray-200/60"
                                    : cat.active
                                        ? "text-gray-500 hover:text-gray-700 hover:bg-white/60"
                                        : "text-gray-400 cursor-not-allowed"
                                }
                            `}
                        >
                            <span className="text-base">{cat.icon}</span>
                            <span className="flex items-center gap-1.5">
                                {cat.label}
                                {!cat.active && (
                                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-400 text-[10px] rounded-full font-medium">
                                        준비중
                                    </span>
                                )}
                            </span>
                            {isSelected && (
                                <span className="hidden sm:block text-[11px] text-[#00b8bb]/60 font-normal">
                                    {cat.description}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* 사설 모의고사 준비중 안내 */}
            {selected === "private" && (
                <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8 text-center">
                    <div className="text-5xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">사설 모의고사</h3>
                    <p className="text-gray-500 mb-4">메가스터디 · 대성 · 이투스</p>
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
        } else if (stored) {
            // 유효하지 않은 카테고리 리셋
            localStorage.setItem(STORAGE_KEY, "official")
            setCategory("official")
        }
    }, [])

    const isActive = CATEGORIES.find((c) => c.id === category)?.active ?? false

    return { category, setCategory, isActive }
}
