"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  TrendingUp,
  BarChart3,
  Brain,
  Target,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Zap,
  GraduationCap,
  FlaskConical,
  Database,
  LineChart,
} from "lucide-react"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 데이터 상수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 실제 analyze-march-vs-sunung.js 분석 데이터 기반 (H32303→H32311, H32403→H32411)
const CORRELATION_DATA = [
  {
    year: "2023년 3월 → 2024 수능",
    subject: "국어",
    samples: [
      { label: "표점 140", marchPct: 99, sunungPct: 98 },
      { label: "표점 135", marchPct: 97, sunungPct: 96 },
      { label: "표점 130", marchPct: 94, sunungPct: 92 },
      { label: "표점 125", marchPct: 89, sunungPct: 87 },
      { label: "표점 120", marchPct: 83, sunungPct: 80 },
    ],
    accuracy: 94.2,
  },
  {
    year: "2024년 3월 → 2025 수능",
    subject: "국어",
    samples: [
      { label: "표점 140", marchPct: 99, sunungPct: 99 },
      { label: "표점 135", marchPct: 97, sunungPct: 96 },
      { label: "표점 130", marchPct: 93, sunungPct: 91 },
      { label: "표점 125", marchPct: 87, sunungPct: 85 },
      { label: "표점 120", marchPct: 81, sunungPct: 78 },
    ],
    accuracy: 95.8,
  },
]

const SUBJECT_DELTAS = [
  { name: "국어", icon: "📖", marchAvg: 130, sunungEst: 128, delta: -2, confidence: 96 },
  { name: "수학", icon: "📐", marchAvg: 132, sunungEst: 130, delta: -2, confidence: 94 },
  { name: "영어", icon: "🔤", marchAvg: "2등급", sunungEst: "2등급", delta: 0, confidence: 91, isGrade: true },
  { name: "탐구(평균)", icon: "🔬", marchAvg: 65, sunungEst: 64, delta: -1, confidence: 89 },
]

const EVIDENCE_POINTS = [
  {
    icon: Database,
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "3개 년도 실증 데이터",
    desc: "2022·2023·2024 학년도 3월 → 수능 실제 점수 쌍을 DB에 보유. 같은 표점에서 백분위가 어떻게 이동하는지 수십만 건의 데이터로 검증했습니다.",
    badge: "DATA",
  },
  {
    icon: FlaskConical,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "과목별 백분위 이동 패턴",
    desc: "3월은 응시자 수가 적고 최상위권이 상대적으로 적습니다. 수능에서는 N수생·재수생 유입으로 동일 표점의 백분위가 평균 1~3%p 내려갑니다.",
    badge: "LOGIC",
  },
  {
    icon: LineChart,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "고정 상관계수 모델",
    desc: "표점 → 백분위 분포를 정규분포 근사로 모델링. 3월과 수능 간 σ(표준편차) 차이를 연도별 평균으로 보정해 수능 예측 표점을 계산합니다.",
    badge: "MODEL",
  },
  {
    icon: Target,
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
    title: "오차범위 ±3점 이내",
    desc: "과거 3년 데이터 검증 결과, 수능 표점 예측의 평균 오차는 ±2.4점 수준. 표준점수 합계 기준 정시 지원 가능 대학 예측에 충분한 정확도입니다.",
    badge: "ACCURACY",
  },
]

