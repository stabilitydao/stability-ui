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

// const CustomizedAxisTick = ({
//   x,
//   y,
//   payload,
//   fontSize,
// }: {
//   x: number;
//   y: number;
//   payload: any;
//   fontSize: number;
// }) => {
//   return (
//     <>
//       {/* {payload.value === "10.02" ? (
//         <g transform={`translate(${10},${y})`}>
//           <text
//             x={0}
//             y={0}
//             dy={10}
//             textAnchor="middle"
//             fill="#8d8e96"
//             fontSize={fontSize}
//           >
//             {payload.value}
//           </text>
//         </g>
//       ) : ( */}
//       <g transform={`translate(${x},${y})`}>
//         <text
//           x={0}
//           y={0}
//           dy={10}
//           textAnchor="middle"
//           fill="#8d8e96"
//           fontSize={fontSize}
//         >
//           {payload.value}
//         </text>
//       </g>
//       {/* )} */}
//     </>
//   );
// };
const CustomizedAxisTick = ({
  x,
  y,
  payload,
  fontSize,
  timestampDifferences,
}: {
  x: number;
  y: number;
  payload: any;
  fontSize: number;
  timestampDifferences: number[];
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

  let min = 0;

  useEffect(() => {
    if (chart.data) {
      min = Math.min(...chart.data.map((item: any) => item[chart.name]));
    }
  }, [chart]);

  const [timestampDifferences, setTimestampDifferences] = useState<number[]>(
    []
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart
        width={WIDTH}
        height={200}
        data={chart.data}
        margin={{ left: 0 }}
      >
        <CartesianGrid strokeDasharray="1 1" />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tick={({ x, y, payload }) => (
            <CustomizedAxisTick
              x={x}
              y={y}
              payload={payload}
              fontSize={12}
              timestampDifferences={timestampDifferences}
            />
          )}
        />
        <YAxis
          domain={chart.name === "sharePrice" ? [0.9, "auto"] : [min, "auto"]}
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
        <Tooltip content={<CustomTooltip APRType={APRType} />} />
        <Area
          type="monotone"
          dataKey={chart.name}
          stroke="#fff"
          fill="#414141"
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
