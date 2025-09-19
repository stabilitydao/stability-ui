import { LineChart } from "./LineChart";
import { ChartBar } from "./ChartBar";

import { ChartSkeleton } from "@ui";

import { cn } from "@utils";

import { TActiveChart } from "@types";

interface IProps {
  chart: TActiveChart;
}

const ChartCard: React.FC<IProps> = ({ chart }) => {
  return (
    <div className="bg-[#101012] rounded-xl border border-[#23252A] min-h-[150px] md:min-h-full max-h-[350px]">
      {chart.data.length ? (
        <div
          className={cn(
            "pr-6 py-6",
            ["TVL", "sharePrice"].includes(chart.name) && "pl-6"
          )}
        >
          {chart.name === "APR" ? (
            <ChartBar chart={chart} />
          ) : (
            <LineChart chart={chart} />
          )}
        </div>
      ) : (
        <ChartSkeleton />
      )}
    </div>
  );
};

export { ChartCard };
