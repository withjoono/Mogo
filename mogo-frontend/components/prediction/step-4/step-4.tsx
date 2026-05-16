import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useExploreJungsiStepper } from "../context/explore-jungsi-provider";
import {
  useGetInterestRegularAdmissions,
  useGetRegularAdmissions,
  useGetCalculatedScores,
} from "@/stores/server/features/jungsi/queries";
import { JungsiStep4Table, ProcessedAdmission } from "./step-4-data-table";
import { calc정시위험도 } from "@/lib/calculations/regular-v2/risk";
import { useAddInterestRegularAdmission } from "@/stores/server/features/jungsi/queries";
import JungsiStep4Chart from "./step-4-chart";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/loading-spinner";

export const JungsiStep4 = () => {
  const { prevStep, nextStep, updateFormData, formData } =
    useExploreJungsiStepper();
  const { data: regularAdmissions } = useGetRegularAdmissions({
    year: 2026,
    admission_type: formData.admissionType,
  });
  const { data: calculatedScores, isLoading: isLoadingScores } =
    useGetCalculatedScores();
  const { refetch } = useGetInterestRegularAdmissions(
    formData.admissionType as "가" | "나" | "다",
  );
  const addInterestRegularAdmission = useAddInterestRegularAdmission();

  const [processedAdmissions, setProcessedAdmissions] = useState<
    ProcessedAdmission[]
  >([]);
  const [selectedAdmissions, setSelectedAdmissions] = useState<number[]>([]);
  const [sortType, setSortType] = useState<
    "none" | "maxCut" | "normalizedScoreDifference"
  >("normalizedScoreDifference");
  const sortedAdmissions = useMemo(() => {
    switch (sortType) {
      case "normalizedScoreDifference":
        return [...processedAdmissions].sort(
          (a, b) =>
            (b.normalizedScoreDifference || -10000) -
            (a.normalizedScoreDifference || -10000),
        );
      default:
        return processedAdmissions;
    }
  }, [processedAdmissions, sortType]);

  // 환산점수를 기반으로 admission 데이터 처리
  useEffect(() => {
    const processAdmissions = () => {
      if (!regularAdmissions || !calculatedScores) return;

      const filtered = regularAdmissions.filter((admission) =>
        formData.step3SelectedIds.includes(admission.id),
      );
      const processed: ProcessedAdmission[] = [];

      // 환산점수를 universityId + scoreCalculationCode로 매핑
      // 같은 대학에 여러 학과가 있고, 각 학과마다 다른 환산점수 공식을 사용
      const scoreMap = new Map(
        calculatedScores.map((score) => [
          `${score.universityId}_${score.scoreCalculationCode}`,
          score,
        ]),
      );

      for (const admission of filtered) {
        // universityId + scoreCalculationCode로 정확한 매칭
        const scoreKey = `${admission.university.id}_${admission.scoreCalculationCode}`;
        const savedScore = scoreMap.get(scoreKey);

        if (savedScore && savedScore.convertedScore) {
          const myScore = savedScore.convertedScore;
          const risk = calc정시위험도(myScore, {
            risk_10: parseFloat(admission.riskPlus5 || "0"),
            risk_9: parseFloat(admission.riskPlus4 || "0"),
            risk_8: parseFloat(admission.riskPlus3 || "0"),
            risk_7: parseFloat(admission.riskPlus2 || "0"),
            risk_6: parseFloat(admission.riskPlus1 || "0"),
            risk_5: parseFloat(admission.riskMinus1 || "0"),
            risk_4: parseFloat(admission.riskMinus2 || "0"),
            risk_3: parseFloat(admission.riskMinus3 || "0"),
            risk_2: parseFloat(admission.riskMinus4 || "0"),
            risk_1: parseFloat(admission.riskMinus5 || "0"),
          });
          const standardScoreSum = savedScore.standardScoreSum || 0;

          // 유불리 점수: 백엔드에서 제공하는 optimalScore와 scoreDifference 사용
          const optimalScore = savedScore.optimalScore;
          const scoreDifference = savedScore.scoreDifference || 0;
          // 정규화된 유불리: 총점 대비 비율 (1000점 기준)
          const totalScore = admission.totalScore || 1000;
          const normalizedScoreDifference = (scoreDifference / totalScore) * 1000;

          processed.push({
            ...admission,
            myScore,
            risk,
            standardScore: standardScoreSum,
            optimalScore,
            scoreDifference,
            normalizedScoreDifference,
          });
        } else {
          processed.push({
            ...admission,
            errorMessage: "환산점수 없음",
          });
        }
      }

      setProcessedAdmissions(processed);
    };

    processAdmissions();
  }, [regularAdmissions, calculatedScores, formData.step3SelectedIds]);

  if (isLoadingScores) {
    return <LoadingSpinner className="pt-40" />;
  }

  const handleNextClick = async () => {
    updateFormData("step4SelectedIds", selectedAdmissions);
    await addInterestRegularAdmission.mutateAsync({
      targetIds: selectedAdmissions,
      admissionType: formData.admissionType as "가" | "나" | "다",
    });
    await refetch();
    nextStep();
  };

  return (
    <div className="flex flex-col items-center justify-center px-2 py-12">
      {/* 거북쌤 유불리 안내 말풍선 */}
      <div className="w-full max-w-screen-xl mb-6">
        <div className="flex items-start gap-4">
          {/* 거북쌤 이미지 */}
          <div className="flex-shrink-0">
            <img
              src="/images/turtle-teacher-2.png"
              alt="거북쌤"
              className="w-24 h-24 object-contain"
            />
          </div>
          {/* 말풍선 */}
          <div className="relative flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            {/* 말풍선 꼬리 */}
            <div className="absolute left-0 top-8 -translate-x-full">
              <div className="border-8 border-transparent border-r-emerald-200" />
            </div>
            <div className="absolute left-0 top-8 -translate-x-[calc(100%-1px)]">
              <div className="border-8 border-transparent border-r-emerald-50" />
            </div>
            <p className="font-semibold mb-2">이 대학 넣어야 하나? 저 대학 넣어야 하나? 고민할 필요 없습니다.</p>
            <p className="font-bold text-emerald-700 mb-3">내 점수를 가장 높여주는 대학에 지원해야 합니다!</p>
            <p className="leading-relaxed text-emerald-800">
              내 표점은 고정이지만, 내 대학별 점수는 대학에 따라 점수가 높아지기도 하고, 낮아지기도 합니다.<br />
              이는 대학마다 산정방식의(과목별 가중치 등) 차이 때문에 발생합니다.<br /><br />
              <b>대학별 유불리 페이지</b>에서는 나와 수능 성적이 똑같은(표점) 학생들이 A대학에 진학했을때의 평균점 대비,<br />
              내 점수가 얼마나 높아지나 낮아지냐를 보여줍니다.<br /><br />
              가장 유리한 대학이 어디인지를 쉽게 찾기 위해서, 총점이 다른 대학별 환산점수를 1000점으로 통일시켜<br />
              비교하기 쉽게 만든 지표가 <b>1000점 통일 유불리 지수</b>입니다.<br /><br />
              <span className="font-semibold">아주 유용한 기능이니, 대학 결정에 꼭 참고하시길 바랍니다!</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <p>
          ⭐ <b>동점수 평균 지표</b>는 각 학교에서 <b>동점자(내 표점합)</b>의{" "}
          <b>평균 환산점수</b>를 나타내요.
        </p>
      </div>
      <div className="w-full max-w-screen-xl space-y-4">
        <div className="py-4">
          <div className="h-[1000px] w-full overflow-x-auto">
            <JungsiStep4Chart
              data={sortedAdmissions}
              selectedAdmissions={selectedAdmissions}
              onSelectAdmission={(id) =>
                setSelectedAdmissions((prev) =>
                  prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id],
                )
              }
            />
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Switch
              id="sort-switch"
              checked={sortType === "normalizedScoreDifference"}
              onCheckedChange={() =>
                setSortType(
                  sortType === "normalizedScoreDifference"
                    ? "none"
                    : "normalizedScoreDifference",
                )
              }
            />
            <Label htmlFor="sort-switch">대학 환산 유불리 정렬</Label>
          </div>
        </div>
        <JungsiStep4Table
          admissions={sortedAdmissions}
          selectedAdmissions={selectedAdmissions}
          setSelectedAdmissions={setSelectedAdmissions}
        />
      </div>
      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant="outline" onClick={prevStep}>
          이전 단계
        </Button>
        <Button
          onClick={handleNextClick}
          disabled={selectedAdmissions.length === 0}
        >
          관심대학 저장하기
        </Button>
      </div>
    </div>
  );
};
