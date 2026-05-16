import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { IJungsiStep1GroupData } from "./step-1";
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";
import { RiskBadge } from "@/components/custom/risk-badge";
import { calc정시위험도 } from "@/lib/calculations/regular-v2/risk";

interface SelectedChartDataTableProps {
  className?: string;
  data: Record<string, IJungsiStep1GroupData>;
  selectedChartKeys: string[];
  selectedAdmissions: number[];
  setSelectedAdmissions: React.Dispatch<React.SetStateAction<number[]>>;
}

export const SelectedChartDataTable = ({
  data,
  selectedChartKeys,
  selectedAdmissions,
  setSelectedAdmissions,
  className,
}: SelectedChartDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedItems = useMemo(() => {
    return selectedChartKeys.flatMap((key) => data[key]?.items || []);
  }, [data, selectedChartKeys]);

  const totalPages = Math.ceil(selectedItems.length / itemsPerPage);

  const isAllSelected = selectedItems.every((item) =>
    selectedAdmissions.includes(item.id),
  );

  const onClick = (item: IRegularAdmission) => {
    if (selectedAdmissions.includes(item.id)) {
      setSelectedAdmissions(selectedAdmissions.filter((n) => n !== item.id));
    } else {
      setSelectedAdmissions([...selectedAdmissions, item.id]);
    }
  };

  const checkSelectedItem = (item: IRegularAdmission) => {
    return selectedAdmissions.includes(item.id);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAdmissions((prev) =>
        prev.filter((id) => !selectedItems.some((item) => item.id === id)),
      );
    } else {
      const newSelectedIds = selectedItems.map((item) => item.id);
      setSelectedAdmissions((prev) => [
        ...new Set([...prev, ...newSelectedIds]),
      ]);
    }
  };

  const currentPageItems = selectedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const selectedCountInCurrentData = selectedItems.filter((item) =>
    selectedAdmissions.includes(item.id),
  ).length;

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-4 pb-8",
        className,
      )}
    >
      <p className="text-center text-2xl font-semibold">
        🏫 대학교 목록({selectedChartKeys.length})
      </p>
      <p className="text-center text-sm text-foreground/60">
        내 점수와 비교하여 대학교를 선택해주세요!
      </p>

      <div className="w-full max-w-screen-lg overflow-x-auto text-sm">
        <div className="mb-4 flex items-center justify-end gap-4">
          <p>
            {selectedCountInCurrentData} / {selectedItems.length}
          </p>
          <Button
            className="flex items-center px-3 py-1.5"
            variant={isAllSelected ? "default" : "outline"}
            onClick={handleSelectAll}
          >
            <span>전체 선택/해제</span>
          </Button>
        </div>
        <table className="w-full min-w-96 table-fixed bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-8 shrink-0 py-2 font-normal">선택</th>
              <th className="w-28 py-2 text-start font-normal">대학명</th>
              <th className="w-20 py-2 text-start font-normal">계열</th>
              <th className="w-32 py-2 text-start font-normal">전형명</th>
              <th className="w-32 py-2 text-start font-normal">학과명</th>
              <th className="w-20 py-2 text-start font-normal">총점</th>
              <th className="w-20 py-2 text-start font-normal">최초컷</th>
              <th className="w-20 py-2 text-start font-normal">추합컷</th>
              <th className="w-20 py-2 text-start font-normal">내 점수</th>
              <th className="w-20 py-2 text-start font-normal">위험도</th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {currentPageItems.map((item) => {
              if (!item) return null;

              const isSelected = checkSelectedItem(item);
              const groupData = Object.values(data).find((group) =>
                group.items.some((groupItem) => groupItem.id === item.id),
              );
              const userScoreData = groupData?.user_scores[item.id];
              const minCut = parseFloat(item.min_cut || "0");
              const maxCut = parseFloat(item.max_cut || "0");

              return (
                <tr
                  key={item.id}
                  className="cursor-pointer border-t hover:bg-accent"
                  onClick={() => onClick(item)}
                >
                  <td className="align-middle">
                    <div className="flex h-full items-center justify-center">
                      <Checkbox checked={isSelected} />
                    </div>
                  </td>
                  <td className="break-all py-2">
                    {item.university.name}({item.university.region})
                  </td>
                  <td className="break-all py-2">{item.general_field_name}</td>
                  <td className="break-all py-2">{item.admission_name}</td>
                  <td className="break-all py-2">{item.recruitment_name}</td>
                  <td className="py-2">{item.total_score || "-"}</td>
                  <td className="py-2">{minCut.toFixed(2)}</td>
                  <td className="py-2">{maxCut.toFixed(2)}</td>
                  <td className="py-2">
                    {userScoreData
                      ? userScoreData.score !== null
                        ? userScoreData.score.toFixed(2)
                        : userScoreData.error || "계산 오류"
                      : "계산 중..."}
                  </td>
                  <td className="py-2">
                    {userScoreData && userScoreData.score !== null ? (
                      <RiskBadge
                        risk={calc정시위험도(userScoreData.score, {
                          risk_10: maxCut,
                          risk_9: maxCut - (maxCut - minCut) * 0.1,
                          risk_8: maxCut - (maxCut - minCut) * 0.2,
                          risk_7: maxCut - (maxCut - minCut) * 0.3,
                          risk_6: maxCut - (maxCut - minCut) * 0.4,
                          risk_5: minCut + (maxCut - minCut) * 0.5,
                          risk_4: minCut + (maxCut - minCut) * 0.4,
                          risk_3: minCut + (maxCut - minCut) * 0.3,
                          risk_2: minCut + (maxCut - minCut) * 0.2,
                          risk_1: minCut + (maxCut - minCut) * 0.1,
                        })}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {currentPage} / {totalPages}
        </div>
        <div className="flex items-center justify-end space-x-2">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
