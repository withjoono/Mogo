import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { ProcessedAdmission } from "./step-3";

interface JungsiStep3ChartProps {
  data: ProcessedAdmission[];
  onSelectAdmission: (id: number) => void;
  selectedAdmissions: number[];
  isSorted: boolean;
}

export const JungsiStep3Chart: React.FC<JungsiStep3ChartProps> = ({
  data,
  onSelectAdmission,
  selectedAdmissions,
  isSorted,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const processedData = data.map((item, idx) => {
      const cutScore = item.standardScore ?? 0;
      const myScore = item.myScore ?? 0;

      return {
        id: item.id,
        idx,
        university: item.university.name,
        region: item.university.region,
        recruitmentName: item.recruitmentName || "",
        generalField: item.generalFieldName,
        admissionType: item.admissionType || "",
        rangeMin: cutScore - 10,
        rangeMax: cutScore + 10,
        range: [cutScore + 10, cutScore - 10],
        originalRangeMin: cutScore,
        originalRangeMax: cutScore,
        userScore: myScore,
        originalUserScore: myScore,
        cutScore,
        scoreDifference: item.scoreDifference,
        xLabelData: `${item.university.name}\n${item.university.region}\n${item.admissionType || ""}\n${item.recruitmentName || ""}`,
      };
    });
    if (isSorted) {
      processedData.sort((a, b) => b.rangeMin - a.rangeMin);
    }
    return processedData;
  }, [data, isSorted]);

  const barSize = 120;

  return (
    <ResponsiveContainer
      width={Math.max(1188, barSize * chartData.length)}
      height={"100%"}
    >
      <ComposedChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        onClick={(event) => {
          if (event.activePayload && event.activePayload.length > 0) {
            const clickedData = event.activePayload[0].payload;
            onSelectAdmission(clickedData.id);
          }
        }}
        onMouseMove={(event) => {
          if (event.activePayload && event.activePayload.length > 0) {
            setHoverIdx(event.activePayload[0].payload.idx);
          }
        }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <CartesianGrid vertical={false} className="stroke-foreground/20" />
        <XAxis
          tickLine={false}
          height={100}
          dataKey="xLabelData"
          tick={(props) => (
            <TickX {...props} selectedAdmissions={selectedAdmissions} />
          )}
          interval={0}
        />
        <YAxis
          stroke="#888888"
          type="number"
          tickCount={10}
          tickFormatter={(value) => value.toString()}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;

            const data = payload[0]?.payload;
            if (!data) return null;

            return (
              <div className="rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
                <p>{`${data.university}(${data.region}) - ${data.admissionType} - ${data.recruitmentName}`}</p>
                <p className="text-sm font-semibold text-primary">
                  배치컷(표준점수합): {data.cutScore}
                </p>
                <p className="text-sm font-semibold text-green-500">
                  내 표준점수합: {data.originalUserScore}
                </p>
                {data.scoreDifference != null && (
                  <p className={`text-sm font-bold ${data.scoreDifference >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    점수차: {data.scoreDifference > 0 ? "+" : ""}{Math.round(data.scoreDifference)}
                  </p>
                )}
                <p className="pt-1 text-xs">선택하려면 클릭해주세요.</p>
              </div>
            );
          }}
        />
        <Bar
          dataKey="range"
          radius={[4, 4, 4, 4]}
          barSize={barSize - 50}
          name="점수 범위"
        >
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.idx}`}
              fill={
                entry.idx === hoverIdx || selectedAdmissions.includes(entry.id)
                  ? "hsl(var(--primary))"
                  : ""
              }
            />
          ))}
        </Bar>
        <Line
          type="monotone"
          dataKey="userScore"
          stroke="#22c55e"
          strokeWidth={3}
          dot={{ stroke: "#22c55e", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: "#22c55e", strokeWidth: 2 }}
          name="내 점수"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

interface TickXProps {
  x: number;
  y: number;
  payload: {
    value: string;
    payload?: {
      id: number;
    };
  };
  selectedAdmissions: number[];
}

const TickX = ({ x, y, payload, selectedAdmissions }: TickXProps) => {
  const [university_name, region, admission_type, recruitment_name] = payload.value.split("\n");
  const width = 110;
  const isSelected = selectedAdmissions.includes(payload.payload?.id ?? -1);

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject
        className="node"
        x={-width / 2}
        y="0"
        width={width}
        height="100px"
      >
        <div
          className={cn(
            "flex flex-col items-center space-y-1 text-xs font-semibold",
            isSelected ? "text-primary" : "text-foreground/60",
          )}
        >
          <p>
            {university_name}({region})
          </p>
          <p className="text-[10px] text-muted-foreground">{admission_type}</p>
          <p>{recruitment_name}</p>
        </div>
      </foreignObject>
    </g>
  );
};
