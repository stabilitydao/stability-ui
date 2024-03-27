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

interface IProps {
  chart: any;
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
  payload: any;
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
  active: boolean;
  payload: any;
  APRType: string;
}) => {
  const PDataKey =
    payload[0]?.dataKey === "TVL" ? (
      <p>{`TVL: $${payload[0].value}`}</p>
    ) : payload[0]?.dataKey === "sharePrice" ? (
      <p>{`Price: $${payload[0].value}`}</p>
    ) : payload[0]?.dataKey === "APR" ? (
      <p>{`${APRType}: ${payload[0].value}%`}</p>
    ) : (
      ""
    );

  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1c23] text-[#fff] rounded-md text-[14px]">
        <div className="px-5 py-3">
          <p>{payload[0].payload.date}</p>
          {PDataKey}
        </div>
      </div>
    );
  }
};

const Chart: React.FC<IProps> = ({ chart, APRType }) => {
  const WIDTH = 500;

  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);

  useEffect(() => {
    if (chart.data) {
      let min: number = Math.min(
        ...chart.data.map((item: any) => item[chart.name])
      );
      let max: number = Math.max(
        ...chart.data.map((item: any) => item[chart.name])
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
        <CartesianGrid strokeDasharray="1 1" stroke="#434395" />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tick={({ x, y, payload }) => (
            <CustomizedAxisTick x={x} y={y} payload={payload} fontSize={12} />
          )}
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
            fill: "#8d8e96",
            fontSize: "16px",
          }}
          mirror={true}
        />
        <Tooltip content={<CustomTooltip APRType={APRType} />} />
        <Area
          type="monotone"
          dataKey={chart.name}
          stroke="#3047ff"
          strokeWidth="2"
          fill="url(#colorUv)"
          points={chart.data.map((entry) => ({
            x: entry.x,
            y: entry.y,
          }))}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export { Chart };
