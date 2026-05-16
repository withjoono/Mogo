import { IEnrichedMockExamScoreResponse } from "@/lib/utils/services/mock-exam";

/**
 * 데모 모드용 샘플 모의고사 표준점수 데이터
 * 이과 학생 기준 (미적분 + 과탐 2과목)
 * 상위권 학생 기준으로 설정
 */
export const DEMO_MOCK_EXAM_SCORES: IEnrichedMockExamScoreResponse = {
  data: [
    // 국어 - 화작 선택
    {
      code: "S1",
      grade: 2,
      standardScore: "131",
      percentile: 94,
      subjectName: "화작",
      subjectCategory: "kor",
    },
    // 수학 - 미적분 선택 (이과)
    {
      code: "S4",
      grade: 2,
      standardScore: "137",
      percentile: 96,
      subjectName: "미적",
      subjectCategory: "math",
    },
    // 영어 - 등급제
    {
      code: "S8",
      grade: 1,
      standardScore: "0",
      percentile: 97,
      subjectName: "영어",
      subjectCategory: "eng",
    },
    // 한국사 - 등급제
    {
      code: "S9",
      grade: 2,
      standardScore: "0",
      percentile: 95,
      subjectName: "한국사",
      subjectCategory: "history",
    },
    // 과탐1 - 물리학1
    {
      code: "S10",
      grade: 2,
      standardScore: "67", // 점수표 최대값에 맞춤 (점수표 범위: ~67)
      percentile: 93,
      subjectName: "물리학 Ⅰ",
      subjectCategory: "science",
    },
    // 과탐2 - 화학1
    {
      code: "S16",
      grade: 2,
      standardScore: "65",
      percentile: 91,
      subjectName: "화학 Ⅰ",
      subjectCategory: "science",
    },
  ],
  academicDivision: "NaturalSciences", // 이과
  standardScoreSum: 400, // 국어(131) + 수학(137) + 과탐1(67) + 과탐2(65)
  myCumulativePercentile: 2.86, // 상위 2.86%
};
