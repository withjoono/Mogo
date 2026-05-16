import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useExploreJungsiStepper } from "../context/explore-jungsi-provider";
import { useGetRegularAdmissions } from "@/stores/server/features/jungsi/queries";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import JungsiStep3TableComponent from "./step-3-data-table";
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";
import { JungsiStep3Chart } from "./step-3-chart";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/loading-spinner";
import { DEMO_MOCK_EXAM_SCORES } from "../demo/demo-mock-exam-data";

export interface ProcessedAdmission extends IRegularAdmission {
  myScore?: number;        // 내 표준점수 합산
  risk?: number;           // 6단계 위험도
  standardScore?: number;  // 대학 배치 기준 표준점수 합
  optimalScore?: number;   // 배치 컷 기준
  scoreDifference?: number; // 내점수 - 배치컷 (양수=여유)
  errorMessage?: string;
}

/** 단순 표준점수 합산 기반 위험도 (6→10단계 매핑) */
function calcSimpleRisk(diff: number): number {
  if (diff >= 15) return 10;
  if (diff >= 8)  return 9;
  if (diff >= 3)  return 8;
  if (diff >= 0)  return 7;
  if (diff >= -5) return 6;
  if (diff >= -10) return 5;
  if (diff >= -15) return 4;
  if (diff >= -20) return 3;
  if (diff >= -25) return 2;
  return 1;
}

export const JungsiStep3: React.FC = () => {
  const { prevStep, nextStep, updateFormData, formData, isDemo } =
    useExploreJungsiStepper();
  const { data: regularAdmissions } = useGetRegularAdmissions({
    year: 2026,
    admission_type: formData.admissionType,
  });
  const { data: mockExamScores } = useGetMockExamStandardScores();

  // 데모 모드에서는 샘플 데이터 사용
  const effectiveMockExamScores = isDemo ? DEMO_MOCK_EXAM_SCORES : mockExamScores;

  const [processedAdmissions, setProcessedAdmissions] = useState<ProcessedAdmission[]>([]);
  const [selectedAdmissions, setSelectedAdmissions] = useState<number[]>([]);
  const [isSorted, setIsSorted] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedItems = useMemo(() => {
    if (!regularAdmissions) return [];
    return [...new Set([...formData.step1SelectedIds, ...formData.step2SelectedIds])];
  }, [formData.step1SelectedIds, formData.step2SelectedIds, regularAdmissions]);

  // 표준점수 합산 + 등급 기반으로 단순 처리
  useEffect(() => {
    if (!regularAdmissions) return;
    if (!effectiveMockExamScores) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const scores = effectiveMockExamScores as any;
    const myStdSum: number = scores?.standardScoreSum ?? 0;

    let myEngGrade = 9;
    let myHistoryGrade = 9;
    if (scores?.data && Array.isArray(scores.data)) {
      const eng = scores.data.find((s: any) => s.subjectCategory === "eng");
      const hist = scores.data.find((s: any) => s.subjectCategory === "history");
      if (eng) myEngGrade = eng.grade ?? 9;
      if (hist) myHistoryGrade = hist.grade ?? 9;
    }

    const filtered = regularAdmissions.filter((a) => selectedItems.includes(a.id));

    const processed: ProcessedAdmission[] = filtered.map((admission) => {
      const cutScore = admission.minCut ? parseFloat(String(admission.minCut)) : null;

      // 등급 최저 기준 미달 체크
      const engReq = admission.englishGradeCriteria;
      const histReq = admission.historyGradeCriteria;
      const failEng = engReq !== null && engReq !== undefined && myEngGrade > engReq;
      const failHist = histReq !== null && histReq !== undefined && myHistoryGrade > histReq;

      if (failEng) {
        return {
          ...admission,
          myScore: myStdSum,
          risk: 1,
          standardScore: cutScore ?? 0,
          optimalScore: cutScore ?? 0,
          scoreDifference: cutScore !== null ? myStdSum - cutScore : undefined,
          errorMessage: `영어 ${engReq}등급 이내 필요 (내 등급: ${myEngGrade})`,
        };
      }
      if (failHist) {
        return {
          ...admission,
          myScore: myStdSum,
          risk: 1,
          standardScore: cutScore ?? 0,
          optimalScore: cutScore ?? 0,
          scoreDifference: cutScore !== null ? myStdSum - cutScore : undefined,
          errorMessage: `한국사 ${histReq}등급 이내 필요 (내 등급: ${myHistoryGrade})`,
        };
      }

      if (cutScore === null) {
        return {
          ...admission,
          myScore: myStdSum,
          risk: 5,
          standardScore: 0,
          optimalScore: 0,
          scoreDifference: undefined,
          errorMessage: "예측컷 데이터 없음",
        };
      }

      const diff = myStdSum - cutScore;
      const risk = calcSimpleRisk(diff);

      return {
        ...admission,
        myScore: myStdSum,
        risk,
        standardScore: cutScore,
        optimalScore: cutScore,
        scoreDifference: diff,
      };
    });

    setProcessedAdmissions(processed);
    setIsLoading(false);
  }, [regularAdmissions, effectiveMockExamScores, selectedItems]);

  const toggleSelection = (id: number) => {
    setSelectedAdmissions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedAdmissions.length === processedAdmissions.length) {
      setSelectedAdmissions([]);
    } else {
      setSelectedAdmissions(processedAdmissions.map((item) => item.id));
    }
  };

  const handleNextClick = async () => {
    updateFormData("step3SelectedIds", selectedAdmissions);
    nextStep();
  };

  const resetSelectedItems = () => setSelectedAdmissionId(null);
  const onClickDetail = (admissionId: number) => {
    setSelectedAdmissionId(admissionId);
    window.scrollTo(0, 0);
  };

  if (isLoading) return <LoadingSpinner className="pt-40" />;

  // 모의고사 점수가 없는 경우
  if (!effectiveMockExamScores) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-red-500">
          모의고사 점수가 등록되지 않았습니다.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          먼저 모의고사 점수를 입력해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pt-4 md:space-y-6">
      {/* 안내 배너 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-700">
          📊 표준점수 단순 합산 예측 (국어 + 수학 + 탐구)
        </p>
        <p className="mt-1 text-xs text-blue-600">
          영어·한국사는 등급제로 적용됩니다. 보다 정확한 환산점수 기반 분석은{" "}
          <a
            href="https://jungsi.geobukschool.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
          >
            정시 유료 서비스
          </a>
          를 이용해주세요.
        </p>
      </div>

      <div className="py-4">
        <div className="h-[500px] w-full overflow-x-auto">
          <JungsiStep3Chart
            data={processedAdmissions}
            onSelectAdmission={(id) => {
              setSelectedAdmissions((prev) =>
                prev.includes(id)
                  ? prev.filter((item) => item !== id)
                  : [...prev, id],
              );
            }}
            selectedAdmissions={selectedAdmissions}
            isSorted={isSorted}
          />
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="sort-switch"
            checked={isSorted}
            onCheckedChange={setIsSorted}
          />
          <Label htmlFor="sort-switch">배치컷 정렬</Label>
        </div>

        <JungsiStep3TableComponent
          admissions={processedAdmissions}
          selectedAdmissions={selectedAdmissions}
          toggleSelection={toggleSelection}
          onSelectAll={handleSelectAll}
          onClickDetail={onClickDetail}
        />
      </div>

      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant="outline" onClick={prevStep}>
          이전 단계
        </Button>
        <Button onClick={handleNextClick} disabled={selectedAdmissions.length === 0}>
          다음 단계
        </Button>
      </div>
    </div>
  );
};

export default JungsiStep3;
