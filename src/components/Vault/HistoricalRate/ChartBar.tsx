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
      min = Math.min(...chart.data.map((item: any) => item[chart.name]));
    }
  }, [chart]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        width={WIDTH}
        height={200}
        data={chart.data}
        margin={{ left: 50 }}
      >
        <CartesianGrid strokeDasharray="1 1" />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          tick={({ x, y, payload }) => (
            <CustomizedAxisTick x={x} y={y} payload={payload} fontSize={12} />
          )}
        />
        <YAxis
          domain={[min, "auto"]}
          tickFormatter={(value) => (value === 0 ? "" : `${value}%`)}
          width={10}
          tickLine={false}
          axisLine={false}
          style={{
            fill: "#8d8e96",
            fontSize: "16px",
          }}
        />
        <Tooltip content={<CustomTooltip APRType={APRType} />} />
        <Bar dataKey={chart.name}>
          {chart.data.map((_: any, index: number) => (
            <Cell cursor="pointer" fill="#7746FC" key={`cell-${index}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export { ChartBar };
