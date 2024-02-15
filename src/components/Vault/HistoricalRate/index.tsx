import { memo, useState, useEffect } from "react";

import axios from "axios";

import { Chart } from "./Chart";

import { formatFromBigInt } from "@utils";

import { GRAPH_ENDPOINT, MONTHS, TIMESTAMPS_IN_SECONDS } from "@constants";

import type { TAddress, TChartData } from "@types";

interface IProps {
  address: TAddress;
  vaultStrategy: string;
}
type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

const HistoricalRate: React.FC<IProps> = memo(({ address, vaultStrategy }) => {
  const APRType = vaultStrategy === "compound farm" ? "APR" : "Farm APR";
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
  // function calculateTimeDifference(start, end) {
  //   const startDate = new Date(start * 1000);
  //   const endDate = new Date(end * 1000);
  //   const difference = endDate.getTime() - startDate.getTime();
  //   const hours = Math.floor(difference / (1000 * 60 * 60));
  //   const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  //   return { hours, minutes };
  // }

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
    const workedData = DATA.map(formatData).sort(
      (a, b) => a.unixTimestamp - b.unixTimestamp
    );
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
    //////////////////////////////////

    //let num = Number(APRChartData[0].unixTimestamp);

    //let numbers = [];
    //while (NOW > num) {
    //let apr = APRChartData;
    // console.log(
    //   calculateTimeDifference(
    //     a,
    //     APRChartData.filter((obj) => obj.unixTimestamp > a)[0].unixTimestamp
    //   )
    // );
    // let obj = {
    //   APR: "222891",
    //   TVL: "10168010705680305384469",
    //   address: "0xf9a20fdb3fb3db0b1951ba57bf82a7c899adb7d6",
    //   sharePrice: "1010875230232836106",
    //   timestamp: a,
    // };
    // ne.push(obj);
    //a += TIMESTAMPS_IN_SECONDS.HOUR;
    //}
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
            className={`cursor-pointer hover:opacity-100 z-20 w-[45px] sm:w-[55px] min-[960px]:w-[60px] text-center text-[10px] sm:text-[12px] min-[960px]:text-[14px] py-1 ${
              activeChart.name === "APR" ? "opacity-100" : "opacity-80"
            }`}
            onClick={() => chartHandler("APR")}
          >
            {APRType}
          </p>
          <p
            className={`cursor-pointer hover:opacity-100 z-20 w-[45px] sm:w-[55px] min-[960px]:w-[60px] text-center text-[10px] sm:text-[12px] min-[960px]:text-[14px] py-1 ${
              activeChart.name === "TVL" ? "opacity-100" : "opacity-80"
            }`}
            onClick={() => chartHandler("TVL")}
          >
            TVL
          </p>
          <p
            className={`cursor-pointer hover:opacity-100 z-20 w-[45px] sm:w-[55px] min-[960px]:w-[60px] text-center text-[10px] sm:text-[12px] min-[960px]:text-[14px] py-1 ${
              activeChart.name === "sharePrice" ? "opacity-100" : "opacity-80"
            }`}
            onClick={() => chartHandler("sharePrice")}
          >
            Price
          </p>
        </div>
      </div>

      <div className="py-3 px-4">
        <Chart chart={activeChart} APRType={APRType} />
      </div>
      <div className="px-4 flex items-center justify-end gap-2 text-[16px] pb-1 sm:pb-3">
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
          All
        </p>
      </div>
    </div>
  );
});

export { HistoricalRate };
