import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useExploreJungsiStepper } from "./context/explore-jungsi-provider";
import {
  useGetRegularAdmissions,
  useGetCalculatedScores,
} from "@/stores/server/features/jungsi/queries";
import { calc정시위험도 } from "@/lib/calculations/regular-v2/risk";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/loading-spinner";
import { Link } from "next/link";
import { ProcessedAdmission } from "../components/step-4/step-4-data-table";
import { JungsiStep4DemoTable } from "./jungsi-step4-demo-table";
import JungsiStep4Chart from "../components/step-4/step-4-chart";

const DEMO_VISIBLE_COUNT = 3;

export const JungsiStep4Demo = () => {
  const { prevStep, nextStep, formData } = useExploreJungsiStepper();
  const { data: regularAdmissions } = useGetRegularAdmissions({
    year: 2025,
    admission_type: formData.admissionType,
  });
  const { data: calculatedScores, isLoading: isLoadingScores } =
    useGetCalculatedScores();

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
            (a.normalizedScoreDifference || -10000)
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
        formData.step3SelectedIds.includes(admission.id)
      );
      const processed: ProcessedAdmission[] = [];

      // 환산점수를 universityId로 매핑
      const scoreMap = new Map(
        calculatedScores.map((score) => [score.universityId, score])
      );

      for (const admission of filtered) {
        const savedScore = scoreMap.get(admission.university.id);

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

          const optimalScore = savedScore.optimalScore;
          const scoreDifference = savedScore.scoreDifference || 0;
          const totalScore = admission.totalScore || 1000;
          const normalizedScoreDifference =
            (scoreDifference / totalScore) * 1000;

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

  const totalCount = sortedAdmissions.length;
  const hiddenCount = Math.max(0, totalCount - DEMO_VISIBLE_COUNT);

  return (
    <div className="flex flex-col items-center justify-center px-2 py-12">
      {/* 거북쌤 유불리 안내 말풍선 */}
      <div className="mb-6 w-full max-w-screen-xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <img
              src="/images/turtle-teacher-2.png"
              alt="거북쌤"
              className="h-24 w-24 object-contain"
            />
          </div>
          <div className="relative flex-1 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <div className="absolute left-0 top-8 -translate-x-full">
              <div className="border-8 border-transparent border-r-emerald-200" />
            </div>
            <div className="absolute left-0 top-8 -translate-x-[calc(100%-1px)]">
              <div className="border-8 border-transparent border-r-emerald-50" />
            </div>
            <p className="mb-2 font-semibold">
              이 대학 넣어야 하나? 저 대학 넣어야 하나? 고민할 필요 없습니다.
            </p>
            <p className="mb-3 font-bold text-emerald-700">
              내 점수를 가장 높여주는 대학에 지원해야 합니다!
            </p>
            <p className="leading-relaxed text-emerald-800">
              내 표점은 고정이지만, 내 대학별 점수는 대학에 따라 점수가
              높아지기도 하고, 낮아지기도 합니다.
              <br />
              이는 대학마다 산정방식의(과목별 가중치 등) 차이 때문에 발생합니다.
              <br />
              <br />
              <b>대학별 유불리 페이지</b>에서는 나와 수능 성적이 똑같은(표점)
              학생들이 A대학에 진학했을때의 평균점 대비,
              <br />내 점수가 얼마나 높아지나 낮아지냐를 보여줍니다.
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
          <div className="h-[500px] w-full overflow-x-auto">
            <JungsiStep4Chart
              data={sortedAdmissions.slice(0, DEMO_VISIBLE_COUNT)}
              selectedAdmissions={selectedAdmissions}
              onSelectAdmission={(id) =>
                setSelectedAdmissions((prev) =>
                  prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id]
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
                    : "normalizedScoreDifference"
                )
              }
            />
            <Label htmlFor="sort-switch">대학 환산 유불리 정렬</Label>
          </div>
        </div>

        {/* 데모 테이블 (상위 3개만 표시, 나머지 블러) */}
        <JungsiStep4DemoTable
          admissions={sortedAdmissions}
          selectedAdmissions={selectedAdmissions}
          setSelectedAdmissions={setSelectedAdmissions}
          visibleCount={DEMO_VISIBLE_COUNT}
        />

        {/* 전체 보기 CTA */}
        {hiddenCount > 0 && (
          <div className="relative mt-8">
            <div className="rounded-xl border-2 border-teal-300 bg-gradient-to-r from-teal-50 to-emerald-50 p-8 text-center">
              <div className="mb-4">
                <span className="inline-block rounded-full bg-teal-500 px-4 py-1 text-sm font-bold text-white">
                  무료 체험 중
                </span>
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                나머지 {hiddenCount}개 대학의 유불리도 확인하세요!
              </h3>
              <p className="mb-6 text-gray-600">
                전체 {totalCount}개 대학 중 상위 {DEMO_VISIBLE_COUNT}개만
                표시되고 있습니다.
                <br />
                이용권을 구매하시면 모든 대학의 유불리를 확인하고 관심대학으로
                저장할 수 있습니다.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="rounded-lg bg-teal-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-teal-700 hover:shadow-xl"
                >
                  이용권 구매하기
                </Link>
                <Link
                  href="/jungsi/a"
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-lg font-medium text-gray-700 transition-all hover:bg-gray-50"
                >
                  전체 서비스 이용하기
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 py-12">
        <Button variant="outline" onClick={prevStep}>
          이전 단계
        </Button>
        <Button onClick={nextStep} disabled={selectedAdmissions.length === 0}>
          완료
        </Button>
      </div>
    </div>
  );
};
