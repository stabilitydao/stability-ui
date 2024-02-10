import { memo, useState } from "react";

import { Chart } from "./Chart";

import { formatFromBigInt } from "@utils";

import { MONTHS } from "@constants";

import type { TChartData } from "@types";

const HistoricalRate: React.FC<{ data: TChartData[] }> = memo(({ data }) => {
  const chartData = data.map((obj) => {
    const date = new Date(Number(obj.timestamp) * 1000);

    const day = date.getDate();
    const month = date.getMonth() + 1;

    const formattedDate = `${day.toString().padStart(2, "0")}.${month
      .toString()
      .padStart(2, "0")}`;

    const monthName = MONTHS[date.getMonth()];
    const formattedTime = `${monthName} ${day}, ${date.getFullYear()} ${date.toLocaleString(
      "en-US",
      { hour: "numeric", minute: "numeric", hour12: true }
    )}`;

    return { ...obj, timestamp: formattedDate, date: formattedTime };
  });
  const sharePriceChartData = chartData.map((obj) => ({
    timestamp: obj.timestamp,
    date: obj.date,
    sharePrice: formatFromBigInt(obj.sharePrice, 18, "withDecimals"),
  }));

  const TVLChartData = chartData.map((obj) => ({
    timestamp: obj.timestamp,
    date: obj.date,
    TVL: formatFromBigInt(obj.TVL, 18, "withFloor"),
  }));

  const APRChartData = chartData
    .filter((obj) => obj.APR)
    .map((obj) => ({
      timestamp: obj.timestamp,
      date: obj.date,
      APR: formatFromBigInt(obj.APR, 3, "withDecimals"),
    }));
  const [activeChart, setActiveChart] = useState({
    name: "APR",
    data: APRChartData,
  });
  return (
    <div className="rounded-md mt-5 bg-button">
      <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px]">
        <h2 className="text-[24px] text-start ml-4">Historical rate</h2>
      </div>
      <div className="p-3">
        <Chart chart={activeChart} />
      </div>
    </div>
  );
});

export { HistoricalRate };
