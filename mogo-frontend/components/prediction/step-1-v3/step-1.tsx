import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  useGetActiveServices,
  useGetCurrentUser,
} from "@/stores/server/features/me/queries";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useExploreJungsiStepper } from "../context/explore-jungsi-provider";
import { useGetRegularAdmissions } from "@/stores/server/features/jungsi/queries";
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";
import { RegionSelector } from "./region-selector";
import { GeneralFieldSelector } from "./general-field-selector";
import { IRegion } from "@/types/region.type";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGetMockExamStandardScores } from "@/stores/server/features/mock-exam/queries";
import { Sparkles } from "lucide-react";
import { SelectedChartDataTable } from "./selected-chart-data-table";
import { JungsiStep1Chart } from "./step-1-chart";
import { DEMO_MOCK_EXAM_SCORES } from "../demo/demo-mock-exam-data";

export interface IJungsiStep1GroupData {
  universityName: string;
  universityRegion: string;
  generalField: string;
  items: IRegularAdmission[];
  rangeMin: number | null;
  rangeMax: number | null;
  hasValidPercentile: boolean;
}

export const JungsiStep1v3 = () => {
  const { data: user } = useGetCurrentUser();
  const { formData, nextStep, updateFormData, isDemo } = useExploreJungsiStepper();

  const { data: regularAdmissions, isFetching: isQueryFetching } = useGetRegularAdmissions({
    year: 2026,
    admission_type: formData.admissionType,
  });
  const { data: mockExamScores } = useGetMockExamStandardScores();
  const { data: activeServices } = useGetActiveServices();

  const [isSorted, setIsSorted] = useState(false);
  const [selectedUniversitiesChart, setSelectedUniversitiesChart] = useState<
    string[]
  >([]);
  const [selectedAdmissionsTable, setSelectedAdmissionsTable] = useState<
    number[]
  >([]);
  const [
    filteredAndGroupedRegularAdmissions,
    setFilteredAndGroupedRegularAdmissions,
  ] = useState<Record<string, IJungsiStep1GroupData>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 데모 모드에서는 샘플 데이터 사용
  const effectiveMockExamScores = isDemo ? DEMO_MOCK_EXAM_SCORES : mockExamScores;

  // 백엔드에서 계산된 나의 누적백분위 사용
  const userPercentile = useMemo(() => {
    if (!effectiveMockExamScores) return 0;
    return effectiveMockExamScores.myCumulativePercentile;
  }, [effectiveMockExamScores]);

  useEffect(() => {
    const processData = async () => {
      if (!regularAdmissions || !effectiveMockExamScores) {
        setFilteredAndGroupedRegularAdmissions({});
        if (!isQueryFetching) {
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }
        return;
      }

      setIsLoading(true);

      const filteredData = regularAdmissions.filter((item) => {
        const regionMatch =
          formData.region.length === 0 ||
          formData.region.includes(item.university.region as IRegion);
        const generalFieldMatch =
          formData.selectedGeneralFieldName === "전체" ||
          formData.selectedGeneralFieldName === item.generalFieldName;
        return regionMatch && generalFieldMatch;
      });

      const groupedData = await groupDataByUniversityGeneralField(filteredData);

      let sortedData = groupedData;
      if (isSorted) {
        sortedData = Object.fromEntries(
          Object.entries(groupedData).sort(([, a], [, b]) => {
            // null 값 처리: null은 가장 낮은 우선순위
            if (b.rangeMax === null) return -1;
            if (a.rangeMax === null) return 1;
            return a.rangeMax - b.rangeMax;
          }),
        );
      }

      setFilteredAndGroupedRegularAdmissions(sortedData);
      setIsLoading(false);
    };

    processData();
  }, [
    regularAdmissions,
    effectiveMockExamScores,
    formData.region,
    formData.selectedGeneralFieldName,
    isSorted,
    isQueryFetching,
  ]);

  const handleNextClick = () => {
    if (!user?.id) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!isDemo && !activeServices?.includes("S") && !activeServices?.includes("J")) {
      toast.error("이용권 구매가 필요합니다.");
      return;
    }

    updateFormData("step1SelectedIds", [...selectedAdmissionsTable]);
    updateFormData("region", []);
    updateFormData("selectedGeneralFieldName", "전체");
    nextStep();
  };

  const handleSelectUniversity = (key: string) => {
    setSelectedUniversitiesChart((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 pt-40 pb-40">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20"></div>
          <div className="absolute h-20 w-20 animate-spin rounded-full border-4 border-primary border-t-transparent opacity-80"></div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
             <Sparkles className="h-6 w-6 animate-pulse text-primary-foreground" />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <p className="animate-pulse text-lg font-bold tracking-tight text-primary">
            환산점수 실시간 계산 및 필터링 중...
          </p>
          <p className="animate-pulse text-sm font-medium text-muted-foreground">
            모집 단위와 대학별 유불리를 분석하고 있습니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-4 pt-4 md:space-y-6">
      <RegionSelector />
      <GeneralFieldSelector />

      <div className="py-4">
        <div className="h-[500px] overflow-x-auto">
          <JungsiStep1Chart
            data={filteredAndGroupedRegularAdmissions}
            onSelectUniversity={handleSelectUniversity}
            selectedKeys={selectedUniversitiesChart}
            myScore={userPercentile}
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

      {user?.id ? (
        selectedUniversitiesChart.length === 0 ? (
          <NoSelectionMessage />
        ) : (
          <SelectedChartDataTable
            selectedChartKeys={selectedUniversitiesChart}
            selectedAdmissions={selectedAdmissionsTable}
            setSelectedAdmissions={setSelectedAdmissionsTable}
            data={filteredAndGroupedRegularAdmissions}
            myScore={userPercentile}
          />
        )
      ) : (
        <NoLoginMessage />
      )}

      <div className="flex items-center justify-center py-12">
        {user?.id ? (
          <Button onClick={handleNextClick}>다음 단계</Button>
        ) : (
          <Link href="/auth/login" className={cn(buttonVariants())}>
            로그인
          </Link>
        )}
      </div>
    </div>
  );
};

const NoLoginMessage = () => (
  <div className="flex w-full animate-bounce items-center justify-center py-8 font-semibold text-primary">
    🚨 로그인을 해야 서비스를 이용할 수 있습니다.
  </div>
);

const NoSelectionMessage = () => (
  <div className="flex w-full animate-bounce items-center justify-center py-8 font-semibold text-primary">
    위 차트에서 대학을 선택해주세요!
  </div>
);

const groupDataByUniversityGeneralField = async (
  data: IRegularAdmission[],
): Promise<Record<string, IJungsiStep1GroupData>> => {
  const grouped: Record<string, IJungsiStep1GroupData> = {};

  for (const item of data) {
    const key = `${item.university.name}-${item.university.region}-${item.generalFieldName}`;
    const minCutPercentStr = item.initialCumulativePercentile || item.minCutPercent || "0";
    const maxCutPercentStr = item.additionalCumulativePercentile || item.maxCutPercent || "0";
    const minCutPercent = parseFloat(minCutPercentStr);
    const maxCutPercent = parseFloat(maxCutPercentStr);

    // 2026년 데이터는 입결 데이터가 없으므로 필터링 제거
    // minCutPercent와 maxCutPercent가 모두 0이어도 대학 표시

    if (!grouped[key]) {
      grouped[key] = {
        universityName: item.university.name,
        universityRegion: item.university.region,
        generalField: item.generalFieldName,
        items: [],
        rangeMin: null,
        rangeMax: null,
        hasValidPercentile: false,
      };
    }

    grouped[key].items.push(item);

    // 유효한 값만 range 계산에 포함
    if (minCutPercent > 0) {
      grouped[key].rangeMin =
        grouped[key].rangeMin === null
          ? minCutPercent
          : Math.min(grouped[key].rangeMin, minCutPercent);
    }
    if (maxCutPercent > 0) {
      grouped[key].rangeMax =
        grouped[key].rangeMax === null
          ? maxCutPercent
          : Math.max(grouped[key].rangeMax, maxCutPercent);
    }
  }

  // Post-processing
  Object.keys(grouped).forEach((key) => {
    const group = grouped[key];
    if (group.rangeMin === null && group.rangeMax === null) {
      group.rangeMin = 0;
      group.rangeMax = 0;
      group.hasValidPercentile = false;
    } else if (group.rangeMin === null) {
      group.rangeMin = group.rangeMax!;
      group.hasValidPercentile = false;
    } else if (group.rangeMax === null) {
      group.rangeMax = group.rangeMin;
      group.hasValidPercentile = false;
    } else {
      if (group.rangeMin === group.rangeMax) {
        group.rangeMax = Math.min(group.rangeMax + 10, 100);
      }
      if (group.rangeMin > group.rangeMax) {
        [group.rangeMin, group.rangeMax] = [group.rangeMax, group.rangeMin];
      }
      group.hasValidPercentile = true;
    }
  });

  return grouped;
};
