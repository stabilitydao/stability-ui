import { formatData } from "./formatData";

import { TIMESTAMPS_IN_SECONDS } from "@constants";

import { TActiveChart, TChartData, TChartNames } from "@types";

type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

export const buildChartData = (
  chartData: TChartData[],
  options: {
    name: TChartNames;
    valueKey: TChartNames;
    segment: TSegment;
    NOW: number;
    TIME: number;
    LAST_TIMESTAMP: number;
  }
): TActiveChart => {
  const { name, valueKey, segment, NOW, TIME, LAST_TIMESTAMP } = options;

  let arr = chartData.filter(
    (obj) => obj[valueKey] && obj?.unixTimestamp >= NOW - TIME
  );

  let newData: TChartData[] = [];
  let time = arr[0]?.unixTimestamp;

  const step =
    name === "APR"
      ? segment === "WEEK"
        ? 3600
        : segment === "MONTH"
          ? 7200
          : 14400
      : 3600;

  do {
    let candidates =
      name === "APR"
        ? arr.filter((obj) => obj?.unixTimestamp >= time)
        : arr.filter((obj) => obj?.unixTimestamp < time);

    let el =
      name === "APR"
        ? candidates[0] || arr[arr?.length - 1]
        : candidates[candidates?.length - 1] || arr[0];

    newData.push({ ...el, timestamp: time });
    time += step;

    if (time >= LAST_TIMESTAMP) {
      newData.push({
        ...arr[arr?.length - 1],
        timestamp: arr?.[arr?.length - 1]?.unixTimestamp,
      });
    }
  } while (time < LAST_TIMESTAMP);

  arr = newData.map(formatData);

  const widthPercent =
    (arr[arr?.length - 1]?.unixTimestamp - arr[0]?.unixTimestamp) / 500;

  let sum = 0;

  const differences = arr.map((entry, index) => {
    if (index === 0) return 0;
    const prevEntry = arr?.[index - 1];
    const diff = entry?.unixTimestamp - prevEntry?.unixTimestamp;
    sum += diff;
    return Math.floor(sum / widthPercent);
  });

  const result = arr.map((obj, index) => ({
    unixTimestamp: obj?.unixTimestamp,
    timestamp: obj?.timestamp,
    date: obj?.date,
    [name]: Number(obj[valueKey]),
    x: differences[index],
    y: Number(obj[valueKey]),
  }));

  return { name, data: result };
};
