import { cn } from "@/lib/utils";

interface DataGridProps {
  data: { label: string; value: string | number }[];
  columns?: number;
}

export const DataGrid = ({ data }: DataGridProps) => (
  <div className={cn("flex flex-wrap gap-x-20 gap-y-4")}>
    {data.map(({ label, value }, index) => (
      <div key={index} className="flex flex-col justify-center gap-2">
        <p className="text-sm">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    ))}
  </div>
);
