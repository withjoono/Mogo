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
  ReferenceLine,
  Label,
} from "recharts";
import { cn } from "@/lib/utils";
import { IJungsiStep1GroupData } from "./step-1";

interface JungsiStep1ChartProps {
  data: Record<string, IJungsiStep1GroupData>;
  onSelectUniversity: (key: string) => void;
  selectedKeys: string[];
  myScore: number;
}

export const JungsiStep1Chart: React.FC<JungsiStep1ChartProps> = ({
  data,
  onSelectUniversity,
  selectedKeys,
  myScore,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const chartData = useMemo(() => {
    return Object.entries(data).map(([key, value], idx) => {
      return {
        key,
        idx,
        university: value.universityName,
        region: value.universityRegion,
        generalField: value.generalField,
        range: [value.rangeMin, value.rangeMax],
        xLabelData: `${value.universityName}\n${value.universityRegion}\n${value.generalField}\n${value.items.length}`,
        myScore: myScore,
      };
    });
  }, [data, myScore]);

  const barSize = 120;

  const handleMouseMove = (state: { activeTooltipIndex?: number }) => {
    if (state?.activeTooltipIndex !== undefined) {
      setHoverIdx(state.activeTooltipIndex);
    }
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
  };

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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
          domain={[0, 100]}
          tickCount={11}
          reversed
          tickFormatter={(value) => value.toString()}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          content={({ payload }) => {
            const data = payload?.[0]?.payload;
            if (!data) return null;

            return (
              <div className="rounded-md bg-background px-4 py-4 text-foreground shadow-lg">
                <p>{`${data.university}(${data.region}) - ${data.generalField}`}</p>
                <p className="text-sm font-semibold text-primary">
                  점수 범위: {parseFloat(data.range[0] || "0").toFixed(2)} ~{" "}
                  {parseFloat(data.range[1] || "0").toFixed(2)}
                </p>
                <p className="text-sm font-semibold text-green-500">
                  나의 누적백분위: {parseFloat(data?.myScore || "0").toFixed(2)}
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
        <defs>
          <filter x="-0.15" y="-0.1" width="1.3" height="1.1" id="solid">
            <feFlood floodColor="hsl(var(--primary))" />
            <feMerge>
              <feMergeNode in="bg" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ReferenceLine y={myScore} stroke="hsl(var(--primary))" strokeWidth={2}>
          <Label
            value="나의 누적백분위"
            offset={6}
            position="insideTopLeft"
            fill="#ffffff"
            filter="url(#solid)"
            className="text-xs font-semibold"
          />
        </ReferenceLine>
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
