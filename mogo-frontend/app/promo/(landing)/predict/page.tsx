import {
  GraduationCap,
  Brain,
  Database,
  LineChart,
  ShieldCheck,
  ArrowRightLeft,
  Building2,
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
  title: "정시 예측 — 모고앱",
  description: "3월 표점 → 수능 표점 변환부터 200+ 대학 합격선 시뮬레이션까지. 3년 실증 데이터 기반 ±2.4점 오차.",
};

export default function PromoPredictPage() {
  return (
    <main>
      <PromoHero
        badge="정시 예측"
        Icon={GraduationCap}
        title="3월 표점으로"
        highlight="수능 정시까지"
        body="3년치 실제 3월 모의 → 수능 데이터를 모델링해 내 표점이 수능에서 어디로 이동할지 예측. 예측 표점은 정시앱 200+ 대학 시뮬레이션으로 그대로 연결됩니다."
        primaryHref="/main/prediction"
        primaryLabel="정시 예측 시작"
        secondaryHref="/promo/march"
        secondaryLabel="3월 변환 상세 보기"
      />

      <PromoSection
        title="정시 예측, 이런 게 다 됩니다"
        subtitle="단순 점수가 아닌, ‘내가 갈 수 있는 대학’까지 보여 주는 분석."
      >
        <FeatureGrid
          items={[
            { icon: ArrowRightLeft, title: "3월 → 수능 표점 변환", body: "응시집단 차이를 보정한 수능 예측 표점 산출" },
            { icon: Database, title: "3년 실증 데이터 모델", body: "2022·2023·2024 3월→수능 실제 점수쌍 기반" },
            { icon: ShieldCheck, title: "±2.4점 평균 오차", body: "정시 지원선 판단에 충분한 예측 정확도" },
            { icon: Brain, title: "과목별 이동 패턴 반영", body: "국·수·탐 응시집단 변화를 과목별로 다르게 보정" },
            { icon: Building2, title: "200+ 대학 시뮬레이션 연동", body: "예측 표점을 정시앱으로 한 번에 넘겨 합격선 분석" },
            { icon: LineChart, title: "회차 누적 보정", body: "여러 회차의 표점을 합쳐 안정적인 예측 결과 제공" },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 정시 예측" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "모의고사 정답 입력",
                body: "3월·6월·9월 회차의 답안을 입력하면 표점·백분위·등급이 자동 계산됩니다.",
              },
              {
                title: "수능 예측 표점 변환",
                body: "3년 실증 데이터 모델이 내 표점을 수능 예측 표점으로 환산. 과목별 이동 폭을 자동 보정.",
              },
              {
                title: "정시앱에서 합격 시뮬레이션",
                body: "예측 표점을 정시앱으로 넘기면 200+ 대학의 환산 점수·합격 가능성을 받습니다.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "3월 표점 → 수능 표점 변환",
              "과목별 예측 신뢰도 표시",
              "표점합·국수탐합 예측",
              "회차 누적 보정",
              "정시앱 200+ 대학 시뮬레이션",
              "관심 대학과의 격차 시각화",
              "수시 최저 기준 점검",
              "예측 결과 PDF 저장",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={GraduationCap}
        title="3월 성적으로 수능 결과를 미리 보세요"
        body="3년 실증 데이터 기반 변환으로 지금 내 위치와 갈 수 있는 대학을 확인할 수 있습니다."
        primaryHref="/main/prediction"
        primaryLabel="정시 예측 시작"
      />
    </main>
  );
}
