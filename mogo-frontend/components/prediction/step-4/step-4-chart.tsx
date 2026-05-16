import { useMemo } from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { ProcessedAdmission } from "./step-4-data-table";

interface JungsiStep4ChartProps {
  data: ProcessedAdmission[];
  selectedAdmissions: number[];
  onSelectAdmission: (id: number) => void;
  isSorted?: boolean;
}

// const CustomDot = (props: any) => {
//   const { cx, cy, payload, selectedAdmissions } = props;
//   if (!cx || !cy) return null;

//   const isSelected = selectedAdmissions.includes(payload.id);

//   return (
//     <circle
//       cx={cx}
//       cy={cy}
//       r={4}
//       stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--primary))"}
//       strokeWidth={isSelected ? 3 : 2}
//       fill={payload.scoreDifference >= 0 ? "#22c55e" : "#ef4444"}
//       className={cn(isSelected && "animate-pulse")}
//     />
//   );
// };

export const JungsiStep4Chart = ({
  data,
  selectedAdmissions,
  onSelectAdmission,
}: JungsiStep4ChartProps) => {
  const chartData = useMemo(() => {
    const processedData = data.map((item, idx) => {
      const scoreDiff = item.normalizedScoreDifference || 0;
      return {
        id: item.id,
        idx,
        university: item.university.name,
        region: item.university.region,
        recruitmentName: item.recruitmentName || "",
        scoreDifference: scoreDiff,
        // 양수/음수 분리하여 별도 데이터로 저장
        positiveScore: scoreDiff >= 0 ? scoreDiff : null,
        negativeScore: scoreDiff < 0 ? scoreDiff : null,
        minCut: item.minCut ? parseFloat(item.minCut) : null,
        maxCut: item.maxCut ? parseFloat(item.maxCut) : null,
        totalScore: item.totalScore,
        standardScore: item.standardScore,
        xLabelData: `${item.university.name}\n${item.university.region}\n${item.recruitmentName || ""}\n${item.id}`,
      };
    });

    return processedData;
  }, [data]);

  // Y축 범위: 데이터 최대/최소값 기준으로 동적 계산
  const { yDomain, yTicks } = useMemo(() => {
    if (chartData.length === 0) {
      return { yDomain: [-10, 10], yTicks: [-10, -5, 0, 5, 10] };
    }

    const maxDiff = Math.max(...chartData.map((d) => d.scoreDifference));
    const minDiff = Math.min(...chartData.map((d) => d.scoreDifference));

    // 데이터 범위에 맞게 Y축 설정 (약간의 여백 추가)
    const yMax = Math.ceil(Math.max(maxDiff, 0) * 1.1) || 10;
    const yMin = Math.floor(Math.min(minDiff, 0) * 1.1) || -10;

    // 적절한 간격으로 ticks 생성
    const range = yMax - yMin;
    const tickCount = 10;
    const tickInterval = Math.ceil(range / tickCount);

    const ticks: number[] = [];
    for (let i = yMin; i <= yMax; i += tickInterval) {
      ticks.push(i);
    }
    // 0이 포함되어 있지 않으면 추가
    if (!ticks.includes(0)) {
      ticks.push(0);
      ticks.sort((a, b) => a - b);
    }

    return { yDomain: [yMin, yMax], yTicks: ticks };
  }, [chartData]);

  const barSize = 120;

  return (
    <ResponsiveContainer
      width={Math.max(1188, barSize * chartData.length)}
      height={"100%"}
    >
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        onClick={(event) => {
          if (event.activePayload && event.activePayload.length > 0) {
            const clickedData = event.activePayload[0].payload;
            onSelectAdmission(clickedData.id);
          }
        }}
      >
        <CartesianGrid vertical={false} className="stroke-foreground/20" />
        <XAxis
          tickLine={false}
          height={100}
          dataKey="xLabelData"
          tick={(props) => (
            <TickX
              {...props}
              selectedAdmissions={selectedAdmissions}
              onSelect={onSelectAdmission}
            />
          )}
          interval={0}
        />
        <YAxis
          stroke="#888888"
          domain={yDomain}
          ticks={yTicks}
          allowDataOverflow={true}
          tickFormatter={(value) => value.toFixed(0)}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={({ payload }) => {
            const data = payload?.[0]?.payload;
            if (!data) return null;

            return (
              <div className="rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
                <p className="font-semibold">{`${data.university}(${data.region})`}</p>
                <p className="mb-2 text-sm">{data.recruitmentName}</p>
                <p className="text-sm">총점: {data.totalScore || "-"}</p>
                <p className="text-sm">
                  최초컷: {data.minCut?.toFixed(2) || "-"}
                </p>
                <p className="text-sm">
                  추합컷: {data.maxCut?.toFixed(2) || "-"}
                </p>
                <p className="text-sm">
                  동점수 평균: {data.standardScore?.toFixed(2) || "-"}
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    data.scoreDifference >= 0
                      ? "text-blue-500"
                      : "text-red-500",
                  )}
                >
                  점수차이: {data.scoreDifference >= 0 ? "+" : ""}{data.scoreDifference.toFixed(2)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  클릭하여{" "}
                  {selectedAdmissions.includes(data.id) ? "선택 해제" : "선택"}
                </p>
              </div>
            );
          }}
        />
        <ReferenceLine
          y={0}
          stroke="hsl(var(--primary))" // 또는 원하는 색상 값
          strokeDasharray="3 3"
          strokeWidth={2} // 선 두께도 조절 가능
        />
        {/* <Line
          type="monotone"
          dataKey="scoreDifference"
          stroke="hsl(var(--primary))"
          strokeWidth={3}
          dot={(props) => (
            <CustomDot {...props} selectedAdmissions={selectedAdmissions} />
          )}
          activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
        /> */}
        {/* 양수 막대 (위로 향함) - 파란색 */}
        <Bar
          dataKey="positiveScore"
          barSize={barSize - 50}
          className="cursor-pointer"
          radius={[8, 8, 0, 0]}
          fill="#3b82f6"
        >
          {chartData.map((item, index) => (
            <Cell
              key={`positive-${index}`}
              className="hover:opacity-80"
              fill="#3b82f6"
            />
          ))}
        </Bar>
        {/* 음수 막대 (아래로 향함) - 빨간색 */}
        <Bar
          dataKey="negativeScore"
          barSize={barSize - 50}
          className="cursor-pointer"
          radius={[0, 0, 8, 8]}
          fill="#ef4444"
        >
          {chartData.map((item, index) => (
            <Cell
              key={`negative-${index}`}
              className="hover:opacity-80"
              fill="#ef4444"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
interface TickXProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
  selectedAdmissions: number[];
  onSelect: (id: number) => void;
}

const TickX = ({ x, y, payload, selectedAdmissions, onSelect }: TickXProps) => {
  if (!x || !y || !payload) return null;

  const [university_name, region, recruitment_name, id] =
    payload.value.split("\n");
  const width = 110;
  const numericId = Number(id);
  const isSelected = selectedAdmissions.includes(numericId);

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
          onClick={(e) => {
            e.stopPropagation();
            onSelect(numericId);
          }}
          className={cn(
            "flex h-full w-full cursor-pointer flex-col items-center space-y-1 text-xs font-semibold hover:opacity-75",
            isSelected ? "text-primary" : "text-foreground/60",
          )}
        >
          <p>{`${university_name}(${region})`}</p>
          <p>{recruitment_name}</p>
        </div>
      </foreignObject>
    </g>
  );
};

export default JungsiStep4Chart;
