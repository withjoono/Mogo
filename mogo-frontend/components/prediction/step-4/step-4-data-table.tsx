import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RiskBadge } from "@/components/custom/risk-badge";
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ProcessedAdmission extends IRegularAdmission {
  myScore?: number;
  risk?: number;
  standardScore?: number;
  optimalScore?: number;      // 동점수 평균
  scoreDifference?: number;   // 유불리 (음수면 유리, 양수면 불리)
  normalizedScoreDifference?: number;
  errorMessage?: string;
}

interface JungsiStep4TableProps {
  admissions: ProcessedAdmission[];
  selectedAdmissions: number[];
  setSelectedAdmissions: React.Dispatch<React.SetStateAction<number[]>>;
}

export const JungsiStep4Table: React.FC<JungsiStep4TableProps> = ({
  admissions,
  selectedAdmissions,
  setSelectedAdmissions,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const currentItems = admissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(admissions.length / itemsPerPage);

  const toggleSelection = (id: number) => {
    setSelectedAdmissions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedAdmissions.length === admissions.length) {
      setSelectedAdmissions([]);
    } else {
      setSelectedAdmissions(admissions.map((item) => item.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-end gap-2">
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
              onClick={handleSelectAll}
            >
              <span>전체 선택/해제</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-96 table-fixed bg-white text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-8 shrink-0 py-2 font-normal">선택</th>
              <th className="w-36 py-2 text-start font-normal">대학명</th>
              <th className="w-36 py-2 text-start font-normal">학과명</th>
              <th className="w-16 py-2 text-start font-normal">총점</th>
              <th className="w-24 py-2 text-start font-normal">최초컷</th>
              <th className="w-24 py-2 text-start font-normal">내 점수</th>
              <th className="w-24 py-2 text-start font-normal">동점수 평균</th>
              <th className="w-24 py-2 text-start font-normal">점수차이</th>
              <th className="w-24 bg-primary/5 py-2 text-start font-semibold">
                점수차이 <br />
                (1000점 기준)
              </th>
              <th className="w-24 py-2 text-start font-normal">위험도</th>
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
                <td className="py-2">{admission.totalScore}</td>
                <td className="py-2">
                  {admission.minCut
                    ? parseFloat(admission.minCut).toFixed(2)
                    : "-"}
                </td>
                <td className="py-2">
                  {admission.errorMessage || admission.myScore?.toFixed(2)}
                </td>
                <td className="py-2">
                  {admission.errorMessage ||
                    (admission.optimalScore != null ? admission.optimalScore.toFixed(2) : "-")}
                </td>
                <td
                  className={cn(
                    "py-2",
                    !admission.scoreDifference ||
                      admission.scoreDifference === 0
                      ? "text-black"
                      : 0 < admission.scoreDifference
                        ? "text-green-500"
                        : "text-red-500",
                  )}
                >
                  {admission.errorMessage ||
                    admission.scoreDifference?.toFixed(2)}
                </td>
                <td
                  className={cn(
                    "bg-primary/5 py-2",
                    !admission.normalizedScoreDifference ||
                      admission.normalizedScoreDifference === 0
                      ? "text-black"
                      : 0 < admission.normalizedScoreDifference
                        ? "text-green-500"
                        : "text-red-500",
                  )}
                >
                  {admission.errorMessage ||
                    admission.normalizedScoreDifference?.toFixed(2)}
                </td>
                <td className="py-2">
                  {admission.errorMessage || (
                    <RiskBadge risk={admission.risk || 0} />
                  )}
                </td>
              </tr>
            ))}
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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

export default JungsiStep4Table;
