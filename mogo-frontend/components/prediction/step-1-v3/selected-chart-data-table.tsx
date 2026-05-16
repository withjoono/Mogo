import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { IJungsiStep1GroupData } from "./step-1";
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";

interface SelectedChartDataTableProps {
  className?: string;
  data: Record<string, IJungsiStep1GroupData>;
  selectedChartKeys: string[];
  selectedAdmissions: number[];
  setSelectedAdmissions: React.Dispatch<React.SetStateAction<number[]>>;
  myScore: number;
}

export const SelectedChartDataTable = ({
  data,
  selectedChartKeys,
  selectedAdmissions,
  setSelectedAdmissions,
  myScore,
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
              <th className="w-48 py-2 text-start font-normal">학과명</th>
              <th className="w-20 py-2 text-start font-normal">최초누백</th>
              <th className="w-20 py-2 text-start font-normal">추합누백</th>
              <th className="w-20 py-2 text-start font-normal">내백분위</th>
              <th className="w-20 py-2 text-start font-normal">차이</th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {currentPageItems.map((item) => {
              if (!item) return null;

              const isSelected = checkSelectedItem(item);

              const minCut = parseFloat(item.minCutPercent || "0");
              const maxCut = parseFloat(item.maxCutPercent || "0");

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
                  <td className="break-all py-2">{item.generalFieldName}</td>
                  <td className="break-all py-2">{item.admissionName}</td>
                  <td className="break-all py-2">{item.recruitmentName}</td>
                  <td className="py-2">{minCut.toFixed(2)}</td>
                  <td className="py-2">{maxCut.toFixed(2)}</td>
                  <td
                    className={cn(
                      "py-2",
                      myScore < minCut
                        ? "text-blue-500"
                        : myScore < maxCut
                          ? "text-green-500"
                          : "text-red-500",
                    )}
                  >
                    {myScore}
                  </td>
                  <td
                    className={cn(
                      "py-2 text-xs",
                      myScore < minCut
                        ? "text-blue-500"
                        : myScore < maxCut
                          ? "text-green-500"
                          : "text-red-500",
                    )}
                  >
                    {myScore < minCut
                      ? `${0 < minCut - myScore ? "+" : ""}${(minCut - myScore).toFixed(2)} (여유)`
                      : myScore < maxCut
                        ? `${0 < maxCut - myScore ? "+" : ""}${(maxCut - myScore).toFixed(2)} (적정)`
                        : `${0 < maxCut - myScore ? "+" : ""}${(maxCut - myScore).toFixed(2)} (위험)`}
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
