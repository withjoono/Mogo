import {
  CheckCheck,
  Sigma,
  Percent,
  Award,
  TrendingUp,
  RefreshCw,
  LineChart,
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
  title: "자동 채점 — 모고앱",
  description: "원점수 → 표준점수 · 백분위 · 등급까지 즉시 환산. 회차별 등급컷이 반영된 정확한 결과.",
};

export default function PromoAutoGradePage() {
  return (
    <main>
      <PromoHero
        badge="자동 채점"
        Icon={CheckCheck}
        title="채점·환산까지"
        highlight="0초"
        body="답안 저장과 동시에 자동 채점. 원점수만 보고 끝내지 않고, 회차별 등급컷을 적용해 표준점수·백분위·등급까지 한 화면에 정리합니다."
        primaryHref="/main/score-analysis"
        primaryLabel="채점 결과 보기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="자동 채점, 이런 게 다 됩니다"
        subtitle="모의고사 결과지에 적힌 모든 지표를 한 화면에서."
      >
        <FeatureGrid
          items={[
            { icon: CheckCheck, title: "원점수 자동 산출", body: "객관식·단답형 즉시 채점, 배점 자동 적용" },
            { icon: Sigma, title: "표준점수 환산", body: "회차별 평균·표준편차 기반 표점 자동 계산" },
            { icon: Percent, title: "백분위 환산", body: "분포 데이터로 내 백분위 위치 즉시 표시" },
            { icon: Award, title: "등급 산출", body: "회차별 공식 등급컷 반영, 영어·한국사는 절대평가 처리" },
            { icon: TrendingUp, title: "과목·전체 종합 점수", body: "표준점수합·국수탐 합산 등 핵심 지표 자동 정리" },
            { icon: RefreshCw, title: "정답 변경 재채점", body: "출제기관 정답 정정 시 한 번에 다시 채점" },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 채점 결과 확인" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "답안 저장",
                body: "정답 입력을 마치고 저장하면 채점이 즉시 시작됩니다. 별도 버튼 없음.",
              },
              {
                title: "점수 카드 확인",
                body: "국어·수학·영어·탐구별 원점수 → 표점 → 백분위 → 등급을 한 카드에서 확인.",
              },
              {
                title: "추이·예측으로 연결",
                body: "회차별 추이 그래프, 약점 분석, 정시 예측까지 한 번의 클릭으로 이동.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "객관식·단답형 자동 채점",
              "회차별 등급컷 자동 적용",
              "표준점수·백분위·등급 환산",
              "표점합·국수탐 합 자동 계산",
              "정답 정정 시 재채점",
              "회차별 점수 추이 그래프",
              "절대평가 과목 처리(영어·한국사)",
              "탐구 과목 변환표점 옵션",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={LineChart}
        title="원점수 너머의 진짜 위치를 보세요"
        body="등급컷이 반영된 표점·백분위로 내 점수가 실제 어디에 있는지 확인하세요."
        primaryHref="/main/score-analysis"
        primaryLabel="채점 결과 보기"
      />
    </main>
  );
}
