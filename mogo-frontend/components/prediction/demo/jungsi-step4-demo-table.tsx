import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RiskBadge } from "@/components/custom/risk-badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "next/link";
import { Lock } from "lucide-react";
import { ProcessedAdmission } from "../components/step-4/step-4-data-table";

interface JungsiStep4DemoTableProps {
  admissions: ProcessedAdmission[];
  selectedAdmissions: number[];
  setSelectedAdmissions: React.Dispatch<React.SetStateAction<number[]>>;
  visibleCount: number;
}

export const JungsiStep4DemoTable: React.FC<JungsiStep4DemoTableProps> = ({
  admissions,
  selectedAdmissions,
  setSelectedAdmissions,
  visibleCount,
}) => {
  const visibleItems = admissions.slice(0, visibleCount);
  const blurredItems = admissions.slice(visibleCount, visibleCount + 5); // 블러 처리할 항목 5개만 표시

  const toggleSelection = (id: number) => {
    setSelectedAdmissions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    // 데모에서는 보이는 항목만 선택 가능
    const visibleIds = visibleItems.map((item) => item.id);
    const allSelected = visibleIds.every((id) => selectedAdmissions.includes(id));

    if (allSelected) {
      setSelectedAdmissions((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedAdmissions((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-end gap-2">
            <p>
              {selectedAdmissions.length} / {visibleCount} (체험)
            </p>
            <Button
              className="flex items-center px-3 py-1.5"
              variant={
                selectedAdmissions.length === visibleCount ? "default" : "outline"
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
            {/* 보이는 항목들 */}
            {visibleItems.map((admission, index) => (
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
                  <div className="flex items-center gap-1">
                    {index === 0 && (
                      <span className="rounded bg-red-500 px-1.5 py-0.5 text-xs text-white">
                        1위
                      </span>
                    )}
                    {index === 1 && (
                      <span className="rounded bg-orange-500 px-1.5 py-0.5 text-xs text-white">
                        2위
                      </span>
                    )}
                    {index === 2 && (
                      <span className="rounded bg-yellow-500 px-1.5 py-0.5 text-xs text-white">
                        3위
                      </span>
                    )}
                    {admission.university.name}({admission.university.region})
                  </div>
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
                    (admission.optimalScore != null
                      ? admission.optimalScore.toFixed(2)
                      : "-")}
                </td>
                <td
                  className={cn(
                    "py-2",
                    !admission.scoreDifference || admission.scoreDifference === 0
                      ? "text-black"
                      : 0 < admission.scoreDifference
                        ? "text-green-500"
                        : "text-red-500"
                  )}
                >
                  {admission.errorMessage || admission.scoreDifference?.toFixed(2)}
                </td>
                <td
                  className={cn(
                    "bg-primary/5 py-2",
                    !admission.normalizedScoreDifference ||
                      admission.normalizedScoreDifference === 0
                      ? "text-black"
                      : 0 < admission.normalizedScoreDifference
                        ? "text-green-500"
                        : "text-red-500"
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

            {/* 블러 처리된 항목들 */}
            {blurredItems.map((admission) => (
              <tr
                key={admission.id}
                className="relative border-t"
              >
                <td colSpan={10} className="relative py-2">
                  <div className="pointer-events-none select-none blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-8 text-center">
                        <Checkbox checked={false} disabled />
                      </div>
                      <div className="w-36 truncate">
                        {admission.university.name}
                      </div>
                      <div className="w-36 truncate">
                        {admission.recruitmentName}
                      </div>
                      <div className="w-16">{admission.totalScore}</div>
                      <div className="w-24">
                        {admission.minCut
                          ? parseFloat(admission.minCut).toFixed(2)
                          : "-"}
                      </div>
                      <div className="w-24">
                        {admission.myScore?.toFixed(2) || "-"}
                      </div>
                      <div className="w-24">
                        {admission.optimalScore?.toFixed(2) || "-"}
                      </div>
                      <div className="w-24">
                        {admission.scoreDifference?.toFixed(2) || "-"}
                      </div>
                      <div className="w-24">
                        {admission.normalizedScoreDifference?.toFixed(2) || "-"}
                      </div>
                      <div className="w-24">-</div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 더 많은 데이터가 있을 경우 안내 */}
      {admissions.length > visibleCount && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 py-4">
          <Lock className="h-5 w-5 text-gray-500" />
          <span className="text-gray-600">
            {admissions.length - visibleCount}개 대학의 유불리가 더 있습니다
          </span>
          <Link
            href="/products"
            className="ml-2 font-semibold text-teal-600 hover:text-teal-700"
          >
            이용권 구매 →
          </Link>
        </div>
      )}
    </div>
  );
};

export default JungsiStep4DemoTable;
