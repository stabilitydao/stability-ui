import type { TChartData } from "@types";
import { useEffect } from "react";
import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import type { TChartPayload } from "@types";

interface IProps {
  chart: {
    name: string;
    data: [];
  };
  APRType: string;
}

const CustomizedAxisTick = ({
  x,
  y,
  payload,
  fontSize,
}: {
  x: number;
  y: number;
  payload: TChartPayload;
  fontSize: number;
}) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="middle"
        fill="#8d8e96"
        fontSize={fontSize}
      >
        {payload.value}
      </text>
    </g>
  );
};
const CustomTooltip = ({
  active,
  payload,
  APRType,
}: {
  active?: boolean;
  payload?: TChartPayload[];
  APRType: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1c23] text-[#fff] rounded-md text-[14px]">
        <div className="px-5 py-3">
          <p>{payload[0].payload.date}</p>
          <p>{`${APRType}: ${payload[0].value}%`}</p>
        </div>
      </div>
    );
  }
};

const ChartBar: React.FC<IProps> = ({ chart, APRType }) => {
  const WIDTH = 500;
  let min = 0;

  useEffect(() => {
    if (chart.data) {
      min = Math.min(
        ...chart.data.map((item: TChartData) =>
          Number(item[chart.name as keyof typeof item])
        )
      );
    }
  }, [chart]);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        width={WIDTH}
        height={260}
        data={chart.data}
        margin={{ left: 50 }}
      >
        <CartesianGrid strokeDasharray="1 1" stroke="#434395" />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tick={({ x, y, payload }) => (
            <CustomizedAxisTick x={x} y={y} payload={payload} fontSize={12} />
          )}
          style={{ fill: "#958CA1" }}
        />
        <YAxis
          domain={[min, "auto"]}
          tickFormatter={(value) => (value === 0 ? "" : `${value}%`)}
          width={10}
          tickLine={false}
          axisLine={false}
          style={{
            fill: "#958CA1",
            fontSize: "12px",
          }}
        />

        <Tooltip content={<CustomTooltip APRType={APRType} />} />

        <Bar dataKey={chart.name} stackId="bar">
          {chart.data.map((_: TChartData, index: number) => (
            <Cell
              cursor="pointer"
              fill="#612FFB"
              key={`cell-${index}`}
              radius={[10, 10, 0, 0]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export { ChartBar };
