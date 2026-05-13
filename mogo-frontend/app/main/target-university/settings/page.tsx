"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import { joinStudyGroupAutomatically } from "@/lib/api/hub-client"
import { getUser, type User } from "@/lib/auth/user"
import { Search, X, ChevronRight, Check, Loader2 } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

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
    university?: { id: number; name: string; region: string }
}

type TabType = "university" | "major"

// ── Autocomplete Combobox ─────────────────────────────────────────────────────

function Combobox<T extends { id: number }>({
    value,
    placeholder,
    onSearch,
    renderItem,
    onSelect,
    displayValue,
    onClear,
    loading,
}: {
    value: T | null
    placeholder: string
    onSearch: (q: string) => Promise<T[]>
    renderItem: (item: T) => React.ReactNode
    onSelect: (item: T) => void
    displayValue: (item: T) => string
    onClear: () => void
    loading?: boolean
}) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<T[]>([])
    const [open, setOpen] = useState(false)
    const [searching, setSearching] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (value) setQuery(displayValue(value))
    }, [value, displayValue])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value
        setQuery(q)
        onClear()
        setResults([])
        if (timerRef.current) clearTimeout(timerRef.current)
        if (q.trim().length === 0) { setOpen(false); return }
        timerRef.current = setTimeout(async () => {
            setSearching(true)
            try {
                const data = await onSearch(q.trim())
                setResults(data || [])
                setOpen(true)
            } catch { setResults([]) }
            setSearching(false)
        }, 250)
    }

    const handleSelect = (item: T) => {
        onSelect(item)
        setQuery(displayValue(item))
        setOpen(false)
        setResults([])
    }

    const handleClear = () => {
        setQuery("")
        setResults([])
        setOpen(false)
        onClear()
    }

    return (
        <div ref={containerRef} className="relative">
            <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => { if (results.length > 0) setOpen(true) }}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-8 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 bg-white transition-all"
                />
                <div className="absolute right-3 flex items-center gap-1">
                    {(searching || loading) && (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    )}
                    {query && !searching && (
                        <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {open && results.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                    {results.map((item) => (
                        <button
                            key={item.id}
                            onMouseDown={(e) => { e.preventDefault(); handleSelect(item) }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-cyan-50 transition-colors border-b border-gray-50 last:border-b-0"
                        >
                            {renderItem(item)}
                        </button>
                    ))}
                </div>
            )}
            {open && !searching && query.trim().length > 0 && results.length === 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1.5 rounded-xl border border-gray-200 bg-white shadow-xl px-4 py-3 text-sm text-gray-400">
                    검색 결과가 없습니다.
                </div>
            )}
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TargetUniversitySettingsPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>("university")
    const [isSaving, setIsSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // ── 목표 대학 tab ──
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
    const [departments, setDepartments] = useState<Department[]>([])
    const [deptFilter, setDeptFilter] = useState("")
    const [loadingDepts, setLoadingDepts] = useState(false)
    const [selectedDeptIds, setSelectedDeptIds] = useState<Set<number>>(new Set())

    // ── 계열/학과 tab ──
    const [selectedDepts, setSelectedDepts] = useState<Department[]>([])

    useEffect(() => { getUser().then(setUser) }, [])

    // Load departments when university selected
    useEffect(() => {
        if (!selectedUniversity) { setDepartments([]); return }
        setLoadingDepts(true)
        setDeptFilter("")
        setSelectedDeptIds(new Set())
        api.get<{ departments: Department[] }>(`/api/universities/${selectedUniversity.id}/departments`)
            .then((data) => setDepartments(data?.departments || []))
            .catch(() => setDepartments([]))
            .finally(() => setLoadingDepts(false))
    }, [selectedUniversity])

    // Search university
    const searchUniversities = useCallback(async (q: string) => {
        return await api.get<University[]>("/api/universities/search", { q }) || []
    }, [])

    // Search departments
    const searchDepartments = useCallback(async (q: string) => {
        return await api.get<Department[]>("/api/universities/departments/search", { q }) || []
    }, [])

    const toggleDept = useCallback((id: number) => {
        setSelectedDeptIds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }, [])

    const filteredDepts = deptFilter.trim()
        ? departments.filter((d) =>
            d.name.includes(deptFilter) ||
            (d.category ?? "").includes(deptFilter) ||
            (d.subCategory ?? "").includes(deptFilter)
        )
        : departments

    const addMajorDept = useCallback((dept: Department) => {
        setSelectedDepts((prev) =>
            prev.some((d) => d.id === dept.id) ? prev : [...prev, dept]
        )
    }, [])

    const removeMajorDept = useCallback((id: number) => {
        setSelectedDepts((prev) => prev.filter((d) => d.id !== id))
    }, [])

    // Save
    const saveTargets = async (deptIds: number[], deptList: Department[]) => {
        if (!user) { alert("로그인이 필요합니다."); return }
        if (deptIds.length === 0) { alert("선택된 모집단위가 없습니다."); return }
        setIsSaving(true)
        setSaveMessage(null)
        let ok = 0, fail = 0, firstName = ""
        for (const departmentId of deptIds) {
            try {
                await api.post("/api/targets", { studentId: user.id, departmentId, priority: 1 })
                ok++
                if (ok === 1) {
                    const dept = deptList.find((d) => d.id === departmentId)
                    if (dept) {
                        const uniName = dept.university?.name ?? selectedUniversity?.name ?? ""
                        firstName = `${uniName} ${dept.name}`.trim()
                    }
                }
            } catch { fail++ }
        }
        if (ok > 0 && firstName) await joinStudyGroupAutomatically("jungsi", (user as User & { grade?: string }).grade ?? "H3", firstName)
        setIsSaving(false)
        setSaveMessage(
            fail === 0
                ? { type: "success", text: `${ok}개 목표 대학이 등록되었습니다!` }
                : { type: "error", text: `${ok}개 성공, ${fail}개 실패 (이미 등록되었거나 최대 개수 초과)` }
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="px-6 py-8" style={{ background: "linear-gradient(135deg, #00e5e8 0%, #9b30a0 50%, #b850b0 100%)" }}>
                <div className="mx-auto max-w-3xl">
                    <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-white/80 hover:text-white">
                        ← 뒤로가기
                    </button>
                    <h1 className="text-2xl font-bold text-white">🎯 목표 대학 설정</h1>
                    <p className="mt-1 text-sm text-white/80">대학명 또는 계열/학과명으로 검색하여 목표 대학을 설정하세요.</p>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 py-6 -mt-4">
                {/* Tabs */}
                <div className="flex rounded-xl bg-white shadow-sm border overflow-hidden mb-6">
                    {(["university", "major"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 ${activeTab === t ? "text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                            style={activeTab === t ? { backgroundColor: "#00e5e8" } : {}}
                        >
                            {t === "university" ? "🏫 목표 대학" : "📚 목표 계열/학과"}
                        </button>
                    ))}
                </div>

                {saveMessage && (
                    <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium flex items-center justify-between ${saveMessage.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                        <span>{saveMessage.text}</span>
                        <button onClick={() => setSaveMessage(null)}><X className="w-4 h-4" /></button>
                    </div>
                )}

                {/* ── Tab 1: 목표 대학 ── */}
                {activeTab === "university" && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border p-5">
                            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Search className="w-4 h-4 text-cyan-500" /> 대학 검색
                            </p>
                            <Combobox<University>
                                value={selectedUniversity}
                                placeholder="대학명을 입력하세요 (예: 서울대, 연세대, 고려대)"
                                onSearch={searchUniversities}
                                renderItem={(uni) => (
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-800">{uni.name}</span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{uni.region}</span>
                                    </div>
                                )}
                                onSelect={(uni) => setSelectedUniversity(uni)}
                                displayValue={(uni) => uni.name}
                                onClear={() => setSelectedUniversity(null)}
                                loading={loadingDepts}
                            />
                            {selectedUniversity && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1.5 rounded-full text-sm font-medium">
                                        {selectedUniversity.name}
                                        <span className="text-xs text-cyan-400">{selectedUniversity.region}</span>
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">학과/모집단위 선택</span>
                                </div>
                            )}
                        </div>

                        {selectedUniversity && (
                            <div className="bg-white rounded-2xl shadow-sm border p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-gray-700">
                                        모집단위 선택
                                        <span className="ml-2 text-xs text-gray-400 font-normal">
                                            {selectedDeptIds.size}개 선택 / 총 {departments.length}개
                                        </span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedDeptIds(selectedDeptIds.size === filteredDepts.length ? new Set() : new Set(filteredDepts.map((d) => d.id)))}
                                            className="text-xs text-cyan-600 hover:text-cyan-800 px-2 py-1 rounded-lg hover:bg-cyan-50 transition-colors"
                                        >
                                            {selectedDeptIds.size === filteredDepts.length && filteredDepts.length > 0 ? "전체 해제" : "전체 선택"}
                                        </button>
                                    </div>
                                </div>

                                {/* Filter within university */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="학과명, 계열로 필터..."
                                        value={deptFilter}
                                        onChange={(e) => setDeptFilter(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-200 bg-gray-50"
                                    />
                                    {deptFilter && (
                                        <button onClick={() => setDeptFilter("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {loadingDepts ? (
                                    <div className="py-8 flex items-center justify-center gap-2 text-gray-400 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" /> 불러오는 중...
                                    </div>
                                ) : filteredDepts.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 text-sm">
                                        {deptFilter ? "필터 조건에 맞는 학과가 없습니다." : "등록된 학과가 없습니다."}
                                    </div>
                                ) : (
                                    <div className="max-h-96 overflow-y-auto space-y-1 pr-1">
                                        {filteredDepts.map((dept) => {
                                            const selected = selectedDeptIds.has(dept.id)
                                            return (
                                                <button
                                                    key={dept.id}
                                                    onClick={() => toggleDept(dept.id)}
                                                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all ${selected ? "bg-cyan-50 border border-cyan-200" : "border border-transparent hover:bg-gray-50"}`}
                                                >
                                                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 transition-all ${selected ? "text-white" : "border-2 border-gray-300"}`}
                                                        style={selected ? { backgroundColor: "#00e5e8" } : {}}>
                                                        {selected && <Check className="w-3 h-3" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-800 truncate">{dept.name}</div>
                                                        <div className="text-xs text-gray-400 flex gap-1.5 mt-0.5 flex-wrap">
                                                            {dept.category && <span>{dept.category}</span>}
                                                            {dept.subCategory && <span>· {dept.subCategory}</span>}
                                                            {dept.admissionType && <span className="text-cyan-500">· {dept.admissionType}</span>}
                                                        </div>
                                                    </div>
                                                    {dept.quota && (
                                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{dept.quota}명</span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedDeptIds.size > 0 && (
                            <div className="flex justify-center pt-2">
                                <button
                                    onClick={() => saveTargets([...selectedDeptIds], departments)}
                                    disabled={isSaving}
                                    className="px-8 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-50"
                                    style={{ backgroundColor: "#00e5e8" }}
                                >
                                    {isSaving ? "저장 중..." : `${selectedDeptIds.size}개 목표 등록`}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab 2: 계열/학과 ── */}
                {activeTab === "major" && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border p-5">
                            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Search className="w-4 h-4 text-cyan-500" /> 계열/학과 검색
                            </p>
                            <Combobox<Department>
                                value={null}
                                placeholder="계열 또는 학과명 입력 (예: 의예과, 컴퓨터, 간호)"
                                onSearch={searchDepartments}
                                renderItem={(dept) => (
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            {dept.university?.name && (
                                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">{dept.university.name}</span>
                                            )}
                                            <span className="font-medium text-gray-800">{dept.name}</span>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5 flex gap-1.5">
                                            {dept.university?.region && <span>{dept.university.region}</span>}
                                            {dept.category && <span>· {dept.category}</span>}
                                            {dept.subCategory && <span>· {dept.subCategory}</span>}
                                            {dept.admissionType && <span className="text-cyan-500">· {dept.admissionType}</span>}
                                        </div>
                                    </div>
                                )}
                                onSelect={addMajorDept}
                                displayValue={() => ""}
                                onClear={() => {}}
                            />
                            <p className="text-xs text-gray-400 mt-2">검색 후 학과를 클릭하면 아래 목록에 추가됩니다.</p>
                        </div>

                        {/* Selected departments */}
                        {selectedDepts.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border p-5">
                                <p className="text-sm font-semibold text-gray-700 mb-3">
                                    선택된 목표
                                    <span className="ml-2 text-xs text-gray-400 font-normal">{selectedDepts.length}개</span>
                                </p>
                                <div className="space-y-2">
                                    {selectedDepts.map((dept) => (
                                        <div key={dept.id} className="flex items-center justify-between bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-2.5">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    {dept.university?.name && (
                                                        <span className="text-xs text-gray-400">[{dept.university.name}]</span>
                                                    )}
                                                    <span className="text-sm font-medium text-gray-800">{dept.name}</span>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5 flex gap-1.5">
                                                    {dept.category && <span>{dept.category}</span>}
                                                    {dept.subCategory && <span>· {dept.subCategory}</span>}
                                                </div>
                                            </div>
                                            <button onClick={() => removeMajorDept(dept.id)} className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={() => saveTargets(selectedDepts.map((d) => d.id), selectedDepts)}
                                        disabled={isSaving}
                                        className="px-8 py-3 text-sm font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl hover:opacity-90 disabled:opacity-50"
                                        style={{ backgroundColor: "#00e5e8" }}
                                    >
                                        {isSaving ? "저장 중..." : `${selectedDepts.length}개 목표 등록`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
