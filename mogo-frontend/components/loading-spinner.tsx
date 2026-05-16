import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="">Loading...</p>
    </div>
  );
}
