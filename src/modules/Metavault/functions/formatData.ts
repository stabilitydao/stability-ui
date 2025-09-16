import { MONTHS } from "@constants";

interface IRawChartData {
  timestamp: number | string;
  apr?: number;
  tvl?: number;
  sharePrice?: number;
}

interface IFormattedChartData extends IRawChartData {
  unixTimestamp: number;
  timestamp: string;
  date: string;
}

export const formatData = (obj: IRawChartData): IFormattedChartData => {
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
