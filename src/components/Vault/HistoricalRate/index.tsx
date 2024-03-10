import { memo, useState, useEffect } from "react";

import axios from "axios";

import { Chart } from "./Chart";
import { ChartBar } from "./ChartBar";

import { formatFromBigInt } from "@utils";

import { GRAPH_ENDPOINT, MONTHS, TIMESTAMPS_IN_SECONDS } from "@constants";

import type { TAddress, TChartData } from "@types";

interface IProps {
  address: TAddress;
  vaultStrategy: string;
}
type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

const HistoricalRate: React.FC<IProps> = memo(({ address, vaultStrategy }) => {
  const APRType = vaultStrategy === "Compound Farm" ? "APR" : "Farm APR";
  const timelineSegments = {
    DAY: "DAY",
    WEEK: "WEEK",
    MONTH: "MONTH",
    YEAR: "YEAR",
  };

  const [chartData, setChartData] = useState<any>([]);
  const [activeChart, setActiveChart] = useState<any>(false);
  const [timeline, setTimeline] = useState<TSegment>(
    timelineSegments.WEEK as TSegment
  );

  function formatData(obj: any) {
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
  }

  const getData = async () => {
    const NOW = Math.floor(Date.now() / 1000);
    let time = NOW - TIMESTAMPS_IN_SECONDS.WEEK;
    const DATA = [];
    let weeklyAPRs = [];
    let entities = 0;
    let status = true;

    while (status) {
      const HISTORY_QUERY = `{
            vaultHistoryEntities(
                where: {address: "${address}"}
                skip: ${entities}
            ) {
                APR
                APR24H
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

    const workedData = DATA.map(formatData).sort(
      (a, b) => a.unixTimestamp - b.unixTimestamp
    );

    let APRChartData = workedData
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
        APR24H: obj.APR24H,
      }));

    for (let i = 0; i < 168; i++) {
      let sortedAPRs = APRChartData.filter(
        (obj: any) => Number(obj.unixTimestamp) < time
      );

      let lastEl = sortedAPRs[sortedAPRs.length - 1] || APRChartData[0];

      const newAPR = { ...lastEl, timestamp: time };

      weeklyAPRs.push(newAPR);

      time += 3600;
    }

    APRChartData = weeklyAPRs.map(formatData);

    setChartData(workedData);
    setActiveChart({ name: "APR", data: APRChartData });
  };

  const chartHandler = (chartType: string, segment: TSegment = timeline) => {
    const NOW = Math.floor(Date.now() / 1000);
    const TIME: any = TIMESTAMPS_IN_SECONDS[segment];
    let time = 0,
      newData;

    switch (chartType) {
      case "APR":
        let APRArr = chartData.filter(
          (obj: TChartData) =>
            obj.APR && Number(obj.unixTimestamp) >= NOW - TIME
        );

        newData = [];
        time = Number(APRArr[0].unixTimestamp);

        if (segment === "MONTH") {
          while (time < NOW) {
            let sortedAPRs = APRArr.filter(
              (obj: any) => Number(obj.unixTimestamp) < time
            );
            let lastEl = sortedAPRs[sortedAPRs.length - 1] || APRArr[0];

            newData.push({ ...lastEl, timestamp: time });
            time += 7200;
          }
        } else if (segment === "YEAR") {
          while (time < NOW) {
            let sortedAPRs = APRArr.filter(
              (obj: any) => Number(obj.unixTimestamp) < time
            );
            let lastEl = sortedAPRs[sortedAPRs.length - 1] || APRArr[0];

            newData.push({ ...lastEl, timestamp: time });
            time += 14400;
          }
        } else {
          while (time < NOW) {
            let sortedAPRs = APRArr.filter(
              (obj: any) => Number(obj.unixTimestamp) < time
            );
            let lastEl = sortedAPRs[sortedAPRs.length - 1] || APRArr[0];

            newData.push({ ...lastEl, timestamp: time });
            time += 3600;
          }
        }

        APRArr = newData.map(formatData);

        const APRWidthPercent =
          (APRArr[APRArr.length - 1].unixTimestamp - APRArr[0].unixTimestamp) /
          500;

        let sum = 0;

        const APRDifferences = APRArr.map((entry: any, index: number) => {
          if (index === 0) return 0;
          const prevEntry = APRArr[index - 1];
          const diff = entry.unixTimestamp - prevEntry.unixTimestamp;
          sum += diff;
          return Math.floor(sum / APRWidthPercent);
        });

        const APRChartData = APRArr.map((obj: TChartData, index: number) => ({
          unixTimestamp: obj.unixTimestamp,
          timestamp: obj.timestamp,
          date: obj.date,
          APR: formatFromBigInt(obj.APR as number, 3, "withDecimals"),
          x: APRDifferences[index],
          y: formatFromBigInt(obj.APR as number, 3, "withDecimals"),
        }));
        setActiveChart({
          name: "APR",
          data: APRChartData,
        });
        break;
      case "TVL":
        let TVLArr = chartData.filter(
          (obj: TChartData) => Number(obj.unixTimestamp) >= NOW - TIME
        );

        newData = [];
        time = Number(TVLArr[0].unixTimestamp);

        while (time < NOW) {
          let sortedAPRs = TVLArr.filter(
            (obj: any) => Number(obj.unixTimestamp) < time
          );
          let lastEl = sortedAPRs[sortedAPRs.length - 1] || TVLArr[0];

          newData.push({ ...lastEl, timestamp: time });
          time += 3600;
        }

        TVLArr = newData.map(formatData);

        const TVLWidthPercent =
          (TVLArr[TVLArr.length - 1].unixTimestamp - TVLArr[0].unixTimestamp) /
          500;

        let TSum = 0;

        const TVLDifferences = TVLArr.map((entry: any, index: number) => {
          if (index === 0) return 0;
          const prevEntry = TVLArr[index - 1];
          const diff = entry.unixTimestamp - prevEntry.unixTimestamp;
          TSum += diff;
          return Math.floor(TSum / TVLWidthPercent);
        });

        const TVLChartData = TVLArr.map((obj: TChartData, index: number) => ({
          unixTimestamp: obj.unixTimestamp,
          timestamp: obj.timestamp,
          date: obj.date,
          TVL: formatFromBigInt(obj.TVL as number, 18, "withFloor"),
          x: TVLDifferences[index],
          y: formatFromBigInt(obj.TVL as number, 18, "withFloor"),
        }));
        setActiveChart({
          name: "TVL",
          data: TVLChartData,
        });
        break;
      case "sharePrice":
        let priceArr = chartData.filter(
          (obj: TChartData) => Number(obj.unixTimestamp) >= NOW - TIME
        );

        newData = [];
        time = Number(priceArr[0].unixTimestamp);

        while (time < NOW) {
          let sortedData = priceArr.filter(
            (obj: any) => Number(obj.unixTimestamp) < time
          );
          let lastEl = sortedData[sortedData.length - 1] || priceArr[0];
          newData.push({ ...lastEl, timestamp: time });
          time += 3600;
        }

        priceArr = newData.map(formatData);

        const priceWidthPercent =
          (priceArr[priceArr.length - 1].unixTimestamp -
            priceArr[0].unixTimestamp) /
          500;

        let PSum = 0;

        const priceDifferences = priceArr.map((entry: any, index: number) => {
          if (index === 0) return 0;
          const prevEntry = priceArr[index - 1];
          const diff = entry.unixTimestamp - prevEntry.unixTimestamp;
          PSum += diff;
          return Math.floor(PSum / priceWidthPercent);
        });

        const priceChartData = priceArr.map(
          (obj: TChartData, index: number) => ({
            unixTimestamp: obj.unixTimestamp,
            timestamp: obj.timestamp,
            date: obj.date,
            sharePrice: formatFromBigInt(
              obj.sharePrice as number,
              18,
              "withDecimals"
            ),
            x: priceDifferences[index],
            y: formatFromBigInt(obj.sharePrice as number, 18, "withDecimals"),
          })
        );
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

  return activeChart && activeChart?.data?.length ? (
    <div className="rounded-md mt-5 bg-button">
      <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px] px-4">
        <h2 className="text-start text-[1rem] min-[380px]:text-[1.25rem] md:text-[1rem] min-[960px]:text-[1.5rem]">
          Historical rate
        </h2>
        <div className="flex items-center border border-[#6376AF] rounded-md text-[1rem] relative sm:px-2 px-1 sm:gap-3 gap-2">
          <div
            className="absolute bg-[#6376AF] rounded-sm"
            style={{
              width: "33.33%",
              height: "100%",
              left:
                activeChart.name === "sharePrice"
                  ? "66.7%"
                  : activeChart.name === "TVL"
                  ? "33.3%"
                  : "0%",
              transition: "left 0.3s ease",
            }}
          ></div>
          <p
            className={`whitespace-nowrap cursor-pointer hover:opacity-100 z-20 w-[45px] sm:w-[55px] min-[960px]:w-[60px] text-center text-[10px] sm:text-[12px] min-[960px]:text-[14px] py-1 ${
              activeChart.name === "APR" ? "opacity-100" : "opacity-80"
            }`}
            onClick={() => chartHandler("APR")}
          >
            {APRType}
          </p>
          <p
            className={`whitespace-nowrap cursor-pointer hover:opacity-100 z-20 w-[45px] sm:w-[55px] min-[960px]:w-[60px] text-center text-[10px] sm:text-[12px] min-[960px]:text-[14px] py-1 ${
              activeChart.name === "TVL" ? "opacity-100" : "opacity-80"
            }`}
            onClick={() => chartHandler("TVL")}
          >
            TVL
          </p>
          <p
            className={`whitespace-nowrap cursor-pointer hover:opacity-100 z-20 w-[45px] sm:w-[55px] min-[960px]:w-[60px] text-center text-[10px] sm:text-[12px] min-[960px]:text-[14px] py-1 ${
              activeChart.name === "sharePrice" ? "opacity-100" : "opacity-80"
            }`}
            onClick={() => chartHandler("sharePrice")}
          >
            Price
          </p>
        </div>
      </div>

      <div className="py-3 px-4">
        {activeChart && (
          <>
            {activeChart.name === "APR" ? (
              <ChartBar chart={activeChart} APRType={APRType} />
            ) : (
              <Chart chart={activeChart} APRType={APRType} />
            )}
          </>
        )}
      </div>
      <div className="px-4 flex items-center justify-end text-[16px] pb-1 sm:pb-3">
        {/* <p
      onClick={() => timelineHandler(timelineSegments.DAY as TSegment)}
      className="opacity-50 hover:opacity-100 cursor-pointer"
    >
      1D
    </p> */}
        <p
          onClick={() => timelineHandler(timelineSegments.WEEK as TSegment)}
          className={`hover:opacity-100 cursor-pointer px-2 ${
            timeline === "WEEK" ? "opacity-100" : "opacity-30"
          }`}
        >
          WEEK
        </p>
        <p
          onClick={() => timelineHandler(timelineSegments.MONTH as TSegment)}
          className={`hover:opacity-100 cursor-pointer px-2 ${
            timeline === "MONTH" ? "opacity-100" : "opacity-30"
          }`}
        >
          MONTH
        </p>
        <p
          onClick={() => timelineHandler(timelineSegments.YEAR as TSegment)}
          className={`hover:opacity-100 cursor-pointer px-2 ${
            timeline === "YEAR" ? "opacity-100" : "opacity-30"
          }`}
        >
          ALL
        </p>
      </div>
    </div>
  ) : (
    <></>
  );
});

export { HistoricalRate };
