import {
  NotebookPen,
  Tags,
  Filter,
  StickyNote,
  BookOpenCheck,
  Search,
  Repeat,
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
  title: "오답 노트 — 모고앱",
  description: "틀린 문항을 자동으로 모아 단원·유형별로 정렬. 메모와 해설 링크를 붙여 다시 풀기까지 한 흐름.",
};

export default function PromoWrongNotesPage() {
  return (
    <main>
      <PromoHero
        badge="오답 노트"
        Icon={NotebookPen}
        title="틀린 문항은"
        highlight="자동으로 모입니다"
        body="채점이 끝나면 틀린 문항이 단원·유형별로 자동 정리됩니다. 메모·해설·다시 풀기까지 한 화면에서 — 노트를 따로 만들 필요 없습니다."
        primaryHref="/main/wrong-answers"
        primaryLabel="오답 노트 열기"
        secondaryHref="/promo"
        secondaryLabel="전체 기능 보기"
      />

      <PromoSection
        title="오답 노트, 이런 게 다 됩니다"
        subtitle="문항 사진·해설·메모를 한 카드에 — 따로 정리할 필요가 없습니다."
      >
        <FeatureGrid
          items={[
            { icon: NotebookPen, title: "오답 자동 수집", body: "채점 즉시 틀린 문항만 모아 노트 생성" },
            { icon: Tags, title: "단원·유형 태그", body: "출제 단원·문항 유형이 자동으로 붙어 분류 끝" },
            { icon: Filter, title: "회차·과목별 필터", body: "보고 싶은 회차·과목·난이도만 추려서 학습" },
            { icon: StickyNote, title: "개별 메모", body: "문항마다 내 풀이·실수·핵심 개념을 한 줄로 기록" },
            { icon: Search, title: "키워드 검색", body: "기억나는 단원·개념어로 과거 오답을 즉시 찾기" },
            { icon: Repeat, title: "다시 풀기 큐", body: "체크한 문항을 모아 모의 시험처럼 다시 풀기" },
          ]}
        />
      </PromoSection>

      <PromoSection title="3단계로 오답 학습" tone="muted">
        <div className="mx-auto max-w-3xl">
          <StepList
            steps={[
              {
                title: "채점 직후 자동 생성",
                body: "정답 입력만 마치면 틀린 문항이 자동으로 오답 노트에 들어갑니다.",
              },
              {
                title: "메모·태그 정리",
                body: "왜 틀렸는지 한 줄 메모. 단원·유형 태그는 기본으로 붙어 있어 분류 작업 없음.",
              },
              {
                title: "다시 풀기",
                body: "체크박스로 다시 풀기 큐에 담아 시험 형식으로 재도전. 정답률 변화도 추적.",
              },
            ]}
          />
        </div>
      </PromoSection>

      <PromoSection title="지금 바로 가능한 것">
        <div className="mx-auto max-w-3xl">
          <CheckList
            items={[
              "오답 자동 수집",
              "단원·유형 자동 태그",
              "회차·과목·난이도 필터",
              "문항별 메모",
              "키워드 검색",
              "다시 풀기 큐",
              "정답률 변화 추적",
              "오답 누적 통계",
            ]}
          />
        </div>
      </PromoSection>

      <FinalCTA
        Icon={BookOpenCheck}
        title="틀린 문제만 다시 풀어도 점수가 오릅니다"
        body="오답 노트는 채점이 끝나는 순간 자동으로 만들어집니다. 메모와 다시 풀기로 한 흐름에 마무리하세요."
        primaryHref="/main/wrong-answers"
        primaryLabel="오답 노트 열기"
      />
    </main>
  );
}
