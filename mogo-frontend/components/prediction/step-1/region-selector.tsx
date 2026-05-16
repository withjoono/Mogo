import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { REGIONS } from "@/types/region.type";
import { useExploreJungsiStepper } from "../context/explore-jungsi-provider";

interface RegionSelectorProps {
  className?: string;
}

export const RegionSelector = ({ className }: RegionSelectorProps) => {
  const { formData, updateFormData } = useExploreJungsiStepper();

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-lg font-semibold md:text-xl">🗺️ 지역 선택</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={formData.region.length === 0 ? "default" : "outline"}
          className="px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm"
          onClick={() => updateFormData("region", [])}
        >
          전국
        </Button>
        {REGIONS.map((region) => {
          const isSelected = formData.region.includes(region);
          return (
            <Button
              key={region}
              variant={isSelected ? "default" : "outline"}
              className="px-3 py-1 text-xs md:px-4 md:py-2 md:text-sm"
              onClick={() => {
                updateFormData(
                  "region",
                  isSelected
                    ? formData.region.filter((n) => n !== region)
                    : [...formData.region, region],
                );
              }}
            >
              {region}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
