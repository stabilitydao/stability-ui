import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
      <p>{`APR: ${payload[0].value}%`}</p>
    ) : (
      ""
    );

  if (active && payload && payload.length) {
    return (
      <div className="bg-[#fff] text-[#8d8e96] rounded-md text-[14px]">
        <div className="px-5 py-3">
          <p>{payload[0].payload.date}</p>
          {PDataKey}
        </div>
      </div>
    );
  }

  return null;
};

const Chart = ({ chart }: { chart: any }) => {
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
          tick={{ dx: 40, dy: 0 }}
          tickFormatter={(value) => (value === 0 ? "" : value)}
          width={10}
          tickLine={false}
          axisLine={false}
          style={{
            fill: "#FFF",
          }}
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
