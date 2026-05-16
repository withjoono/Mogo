import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExploreJungsiStepper } from "../context/explore-jungsi-provider";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import {
  useGetRegularAdmissions,
  useGetCalculatedScores,
} from "@/stores/server/features/jungsi/queries";
import { Badge } from "@/components/ui/badge";
import { JungsiStep2Chart } from "./step-2-chart";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RegionSelector } from "../step-1/region-selector";
import { IRegion } from "@/types/region.type";
import { Step2DataTable } from "./step-2-data-table";
import { toast } from "sonner";
import { DEMO_MOCK_EXAM_SCORES } from "../demo/demo-mock-exam-data";
import LoadingSpinner from "@/components/loading-spinner";

export const JungsiStep2 = () => {
  const { formData, nextStep, prevStep, updateFormData, isDemo } =
    useExploreJungsiStepper();

  const { data: regularAdmissions } = useGetRegularAdmissions({
    year: 2026,
    admission_type: formData.admissionType,
  });
  const { data: mockExamScores } = useGetMockExamStandardScores();
  const { data: calculatedScores, isLoading: isLoadingScores } =
    useGetCalculatedScores();

  const [isSorted, setIsSorted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmissions, setSelectedAdmissions] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  // 데모 모드에서는 샘플 데이터 사용
  const _effectiveMockExamScores = isDemo ? DEMO_MOCK_EXAM_SCORES : mockExamScores;

  // 백엔드 calculatedScores를 userScores 형태로 매핑
  // scoreCalculationCode(환산인자코드)로 매핑 - 같은 코드를 쓰는 대학/학과는 동일한 환산점수
  const userScores = useMemo(() => {
    const scores: Record<number, { score: number | null; error: string | null }> = {};

    if (!calculatedScores || !regularAdmissions) {
      console.log("[Step2] calculatedScores 또는 regularAdmissions 없음:", {
        calculatedScores: calculatedScores?.length,
        regularAdmissions: regularAdmissions?.length,
      });
      return scores;
    }

    console.log("[Step2] 환산점수 매핑 시작:", {
      calculatedScoresCount: calculatedScores.length,
      regularAdmissionsCount: regularAdmissions.length,
    });

    // 환산점수를 scoreCalculationCode로 매핑
    const scoreMap = new Map(
      calculatedScores.map((score) => [score.scoreCalculationCode, score]),
    );

    console.log("[Step2] scoreMap 크기:", scoreMap.size);
    console.log("[Step2] scoreMap 샘플 키들:", [...scoreMap.keys()].slice(0, 5));

    // regularAdmissions의 scoreCalculationCode 샘플 확인
    const admissionCodes = regularAdmissions.slice(0, 10).map(a => ({
      id: a.id,
      name: a.university.name,
      code: a.scoreCalculationCode,
    }));
    console.log("[Step2] regularAdmissions 샘플 코드들:", admissionCodes);

    let matchCount = 0;
    let noMatchCount = 0;

    for (const admission of regularAdmissions) {
      const scoreKey = admission.scoreCalculationCode;
      const savedScore = scoreKey ? scoreMap.get(scoreKey) : null;

      if (savedScore && savedScore.convertedScore) {
        scores[admission.id] = { score: savedScore.convertedScore, error: null };
        matchCount++;
      } else {
        scores[admission.id] = { score: null, error: "환산점수 없음" };
        noMatchCount++;
      }
    }

    console.log("[Step2] 매핑 결과:", { matchCount, noMatchCount });

    return scores;
  }, [calculatedScores, regularAdmissions]);

  const filteredAdmissions = useMemo(() => {
    if (!regularAdmissions || !searchTerm) return [];
    return regularAdmissions.filter(
      (admission) =>
        admission.recruitmentName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        admission.university.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [regularAdmissions, searchTerm]);

  const filteredChartData = useMemo(() => {
    return filteredAdmissions.filter((admission) => {
      const regionMatch =
        formData.region.length === 0 ||
        formData.region.includes(admission.university.region as IRegion);

      return regionMatch;
    });
  }, [filteredAdmissions, formData.region]);

  const uniqueAdmissionNames = useMemo(() => {
    return [
      ...new Set(
        filteredAdmissions.map((admission) => admission.recruitmentName),
      ),
    ];
  }, [filteredAdmissions]);

  const handleSearch = () => {
    if (!searchTerm) {
      toast.info("검색어를 입력해주세요.");
      return;
    }
    setShowResults(true);
  };

  const handleNextClick = () => {
    if (
      formData.step1SelectedIds.length === 0 &&
      selectedAdmissions.length === 0
    ) {
      toast.error("대학별/학과별 검색에서 하나 이상의 전형을 선택해야합니다.");
      return;
    }

    updateFormData("step2SelectedIds", selectedAdmissions);
    nextStep();
  };

  // 로딩 중일 때 표시
  if (isLoadingScores) {
    return <LoadingSpinner className="pt-40" />;
  }

  return (
    <div className="space-y-3 px-4 pt-4 md:space-y-6">
      <div className="flex w-full items-center justify-center gap-2 pb-4">
        <Input
          type="text"
          placeholder="학과명 검색 (ex. 간호, 무역)"
          value={searchTerm}
          onChange={(e) => {
            setShowResults(false);
            setSearchTerm(e.target.value);
          }}
          className="w-full max-w-md"
        />
      </div>

      {searchTerm && !showResults && (
        <div className="space-y-2">
          <p className="text-center text-lg font-semibold">
            검색 할 학과 (총 {uniqueAdmissionNames.length}개)
          </p>
          <div className="mb-4 flex flex-wrap justify-center gap-2 text-sm">
            {uniqueAdmissionNames.map((item) => (
              <Badge
                key={item}
                onClick={() => setSearchTerm(item || "")}
                className="cursor-pointer text-base"
              >
                {item}
              </Badge>
            ))}
          </div>
          <div className="flex justify-center py-8">
            <Button type="button" onClick={handleSearch}>
              검색
            </Button>
          </div>
        </div>
      )}

      {!searchTerm && !showResults && (
        <p className="text-center text-sm">
          학과명으로 탐색하려면 검색어를 입력하고, 탐색하지 않으려면 다음단계로
          진행해주세요.
        </p>
      )}

      {showResults && (
        <>
          <RegionSelector />
          <p className="text-red-500">
            ⭐ 차트에서는 원할한 대학 비교를 위해 총점과 점수가{" "}
            <b>1000점으로 통일</b>
            되어 있습니다.
          </p>
          <div className="py-4">
            <div className="h-[500px] w-full overflow-x-auto">
              <JungsiStep2Chart
                data={filteredChartData}
                onSelectAdmission={(id) => {
                  setSelectedAdmissions((prev) =>
                    prev.includes(id)
                      ? prev.filter((item) => item !== id)
                      : [...prev, id],
                  );
                }}
                selectedAdmissions={selectedAdmissions}
                isSorted={isSorted}
                userScores={userScores}
              />
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Switch
                id="sort-switch"
                checked={isSorted}
                onCheckedChange={setIsSorted}
              />
              <Label htmlFor="sort-switch">추합컷 정렬</Label>
            </div>
          </div>
          <Step2DataTable
            data={filteredChartData}
            selectedAdmissions={selectedAdmissions}
            setSelectedAdmissions={setSelectedAdmissions}
            userScores={userScores}
          />
        </>
      )}

      <div className="flex items-center justify-center gap-4 py-12">
        <Button
          variant="outline"
          onClick={() => {
            updateFormData("region", []);
            updateFormData("selectedGeneralFieldName", "전체");
            prevStep();
          }}
        >
          이전 단계
        </Button>
        <Button onClick={handleNextClick}>다음 단계</Button>
      </div>
    </div>
  );
};
