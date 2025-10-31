import { formatNumber } from "@utils";

export const convertToUSD = (value: string | number): string => {
  value = Number(value);

  if (!value) {
    return "";
  }

  if (value > 1000000000000) {
    return "$1T+";
  }

  if (value < 1) {
    return `$${formatNumber(value, "smallNumbers")}`;
  }

  return formatNumber(value, "abbreviate");
};
