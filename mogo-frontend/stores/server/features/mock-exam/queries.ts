import { useState, useEffect } from "react";
import { getAccessToken } from "@/lib/auth/token-manager";

export interface MyScores {
  standardScoreSum: number;
  englishGrade: number;
  historyGrade: number;
  koreanStandard: number | null;
  mathStandard: number | null;
  inquiry1Standard: number | null;
  inquiry2Standard: number | null;
  mockExamId: number | null;
  mockExamName: string;
  // IEnrichedMockExamScoreResponse 호환 필드
  data: { subjectCategory: string; grade: number; standardScore: string; percentile: number; subjectName: string; code: string }[];
  myCumulativePercentile: number;
}

export const useGetMockSchedules = () => ({ data: [] });
export const useGetInputMockScores = (_id: any) => ({ data: { mockScores: [] } });

export const useGetMockExamStandardScores = () => {
  const [data, setData] = useState<MyScores | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = getAccessToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/explore/my-scores", { headers });
        if (!res.ok) { setIsLoading(false); return; }
        const json = await res.json();
        if (!json.success || !json.data) { setIsLoading(false); return; }

        const d = json.data;
        // IEnrichedMockExamScoreResponse 형태로 변환
        const scoreData = [];
        if (d.koreanStandard) scoreData.push({ code: "kor", grade: 1, standardScore: String(d.koreanStandard), percentile: 0, subjectName: "국어", subjectCategory: "kor" });
        if (d.mathStandard) scoreData.push({ code: "math", grade: 1, standardScore: String(d.mathStandard), percentile: 0, subjectName: "수학", subjectCategory: "math" });
        if (d.englishGrade) scoreData.push({ code: "eng", grade: d.englishGrade, standardScore: "0", percentile: 0, subjectName: "영어", subjectCategory: "eng" });
        if (d.historyGrade) scoreData.push({ code: "history", grade: d.historyGrade, standardScore: "0", percentile: 0, subjectName: "한국사", subjectCategory: "history" });

        setData({
          ...d,
          data: scoreData,
          myCumulativePercentile: 0,
        });
      } catch (e) {
        // silent fail – 점수 미입력 상태
      } finally {
        setIsLoading(false);
      }
    };
    fetchScores();
  }, []);

  return { data, isLoading };
};
