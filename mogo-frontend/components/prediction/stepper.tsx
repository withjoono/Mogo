import { cn } from "@/lib/utils";
import { Check, ChevronRight, Pencil } from "lucide-react";
import { useExploreJungsiStepper } from "./context/explore-jungsi-provider";

type StepProps = {
  id: number;
  text: string;
  isLast?: boolean;
};

export const Step = ({ id, text, isLast }: StepProps) => {
  const { step } = useExploreJungsiStepper();
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center rounded-md border px-3 py-2 text-xs font-semibold transition duration-200 lg:px-4 lg:text-sm",
          id < step && "bg-green-500 text-white",
          step === id && "border-primary bg-primary text-primary-foreground",
          step < id && "border-muted bg-muted text-muted-foreground",
        )}
      >
        {id < step ? (
          <Check className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
        ) : null}
        {id === step ? (
          <Pencil className="mr-2 h-3 w-3 lg:h-4 lg:w-4" />
        ) : null}{" "}
        {text}
      </div>
      {isLast ? null : <ChevronRight className="mr-0" />}
    </div>
  );
};
