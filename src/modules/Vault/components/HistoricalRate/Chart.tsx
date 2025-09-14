import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { formatNumber } from "@utils";

import { AxisTick, ChartTooltip } from "@ui";

import type { TChartData } from "@types";

interface IProps {
  chart: {
    name: string;
    data: [];
  };
}

const Chart: React.FC<IProps> = ({ chart }) => {
  const WIDTH = 500;

  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);

  useEffect(() => {
    if (chart.data) {
      let min: number = Math.min(
        ...chart.data.map((item: TChartData) =>
          Number(item[chart.name as keyof typeof item])
        )
      );
      let max: number = Math.max(
        ...chart.data.map((item: TChartData) =>
          Number(item[chart.name as keyof typeof item])
        )
      );

      let difference = (max - min) / 10;

      min = Number((min - difference).toFixed(4));
      max = Number((max + difference).toFixed(4));

      if (min < 0) min = 0;

      setMinValue(min);
      setMaxValue(max);
    }
  }, [chart]);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        width={WIDTH}
        height={260}
        data={chart.data}
        margin={{ left: 0 }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="#1A2A84" stopOpacity={1} />
            <stop offset={1} stopColor="#0c0c1b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="5 5"
          stroke="#23252a"
          vertical={false}
        />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tick={({ x, y, payload }) => (
            <AxisTick x={x} y={y} payload={payload} fontSize={12} />
          )}
          style={{ fill: "#97979A" }}
        />
        <YAxis
          domain={
            chart.name === "sharePrice"
              ? [minValue, maxValue]
              : [minValue, "auto"]
          }
          tickFormatter={(value) =>
            value === 0 ? "" : `${formatNumber(value, "chartAbbreviate")}`
          }
          width={10}
          tickLine={false}
          axisLine={false}
          style={{
            fill: "#97979A",
            fontSize: "12px",
          }}
          mirror={true}
        />
        <Tooltip content={<ChartTooltip type={chart.name} />} />
        <Area
          type="monotone"
          dataKey={chart.name}
          stroke="#5E6AD2"
          strokeWidth="2"
          fill="url(#colorUv)"
          points={chart.data.map((entry) => ({
            x: entry?.x as number,
            y: entry?.y as number,
          }))}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export { Chart };
