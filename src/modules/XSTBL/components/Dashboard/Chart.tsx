import { useStore } from "@nanostores/react";

import { apiData } from "@store";

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

import type { TChartPayload } from "@types";

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
}: {
  active?: boolean;
  payload?: TChartPayload[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1c23] text-[#fff] rounded-md text-[14px]">
        <div className="px-5 py-3">
          <p>xSTBL: {formatNumber(payload[0].payload.value, "abbreviate")}</p>
          <p>Date: {payload[0].payload.timestamp}</p>
        </div>
      </div>
    );
  }
};

const Chart = (): JSX.Element => {
  const WIDTH = 500;

  const $apiData = useStore(apiData);

  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);

  const [data, setData] = useState<{ timestamp: string; value: string }[]>([]);

  const initChart = () => {
    if (Object.entries($apiData?.revenueChart).length) {
      const _data = Object.entries($apiData.revenueChart).map(
        ([timestamp, value]) => {
          const date = new Date(Number(timestamp) * 1000);

          const day = date.getDate();
          const month = date.getMonth() + 1;
          const formattedDate = `${day.toString().padStart(2, "0")}.${month
            .toString()
            .padStart(2, "0")}`;

          return { timestamp: formattedDate, value };
        }
      );

      let min: number = Math.min(..._data.map((item) => Number(item.value)));
      let max: number = Math.max(..._data.map((item) => Number(item.value)));

      let difference = (max - min) / 10;

      min = Number((min - difference).toFixed(4));
      max = Number((max + difference).toFixed(4));

      if (min < 0) min = 0;

      setMinValue(min);
      setMaxValue(max);
      setData(_data);
    }
  };

  useEffect(() => {
    initChart();
  }, []);
  return (
    <div className="bg-[#101012] rounded-xl border border-[#23252A] min-h-[150px] md:min-h-full">
      <ResponsiveContainer width="100%" height="100%" className="p-4">
        <AreaChart width={WIDTH} height={260} data={data} margin={{ left: 0 }}>
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
              <CustomizedAxisTick x={x} y={y} payload={payload} fontSize={12} />
            )}
            style={{ fill: "#97979A" }}
          />
          <YAxis
            domain={[minValue, maxValue]}
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
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#5E6AD2"
            strokeWidth="2"
            fill="url(#colorUv)"
            points={data.map((entry) => ({
              x: entry?.timestamp,
              y: entry?.value,
            }))}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export { Chart };
