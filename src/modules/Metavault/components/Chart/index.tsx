import { useState, useEffect } from "react";

import axios from "axios";

import { HeadingText, ChartSkeleton, ChartTimelineSwitcher } from "@ui";

import { LineChart } from "./LineChart";
import { ChartBar } from "./ChartBar";

import { cn } from "@utils";

import { MONTHS, TIMESTAMPS_IN_SECONDS } from "@constants";

import { seeds } from "@stabilitydao/stability";

import { TActiveChart, TimelineTypes, TChartData } from "@types";

type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

const Chart = ({ symbol }: { symbol: string }): JSX.Element => {
  const [isData, setIsData] = useState(true);
  const [chartData, setChartData] = useState<TChartData[]>([]);

  const [activeChart, setActiveChart] = useState<TActiveChart>({
    name: "",
    data: [],
  });

  const [timeline, setTimeline] = useState<TSegment>(
    TimelineTypes.Week as TSegment
  );

  const formatData = (obj) => {
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

  const chartHandler = (chartType: string, segment: TSegment = timeline) => {
    const NOW = Math.floor(Date.now() / 1000);
    const TIME: number = TIMESTAMPS_IN_SECONDS[segment];
    let time = NOW - TIME;
    let newData;
    const lastTimestamp = chartData[chartData.length - 1].unixTimestamp;
    switch (chartType) {
      case "APR":
        let APRArr = chartData.filter(
          (obj) => obj.apr && obj.unixTimestamp >= NOW - TIME
        );
        newData = [];
        if (segment === "WEEK") {
          do {
            let sortedAPRs = APRArr.filter((obj) => obj.unixTimestamp >= time);
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
        } else if (segment === "MONTH") {
          do {
            let sortedAPRs = APRArr.filter((obj) => obj.unixTimestamp >= time);
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
            let sortedAPRs = APRArr.filter((obj) => obj.unixTimestamp >= time);
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
          (APRArr[APRArr.length - 1].unixTimestamp - APRArr[0].unixTimestamp) /
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
          APR: Number(obj.apr),
          x: APRDifferences[index],
          y: Number(obj.apr),
        }));

        setActiveChart({
          name: "APR",
          data: APRChartData as [],
        });
        break;
      case "TVL":
        let TVLArr = chartData.filter(
          (obj: TChartData) => obj.unixTimestamp >= NOW - TIME
        );
        newData = [];

        time = TVLArr[0].unixTimestamp;

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
          (TVLArr[TVLArr.length - 1].unixTimestamp - TVLArr[0].unixTimestamp) /
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
          TVL: obj.tvl,
          x: TVLDifferences[index],
          y: obj.tvl,
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

        time = priceArr[0].unixTimestamp;

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
            sharePrice: obj.sharePrice,
            x: priceDifferences[index],
            y: obj.sharePrice,
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

  const getData = async () => {
    try {
      const req = await axios.get(`${seeds[0]}/metavault/${symbol}/chart`);

      const res = req.data;

      const DATA = Object.entries(res).map(([timestamp, obj]) => ({
        ...obj,
        timestamp,
      }));

      const workedData = DATA.map(formatData);

      if (!workedData.length) {
        setIsData(false);
        return;
      }
      setChartData(workedData);
    } catch (err) {
      console.log("Chart data error:", err);
    }
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
    <div className="flex flex-col gap-4 mt-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-[24px] leading-8 hidden md:block">
          Historical Rate
        </span>
        <div className="flex items-center justify-between md:justify-end">
          <span className="font-semibold text-[18px] leading-6 block md:hidden">
            Historical Rate
          </span>
        </div>
        <div className="bg-[#18191C] rounded-lg text-[14px] leading-5 font-medium flex items-center border border-[#232429]">
          <span
            className={cn(
              "px-4 h-10 text-center rounded-lg flex items-center justify-center",
              activeChart.name !== "APR"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => chartHandler("APR")}
          >
            Native APR
          </span>
          <span
            className={cn(
              "px-4 h-10 text-center rounded-lg flex items-center justify-center",
              activeChart.name !== "TVL"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => chartHandler("TVL")}
          >
            TVL
          </span>
          <span
            className={cn(
              "px-4 h-10 text-center rounded-lg flex items-center justify-center",
              activeChart.name !== "sharePrice"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => chartHandler("sharePrice")}
          >
            {symbol} Price
          </span>
        </div>
      </div>

      <div className="bg-[#101012] rounded-xl border border-[#23252A] min-h-[150px] md:min-h-full max-h-[350px]">
        {isData ? (
          <div
            className={cn(
              "pr-6 py-6",
              ["TVL", "sharePrice"].includes(activeChart.name) && "pl-6"
            )}
          >
            {activeChart.name !== "" ? (
              <>
                {activeChart?.name === "APR" ? (
                  <ChartBar chart={activeChart} />
                ) : (
                  <LineChart chart={activeChart} />
                )}
              </>
            ) : (
              <ChartSkeleton />
            )}
          </div>
        ) : (
          <div className="h-[320px] flex items-center justify-center">
            <HeadingText text="No available data" scale={2} />
          </div>
        )}
      </div>

      {!!activeChart.name && (
        <ChartTimelineSwitcher timeline={timeline} onChange={timelineHandler} />
      )}
    </div>
  );
};

export { Chart };
