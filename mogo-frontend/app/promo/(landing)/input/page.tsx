import {
  PencilLine,
  ListChecks,
  Clock,
  Upload,
  Layers,
  FileSpreadsheet,
  CalendarRange,
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
  title: "정답 입력 — 모고앱",
  description: "OMR식 일괄 입력으로 1분이면 끝. 회차·과목 자동 인식, 미응시·복수정답까지 처리합니다.",
};

export default function PromoInputPage() {
  return (
    <main>
      <PromoHero
        badge="정답 입력"
        Icon={PencilLine}
        title="정답 입력까지"
        highlight="1분"
        body="회차만 고르면 과목·문항 수가 자동으로 펼쳐집니다. 1번부터 차례로 OMR식 입력 — 미응시·복수정답도 그대로 받습니다."
        primaryHref="/main/input"
        primaryLabel="정답 입력 시작하기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="정답 입력, 이런 게 다 됩니다"
        subtitle="3월·6월·9월·수능·사설 모의 — 어떤 회차든 같은 방식으로."
      >
        <FeatureGrid
          items={[
            { icon: CalendarRange, title: "회차 자동 인식", body: "교육청·평가원·사설 회차 라이브러리에서 한 번 선택" },
            { icon: Layers, title: "과목 다중 입력", body: "국어·수학·영어·탐구 2과목까지 한 화면에서 처리" },
            { icon: ListChecks, title: "OMR식 일괄 입력", body: "1번부터 순서대로, 키패드만으로 25문항 입력" },
            { icon: Clock, title: "미응시·시간 부족 표시", body: "응시 안 한 과목·문항은 통계에서 자동 제외" },
            { icon: FileSpreadsheet, title: "복수정답·정답 변경", body: "출제기관 정정 공지를 그대로 반영해 재채점" },
            { icon: Upload, title: "이전 회차 불러오기", body: "지난 회차 답안을 복제해 빠르게 채점 시작" },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 정답 입력" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "회차 선택",
                body: "메인 메뉴 '정답 입력' → 응시한 회차 선택. 과목·문항 구성이 자동으로 채워집니다.",
              },
              {
                title: "답안 입력",
                body: "1번부터 순서대로 선택지를 누르세요. 키보드 1~5 단축키 지원. 미응시는 건너뛰기.",
              },
              {
                title: "저장 → 즉시 분석",
                body: "저장 즉시 자동 채점이 시작되어 자동 채점·약점 분석·정시 예측 페이지로 이동할 수 있습니다.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "교육청·평가원 회차 라이브러리",
              "사설 모의 임의 입력",
              "국어·수학·영어·탐구 일괄 처리",
              "키보드 단축키(1~5)",
              "미응시 과목 자동 제외",
              "복수정답·정답 변경 재채점",
              "이전 회차 답안 복제",
              "수정 후 자동 재계산",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={Wand2}
        title="모의고사 하나 입력하는 데 1분이면 됩니다"
        body="Hub 계정으로 로그인하고 메인 메뉴 '정답 입력'에서 시작하세요."
        primaryHref="/main/input"
        primaryLabel="정답 입력 시작하기"
      />
    </main>
  );
}
