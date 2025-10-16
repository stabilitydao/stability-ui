import { formatNumber } from "@utils";

export const convertToUSD = (value: string | number): string => {
  value = Number(value);
  if (!value) {
    return "";
  }

  if (value < 1) {
    return `$${formatNumber(value, "smallNumbers")}`;
  }

  return formatNumber(value, "abbreviate");
};
