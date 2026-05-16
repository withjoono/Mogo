import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RiskBadge } from "@/components/custom/risk-badge";
import { ProcessedAdmission } from "./step-3";
import { cn } from "@/lib/utils";

type SortType = "none" | "maxCut" | "myScore";

interface JungsiStep3TableComponentProps {
  admissions: ProcessedAdmission[];
  selectedAdmissions: number[];
  toggleSelection: (id: number) => void;
  onSelectAll: () => void;
  className?: string;
  onClickDetail: (admissionId: number) => void;
}

const JungsiStep3TableComponent: React.FC<JungsiStep3TableComponentProps> = ({
  admissions,
  selectedAdmissions,
  toggleSelection,
  onSelectAll,
  className,
  onClickDetail,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState<SortType>("myScore");
  const itemsPerPage = 10;

  const sortedAdmissions = useMemo(() => {
    switch (sortType) {
      case "myScore":
        return [...admissions].sort(
          (a, b) => (b.risk || -100) - (a.risk || -100),
        );
      default:
        return admissions;
    }
  }, [admissions, sortType]);

  const currentItems = sortedAdmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(sortedAdmissions.length / itemsPerPage);

  const handleSortChange = (newSortType: SortType) => {
    setSortType((prevSortType) =>
      prevSortType === newSortType ? "none" : newSortType,
    );
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-4 pb-8",
        className,
      )}
    >
      <div className="flex w-full items-center justify-end gap-4">
        <p>
          {selectedAdmissions.length} / {admissions.length}
        </p>
        <Button
          className="flex items-center px-3 py-1.5"
          variant={
            selectedAdmissions.length === admissions.length
              ? "default"
              : "outline"
          }
          onClick={onSelectAll}
        >
          <span>전체 선택/해제</span>
        </Button>
      </div>
      <div className="flex w-full items-center justify-end gap-2">
        <div className="mt-4 flex items-center space-x-2">
          <Switch
            id="myScoreSort"
            checked={sortType === "myScore"}
            onCheckedChange={() => handleSortChange("myScore")}
          />
          <Label htmlFor="myScoreSort">위험도 정렬</Label>
        </div>
      </div>
      <table className="w-full min-w-96 table-fixed bg-white text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="w-8 shrink-0 py-2 font-normal">선택</th>
            <th className="w-32 py-2 text-start font-normal">대학명</th>
            <th className="w-32 py-2 text-start font-normal">학과명</th>
            <th className="w-10 py-2 text-start font-normal">군</th>
            <th className="w-24 py-2 text-start font-normal">배치컷(표점합)</th>
            <th className="w-24 py-2 text-start font-normal">내 표준점수합</th>
            <th className="w-24 py-2 text-start font-normal">점수차</th>
            <th className="w-24 py-2 text-start font-normal">위험도</th>
            <th className="w-32 py-2 text-start font-normal">비고</th>
          </tr>
        </thead>
        <tbody className="font-semibold">
          {currentItems.map((admission) => (
            <tr
              key={admission.id}
              className="cursor-pointer border-t hover:bg-accent"
              onClick={() => toggleSelection(admission.id)}
            >
              <td className="align-middle">
                <div className="flex h-full items-center justify-center">
                  <Checkbox
                    checked={selectedAdmissions.includes(admission.id)}
                  />
                </div>
              </td>
              <td className="break-all py-2">
                {admission.university.name}({admission.university.region})
              </td>
              <td className="break-all py-2">{admission.recruitmentName}</td>
              <td className="py-2 text-xs text-muted-foreground">{admission.admissionType}</td>
              <td className="py-2 font-bold">
                {admission.standardScore ? admission.standardScore : "-"}
              </td>
              <td className="py-2">
                {admission.myScore ?? "-"}
              </td>
              <td className="py-2">
                {admission.scoreDifference != null ? (
                  <span className={admission.scoreDifference >= 0 ? "text-blue-600" : "text-red-600"}>
                    {admission.scoreDifference > 0 ? "+" : ""}{Math.round(admission.scoreDifference)}
                  </span>
                ) : "-"}
              </td>
              <td className="py-2">
                <RiskBadge risk={admission.risk || 0} />
              </td>
              <td className="break-all py-2 text-xs text-muted-foreground">
                {admission.errorMessage || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col items-center justify-center space-y-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {currentPage} / {totalPages}
        </div>
        <div className="flex items-center justify-end space-x-2">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
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

export default JungsiStep3TableComponent;
