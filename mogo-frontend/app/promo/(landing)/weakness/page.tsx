import {
  Activity,
  PieChart,
  TrendingDown,
  AlertTriangle,
  Layers3,
  Lightbulb,
  BarChart3,
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
  title: "약점 분석 — 모고앱",
  description: "단원·유형·난이도별 정답률로 어디가 약한지, 무엇부터 보충해야 하는지 한 화면에서 확인.",
};

export default function PromoWeaknessPage() {
  return (
    <main>
      <PromoHero
        badge="약점 분석"
        Icon={Activity}
        title="어디가 약한지"
        highlight="한 화면에서"
        body="여러 회차의 채점 결과를 합쳐 단원·유형·난이도별 정답률을 계산. '문법은 약하다'가 아니라 '어떤 단원의 어떤 유형이 몇 %인지' 숫자로 보여 줍니다."
        primaryHref="/main/weakness-analysis"
        primaryLabel="약점 분석 보기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="약점 분석, 이런 게 다 됩니다"
        subtitle="감이 아니라 데이터로 약점을 짚어 주는 분석 카드."
      >
        <FeatureGrid
          items={[
            { icon: PieChart, title: "단원별 정답률", body: "교과 단원 분류 그대로 — 어디부터 보충할지 명확" },
            { icon: Layers3, title: "유형별 정답률", body: "킬러·준킬러·기본 유형 등 출제 유형별 분포" },
            { icon: TrendingDown, title: "난이도별 정답률", body: "쉬운 문제를 놓치는지, 어려운 문제가 막히는지 진단" },
            { icon: AlertTriangle, title: "취약 단원 알림", body: "정답률 하위 단원·유형을 빨간 카드로 강조" },
            { icon: BarChart3, title: "회차 누적 분석", body: "한 회차가 아닌 최근 N개 회차를 합쳐 안정적인 진단" },
            { icon: Lightbulb, title: "보충 우선순위", body: "기여도(틀림 빈도×배점)로 무엇부터 잡을지 추천" },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 약점 잡기" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "회차 누적 채점",
                body: "최근 3~5개 회차를 입력해 두면 누적 분석이 자동으로 활성화됩니다.",
              },
              {
                title: "분석 카드 확인",
                body: "단원·유형·난이도 3축의 카드에서 빨간색 영역을 확인. 클릭 시 해당 오답 문항 목록으로 이동.",
              },
              {
                title: "오답 노트로 연결",
                body: "취약 단원의 오답만 모아 다시 풀기 큐로 — 약점 → 학습이 한 흐름.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "단원별 정답률 분석",
              "유형별 정답률 분석",
              "난이도별 정답률 분석",
              "취약 단원 자동 강조",
              "보충 우선순위 추천",
              "최근 N회차 누적 분석",
              "취약 단원 → 오답 노트 연결",
              "과목별 종합 진단 카드",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Lightbulb}
        title="‘느낌’이 아니라 ‘숫자’로 약점을 잡으세요"
        body="회차 몇 개만 입력하면 단원·유형·난이도 3축 분석이 자동으로 켜집니다."
        primaryHref="/main/weakness-analysis"
        primaryLabel="약점 분석 보기"
      />
    </main>
  );
}