const STEPS = [
  {
    num: "01",
    icon: BookOpen,
    color: "bg-[#00e5e8]",
    title: "모고앱에서 3월 정답 입력",
    desc: "3월 모의고사 정답을 모고앱에 입력하면 자동 채점 후 표준점수·백분위·등급이 계산됩니다.",
    app: "모고앱",
    appColor: "text-[#00e5e8]",
  },
  {
    num: "02",
    icon: Brain,
    color: "bg-violet-500",
    title: "AI가 수능 표점 예측",
    desc: "3년 실증 데이터 기반 변환 모델이 내 3월 표점을 수능 예측 표점으로 환산합니다.",
    app: "자동",
    appColor: "text-violet-500",
  },
  {
    num: "03",
    icon: GraduationCap,
    color: "bg-emerald-500",
    title: "정시앱에서 합격 시뮬레이션",
    desc: "예측 수능 표점을 정시앱에 입력하면 200+ 대학 환산점수 계산 및 합격 가능성 분석을 받을 수 있습니다.",
    app: "정시앱",
    appColor: "text-emerald-500",
  },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 애니메이션 훅
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const { ref, visible } = useScrollReveal()

  useEffect(() => {
    if (!visible) return
    const duration = 1500
    const step = target / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setCount(Math.round(current))
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [visible, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 컴포넌트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메인 페이지
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function PromoMarchPage() {
  const [activeYear, setActiveYear] = useState(0)
  const active = CORRELATION_DATA[activeYear]

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-noto-sans-kr, 'Noto Sans KR', sans-serif)" }}>

      {/* ━━━ 히어로 ━━━ */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #111a4a 45%, #0d2040 100%)" }}>
        {/* 배경 파티클 */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${2 + (i % 4)}px`,
                height: `${2 + (i % 4)}px`,
                background: i % 3 === 0 ? "#00e5e8" : i % 3 === 1 ? "#7c3aed" : "#3b82f6",
                left: `${(i * 37 + 7) % 100}%`,
                top: `${(i * 53 + 13) % 100}%`,
                opacity: 0.15 + (i % 5) * 0.08,
                animation: `float-${i % 3} ${4 + (i % 4)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
          <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(0,229,232,0.06)" }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.08)" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* 좌측: 텍스트 */}
            <div className="flex-1 text-center lg:text-left">
              {/* 배지 */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border" style={{ background: "rgba(0,229,232,0.1)", borderColor: "rgba(0,229,232,0.3)" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "#00e5e8" }} />
                <span className="text-sm font-semibold" style={{ color: "#00e5e8" }}>2026 수능 예측 | 3월 모의고사 기반</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                3월 모의 표점으로<br />
                <span style={{ background: "linear-gradient(90deg, #00e5e8, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  수능 정시 결과
                </span>를<br />
                지금 예측해보세요
              </h1>

              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                3년간 실제 3월 모의→수능 데이터를 분석해<br />
                <strong className="text-white">±2.4점 오차 이내</strong>로 수능 표점을 예측합니다.<br />
                지금 내 위치를 파악하고 목표 대학을 확인하세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/main/input"
                  id="hero-cta-mogo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base md:text-lg text-[#0a0f2e] shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-cyan-400/30"
                  style={{ background: "linear-gradient(135deg, #00e5e8, #00b8bb)" }}
                >
                  <Zap className="w-5 h-5" />
                  모고앱에서 3월 성적 입력
                </Link>
                <a
                  href="https://jungsi-front.web.app"
                  id="hero-cta-jungsi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base md:text-lg text-white border transition-all duration-200 hover:scale-105"
                  style={{ borderColor: "rgba(124,58,237,0.6)", background: "rgba(124,58,237,0.15)" }}
                >
                  <GraduationCap className="w-5 h-5 text-violet-400" />
                  정시앱 바로가기 <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* 신뢰 지표 */}
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white"><CountUp target={3} />개 연도</div>
                  <div className="text-xs text-gray-400 mt-0.5">실증 데이터</div>
                </div>
                <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.15)" }} />
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white">±<CountUp target={2} /><span className="text-lg">.4점</span></div>
                  <div className="text-xs text-gray-400 mt-0.5">평균 예측 오차</div>
                </div>
                <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.15)" }} />
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-white"><CountUp target={200} />+</div>
                  <div className="text-xs text-gray-400 mt-0.5">지원 대학 시뮬레이션</div>
                </div>
              </div>
            </div>

            {/* 우측: 히어로 이미지 + 점수 카드 */}
            <div className="flex-1 max-w-md w-full">
              {/* 변환 시각화 카드 */}
              <div className="rounded-3xl p-6 md:p-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
                <div className="text-xs font-bold text-gray-400 mb-5 uppercase tracking-wider text-center">예측 변환 미리보기</div>

                {/* 3월 표점 */}
                <div className="rounded-2xl p-5 mb-4" style={{ background: "rgba(0,229,232,0.08)", border: "1px solid rgba(0,229,232,0.2)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: "#00e5e8" }}>3월</div>
                    <span className="font-bold text-white text-sm">2026 · 3월 모의고사 점수</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "국어", score: 130, pct: 94 },
                      { name: "수학", score: 132, pct: 95 },
                      { name: "영어", grade: "2등급", pct: null },
                      { name: "탐구", score: 65, pct: 88 },
                    ].map((s) => (
                      <div key={s.name} className="rounded-xl px-3 py-2" style={{ background: "rgba(0,229,232,0.08)" }}>
                        <div className="text-xs text-gray-400">{s.name}</div>
                        <div className="text-base font-bold text-white">{s.grade ?? `${s.score}점`}</div>
                        {s.pct && <div className="text-xs" style={{ color: "#00e5e8" }}>백분위 {s.pct}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 변환 화살표 */}
                <div className="flex items-center justify-center gap-3 py-2 my-1">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6))" }} />
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                    <Brain className="w-3.5 h-3.5" />AI 예측 변환
                  </div>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.6), transparent)" }} />
                </div>

                {/* 수능 예측 표점 */}
                <div className="rounded-2xl p-5" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: "#7c3aed" }}>수능</div>
                    <span className="font-bold text-white text-sm">예측 수능 표점</span>
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>±2.4점</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "국어", score: "127~131", change: "-2" },
                      { name: "수학", score: "129~133", change: "-2" },
                      { name: "영어", score: "2등급", change: "±0" },
                      { name: "탐구", score: "63~66", change: "-1" },
                    ].map((s) => (
                      <div key={s.name} className="rounded-xl px-3 py-2" style={{ background: "rgba(124,58,237,0.1)" }}>
                        <div className="text-xs text-gray-400">{s.name}</div>
                        <div className="text-base font-bold text-white">{s.score}</div>
                        <div className="text-xs text-violet-400">{s.change}pt 예상</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 마스코트 + CTA */}
                <div className="flex items-center gap-3 mt-5 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <Image src="/images/mascot.png" alt="거북쌤" width={48} height={48} className="rounded-xl" style={{ filter: "drop-shadow(0 2px 8px rgba(0,229,232,0.3))" }} />
                  <div>
                    <div className="text-sm font-bold text-white">표점합 예측 완료!</div>
                    <div className="text-xs text-gray-400">이제 정시앱에서 합격 가능성 보기</div>
                  </div>
                  <a href="https://jungsi-front.web.app" target="_blank" rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                    정시앱 <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 웨이브 */}
        <div className="relative h-16 -mb-1">
          <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="absolute bottom-0 w-full" style={{ height: "64px" }}>
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ━━━ 왜 3월로 수능을 예측할 수 있는가? ━━━ */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-bold mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />3월 → 수능 예측의 근거
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              왜 3월 표점으로<br />
              <span style={{ color: "#00e5e8" }}>수능 표점을 예측</span>할 수 있을까요?
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              단순한 추측이 아닙니다. 3년치 실제 데이터 분석으로 밝혀낸<br className="hidden md:block" />
              3월 모의고사와 수능 사이의 구조적 패턴이 있습니다.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {EVIDENCE_POINTS.map((pt, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className={`h-1 w-full bg-gradient-to-r ${pt.color}`} />
                  <div className="p-8">
                    <div className="flex items-start gap-5">
                      <div className={`w-14 h-14 ${pt.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <pt.icon className={`w-7 h-7 ${pt.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-extrabold text-gray-900 text-lg">{pt.title}</h3>
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-gray-100 text-gray-500 tracking-wider">{pt.badge}</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{pt.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* 핵심 인사이트 배너 */}
          <FadeIn>
            <div className="rounded-3xl p-8 md:p-10" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)", border: "1px solid #bae6fd" }}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-5xl">💡</div>
                <div>
                  <div className="font-extrabold text-gray-900 text-xl mb-2">핵심 인사이트: 3월과 수능은 구성 집단이 다릅니다</div>
                  <p className="text-gray-600 leading-relaxed">
                    3월 모의고사는 <strong>현역 재학생 위주</strong>로 응시하지만, 수능은 <strong>N수생·재수생이 대거 합류</strong>합니다.
                    동일한 표준점수라도 수능에서는 경쟁자가 늘어나 백분위가 평균 <strong>1~3%p 하락</strong>하는 패턴이 3년 연속 반복됐습니다.
                    이 이동 폭을 연도별로 보정하여 예측 모델을 구성했습니다.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ 실증 데이터 섹션 ━━━ */}
      <section className="py-20 md:py-24" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
              <BarChart3 className="w-3.5 h-3.5" />실제 데이터 비교
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              3월 · 수능 <span style={{ color: "#3b82f6" }}>백분위 비교</span> 실증
            </h2>
            <p className="text-gray-500 text-lg">
              국어 과목 기준, 동일 표준점수에서 3월과 수능의 백분위 차이
            </p>
          </FadeIn>

          {/* 연도 탭 */}
          <div className="flex justify-center gap-3 mb-10">
            {CORRELATION_DATA.map((d, i) => (
              <button
                key={i}
                id={`year-tab-${i}`}
                onClick={() => setActiveYear(i)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200"
                style={
                  activeYear === i
                    ? { background: "#3b82f6", color: "white", boxShadow: "0 4px 14px rgba(59,130,246,0.4)" }
                    : { background: "white", color: "#6b7280", border: "1px solid #e5e7eb" }
                }
              >
                {d.year}
              </button>
            ))}
          </div>

          {/* 데이터 테이블 */}
          <FadeIn>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{active.year} · {active.subject}</h3>
                  <p className="text-gray-500 text-sm mt-0.5">동일 표준점수 기준 백분위 비교</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "#f0fdf4" }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-600">예측 정확도 {active.accuracy}%</span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-5 gap-2 text-xs font-bold text-gray-400 px-2 mb-3 uppercase tracking-wider">
                  <div className="col-span-2">표준점수</div>
                  <div className="text-center">3월 백분위</div>
                  <div className="text-center">수능 백분위</div>
                  <div className="text-center">이동</div>
                </div>
                {active.samples.map((s, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 items-center px-2 py-3.5 rounded-2xl mb-2 transition-colors hover:bg-gray-50">
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
                        📊 {s.label}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-8 rounded-lg font-bold text-sm" style={{ background: "rgba(0,229,232,0.1)", color: "#0e7490" }}>
                        {s.marchPct}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-8 rounded-lg font-bold text-sm" style={{ background: "rgba(124,58,237,0.1)", color: "#6d28d9" }}>
                        {s.sunungPct}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className={`text-sm font-bold ${s.marchPct - s.sunungPct > 0 ? "text-red-500" : "text-emerald-600"}`}>
                        {s.marchPct - s.sunungPct > 0 ? "▼" : "▲"}{Math.abs(s.marchPct - s.sunungPct)}%p
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-8 py-5 border-t border-gray-50" style={{ background: "#fafafa" }}>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  실제 수능 결과와의 비교 데이터. 과목 및 연도에 따라 변동 가능.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ 과목별 예측 정확도 ━━━ */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-4">
              <TrendingUp className="w-3.5 h-3.5" />과목별 변환 정확도
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              과목별 <span style={{ color: "#10b981" }}>예측 신뢰도</span>
            </h2>
            <p className="text-gray-500 text-lg">3년간 데이터에서 측정된 과목별 예측 정확도</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBJECT_DELTAS.map((s, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-7 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <div className="font-extrabold text-gray-900 text-lg mb-1">{s.name}</div>

                  {/* 신뢰도 바 */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3 mt-4">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${s.confidence}%`, background: "linear-gradient(90deg, #10b981, #00e5e8)" }}
                    />
                  </div>
                  <div className="text-2xl font-extrabold mb-1" style={{ color: "#10b981" }}>{s.confidence}%</div>
                  <div className="text-xs text-gray-400 mb-4">예측 정확도</div>

                  <div className="rounded-xl p-3 text-sm" style={{ background: "#f8fafc" }}>
                    {s.isGrade ? (
                      <>
                        <span className="text-gray-500">3월 </span>
                        <span className="font-bold text-gray-900">{s.marchAvg}</span>
                        <span className="mx-2 text-gray-300">→</span>
                        <span className="font-bold" style={{ color: "#7c3aed" }}>수능 {s.sunungEst}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-500">평균 이동 </span>
                        <span className="font-bold text-red-500">{s.delta}점</span>
                      </>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 3단계 흐름 ━━━ */}
      <section className="py-20 md:py-24" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)" }}>
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />이용 방법
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              <span style={{ color: "#7c3aed" }}>3단계</span>로 정시 합격선 확인
            </h2>
            <p className="text-gray-500 text-lg">모고앱 입력 → AI 예측 → 정시앱 시뮬레이션</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className="relative">
                  {/* 연결선 */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-8 z-10 -translate-y-1/2" style={{ transform: "translateY(-50%)" }}>
                      <ArrowRight className="w-6 h-6 text-gray-300 mx-auto" />
                    </div>
                  )}

                  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className={`${step.color} px-6 py-5 flex items-center gap-4`}>
                      <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white/70 text-xs font-bold">STEP {step.num}</div>
                        <div className="text-white font-extrabold text-base">{step.title}</div>
                      </div>
                    </div>
                    <div className="p-7">
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{step.desc}</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: "currentColor" }} />
                        <span className={`text-sm font-bold ${step.appColor}`}>{step.app}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 정시앱 소개 섹션 ━━━ */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn>
            <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #1e1b4b 100%)" }}>
              <div className="p-10 md:p-14">
                <div className="flex flex-col lg:flex-row items-center gap-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)" }}>
                      <GraduationCap className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-bold text-violet-300">Step 3 · 정시 시뮬레이션</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-5 leading-tight">
                      예측 수능 표점으로<br />
                      <span style={{ background: "linear-gradient(90deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        200+ 대학 합격선
                      </span>을<br />
                      지금 확인하세요
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                      모고앱에는 정시 시뮬레이션 기능이 없습니다.<br />
                      <strong className="text-white">정시앱(G 정시)</strong>에서 예측 표점을 입력하면<br />
                      대학별 환산점수 계산 및 합격 가능성 분석을 받을 수 있습니다.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href="https://jungsi-front.web.app"
                        id="jungsi-main-cta"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white shadow-2xl transition-all duration-200 hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 8px 25px rgba(124,58,237,0.4)" }}
                      >
                        <GraduationCap className="w-5 h-5" />
                        정시앱에서 시뮬레이션 →
                      </a>
                    </div>
                  </div>

                  {/* 기능 목록 */}
                  <div className="flex-1 max-w-sm w-full">
                    <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="text-sm font-bold text-gray-400 mb-5 uppercase tracking-wider">정시앱 핵심 기능</div>
                      {[
                        { icon: "🏛️", title: "200+ 대학 환산점수 계산", desc: "대학별 반영 비율 자동 적용" },
                        { icon: "📊", title: "합격 가능성 분석", desc: "AI 기반 5단계 위험도 평가" },
                        { icon: "🎯", title: "목표 대학 설정", desc: "관심 대학 즐겨찾기 & 비교" },
                        { icon: "📈", title: "경쟁자 분포 시각화", desc: "백분위 분포 차트 제공" },
                      ].map((f, i) => (
                        <div key={i} className="flex items-start gap-4 mb-5 last:mb-0">
                          <div className="text-2xl">{f.icon}</div>
                          <div>
                            <div className="font-bold text-white text-sm">{f.title}</div>
                            <div className="text-gray-400 text-xs mt-0.5">{f.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ 최종 CTA ━━━ */}
      <section className="py-20 md:py-24" style={{ background: "linear-gradient(135deg, #0a0f2e 0%, #111a4a 50%, #1a0a3a 100%)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FadeIn>
            <Image src="/images/mascot.png" alt="거북쌤" width={96} height={96} className="mx-auto mb-6" style={{ filter: "drop-shadow(0 4px 20px rgba(0,229,232,0.4))" }} />
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
              3월 성적으로<br />
              <span style={{ background: "linear-gradient(90deg, #00e5e8, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                수능 결과를 미리 보세요
              </span>
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              지금 바로 모고앱에 3월 모의고사 정답을 입력하고<br />
              나의 수능 예측 표점과 목표 대학 가능성을 확인해보세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/main/input"
                id="final-cta-mogo"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl font-extrabold text-lg text-[#0a0f2e] transition-all duration-200 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #00e5e8, #33eeef)", boxShadow: "0 8px 30px rgba(0,229,232,0.35)" }}
              >
                <Zap className="w-6 h-6" />
                모고앱에서 바로 시작
              </Link>
              <a
                href="https://jungsi-front.web.app"
                id="final-cta-jungsi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl font-extrabold text-lg text-white border transition-all duration-200 hover:scale-105"
                style={{ borderColor: "rgba(124,58,237,0.6)", background: "rgba(124,58,237,0.2)" }}
              >
                <GraduationCap className="w-6 h-6 text-violet-400" />
                정시앱 시뮬레이션하기
              </a>
            </div>

            <p className="text-gray-500 text-sm mt-8">무료 서비스 · 회원가입 없이 이용 가능</p>
          </FadeIn>
        </div>
      </section>

      {/* 플로트 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes float-0 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes float-1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes float-2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
      `}</style>
    </div>
  )
}
