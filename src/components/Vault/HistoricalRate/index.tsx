import { memo, useState, useEffect } from "react";

import axios from "axios";

import { Chart } from "./Chart";

import { formatFromBigInt } from "@utils";

import { GRAPH_ENDPOINT, MONTHS, TIMESTAMPS_IN_SECONDS } from "@constants";

import type { TAddress, TChartData } from "@types";

interface IProps {
  address: TAddress;
}
type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

const HistoricalRate: React.FC<IProps> = memo(({ address }) => {
  const timelineSegments = {
    DAY: "DAY",
    WEEK: "WEEK",
    MONTH: "MONTH",
    YEAR: "YEAR",
  };

  const [chartData, setChartData] = useState<any>([]);
  const [activeChart, setActiveChart] = useState<any>({});
  const [timeline, setTimeline] = useState<TSegment>(
    timelineSegments.WEEK as TSegment
  );

  const getData = async () => {
    const NOW = Math.floor(Date.now() / 1000);
    const DATA = [];
    let entities = 0;
    let status = true;

    while (status) {
      const HISTORY_QUERY = `{
            vaultHistoryEntities(
                where: {address: "${address}"}
                skip: ${entities}
            ) {
                APR
                address
                sharePrice
                TVL
                timestamp
            }}`;

      const graphResponse = await axios.post(GRAPH_ENDPOINT, {
        query: HISTORY_QUERY,
      });

      DATA.push(...graphResponse.data.data.vaultHistoryEntities);

      if (graphResponse.data.data.vaultHistoryEntities.length < 100) {
        status = false;
      }
      entities += 100;
    }

    const workedData = DATA.map((obj) => {
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

      return {
        ...obj,
        unixTimestamp: obj.timestamp,
        timestamp: formattedDate,
        date: formattedTime,
      };
    }).sort((a, b) => a.unixTimestamp - b.unixTimestamp);
    const APRChartData = workedData
      .filter(
        (obj) =>
          obj.APR &&
          Number(obj.unixTimestamp) >= NOW - TIMESTAMPS_IN_SECONDS.WEEK
      )
      .map((obj) => ({
        unixTimestamp: obj.unixTimestamp,
        timestamp: obj.timestamp,
        date: obj.date,
        APR: formatFromBigInt(obj.APR, 3, "withDecimals"),
      }));

    setChartData(workedData);
    setActiveChart({ name: "APR", data: APRChartData });
  };

  const chartHandler = (chartType: string, segment: TSegment = timeline) => {
    const NOW = Math.floor(Date.now() / 1000);
    const TIME: any = TIMESTAMPS_IN_SECONDS[segment];
    switch (chartType) {
      case "APR":
        const APRChartData = chartData
          .filter(
            (obj: TChartData) =>
              obj.APR && Number(obj.unixTimestamp) >= NOW - TIME
          )
          .map((obj: TChartData) => ({
            unixTimestamp: obj.unixTimestamp,
            timestamp: obj.timestamp,
            date: obj.date,
            APR: formatFromBigInt(obj.APR as number, 3, "withDecimals"),
          }));
        setActiveChart({
          name: "APR",
          data: APRChartData,
        });
        break;
      case "TVL":
        const TVLChartData = chartData
          .filter((obj: TChartData) => Number(obj.unixTimestamp) >= NOW - TIME)
          .map((obj: TChartData) => ({
            unixTimestamp: obj.unixTimestamp,
            timestamp: obj.timestamp,
            date: obj.date,
            TVL: formatFromBigInt(obj.TVL as number, 18, "withFloor"),
          }));
        setActiveChart({
          name: "TVL",
          data: TVLChartData,
        });
        break;
      case "sharePrice":
        const priceChartData = chartData
          .filter((obj: TChartData) => Number(obj.unixTimestamp) >= NOW - TIME)
          .map((obj: TChartData) => ({
            unixTimestamp: obj.unixTimestamp,
            timestamp: obj.timestamp,
            date: obj.date,
            sharePrice: formatFromBigInt(
              obj.sharePrice as number,
              18,
              "withDecimals"
            ),
          }));
        setActiveChart({
          name: "sharePrice",
          data: priceChartData,
        });
        break;
      default:
        console.log("NO ACTIVE CASE");
        break;
    }
  };
  const timelineHandler = (segment: TSegment) => {
    const TIME: any = TIMESTAMPS_IN_SECONDS[segment];
    if (TIME === timeline) return;
    setTimeline(segment);
    chartHandler(activeChart.name, segment);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="rounded-md mt-5 bg-button">
      <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px] px-4">
        <h2 className="text-start text-[1rem] min-[370px]:text-[1.5rem]">
          Historical rate
        </h2>
        <div className="flex items-center gap-3 border border-[#6376AF] px-2 py-1 rounded-md text-[1rem]">
          <p
            className={`cursor-pointer hover:opacity-100 ${
              activeChart.name === "APR" ? "opacity-100" : "opacity-80"
            }`}
            onClick={() => chartHandler("APR")}
          >
            APR
          </p>
          <p
            className={`cursor-pointer hover:opacity-100 ${
              activeChart.name === "TVL" ? "opacity-100" : "opacity-80"
            }`}
            onClick={() => chartHandler("TVL")}
          >
            TVL
          </p>
          <p
            className={`cursor-pointer hover:opacity-100 ${
              activeChart.name === "sharePrice" ? "opacity-100" : "opacity-80"
            }`}
            onClick={() => chartHandler("sharePrice")}
          >
            Price
          </p>
        </div>
      </div>

      <div className="py-3 px-4">
        <Chart chart={activeChart} />
      </div>
      <div className="px-4 flex items-center justify-end gap-2 text-[16px] pb-3">
        {/* <p
          onClick={() => timelineHandler(timelineSegments.DAY as TSegment)}
          className="opacity-50 hover:opacity-100 cursor-pointer"
        >
          1D
        </p> */}
        <p
          onClick={() => timelineHandler(timelineSegments.WEEK as TSegment)}
          className={`hover:opacity-100 cursor-pointer ${
            timeline === "WEEK" ? "opacity-100" : "opacity-30"
          }`}
        >
          1W
        </p>
        <p
          onClick={() => timelineHandler(timelineSegments.MONTH as TSegment)}
          className={`hover:opacity-100 cursor-pointer ${
            timeline === "MONTH" ? "opacity-100" : "opacity-30"
          }`}
        >
          1M
        </p>
        <p
          onClick={() => timelineHandler(timelineSegments.YEAR as TSegment)}
          className={`hover:opacity-100 cursor-pointer ${
            timeline === "YEAR" ? "opacity-100" : "opacity-30"
          }`}
        >
          1Y
        </p>
      </div>
    </div>
  );
});

export { HistoricalRate };
