import { MarketSectionTypes, MarketTypes } from "@types";

const TOOLTIP_DESCRIPTIONS = {
  isolatedRisk:
    "Stability markets are isolated (isolated risk). An exploit, misconfiguration, or the inability to liquidate in one market doesn’t impact other markets. This level of security is impossible in multi-token pools, where lenders are exposed to the risk of all token assets (shared risk).",
  utilization:
    "Utilization measures borrowing demand for an asset and is calculated as follows: Total borrowed divided by total deposited.",
  assetTVL: "Value of tokens deposited in the market.",
  assetTVLInUSD: "The total dollar value of tokens deposited in the market.",
  maxLTV: "The maximum amount you can borrow against your collateral.",
  liquidationThreshold:
    "The Liquidation Threshold (LT) is where your loan becomes under-collateralized, and consequently, part of your collateral becomes liquidatable.",
  reserveFactor:
    "Percentage of interest paid by borrowers that is redirected to the protocol’s reserves instead of being distributed to lenders.",
  liquidationBonus:
    "The bonus received by liquidators to incentivise the purchase of specific collateral that has a health factor below 1",
  oracle: "Providing market price and cryptocurrency data",
  tokenCap: "Current value based on the circulating supply",
};

const MARKET_SECTIONS = Object.values(MarketSectionTypes);

const RISK_TEXT_COLORS = {
  white: "text-[#ffffff]",
  green: "text-[#48C05C]",
  yellow: "text-[#FFBC00]",
  orange: "text-warning-600",
  red: "text-error-400",
};

const USERS_TABLE_WIDTH = {
  [MarketTypes.Isolated]: "min-w-[600px]", // -150 liq.price
  [MarketTypes.NonIsolated]: "min-w-[500px]", // -150 liq.price
  [MarketTypes.Stable]: "min-w-[600px]",
};

export {
  MARKET_SECTIONS,
  TOOLTIP_DESCRIPTIONS,
  RISK_TEXT_COLORS,
  USERS_TABLE_WIDTH,
};
