import { RISK_TEXT_COLORS } from "../constants";

export const getLTVTextColor = (
  LTV: number,
  maxLTV: number,
  LT: number
): string => {
  const redThreshold = (maxLTV + LT) / 2;

  if (LTV <= maxLTV / 2) {
    return RISK_TEXT_COLORS.green;
  }

  if (LTV <= maxLTV) {
    return RISK_TEXT_COLORS.yellow;
  }

  if (LTV <= redThreshold) {
    return RISK_TEXT_COLORS.orange;
  }

  return RISK_TEXT_COLORS.red;
};
