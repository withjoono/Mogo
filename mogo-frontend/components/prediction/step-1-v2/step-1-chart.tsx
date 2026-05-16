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
import { I대학백분위 } from "./step-1";

interface JungsiStep1ChartProps {
  data: I대학백분위[];
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
    return data.map((item, idx) => {
      const key = `${item.대학명}-${item.지역}`;
      const minValue = parseFloat(item.최저값);
      const maxValue = parseFloat(item.최고값);

      // 최저점과 최고점이 동일한 경우, 최저점에 0.2를 더함
      const adjustedMinValue =
        minValue === maxValue ? minValue + 0.2 : minValue;

      return {
        key,
        idx,
        university: item.대학명,
        region: item.지역,
        range: [adjustedMinValue, maxValue],
        xLabelData: `${item.대학명}\n${item.지역}`,
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
        onClick={(event) => {
          if (event.activePayload && event.activePayload.length > 0) {
            onSelectUniversity(event.activePayload[0].payload.key);
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
          domain={[0, 100]}
          reversed={true}
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
                <p>{`${data.university}(${data.region})`}</p>
                <p className="text-sm font-semibold text-primary">
                  최고 백분위: {data.range[1].toFixed(2)}
                </p>
                <p className="text-sm font-semibold text-primary">
                  최저 백분위: {data.range[0].toFixed(2)}
                </p>
                <p className="text-sm font-semibold text-green-600">
                  나의 누적백분위: {myScore.toFixed(2)}
                </p>
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

const TickX: React.FC<TickXProps> = ({
  x,
  y,
  payload,
  selectedKeys,
  onClickItem,
}) => {
  const [university_name, region] = payload.value.split("\n");
  const width = 110;
  const key = `${university_name}-${region}`;
  const isSelected = selectedKeys.includes(key);

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
        </div>
      </foreignObject>
    </g>
  );
};

export default JungsiStep1Chart;
