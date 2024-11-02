import { memo, useState, useEffect } from "react";

import axios, { AxiosError } from "axios";

import { Chart } from "./Chart";
import { ChartBar } from "./ChartBar";

import { ChartSkeleton, HeadingText } from "@ui";

import { formatFromBigInt, getTimeDifference } from "@utils";

import { GRAPH_ENDPOINTS } from "src/constants/env";

import { MONTHS, TIMESTAMPS_IN_SECONDS } from "@constants";

import type { TAddress, TChartData } from "@types";

interface IProps {
  network: string;
  address: TAddress;
  created: number;
  vaultStrategy: string;
  lastHardWork: number;
}
type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

type TActiveChart =
  | {
      name: string;
      data: [];
    }
  | undefined;

const HistoricalRate: React.FC<IProps> = memo(
  ({ network, address, created, vaultStrategy, lastHardWork }) => {
    const APRType = vaultStrategy === "Compound Farm" ? "APR" : "Farm APR";

    const timelineSegments = {
      DAY: "DAY",
      WEEK: "WEEK",
      MONTH: "MONTH",
      YEAR: "YEAR",
    };

    const daysFromLastHardWork = getTimeDifference(lastHardWork).days;

    const [chartData, setChartData] = useState<TChartData[]>([]);
    const [activeChart, setActiveChart] = useState<TActiveChart>();
    const [timeline, setTimeline] = useState<TSegment>(
      timelineSegments.WEEK as TSegment
    );
    const [isData, setIsData] = useState(true);
    const [graphError, setGraphError] = useState({
      isError: false,
      httpStatus: "",
      errorMessage: "",
    });

    const createdDaysDifference = getTimeDifference(created)?.days;

    const formatData = (obj: TChartData) => {
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
        unixTimestamp: Number(obj.timestamp),
        timestamp: formattedDate,
        date: formattedTime,
      };
    };

    const getData = async () => {
      const NOW = Math.floor(Date.now() / 1000);
      const DATA = [];

      let entities = 0;
      let status = true;

      try {
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

        let _chartData = workedData.filter(
          (obj) =>
            obj.APR && obj.unixTimestamp >= NOW - TIMESTAMPS_IN_SECONDS.WEEK
        );

        if (!_chartData.length) {
          setIsData(false);
          return;
        }

        setChartData(workedData);
      } catch (error) {
        const err = error as AxiosError;
        if (err.response) {
          setGraphError({
            isError: true,
            httpStatus: `HTTP Status: ${err.response.status}`,
            errorMessage: `Error Message: ${err.response.statusText}`,
          });
        } else {
          setGraphError({
            isError: true,
            httpStatus: "",
            errorMessage: `Error Message: ${err.message}`,
          });
        }
        setIsData(false);
        throw new Error(err.message);
      }
    };

    const chartHandler = (chartType: string, segment: TSegment = timeline) => {
      const NOW = Math.floor(Date.now() / 1000);
      const TIME: number = TIMESTAMPS_IN_SECONDS[segment];

      let time = NOW - TIME;

      let newData;

      const lastTimestamp = chartData[chartData.length - 1].unixTimestamp;

      switch (chartType) {
        case "APR":
          let APRArr = chartData.filter(
            (obj) => obj.APR && obj.unixTimestamp >= NOW - TIME
          );

          newData = [];

          if (segment === "WEEK" && createdDaysDifference >= 7) {
            do {
              let sortedAPRs = APRArr.filter(
                (obj) => obj.unixTimestamp >= time
              );

              let firstEl = sortedAPRs[0] || APRArr[APRArr.length - 1];

              newData.push({ ...firstEl, timestamp: time });
              time += 3600;

              if (time >= lastTimestamp) {
                newData.push({
                  ...APRArr[APRArr.length - 1],
                  timestamp: APRArr[APRArr.length - 1]?.unixTimestamp,
                });
              }
            } while (time < lastTimestamp);
          } else if (segment === "MONTH" && createdDaysDifference >= 30) {
            do {
              let sortedAPRs = APRArr.filter(
                (obj) => obj.unixTimestamp >= time
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
          } else {
            time = APRArr[0].unixTimestamp;
            do {
              let sortedAPRs = APRArr.filter(
                (obj) => obj.unixTimestamp >= time
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
          }

          APRArr = newData.map(formatData);

          const APRWidthPercent =
            (APRArr[APRArr.length - 1].unixTimestamp -
              APRArr[0].unixTimestamp) /
            500;

          let sum = 0;

          const APRDifferences = APRArr.map(
            (entry: TChartData, index: number) => {
              if (index === 0) return 0;
              const prevEntry = APRArr[index - 1];
              const diff = entry.unixTimestamp - prevEntry.unixTimestamp;
              sum += diff;
              return Math.floor(sum / APRWidthPercent);
            }
          );

          let APRChartData = APRArr.map((obj: TChartData, index: number) => ({
            unixTimestamp: obj.unixTimestamp,
            timestamp: obj.timestamp,
            date: obj.date,
            APR: formatFromBigInt(obj.APR as number, 3, "withDecimals"),
            x: APRDifferences[index],
            y: formatFromBigInt(obj.APR as number, 3, "withDecimals"),
          }));

          if (daysFromLastHardWork >= 3) {
            APRChartData = APRChartData.filter(
              (data) => data.unixTimestamp < lastHardWork
            );
          }

          setActiveChart({
            name: "APR",
            data: APRChartData as [],
          });
          break;
        case "vsHodl":
          let vsHoldArr = chartData.filter(
            (obj: TChartData) => obj.APR && obj.unixTimestamp >= NOW - TIME
          );

          newData = [];
          if (segment === "WEEK" && createdDaysDifference >= 7) {
            do {
              let sortedAPRs = vsHoldArr.filter(
                (obj) => obj.unixTimestamp >= time
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
          } else if (segment === "MONTH" && createdDaysDifference >= 30) {
            do {
              let sortedAPRs = vsHoldArr.filter(
                (obj) => obj.unixTimestamp >= time
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
          } else {
            time = vsHoldArr[0].unixTimestamp;
            do {
              let sortedAPRs = vsHoldArr.filter(
                (obj) => obj.unixTimestamp >= time
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
            data: vsHoldAPRChartData as [],
          });
          break;
        case "TVL":
          let TVLArr = chartData.filter(
            (obj: TChartData) => obj.unixTimestamp >= NOW - TIME
          );
          newData = [];

          if (
            segment === "YEAR" ||
            (segment === "WEEK" && createdDaysDifference < 7) ||
            (segment === "MONTH" && createdDaysDifference < 30)
          ) {
            time = TVLArr[0].unixTimestamp;
          }

          do {
            let sortedAPRs = TVLArr.filter((obj) => obj.unixTimestamp < time);
            let lastEl = sortedAPRs[sortedAPRs.length - 1] || TVLArr[0];

            newData.push({ ...lastEl, timestamp: time });
            time += 3600;
            if (time >= lastTimestamp) {
              newData.push({
                ...TVLArr[TVLArr.length - 1],
                timestamp: TVLArr[TVLArr.length - 1].unixTimestamp,
              });
            }
          } while (time < lastTimestamp);

          TVLArr = newData.map(formatData);

          const TVLWidthPercent =
            (TVLArr[TVLArr.length - 1].unixTimestamp -
              TVLArr[0].unixTimestamp) /
            500;

          let TSum = 0;

          const TVLDifferences = TVLArr.map(
            (entry: TChartData, index: number) => {
              if (index === 0) return 0;
              const prevEntry = TVLArr[index - 1];
              const diff = entry.unixTimestamp - prevEntry.unixTimestamp;
              TSum += diff;
              return Math.floor(TSum / TVLWidthPercent);
            }
          );

          const TVLChartData = TVLArr.map((obj: TChartData, index: number) => ({
            unixTimestamp: obj.unixTimestamp,
            timestamp: obj.timestamp,
            date: obj.date,
            TVL: formatFromBigInt(obj.TVL || 0, 18, "withFloor"),
            x: TVLDifferences[index],
            y: formatFromBigInt(obj.TVL || 0, 18, "withFloor"),
          }));
          setActiveChart({
            name: "TVL",
            data: TVLChartData as [],
          });
          break;
        case "sharePrice":
          let priceArr = chartData.filter(
            (obj: TChartData) => obj.unixTimestamp >= NOW - TIME
          );

          newData = [];

          if (
            segment === "YEAR" ||
            (segment === "WEEK" && createdDaysDifference < 7) ||
            (segment === "MONTH" && createdDaysDifference < 30)
          ) {
            time = priceArr[0].unixTimestamp;
          }

          do {
            let sortedData = priceArr.filter((obj) => obj.unixTimestamp < time);
            let lastEl = sortedData[sortedData.length - 1] || priceArr[0];
            newData.push({ ...lastEl, timestamp: time });
            time += 3600;
            if (time >= lastTimestamp) {
              newData.push({
                ...priceArr[priceArr.length - 1],
                timestamp: priceArr[priceArr.length - 1].unixTimestamp,
              });
            }
          } while (time < lastTimestamp);

          priceArr = newData.map(formatData);

          const priceWidthPercent =
            (priceArr[priceArr.length - 1].unixTimestamp -
              priceArr[0].unixTimestamp) /
            500;

          let PSum = 0;

          const priceDifferences = priceArr.map(
            (entry: TChartData, index: number) => {
              if (!index) return 0;
              const prevEntry = priceArr[index - 1];
              const diff = entry.unixTimestamp - prevEntry.unixTimestamp;
              PSum += diff;
              return Math.floor(PSum / priceWidthPercent);
            }
          );

          const priceChartData = priceArr.map(
            (obj: TChartData, index: number) => ({
              unixTimestamp: obj.unixTimestamp,
              timestamp: obj.timestamp,
              date: obj.date,
              sharePrice: formatFromBigInt(
                obj.sharePrice || 0,
                18,
                "withDecimals"
              ),
              x: priceDifferences[index],
              y: formatFromBigInt(obj.sharePrice || 0, 18, "withDecimals"),
            })
          );
          setActiveChart({
            name: "sharePrice",
            data: priceChartData as [],
          });
          break;
        default:
          console.log("NO ACTIVE CASE");
          break;
      }
    };

    const timelineHandler = (segment: TSegment) => {
      if (segment === timeline) return;
      setTimeline(segment);
      chartHandler(activeChart?.name || "", segment);
    };

    useEffect(() => {
      if (chartData.length) {
        chartHandler("APR", "WEEK");
      }
    }, [chartData]);

    useEffect(() => {
      getData();
    }, []);

    return (
      <div className="rounded-md mt-5">
        <div className="rounded-t-md flex flex-col md:flex-row justify-between items-center h-[60px] md:px-4">
          <HeadingText text="Historical Rate" scale={2} />
          {activeChart && (
            <div className="flex items-center font-semibold relative text-[14px]">
              <p
                className={`whitespace-nowrap cursor-pointer z-20 text-center p-4 border-b-[1.5px] border-transparent ${activeChart.name === "APR" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
                onClick={() => chartHandler("APR")}
              >
                {APRType}
              </p>
              <p
                className={`whitespace-nowrap cursor-pointer z-20 p-4 border-b-[1.5px]  border-transparent ${activeChart.name === "vsHodl" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
                onClick={() => chartHandler("vsHodl")}
              >
                VS HODL APR
              </p>
              <p
                className={`whitespace-nowrap cursor-pointer z-20 text-center p-4 border-b-[1.5px]  border-transparent ${activeChart.name === "TVL" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
                onClick={() => chartHandler("TVL")}
              >
                TVL
              </p>
              <p
                className={`whitespace-nowrap cursor-pointer z-20 text-center p-4 border-b-[1.5px]  border-transparent ${
                  activeChart.name === "sharePrice"
                    ? "text-neutral-50 !border-accent-500"
                    : "text-neutral-500 hover:border-accent-800"
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
            <div className="pb-3 pt-10 md:py-3 md:px-4">
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
              <div className="flex items-center justify-end  select-none font-manrope text-[14px] font-semibold">
                <div className="flex items-center justify-center bg-accent-900 h-10 rounded-2xl w-full max-w-[200px]">
                  {/* <p
      onClick={() => timelineHandler(timelineSegments.DAY as TSegment)}
      className="opacity-50 hover:opacity-100 cursor-pointer"
    >
      1D
    </p> */}
                  <div className="flex items-center justify-center px-1">
                    <p
                      onClick={() =>
                        timelineHandler(timelineSegments.WEEK as TSegment)
                      }
                      className={`py-1 px-4 cursor-pointer rounded-xl ${
                        timeline === "WEEK"
                          ? "bg-accent-500 text-neutral-50 h-8"
                          : "text-accent-400 h-full hover:bg-accent-800 hover:text-accent-400"
                      }`}
                    >
                      Week
                    </p>
                    <p
                      onClick={() =>
                        timelineHandler(timelineSegments.MONTH as TSegment)
                      }
                      className={`py-1 px-4 cursor-pointer  rounded-xl ${
                        timeline === "MONTH"
                          ? "bg-accent-500 text-neutral-50 h-8"
                          : "text-accent-400 h-full hover:bg-accent-800 hover:text-accent-400"
                      }`}
                    >
                      Month
                    </p>
                    <p
                      onClick={() =>
                        timelineHandler(timelineSegments.YEAR as TSegment)
                      }
                      className={`py-1 px-4 cursor-pointer rounded-xl ${
                        timeline === "YEAR"
                          ? "bg-accent-500 text-neutral-50 h-8 hover:bg-accent-500 hover:text-neutral-50"
                          : "text-accent-400 h-full hover:bg-accent-800 hover:text-accent-400"
                      }`}
                    >
                      All
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-[320px] flex items-center justify-center">
            {graphError.isError ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <HeadingText text="Unable to load subgraph" scale={2} />
                {!!graphError.httpStatus && (
                  <HeadingText text={graphError.httpStatus} scale={3} />
                )}
                {!!graphError.errorMessage && (
                  <HeadingText text={graphError.errorMessage} scale={3} />
                )}
              </div>
            ) : (
              <HeadingText text="No available data" scale={2} />
            )}
          </div>
        )}
      </div>
    );
  }
);

export { HistoricalRate };
