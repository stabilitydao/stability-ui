import { RISK_TEXT_COLORS } from "../constants";

import { MarketTypes } from "@types";

export const getHFTextColor = (HF: number, marketType: MarketTypes): string => {
  if (marketType === MarketTypes.Stable) {
    if (HF <= 1.02) {
      return RISK_TEXT_COLORS.red;
    } else if (HF <= 1.05) {
      return RISK_TEXT_COLORS.orange;
    } else if (HF <= 1.5) {
      return RISK_TEXT_COLORS.yellow;
    }
    return RISK_TEXT_COLORS.green;
  }

  if (HF <= 1.1) {
    return RISK_TEXT_COLORS.red;
  } else if (HF <= 1.3) {
    return RISK_TEXT_COLORS.orange;
  } else if (HF < 1.9) {
    return RISK_TEXT_COLORS.yellow;
  }

  return RISK_TEXT_COLORS.green;
};
