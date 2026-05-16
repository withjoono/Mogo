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
import { IRegularAdmission } from "@/stores/server/features/jungsi/interfaces";

interface JungsiStep2ChartProps {
  data: IRegularAdmission[];
  onSelectAdmission: (id: number) => void;
  selectedAdmissions: number[];
  isSorted: boolean;
  userScores: Record<
    number,
    {
      score: number | null;
      error: string | null;
    }
  >;
}

export const JungsiStep2Chart: React.FC<JungsiStep2ChartProps> = ({
  data,
  onSelectAdmission,
  selectedAdmissions,
  isSorted,
  userScores,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const processedData = data.map((item, idx) => {
      const totalScore = item.totalScore || 1000;
      const minCut = parseFloat(item.minCut || "0");
      const maxCut = parseFloat(item.maxCut || "0");
      const normalizedMinCut = Math.min(
        Math.max((minCut / totalScore) * 1000, 0),
        1000,
      );
      const normalizedMaxCut = Math.min(
        Math.max((maxCut / totalScore) * 1000, 0),
        1000,
      );
      const userScore = userScores[item.id] || 0;
      const normalizedUserScore = userScore.score
        ? Math.min(Math.max((userScore.score / totalScore) * 1000, 0), 1000)
        : 0;

      return {
        id: item.id,
        idx,
        university: item.university.name,
        region: item.university.region,
        recruitmentName: item.recruitmentName || "",
        generalField: item.generalFieldName,
        rangeMin: normalizedMinCut,
        rangeMax: normalizedMaxCut,
        range: [normalizedMaxCut, normalizedMinCut],
        originalRangeMin: minCut,
        originalRangeMax: maxCut,
        userScore: normalizedUserScore,
        originalUserScore: userScore,
        totalScore,
        xLabelData: `${item.university.name}\n${item.university.region}\n${item.recruitmentName || ""}`,
      };
    });
    if (isSorted) {
      processedData.sort((a, b) => b.rangeMin - a.rangeMin);
    }
    return processedData;
  }, [data, isSorted, userScores]);

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
          domain={[0, 1000]}
          tickCount={11}
          tickFormatter={(value) => value.toString()}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={({ payload }) => {
            const data = payload?.[0]?.payload;
            if (!data) return null;

            return (
              <div className="rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
                <p>{`${data.university}(${data.region}) - ${data.recruitmentName}`}</p>
                <p className="text-sm font-semibold text-primary">
                  점수 범위: {data.rangeMin.toFixed(2)} ~{" "}
                  {data.rangeMax.toFixed(2)}
                </p>
                <p className="text-sm font-semibold text-green-500">
                  내 점수:{" "}
                  {data.originalUserScore.error
                    ? data.originalUserScore.error
                    : parseFloat(data.userScore).toFixed(2)}
                </p>
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
  const [university_name, region, recruitment_name] = payload.value.split("\n");
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
          <p>{recruitment_name}</p>
        </div>
      </foreignObject>
    </g>
  );
};
