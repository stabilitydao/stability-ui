import { formatUnits } from "viem/utils";

export const formatFromBigInt = (
  value: number | string | bigint,
  decimals: number,
  type: string = ""
): number => {
  let formatedValue;

  switch (type) {
    case "withDecimals":
      formatedValue =
        Math.floor(+formatUnits(BigInt(value), decimals) * 100000) / 100000;
      break;
    case "withFloor":
      formatedValue = Math.floor(+formatUnits(BigInt(value), decimals));
      break;
    default:
      formatedValue = +formatUnits(BigInt(value), decimals);
      break;
  }
  return formatedValue;
};
