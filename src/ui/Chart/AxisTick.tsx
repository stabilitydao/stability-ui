import { TChartPayload } from "@types";

const AxisTick = ({
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

export { AxisTick };
