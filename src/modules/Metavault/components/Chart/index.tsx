import { useState, useEffect } from "react";

import axios from "axios";

import { HeadingText, ChartTimelineSwitcher } from "@ui";

import { ChartCard } from "./ChartCard";

import { ChartTypeHandler } from "./ChartTypeHandler";

import { formatData } from "../../functions/formatData";
import { buildChartData } from "../../functions/buildChartData";

import { TIMESTAMPS_IN_SECONDS } from "@constants";

import { seeds } from "@stabilitydao/stability";

import {
  TActiveChart,
  TimelineTypes,
  TChartData,
  MetaVaultDisplayTypes,
  TChartNames,
} from "@types";

type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

const Chart = ({
  symbol,
  display,
}: {
  symbol: string;
  display: MetaVaultDisplayTypes;
}): JSX.Element => {
  const [isData, setIsData] = useState(true);
  const [chartData, setChartData] = useState<TChartData[]>([]);

  const [timeline, setTimeline] = useState<TSegment>(
    TimelineTypes.Week as TSegment
  );

  const [activeChart, setActiveChart] = useState<TActiveChart>({
    name: "",
    data: [],
  });

  const [allCharts, setAllCharts] = useState<TActiveChart[]>([
    { name: "APR", data: [] },
    { name: "TVL", data: [] },
    { name: "sharePrice", data: [] },
  ]);

  const getChartTitle = (name: string, symbol: string) => {
    switch (name) {
      case "APR":
        return "Native APR";
      case "sharePrice":
        return `${symbol === "metaUSD" ? "wmetaUSD" : symbol} Price`;
      case "TVL":
        return "TVL";
      default:
        return name;
    }
  };

  const buildMultipleCharts = (
    chartData: TChartData[],
    configs: { name: string; valueKey: TChartNames }[],
    options: {
      segment: TSegment;
      NOW: number;
      TIME: number;
      LAST_TIMESTAMP: number;
    }
  ) => {
    return configs.map((cfg) =>
      buildChartData(chartData, {
        ...options,
        name: cfg.name,
        valueKey: cfg.valueKey,
      })
    );
  };

  const timelineHandler = (segment: TSegment) => {
    if (segment === timeline) return;
    setTimeline(segment);
    chartHandler(activeChart?.name || "", segment);
  };

  const chartHandler = (chartType: string, segment: TSegment = timeline) => {
    const NOW = Math.floor(Date.now() / 1000);
    const TIME: number = TIMESTAMPS_IN_SECONDS[segment];
    const LAST_TIMESTAMP = chartData[chartData.length - 1].unixTimestamp;

    if (display === MetaVaultDisplayTypes.Lite) {
      const singleChart = buildChartData(chartData, {
        name: chartType as TChartNames,
        valueKey:
          chartType === "APR"
            ? "apr"
            : chartType === "TVL"
              ? "tvl"
              : "sharePrice",
        segment,
        NOW,
        TIME,
        LAST_TIMESTAMP,
      });

      setActiveChart(singleChart);
    } else {
      const charts = buildMultipleCharts(
        chartData,
        [
          { name: "APR", valueKey: "apr" },
          { name: "TVL", valueKey: "tvl" },
          { name: "sharePrice", valueKey: "sharePrice" },
        ],
        { segment, NOW, TIME, LAST_TIMESTAMP }
      );

      setAllCharts(charts);
    }
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
      setChartData(workedData as TChartData[]);
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
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
        <span className="font-semibold text-[24px] leading-8 hidden md:block">
          Historical Rates
        </span>
        <div className="flex items-center justify-between md:justify-end">
          <span className="font-semibold text-[18px] leading-6 block md:hidden">
            Historical Rates
          </span>
        </div>
        <ChartTypeHandler
          display={display}
          chart={activeChart.name}
          metaVaultSymbol={symbol}
          handler={chartHandler}
        />

        <ChartTimelineSwitcher
          timeline={timeline}
          onChange={timelineHandler}
          isActive={!!allCharts.length && display === MetaVaultDisplayTypes.Pro}
        />
      </div>

      {isData ? (
        <div>
          {display === MetaVaultDisplayTypes.Lite ? (
            <ChartCard chart={activeChart} />
          ) : (
            <div className="flex flex-col gap-5">
              {allCharts.map((chartData) => (
                <div key={chartData.name} className="flex flex-col gap-2">
                  <span className="font-semibold text-[20px] leading-6">
                    {getChartTitle(chartData.name, symbol)}
                  </span>
                  <ChartCard chart={chartData} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#101012] rounded-xl border border-[#23252A] min-h-[150px] md:min-h-full max-h-[350px]">
          <div className="h-[320px] flex items-center justify-center">
            <HeadingText text="No available data" scale={2} />
          </div>
        </div>
      )}

      <ChartTimelineSwitcher
        timeline={timeline}
        onChange={timelineHandler}
        isActive={!!activeChart.name && display === MetaVaultDisplayTypes.Lite}
      />
    </div>
  );
};

export { Chart };
