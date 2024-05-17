import { memo, useState, useEffect } from "react";

import axios from "axios";

import { Chart } from "./Chart";

import { ChartSkeleton } from "@components";

import { GRAPH_ENDPOINT, MONTHS, TIMESTAMPS_IN_SECONDS } from "@constants";

import type { TAddress, TChartData, TAsset } from "@types";

interface IProps {
  address: TAddress;
  assets: TAsset[];
}

type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

const HoldChart: React.FC<IProps> = memo(({ address, assets }) => {
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
  const [activeLines, setActiveLines] = useState([]);

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
                where: {address: "${address}",vsHoldAPR_not: null, tokensVsHoldAPR_not: null}
                skip: ${entities}
            ) {
                address
                tokensVsHoldAPR
                vsHoldAPR
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

    let vsHoldChartData = workedData
      .filter(
        (obj) => Number(obj.unixTimestamp) >= NOW - TIMESTAMPS_IN_SECONDS.WEEK
      )
      .map((obj) => ({
        unixTimestamp: obj.unixTimestamp,
        timestamp: obj.timestamp,
        date: obj.date,
        vsHoldAPR: [
          { symbol: "Vault", apr: obj.vsHoldAPR },
          ...assets.map((asset, index) => ({
            symbol: asset.symbol,
            apr: obj.tokensVsHoldAPR[index],
          })),
        ],
      }));

    if (!vsHoldChartData.length) {
      setIsData(false);
      return;
    }
    const lastTimestamp =
      vsHoldChartData[vsHoldChartData.length - 1].unixTimestamp;

    time = Number(vsHoldChartData[0].unixTimestamp);

    do {
      let sortedAPRs = vsHoldChartData.filter(
        (obj: any) => Number(obj.unixTimestamp) >= time
      );

      let firstEl =
        sortedAPRs[0] || vsHoldChartData[vsHoldChartData.length - 1];

      newData.push({ ...firstEl, timestamp: time });
      time += 3600;
      if (time >= lastTimestamp) {
        newData.push({
          ...vsHoldChartData[vsHoldChartData.length - 1],
          timestamp: vsHoldChartData[vsHoldChartData.length - 1].unixTimestamp,
        });
      }
    } while (time < lastTimestamp);

    vsHoldChartData = newData.map(formatData);

    const lines = vsHoldChartData[0].vsHoldAPR.map((vsAPR) => ({
      symbol: vsAPR.symbol,
      state: true,
    }));

    setActiveLines(lines);
    setChartData(workedData);
    setActiveChart(vsHoldChartData);
  };

  const chartHandler = (segment: TSegment = timeline) => {
    const NOW = Math.floor(Date.now() / 1000);
    const TIME: any = TIMESTAMPS_IN_SECONDS[segment];

    let time = 0,
      newData;

    const lastTimestamp = chartData[chartData.length - 1].unixTimestamp;

    let vsHoldArr = chartData.filter(
      (obj: TChartData) => Number(obj.unixTimestamp) >= NOW - TIME
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

    let vsHoldChartData = vsHoldArr.map((obj) => ({
      unixTimestamp: obj.unixTimestamp,
      timestamp: obj.timestamp,
      date: obj.date,
      vsHoldAPR: [
        { symbol: "Vault", apr: obj.vsHoldAPR },
        ...assets.map((asset, index) => ({
          symbol: asset.symbol,
          apr: obj.tokensVsHoldAPR[index],
        })),
      ],
    }));

    setActiveChart(vsHoldChartData);
  };

  const timelineHandler = (segment: TSegment) => {
    const TIME: any = TIMESTAMPS_IN_SECONDS[segment];
    if (TIME === timeline) return;
    setTimeline(segment);
    chartHandler(segment);
  };

  const handleActiveLine = (lineIndex) => {
    const newActiveLines = activeLines.map((line, index) => {
      if (index === lineIndex) {
        return { ...line, state: !line.state };
      }

      return line;
    });

    setActiveLines(newActiveLines);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="rounded-md mt-5">
      {isData ? (
        <>
          <div className="py-3 px-4">
            {activeChart ? (
              <Chart chart={activeChart} activeLines={activeLines} />
            ) : (
              <ChartSkeleton />
            )}
          </div>
          {activeChart && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 pb-1 sm:pb-3">
                {activeLines.length &&
                  activeLines.map((line, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center"
                    >
                      <input
                        checked={line.state}
                        onChange={() => handleActiveLine(index)}
                        id={`checked-checkbox-${index}`}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor={`checked-checkbox-${index}`}
                        className="ms-2 text-sm font-medium"
                      >
                        {line.symbol}
                      </label>
                    </div>
                  ))}
              </div>
              <div className="px-4 flex items-center justify-end text-[16px] pb-1 sm:pb-3">
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
});

export { HoldChart };
