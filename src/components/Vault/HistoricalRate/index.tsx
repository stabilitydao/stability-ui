import { memo, useState, useEffect } from "react";

import axios from "axios";

import { Chart } from "./Chart";
import { ChartBar } from "./ChartBar";

import { ChartSkeleton } from "@components";

import { formatFromBigInt } from "@utils";

import { GRAPH_ENDPOINTS, MONTHS, TIMESTAMPS_IN_SECONDS } from "@constants";

import type { TAddress, TChartData } from "@types";

interface IProps {
  network: string;
  address: TAddress;
  vaultStrategy: string;
}
type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

const HistoricalRate: React.FC<IProps> = memo(
  ({ network, address, vaultStrategy }) => {
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
    const [isData, setIsData] = useState(true);

    const formatData = (obj: any) => {
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
    };

    const getData = async () => {
      const NOW = Math.floor(Date.now() / 1000);
      const DATA = [];

      let newData = [];
      let time = NOW - TIMESTAMPS_IN_SECONDS.WEEK;
      let entities = 0;
      let status = true;

      while (status) {
        const HISTORY_QUERY = `{
            vaultHistoryEntities(
              orderBy: timestamp, 
              orderDirection: asc,
              where: {address: "${address}", periodVsHoldAPR_not: null}
              skip: ${entities}
            ) {
                APR
                APR24H
                periodVsHoldAPR
                address
                sharePrice
                TVL
                timestamp
            }}`;

        const graphResponse = await axios.post(GRAPH_ENDPOINTS[network], {
          query: HISTORY_QUERY,
        });

        DATA.push(...graphResponse.data.data.vaultHistoryEntities);

        if (graphResponse.data.data.vaultHistoryEntities.length < 100) {
          status = false;
        }
        entities += 100;
      }

      const workedData = DATA.map(formatData);

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
          vsHoldAPR: Number(obj.periodVsHoldAPR).toFixed(3),
        }));

      if (!APRChartData.length) {
        setIsData(false);
        return;
      }
      const lastTimestamp = APRChartData[APRChartData.length - 1].unixTimestamp;

      time = Number(APRChartData[0].unixTimestamp);

      do {
        let sortedAPRs = APRChartData.filter(
          (obj: any) => Number(obj.unixTimestamp) >= time
        );

        let firstEl = sortedAPRs[0] || APRChartData[APRChartData.length - 1];

        newData.push({ ...firstEl, timestamp: time });
        time += 3600;
        if (time >= lastTimestamp) {
          newData.push({
            ...APRChartData[APRChartData.length - 1],
            timestamp: APRChartData[APRChartData.length - 1].unixTimestamp,
          });
        }
      } while (time < lastTimestamp);

      APRChartData = newData.map(formatData);

      setChartData(workedData);
      setActiveChart({ name: "APR", data: APRChartData });
    };

    const chartHandler = (chartType: string, segment: TSegment = timeline) => {
      const NOW = Math.floor(Date.now() / 1000);
      const TIME: any = TIMESTAMPS_IN_SECONDS[segment];

      let time = 0,
        newData;
      const lastTimestamp = chartData[chartData.length - 1].unixTimestamp;

      switch (chartType) {
        case "APR":
          let APRArr = chartData.filter(
            (obj: TChartData) =>
              obj.APR && Number(obj.unixTimestamp) >= NOW - TIME
          );

          newData = [];
          time = Number(APRArr[0].unixTimestamp);

          if (segment === "MONTH") {
            do {
              let sortedAPRs = APRArr.filter(
                (obj: any) => Number(obj.unixTimestamp) >= time
              );
              let firstEl = sortedAPRs[0] || APRArr[APRArr.length - 1];

              newData.push({ ...firstEl, timestamp: time });
              time += 7200;
              if (time >= lastTimestamp) {
                newData.push({
                  ...APRArr[APRArr.length - 1],
                  timestamp: APRArr[APRArr.length - 1].unixTimestamp,
                });
              }
            } while (time < lastTimestamp);
          } else if (segment === "YEAR") {
            do {
              let sortedAPRs = APRArr.filter(
                (obj: any) => Number(obj.unixTimestamp) >= time
              );
              let firstEl = sortedAPRs[0] || APRArr[APRArr.length - 1];

              newData.push({ ...firstEl, timestamp: time });
              time += 14400;
              if (time >= lastTimestamp) {
                newData.push({
                  ...APRArr[APRArr.length - 1],
                  timestamp: APRArr[APRArr.length - 1].unixTimestamp,
                });
              }
            } while (time < lastTimestamp);
          } else {
            do {
              let sortedAPRs = APRArr.filter(
                (obj: any) => Number(obj.unixTimestamp) >= time
              );
              let firstEl = sortedAPRs[0] || APRArr[APRArr.length - 1];

              newData.push({ ...firstEl, timestamp: time });
              time += 3600;
              if (time >= lastTimestamp) {
                newData.push({
                  ...APRArr[APRArr.length - 1],
                  timestamp: APRArr[APRArr.length - 1].unixTimestamp,
                });
              }
            } while (time < lastTimestamp);
          }

          APRArr = newData.map(formatData);

          const APRWidthPercent =
            (APRArr[APRArr.length - 1].unixTimestamp -
              APRArr[0].unixTimestamp) /
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

          while (time < lastTimestamp) {
            let sortedAPRs = TVLArr.filter(
              (obj: any) => Number(obj.unixTimestamp) < time
            );
            let lastEl = sortedAPRs[sortedAPRs.length - 1] || TVLArr[0];

            newData.push({ ...lastEl, timestamp: time });
            time += 3600;
            if (time >= lastTimestamp) {
              newData.push({
                ...TVLArr[TVLArr.length - 1],
                timestamp: TVLArr[TVLArr.length - 1].unixTimestamp,
              });
            }
          }

          TVLArr = newData.map(formatData);
          const TVLWidthPercent =
            (TVLArr[TVLArr.length - 1].unixTimestamp -
              TVLArr[0].unixTimestamp) /
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

          while (time < lastTimestamp) {
            let sortedData = priceArr.filter(
              (obj: any) => Number(obj.unixTimestamp) < time
            );
            let lastEl = sortedData[sortedData.length - 1] || priceArr[0];
            newData.push({ ...lastEl, timestamp: time });
            time += 3600;
            if (time >= lastTimestamp) {
              newData.push({
                ...priceArr[priceArr.length - 1],
                timestamp: priceArr[priceArr.length - 1].unixTimestamp,
              });
            }
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

        case "vsHodl":
          let vsHoldArr = chartData.filter(
            (obj: TChartData) =>
              obj.APR && Number(obj.unixTimestamp) >= NOW - TIME
          );

          newData = [];
          time = Number(vsHoldArr[0].unixTimestamp);

          if (segment === "MONTH") {
            do {
              let sortedAPRs = vsHoldArr.filter(
                (obj: any) => Number(obj.unixTimestamp) >= time
              );
              let firstEl = sortedAPRs[0] || vsHoldArr[vsHoldArr.length - 1];

              newData.push({ ...firstEl, timestamp: time });
              time += 7200;
              if (time >= lastTimestamp) {
                newData.push({
                  ...vsHoldArr[vsHoldArr.length - 1],
                  timestamp: vsHoldArr[vsHoldArr.length - 1].unixTimestamp,
                });
              }
            } while (time < lastTimestamp);
          } else if (segment === "YEAR") {
            do {
              let sortedAPRs = vsHoldArr.filter(
                (obj: any) => Number(obj.unixTimestamp) >= time
              );
              let firstEl = sortedAPRs[0] || vsHoldArr[vsHoldArr.length - 1];

              newData.push({ ...firstEl, timestamp: time });
              time += 14400;
              if (time >= lastTimestamp) {
                newData.push({
                  ...vsHoldArr[vsHoldArr.length - 1],
                  timestamp: vsHoldArr[vsHoldArr.length - 1].unixTimestamp,
                });
              }
            } while (time < lastTimestamp);
          } else {
            do {
              let sortedAPRs = vsHoldArr.filter(
                (obj: any) => Number(obj.unixTimestamp) >= time
              );
              let firstEl = sortedAPRs[0] || vsHoldArr[vsHoldArr.length - 1];

              newData.push({ ...firstEl, timestamp: time });
              time += 3600;
              if (time >= lastTimestamp) {
                newData.push({
                  ...vsHoldArr[vsHoldArr.length - 1],
                  timestamp: vsHoldArr[vsHoldArr.length - 1].unixTimestamp,
                });
              }
            } while (time < lastTimestamp);
          }

          vsHoldArr = newData.map(formatData);

          const vsHoldAPRChartData = vsHoldArr.map((obj: TChartData) => ({
            unixTimestamp: obj.unixTimestamp,
            timestamp: obj.timestamp,
            date: obj.date,
            vsHodl: Number(obj.periodVsHoldAPR).toFixed(3),
          }));
          setActiveChart({
            name: "vsHodl",
            data: vsHoldAPRChartData,
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
      <div className="rounded-md mt-5">
        <div className="rounded-t-md flex justify-between items-center  h-[60px] px-4">
          <h2 className="text-start text-[1rem] min-[420px]:text-[1.25rem] md:text-[1rem] min-[960px]:text-[1.5rem] lg:block md:hidden block">
            Historical rate
          </h2>
          {activeChart && (
            <div className="flex items-center relative sm:px-2 px-1 sm:gap-4 gap-2 text-[10px] sm:text-[12px] lg:text-[14px]">
              <div
                className="absolute bottom-0 bg-[#6376AF] rounded-sm"
                style={{
                  width: "25%",
                  height: "3px",
                  left:
                    activeChart.name === "sharePrice"
                      ? "75%"
                      : activeChart.name === "TVL"
                      ? "50%"
                      : activeChart.name === "vsHodl"
                      ? "25%"
                      : "0%",
                  transition: "left 0.3s ease",
                }}
              ></div>
              <p
                className={`whitespace-nowrap cursor-pointer hover:opacity-100 z-20 w-[55px] md:w-[65px] lg:w-[80px] text-center py-1 ${
                  activeChart.name === "APR" ? "opacity-100" : "opacity-80"
                }`}
                onClick={() => chartHandler("APR")}
              >
                {APRType}
              </p>
              <p
                className={`whitespace-nowrap cursor-pointer hover:opacity-100 z-20 py-1 ${
                  activeChart.name === "vsHodl" ? "opacity-100" : "opacity-80"
                }`}
                onClick={() => chartHandler("vsHodl")}
              >
                VS HODL APR
              </p>
              <p
                className={`whitespace-nowrap cursor-pointer hover:opacity-100 z-20 w-[55px] md:w-[65px] lg:w-[80px] text-center py-1 ${
                  activeChart.name === "TVL" ? "opacity-100" : "opacity-80"
                }`}
                onClick={() => chartHandler("TVL")}
              >
                TVL
              </p>
              <p
                className={`whitespace-nowrap cursor-pointer hover:opacity-100 z-20 w-[55px] md:w-[65px] lg:w-[80px] text-center py-1 ${
                  activeChart.name === "sharePrice"
                    ? "opacity-100"
                    : "opacity-80"
                }`}
                onClick={() => chartHandler("sharePrice")}
              >
                Price
              </p>
            </div>
          )}
        </div>
        {isData ? (
          <>
            <div className="py-3 px-4">
              {activeChart ? (
                <>
                  {activeChart.name === "APR" ? (
                    <ChartBar chart={activeChart} APRType={APRType} />
                  ) : activeChart.name === "vsHodl" ? (
                    <ChartBar chart={activeChart} APRType={"VS HODL APR"} />
                  ) : (
                    <Chart chart={activeChart} />
                  )}
                </>
              ) : (
                <ChartSkeleton />
              )}
            </div>
            {activeChart && (
              <div className="px-4 flex items-center justify-end text-[16px] pb-1 sm:pb-3">
                {/* <p
      onClick={() => timelineHandler(timelineSegments.DAY as TSegment)}
      className="opacity-50 hover:opacity-100 cursor-pointer"
    >
      1D
    </p> */}
                <p
                  onClick={() =>
                    timelineHandler(timelineSegments.WEEK as TSegment)
                  }
                  className={`hover:opacity-100 cursor-pointer px-2 ${
                    timeline === "WEEK" ? "opacity-100" : "opacity-30"
                  }`}
                >
                  WEEK
                </p>
                <p
                  onClick={() =>
                    timelineHandler(timelineSegments.MONTH as TSegment)
                  }
                  className={`hover:opacity-100 cursor-pointer px-2 ${
                    timeline === "MONTH" ? "opacity-100" : "opacity-30"
                  }`}
                >
                  MONTH
                </p>
                <p
                  onClick={() =>
                    timelineHandler(timelineSegments.YEAR as TSegment)
                  }
                  className={`hover:opacity-100 cursor-pointer px-2 ${
                    timeline === "YEAR" ? "opacity-100" : "opacity-30"
                  }`}
                >
                  ALL
                </p>
              </div>
            )}
          </>
        ) : (
          <h3 className="flex items-center justify-center h-[320px]">
            No available data
          </h3>
        )}
      </div>
    );
  }
);

export { HistoricalRate };
