import {
  Network,
  Link2,
  KeyRound,
  Users,
  GraduationCap,
  BookOpenCheck,
  ClipboardList,
  Wand2,
} from "lucide-react";
import {
  PromoHero,
  PromoSection,
  FeatureGrid,
  StepList,
  CheckList,
  FinalCTA,
} from "../_components";

export const metadata = {
  title: "거북스쿨 생태계 — 모고앱",
  description: "Hub·Susi·Jungsi·ExamHub·TeacherAdmin과 한 계정으로 연결. 모의고사 결과가 다른 앱으로 그대로 흘러갑니다.",
};

const APPS = [
  {
    icon: KeyRound,
    title: "Hub",
    body: "거북스쿨 SSO 중심. 한 번 가입하면 모든 위성앱에 자동 로그인.",
  },
  {
    icon: GraduationCap,
    title: "Jungsi (정시앱)",
    body: "200+ 대학 환산 점수·합격 시뮬레이션. 모고앱 예측 표점을 그대로 받음.",
  },
  {
    icon: BookOpenCheck,
    title: "Susi (수시앱)",
    body: "학생부·세특·수상 데이터 분석. 모고앱 등급으로 수시 최저 기준 점검.",
  },
  {
    icon: ClipboardList,
    title: "ExamHub",
    body: "통합 시험 엔진·오답 분석. 모고앱 오답 노트가 같은 도구로 연결.",
  },
  {
    icon: Users,
    title: "TeacherAdmin (선생님앱)",
    body: "학원·강사용. 학생이 모고앱에서 푼 결과를 선생님이 그대로 확인.",
  },
];

export default function PromoEcosystemPage() {
  return (
    <main>
      <PromoHero
        badge="거북스쿨 생태계"
        Icon={Network}
        title="한 계정,"
        highlight="여러 입시 도구"
        body="Hub 계정 하나로 모고앱·정시앱·수시앱·이그잼허브·선생님앱이 이어집니다. 모의고사 결과는 정시 시뮬레이션·수시 최저 점검·선생님 케어로 그대로 흘러갑니다."
        primaryHref="/main"
        primaryLabel="모고앱 시작하기"
        secondaryHref="https://www.tskool.kr"
        secondaryLabel="Hub에서 가입"
      />

      <PromoSection
        title="다섯 앱이 한 데이터로 묶입니다"
        subtitle="앱마다 따로 회원가입할 필요가 없습니다."
      >
        <FeatureGrid
          items={APPS.map((a) => ({ icon: a.icon, title: a.title, body: a.body }))}
        />
      </PromoSection>

      <PromoSection title="모고앱이 다른 앱과 이어지는 방식" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "Hub에서 한 번 가입",
                body: "tskool.kr에서 Hub 계정을 만들면 모든 위성앱에 같은 계정으로 자동 로그인됩니다.",
              },
              {
                title: "모고앱에서 정답 입력·분석",
                body: "모의고사 답안 → 자동 채점 → 표준점수·약점·정시 예측이 한 화면에서 생성됩니다.",
              },
              {
                title: "결과가 다른 앱으로 흘러감",
                body: "예측 표점 → 정시앱 시뮬레이션, 등급 → 수시앱 최저 점검, 오답 → 이그잼허브 분석.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "Hub SSO 단일 로그인",
              "정시앱 200+ 대학 시뮬레이션 연동",
              "수시앱 최저 기준 점검 연동",
              "이그잼허브 통합 분석",
              "선생님앱에서 학생 결과 확인",
              "한 데이터·한 학생 ID",
              "앱 간 자동 동기화",
              "프로필·관심 대학 공유",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Link2}
        title="입시 도구는 따로 쓸 필요가 없습니다"
        body="Hub 계정 하나로 거북스쿨의 모든 위성앱을 시작하세요."
        primaryHref="/main"
        primaryLabel="모고앱 시작하기"
      />
    </main>
  );
}
