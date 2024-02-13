import { useEffect } from "react";
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
}: {
  active: boolean;
  payload: any;
}) => {
  const PDataKey =
    payload[0]?.dataKey === "TVL" ? (
      <p>{`TVL: $${payload[0].value}`}</p>
    ) : payload[0]?.dataKey === "sharePrice" ? (
      <p>{`Price: $${payload[0].value}`}</p>
    ) : payload[0]?.dataKey === "APR" ? (
      <p>{`Farm APR: ${payload[0].value}%`}</p>
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

const Chart = ({ chart }: { chart: any }) => {
  let min = 0;
  useEffect(() => {
    if (chart.data) {
      min = Math.min(...chart.data.map((item: any) => item[chart.name]));
    }
  }, [chart]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        width={500}
        height={200}
        data={chart.data}
        margin={{ left: 0 }}
      >
        <CartesianGrid strokeDasharray="1 1" />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tick={<CustomizedAxisTick fontSize={12} />}
        />
        <YAxis
          domain={[min, "auto"]}
          tickFormatter={(value) =>
            value === 0
              ? ""
              : chart.name === "APR"
              ? `${value}%`
              : chart.name === "TVL"
              ? `${formatNumber(value, "abbreviateInteger")}`
              : `$${value}`
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
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={chart.name}
          stroke="#fff"
          fill="#414141"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export { Chart };
