import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { TOKENS_ASSETS } from "@constants";

interface IProps {
  chart: any;
  activeLines: { symbol: string; state: boolean }[];
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
}: {
  active: boolean;
  payload: any;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1c23] text-[#fff] rounded-md text-[14px]">
        <div className="px-5 py-3">
          <p>{payload[0].payload.date}</p>
          {payload &&
            payload.map((_) => (
              <p key={_.value}>
                {`${_.dataKey}: ${Number(_.value).toFixed(2)}`}%
              </p>
            ))}
        </div>
      </div>
    );
  }
};

const Chart: React.FC<IProps> = ({ chart, activeLines }) => {
  const WIDTH = 500;

  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (chart) {
      const chartData = chart.flatMap((obj) =>
        obj.vsHoldAPR.map(({ apr }: { apr: string }) => apr)
      );

      let min: number = Math.min(...chartData);
      let max: number = Math.max(...chartData);

      let difference = (max - min) / 10;

      min = Number((min - difference).toFixed(4));
      max = Number((max + difference).toFixed(4));
      ///// new chart data
      const transformedData = chart.map((item) => {
        const newItem = { ...item };

        item.vsHoldAPR.forEach((asset) => {
          newItem[asset.symbol] = asset.apr;
        });

        delete newItem.vsHoldAPR;

        return newItem;
      });

      setChartData(transformedData);

      setMinValue(min);
      setMaxValue(max);
    }
  }, [chart]);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        width={WIDTH}
        height={260}
        data={chartData}
        margin={{ left: 0 }}
      >
        {/* <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset={0} stopColor="#1A2A84" stopOpacity={1} />
            <stop offset={1} stopColor="#0c0c1b" stopOpacity={0} />
          </linearGradient>
        </defs> */}
        <CartesianGrid strokeDasharray="1 1" stroke="#434395" />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tick={({ x, y, payload }) => (
            <CustomizedAxisTick x={x} y={y} payload={payload} fontSize={12} />
          )}
        />
        <YAxis
          domain={[minValue, maxValue]}
          tickFormatter={(value) => `${value.toFixed()}%`}
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

        {activeLines &&
          activeLines.map(
            (line) =>
              line.state && (
                <Area
                  type="monotone"
                  dataKey={line.symbol}
                  key={line.symbol}
                  stroke={
                    TOKENS_ASSETS.find((token) => token.symbol === line.symbol)
                      ?.color || "#3047ff"
                  }
                  strokeWidth="2"
                  fill="none"
                  // points={chart.data.map((entry) => ({
                  //   x: entry.x,
                  //   y: entry.y,
                  // }))}
                />
              )
          )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export { Chart };
