import {
  Target,
  Star,
  Building2,
  TrendingUp,
  Ruler,
  Bell,
  BookMarked,
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
  title: "목표 대학 — 모고앱",
  description: "관심 대학을 즐겨찾기에 두면 회차마다 합격선까지 남은 거리를 자동으로 계산해 보여 줍니다.",
};

export default function PromoTargetPage() {
  return (
    <main>
      <PromoHero
        badge="목표 대학"
        Icon={Target}
        title="합격선까지"
        highlight="몇 점 남았는지"
        body="가고 싶은 대학을 즐겨찾기에 담으면 회차마다 현재 표점과 합격선 사이의 거리를 자동 계산. 추이 그래프로 격차가 좁혀지는지 한눈에 봅니다."
        primaryHref="/main/target-university"
        primaryLabel="목표 대학 설정"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="목표 대학, 이런 게 다 됩니다"
        subtitle="관심 대학을 점·선·면 세 가지 시각으로 추적합니다."
      >
        <FeatureGrid
          items={[
            { icon: Star, title: "관심 대학 즐겨찾기", body: "200+ 대학·학과를 검색해 빠르게 즐겨찾기에 등록" },
            { icon: Ruler, title: "합격선과의 거리", body: "현재 예측 표점과 합격선 격차를 점수로 표시" },
            { icon: TrendingUp, title: "추이 그래프", body: "회차마다 격차가 좁혀지는지 선 그래프로 추적" },
            { icon: Building2, title: "환산 점수 미리 보기", body: "대학별 반영 비율을 적용한 환산 점수까지 계산" },
            { icon: BookMarked, title: "수시·정시 동시 관리", body: "수시 최저 기준과 정시 합격선을 한 카드에" },
            { icon: Bell, title: "변동 알림", body: "합격선 변동이나 모집요강 업데이트 시 알림" },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 목표 추적" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "관심 대학 등록",
                body: "메인 메뉴 '목표 대학'에서 대학·학과를 검색해 즐겨찾기에 담으세요.",
              },
              {
                title: "회차별 격차 확인",
                body: "정답 입력만 마치면 현재 표점과 합격선의 차이가 카드에 자동으로 나타납니다.",
              },
              {
                title: "정시앱으로 심화 분석",
                body: "정시앱에서 200+ 대학 환산 점수와 합격 가능성을 더 깊게 확인할 수 있습니다.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "관심 대학 즐겨찾기",
              "합격선까지 점수 격차",
              "회차별 격차 추이",
              "대학별 환산 점수",
              "수시 최저 기준 점검",
              "정시 합격선 비교",
              "관심 학과 즐겨찾기",
              "정시앱 시뮬레이션 연동",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Target}
        title="가고 싶은 대학이 있을수록 점수는 올라갑니다"
        body="관심 대학을 등록하고 매 회차 합격선까지의 거리를 추적해 보세요."
        primaryHref="/main/target-university"
        primaryLabel="목표 대학 설정"
      />
    </main>
  );
}
