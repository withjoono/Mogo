"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api/client"
import { getUser, type User } from "@/lib/auth/user"

// Types
interface University {
    id: number
    code: string
    name: string
    region: string
}

interface Department {
    id: number
    code: string
    name: string
    category: string | null
    subCategory: string | null
    admissionType: string | null
    quota: number | null
    university?: {
        id: number
        name: string
        region: string
    }
}

interface UniversityWithDepartments {
    university: { id: number; name: string; region: string }
    departments: Department[]
}

type TabType = "university" | "major"

export default function TargetUniversitySettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>("university")
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // Tab 1: University search
    const [uniQuery, setUniQuery] = useState("")
    const [uniResults, setUniResults] = useState<University[]>([])
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
    const [departments, setDepartments] = useState<Department[]>([])
    const [selectedDeptIds, setSelectedDeptIds] = useState<Set<number>>(new Set())

    // Tab 2: Major/Category search
    const [majorQuery, setMajorQuery] = useState("")
    const [majorResults, setMajorResults] = useState<Department[]>([])
    const [selectedMajorDeptIds, setSelectedMajorDeptIds] = useState<Set<number>>(new Set())

    // Init user
    useEffect(() => {
        getUser().then(setUser)
    }, [])

    // Debounced university search
    useEffect(() => {
        if (uniQuery.trim().length < 1) {
            setUniResults([])
            return
        }
        const timer = setTimeout(async () => {
            try {
                const data = await api.get<University[]>("/api/universities/search", { q: uniQuery.trim() })
                setUniResults(data || [])
            } catch { setUniResults([]) }
        }, 300)
        return () => clearTimeout(timer)
    }, [uniQuery])

    // Load departments when a university is selected
    useEffect(() => {
        if (!selectedUniversity) {
            setDepartments([])
            return
        }
        const load = async () => {
            setIsLoading(true)
            try {
                const data = await api.get<UniversityWithDepartments>(`/api/universities/${selectedUniversity.id}/departments`)
                setDepartments(data?.departments || [])
            } catch { setDepartments([]) }
            finally { setIsLoading(false) }
        }
        load()
    }, [selectedUniversity])

    // Debounced major search
    useEffect(() => {
        if (majorQuery.trim().length < 1) {
            setMajorResults([])
            return
        }
        const timer = setTimeout(async () => {
            try {
                const data = await api.get<Department[]>("/api/universities/departments/search", { q: majorQuery.trim() })
                setMajorResults(data || [])
            } catch { setMajorResults([]) }
        }, 300)
        return () => clearTimeout(timer)
    }, [majorQuery])

    // Toggle selection helpers
    const toggleDeptSelection = useCallback((id: number) => {
        setSelectedDeptIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const toggleMajorDeptSelection = useCallback((id: number) => {
        setSelectedMajorDeptIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const selectAllDepts = () => {
        setSelectedDeptIds(new Set(departments.map(d => d.id)))
    }
    const deselectAllDepts = () => setSelectedDeptIds(new Set())

    const selectAllMajorDepts = () => {
        setSelectedMajorDeptIds(new Set(majorResults.map(d => d.id)))
    }
    const deselectAllMajorDepts = () => setSelectedMajorDeptIds(new Set())

    // Save targets
    const saveTargets = async (deptIds: Set<number>) => {
        if (!user) { alert("로그인이 필요합니다."); return }
        if (deptIds.size === 0) { alert("선택된 모집단위가 없습니다."); return }

        setIsSaving(true)
        setSaveMessage(null)
        let successCount = 0
        let failCount = 0

        for (const departmentId of deptIds) {
            try {
                await api.post("/api/targets", {
                    studentId: user.id,
                    departmentId,
                    priority: 1,
                })
                successCount++
            } catch {
                failCount++
            }
        }

        setIsSaving(false)
        if (failCount === 0) {
            setSaveMessage({ type: "success", text: `${successCount}개 목표 대학이 등록되었습니다.` })
        } else {
            setSaveMessage({
                type: "error",
                text: `${successCount}개 성공, ${failCount}개 실패 (이미 등록된 항목 또는 최대 개수 초과)`,
            })
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div
                className="px-6 py-8"
                style={{
                    background: "linear-gradient(135deg, #00e5e8 0%, #9b30a0 50%, #b850b0 100%)",
                }}
            >
                <div className="mx-auto max-w-3xl">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
                    >
                        ← 뒤로가기
                    </button>
                    <h1 className="text-2xl font-bold text-white">🎯 목표 대학 설정</h1>
                    <p className="mt-1 text-sm text-white/80">
                        대학명 또는 계열/학과명으로 검색하여 목표 대학을 설정하세요.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-3xl px-4 py-6 -mt-4">
                {/* Tab Switcher */}
                <div className="flex rounded-xl bg-white shadow-sm border overflow-hidden mb-6">
                    <button
                        onClick={() => setActiveTab("university")}
                        className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 ${activeTab === "university"
                                ? "text-white"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                        style={activeTab === "university" ? { backgroundColor: "#00e5e8" } : {}}
                    >
                        🏫 목표 대학
                    </button>
                    <button
                        onClick={() => setActiveTab("major")}
                        className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 ${activeTab === "major"
                                ? "text-white"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                        style={activeTab === "major" ? { backgroundColor: "#00e5e8" } : {}}
                    >
                        📚 목표 계열/학과
                    </button>
                </div>

                {/* Save Message */}
                {saveMessage && (
                    <div
                        className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${saveMessage.type === "success"
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                    >
                        {saveMessage.text}
                    </div>
                )}

                {/* Tab 1: University Search */}
                {activeTab === "university" && (
                    <div className="space-y-4">
                        <Card className="shadow-sm border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span style={{ color: "#00e5e8" }}>🔍</span> 대학 검색
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    type="text"
                                    placeholder="대학명을 입력하세요 (예: 서울대, 연세대)"
                                    value={uniQuery}
                                    onChange={e => {
                                        setUniQuery(e.target.value)
                                        setSelectedUniversity(null)
                                    }}
                                    className="text-base"
                                />
                                {/* Autocomplete dropdown */}
                                {uniResults.length > 0 && !selectedUniversity && (
                                    <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border bg-white shadow-lg">
                                        {uniResults.map(uni => (
                                            <button
                                                key={uni.id}
                                                onClick={() => {
                                                    setSelectedUniversity(uni)
                                                    setUniQuery(uni.name)
                                                    setUniResults([])
                                                    setSelectedDeptIds(new Set())
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm hover:bg-cyan-50 transition-colors border-b last:border-b-0 flex items-center justify-between"
                                            >
                                                <span className="font-medium">{uni.name}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {uni.region}
                                                </Badge>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Departments list */}
                        {selectedUniversity && (
                            <Card className="shadow-sm border">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span style={{ color: "#00e5e8" }}>📋</span>
                                            {selectedUniversity.name}
                                            <Badge variant="outline" className="text-xs">
                                                {selectedUniversity.region}
                                            </Badge>
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={selectedDeptIds.size === departments.length ? deselectAllDepts : selectAllDepts}
                                                className="text-xs"
                                            >
                                                {selectedDeptIds.size === departments.length ? "전체 해제" : "전체 선택"}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedDeptIds.size}개 선택됨 / 총 {departments.length}개
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="py-8 text-center text-gray-400">불러오는 중...</div>
                                    ) : departments.length === 0 ? (
                                        <div className="py-8 text-center text-gray-400">등록된 학과가 없습니다.</div>
                                    ) : (
                                        <div className="max-h-96 overflow-y-auto space-y-1">
                                            {departments.map(dept => {
                                                const isSelected = selectedDeptIds.has(dept.id)
                                                return (
                                                    <button
                                                        key={dept.id}
                                                        onClick={() => toggleDeptSelection(dept.id)}
                                                        className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-all duration-150 ${isSelected
                                                                ? "bg-cyan-50 border border-cyan-200 shadow-sm"
                                                                : "hover:bg-gray-50 border border-transparent"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`h-5 w-5 rounded flex items-center justify-center shrink-0 transition-colors ${isSelected ? "text-white" : "border-2 border-gray-300"
                                                                }`}
                                                            style={isSelected ? { backgroundColor: "#00e5e8" } : {}}
                                                        >
                                                            {isSelected && <span className="text-xs">✓</span>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{dept.name}</div>
                                                            <div className="text-xs text-gray-400 flex gap-2 mt-0.5">
                                                                {dept.category && <span>{dept.category}</span>}
                                                                {dept.subCategory && <span>· {dept.subCategory}</span>}
                                                                {dept.admissionType && <span>· {dept.admissionType}</span>}
                                                            </div>
                                                        </div>
                                                        {dept.quota && (
                                                            <Badge variant="secondary" className="text-xs shrink-0">
                                                                {dept.quota}명
                                                            </Badge>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Save button */}
                        {selectedDeptIds.size > 0 && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    onClick={() => saveTargets(selectedDeptIds)}
                                    disabled={isSaving}
                                    className="px-8 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl"
                                    style={{ backgroundColor: "#00e5e8" }}
                                >
                                    {isSaving ? "저장 중..." : `${selectedDeptIds.size}개 목표 대학 등록`}
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: Major/Category Search */}
                {activeTab === "major" && (
                    <div className="space-y-4">
                        <Card className="shadow-sm border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span style={{ color: "#00e5e8" }}>🔍</span> 계열/학과 검색
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    type="text"
                                    placeholder="계열 또는 학과명 입력 (예: 의대, 컴퓨터, 간호)"
                                    value={majorQuery}
                                    onChange={e => setMajorQuery(e.target.value)}
                                    className="text-base"
                                />
                                {majorQuery.trim().length > 0 && majorResults.length === 0 && (
                                    <p className="text-xs text-gray-400 mt-2">검색 결과가 없습니다.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Major search results */}
                        {majorResults.length > 0 && (
                            <Card className="shadow-sm border">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span style={{ color: "#00e5e8" }}>📋</span>
                                            검색 결과
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={selectedMajorDeptIds.size === majorResults.length ? deselectAllMajorDepts : selectAllMajorDepts}
                                                className="text-xs"
                                            >
                                                {selectedMajorDeptIds.size === majorResults.length ? "전체 해제" : "전체 선택"}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {selectedMajorDeptIds.size}개 선택됨 / 총 {majorResults.length}개
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-[500px] overflow-y-auto space-y-1">
                                        {majorResults.map(dept => {
                                            const isSelected = selectedMajorDeptIds.has(dept.id)
                                            return (
                                                <button
                                                    key={dept.id}
                                                    onClick={() => toggleMajorDeptSelection(dept.id)}
                                                    className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-all duration-150 ${isSelected
                                                            ? "bg-cyan-50 border border-cyan-200 shadow-sm"
                                                            : "hover:bg-gray-50 border border-transparent"
                                                        }`}
                                                >
                                                    <div
                                                        className={`h-5 w-5 rounded flex items-center justify-center shrink-0 transition-colors ${isSelected ? "text-white" : "border-2 border-gray-300"
                                                            }`}
                                                        style={isSelected ? { backgroundColor: "#00e5e8" } : {}}
                                                    >
                                                        {isSelected && <span className="text-xs">✓</span>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">
                                                            {dept.university?.name && (
                                                                <span className="text-gray-500 mr-1">[{dept.university.name}]</span>
                                                            )}
                                                            {dept.name}
                                                        </div>
                                                        <div className="text-xs text-gray-400 flex gap-2 mt-0.5">
                                                            {dept.university?.region && <span>{dept.university.region}</span>}
                                                            {dept.category && <span>· {dept.category}</span>}
                                                            {dept.subCategory && <span>· {dept.subCategory}</span>}
                                                        </div>
                                                    </div>
                                                    {dept.quota && (
                                                        <Badge variant="secondary" className="text-xs shrink-0">
                                                            {dept.quota}명
                                                        </Badge>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Save button */}
                        {selectedMajorDeptIds.size > 0 && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    onClick={() => saveTargets(selectedMajorDeptIds)}
                                    disabled={isSaving}
                                    className="px-8 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl"
                                    style={{ backgroundColor: "#00e5e8" }}
                                >
                                    {isSaving ? "저장 중..." : `${selectedMajorDeptIds.size}개 목표 대학 등록`}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
