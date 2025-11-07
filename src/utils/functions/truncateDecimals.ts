export const truncateDecimals = (
  value: number | string,
  decimals: number
): string => {
  value = Number(value);

  const factor = 10 ** decimals;

  const truncated = Math.floor(value * factor) / factor;

  const valueStr = value.toString();
  const parts = valueStr.split(".");
  if (!parts[1] || parts[1].length <= decimals) {
    return valueStr;
  }

  return truncated.toString();
};
