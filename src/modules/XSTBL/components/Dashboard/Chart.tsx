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

import { AxisTick, ChartTooltip } from "@ui";

import { formatNumber } from "@utils";

import { MONTHS } from "@constants";

type ChartDataPoint = {
  timestamp: string;
  value: number;
  date: string;
};

const Chart = (): JSX.Element => {
  const $apiData = useStore(apiData);
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);

  useEffect(() => {
    const chart = $apiData?.revenueChart;
    if (!chart || !Object.keys(chart).length) return;

    const _data = Object.entries(chart).map(([timestamp, value]) => {
      const dateObj = new Date(Number(timestamp) * 1000);
      const day = dateObj.getDate().toString().padStart(2, "0");
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const formattedDate = `${day}.${month}`;

      const monthName = MONTHS[dateObj.getMonth()];
      const formattedTime = `${monthName} ${day}, ${dateObj.getFullYear()} ${dateObj.toLocaleString(
        "en-US",
        { hour: "numeric", minute: "numeric", hour12: true }
      )}`;

      return {
        timestamp: formattedDate,
        value: Number(value),
        date: formattedTime,
      };
    });

    if (!_data.length) return;

    const values = _data.map((d) => d.value);

    const min = Math.max(
      0,
      Number(
        (
          Math.min(...values) -
          (Math.max(...values) - Math.min(...values)) / 10
        ).toFixed(4)
      )
    );

    const max = Number(
      (
        Math.max(...values) +
        (Math.max(...values) - Math.min(...values)) / 10
      ).toFixed(4)
    );

    setData(_data);
    setMinValue(min);
    setMaxValue(max);
  }, [$apiData]);

  return (
    <div className="bg-[#101012] rounded-xl border border-[#23252A] min-h-[150px] md:min-h-full max-h-[300px]">
      <ResponsiveContainer width="100%" height="100%" className="p-4">
        <AreaChart width={500} height={260} data={data} margin={{ left: 0 }}>
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
          <Tooltip content={<ChartTooltip type="xSTBL" />} />
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
