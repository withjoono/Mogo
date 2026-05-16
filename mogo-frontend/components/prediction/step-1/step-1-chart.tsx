import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { IJungsiStep1GroupData } from "./step-1";

interface JungsiStep1ChartProps {
  data: Record<string, IJungsiStep1GroupData>;
  onSelectUniversity: (key: string) => void;
  selectedKeys: string[];
}

export const JungsiStep1Chart: React.FC<JungsiStep1ChartProps> = ({
  data,
  onSelectUniversity,
  selectedKeys,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const chartData = useMemo(() => {
    return Object.entries(data).map(([key, value], idx) => {
      return {
        key,
        idx,
        university: value.university_name,
        region: value.university_region,
        general_field: value.general_field,
        range: [value.range_min, value.range_max],
        userScore: Math.min(value.max_user_score || 0, 1000),
        xLabelData: `${value.university_name}\n${value.university_region}\n${value.general_field}\n${value.items.length}`,
      };
    });
  }, [data]);

  const barSize = 120;

  return (
    <ResponsiveContainer
      width={Math.max(1188, barSize * chartData.length)}
      height={"100%"}
    >
      <ComposedChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        onClick={({ activePayload }) => {
          if (activePayload && activePayload.length > 0) {
            onSelectUniversity(activePayload[0].payload.key);
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
              selectedKeys={selectedKeys}
              onClickItem={onSelectUniversity}
            />
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
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              setHoverIdx(payload[0].payload.idx);
            } else {
              setHoverIdx(null);
            }

            const data = payload?.[0]?.payload;
            if (!data) return null;

            return (
              <div className="rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
                <p>{`${data.university}(${data.region}) - ${data.general_field}`}</p>
                <p className="text-sm font-semibold text-primary">
                  점수 범위: {parseFloat(data.range[0] || "0").toFixed(2)} ~{" "}
                  {parseFloat(data.range[1] || "0").toFixed(2)}
                </p>
                <p className="text-sm font-semibold text-green-500">
                  내 점수: {parseFloat(data.userScore || "0").toFixed(2)}
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
                entry.idx === hoverIdx || selectedKeys.includes(entry.key)
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
  };
  selectedKeys: string[];
  onClickItem: (key: string) => void;
}

const TickX = ({ x, y, payload, selectedKeys, onClickItem }: TickXProps) => {
  const [university_name, region, general_type_name, count] =
    payload.value.split("\n");
  const width = 110;
  const key = `${university_name}-${region}-${general_type_name}`;
  const isSelected = selectedKeys.includes(key);
  // console.log(payload.value);
  const handleClick = () => {
    onClickItem(key);
  };

  return (
    <g transform={`translate(${x},${y})`} onClick={handleClick}>
      <foreignObject
        className="node"
        x={-width / 2}
        y="0"
        width={width}
        height="100px"
      >
        <div
          className={cn(
            "flex cursor-pointer flex-col items-center space-y-1 text-xs font-semibold text-foreground/60 hover:text-primary",
            isSelected ? "text-primary" : "",
          )}
        >
          <p>
            {university_name}({region})
          </p>
          <p>{general_type_name}</p>
          <p>학과 {count}개</p>
        </div>
      </foreignObject>
    </g>
  );
};
