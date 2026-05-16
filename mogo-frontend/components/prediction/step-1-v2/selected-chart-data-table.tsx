import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { I대학백분위 } from "./step-1";
import { toast } from "sonner";

interface SelectedChartDataTableProps {
  className?: string;
  selectedUniversities: string[];
  setSelectedUniversities: React.Dispatch<React.SetStateAction<string[]>>;
  data: I대학백분위[];
  myScore: number; // 사용자의 백분위 점수
}

export const SelectedChartDataTable: React.FC<SelectedChartDataTableProps> = ({
  className,
  selectedUniversities,
  setSelectedUniversities,
  data,
  myScore,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectedUniversities.length >= 20) {
      setSelectedUniversities([]);
    } else {
      if (data.length > 20) {
        toast.error("한번에 최대 20개의 대학만 선택할 수 있습니다.");
        return;
      } else {
        setSelectedUniversities(
          data.map((item) => `${item.대학명}-${item.지역}`),
        );
      }
    }
  };

  const handleToggleSelect = (key: string) => {
    if (selectedUniversities.length >= 20) {
      toast.error("한번에 최대 20개의 대학만 선택할 수 있습니다.");
      return;
    }
    setSelectedUniversities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-4 pb-8",
        className,
      )}
    >
      <p className="text-center text-2xl font-semibold">
        🏫 대학교 목록({selectedUniversities.length})
      </p>
      <p className="text-center text-sm text-foreground/60">
        나의 누적백분위와 비교하여 대학교를 선택해주세요!
      </p>

      <div className="w-full max-w-screen-lg overflow-x-auto text-sm">
        <div className="mb-4 flex items-center justify-end gap-4">
          <p>
            {selectedUniversities.length} / {data.length}
          </p>
          <Button
            className="flex items-center px-3 py-1.5"
            variant={
              selectedUniversities.length === data.length
                ? "default"
                : "outline"
            }
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
              <th className="w-20 py-2 text-start font-normal">지역</th>
              <th className="w-20 py-2 text-start font-normal">최고 백분위</th>
              <th className="w-20 py-2 text-start font-normal">최저 백분위</th>
              <th className="w-32 py-2 text-start font-normal">나의 누적백분위</th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {data
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
              )
              .map((item) => {
                const key = `${item.대학명}-${item.지역}`;
                const isSelected = selectedUniversities.includes(key);
                return (
                  <tr
                    key={key}
                    className="cursor-pointer border-t hover:bg-accent"
                    onClick={() => handleToggleSelect(key)}
                  >
                    <td className="align-middle">
                      <div className="flex h-full items-center justify-center">
                        <Checkbox checked={isSelected} />
                      </div>
                    </td>
                    <td className="py-2">{item.대학명}</td>
                    <td className="py-2">{item.지역}</td>
                    <td className="py-2">{item.최고값}</td>
                    <td className="py-2">{item.최저값}</td>
                    <td className="py-2">{myScore.toFixed(2)}</td>
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

export default SelectedChartDataTable;
