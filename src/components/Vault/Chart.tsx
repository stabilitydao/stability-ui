import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Chart = () => {
  const data = [
    { name: "test1", uv: 4000, pv: 2400, amt: 2400 },
    { name: "test1", uv: 3000, pv: 1398, amt: 2210 },
    { name: "test1", uv: 2000, pv: 9800, amt: 2290 },
    { name: "test1", uv: 2780, pv: 3908, amt: 2000 },
    { name: "test1", uv: 1890, pv: 4800, amt: 2181 },
    { name: "test1", uv: 2390, pv: 3800, amt: 2500 },
    { name: "test1", uv: 3490, pv: 4300, amt: 2100 },
  ];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export { Chart };
