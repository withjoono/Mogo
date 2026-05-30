import Link from "next/link";
import {
  ArrowRight,
  PencilLine,
  CheckCheck,
  NotebookPen,
  Activity,
  GraduationCap,
  Target,
  Wand2,
  CheckCircle2,
  Sparkles,
  Zap,
  Repeat,
} from "lucide-react";

export const metadata = {
  title: "모고앱 — 모의고사 정답 입력 → 채점·분석·정시 예측",
  description:
    "정답 입력 한 번으로 자동 채점·표준점수·등급컷·약점 분석·정시 예측까지. 거북스쿨 생태계로 수시·정시 도구가 한 계정으로 이어집니다.",
};

const VALUE_PROPS = [
  {
    icon: Zap,
    title: "정답 입력 한 번, 모든 분석 자동",
    body:
      "모의고사 답안만 넣으면 자동 채점 → 표준점수·백분위·등급 환산 → 오답 노트·약점 분석·정시 예측까지 한 흐름으로 처리됩니다.",
  },
  {
    icon: Sparkles,
    title: "3월 표점 → 수능 표점 변환",
    body:
      "3년 실증 데이터 기반 변환 모델로 3월 모의 표점을 수능 예측 표점으로 환산. 평균 오차 ±2.4점 수준으로 지금 내 위치를 확인합니다.",
  },
  {
    icon: Repeat,
    title: "거북스쿨 한 계정으로 연동",
    body:
      "Hub 계정 하나로 모고앱·정시앱·수시앱·이그잼허브가 모두 이어집니다. 예측 표점은 정시앱 200+ 대학 시뮬레이션으로 바로 흘러갑니다.",
  },
];

const FEATURES = [
  { icon: PencilLine, title: "정답 입력", body: "OMR식 일괄 입력 · 회차 자동 인식 · 미응시 처리" },
  { icon: CheckCheck, title: "자동 채점", body: "원점수 → 표준점수 · 백분위 · 등급 환산까지 즉시" },
  { icon: NotebookPen, title: "오답 노트", body: "틀린 문항 자동 수집 · 단원·유형별 정렬 · 메모 첨부" },
  { icon: Activity, title: "약점 분석", body: "단원·유형·난이도별 정답률 → 보충 우선순위 추천" },
  { icon: GraduationCap, title: "정시 예측", body: "수능 예측 표점 환산 · 정시앱 200+ 대학 시뮬레이션 연동" },
  { icon: Target, title: "목표 대학", body: "관심 대학 즐겨찾기 · 현재 점수와 합격선 거리 시각화" },
];

const ECOSYSTEM = [
  { name: "Hub", desc: "거북스쿨 SSO · 계정 통합" },
  { name: "Jungsi", desc: "정시 200+ 대학 시뮬레이션" },
  { name: "Susi", desc: "수시 학생부 분석" },
  { name: "ExamHub", desc: "통합 시험 엔진" },
  { name: "TeacherAdmin", desc: "선생님앱 — 출제·반 운영" },
];

const READY = [
  "모의고사 정답 일괄 입력",
  "표준점수·백분위·등급 자동 환산",
  "오답 노트 자동 생성",
  "단원·유형별 약점 분석",
  "3월 표점 → 수능 표점 변환",
  "정시 200+ 대학 합격 시뮬레이션 연동",
  "목표 대학 즐겨찾기",
  "회차별 성적 추이",
  "Hub 계정으로 한 번에 로그인",
];

export default function PromoPage() {
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-background to-background">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:px-12 sm:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            거북스쿨 생태계
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            모의고사 정답 입력 → <span className="text-primary">채점·분석·정시 예측</span> 한 번에
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            모고앱은 모의고사 답안을 넣으면 자동 채점·표준점수·약점 분석·정시 예측까지 한 흐름으로 처리해 주는 정시 준비 도구입니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/main/input"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              정답 입력 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://www.tskool.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              Hub에서 가입
            </a>
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPS ===== */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-12">
        <div className="grid gap-5 md:grid-cols-3">
          {VALUE_PROPS.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-2xl border bg-card p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURE GRID ===== */}
      <section className="bg-secondary/30 px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              무엇이 들어 있나
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              정답 입력부터 정시 예측까지 — 모의고사 분석에 필요한 도구가 한 화면에 모여 있습니다.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ECOSYSTEM ===== */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            모의고사 한 번, 입시 도구가 따라 옵니다
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            거북스쿨의 앱들이 한 계정·한 데이터로 묶여 있어, 모고앱에서 예측한 표점이 정시앱·수시앱으로 그대로 흘러갑니다.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl bg-primary p-5 text-primary-foreground sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">중심</p>
            <p className="mt-2 text-lg font-bold">모고앱</p>
            <p className="mt-1 text-xs opacity-80">채점 · 분석 · 예측</p>
          </div>
          {ECOSYSTEM.map((e) => (
            <div key={e.name} className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">앱</p>
              <p className="mt-2 text-lg font-bold text-foreground">{e.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== READY ===== */}
      <section className="bg-secondary/30 px-6 py-20 sm:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            지금 바로 가능한 것
          </h2>
          <p className="mt-4 text-muted-foreground">아래 모든 기능이 작동 중입니다.</p>
        </div>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-2 sm:grid-cols-2">
          {READY.map((r) => (
            <li
              key={r}
              className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm text-foreground"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:px-12">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Wand2 className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          첫 모의고사 분석까지 1분이면 됩니다
        </h2>
        <p className="mt-4 text-muted-foreground">
          Hub 계정으로 로그인하고 정답을 입력해 보세요. 표준점수·약점·정시 예측이 즉시 화면에 나타납니다.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/main/input"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            정답 입력 시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
