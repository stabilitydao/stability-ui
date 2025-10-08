import { MarketSectionTypes } from "@types";

const TOOLTIP_DESCRIPTIONS = {
  isolatedRisk:
    "Stability markets are isolated (isolated risk). An exploit, misconfiguration, or the inability to liquidate in one market doesn’t impact other markets. This level of security is impossible in multi-token pools, where lenders are exposed to the risk of all token assets (shared risk).",
  utilization:
    "Utilization measures borrowing demand for an asset and is calculated as follows: Total borrowed divided by total deposited.",
  assetTVL: "Value of tokens deposited in the market.",
  maxLTV: "The maximum amount you can borrow against your collateral.",
  liquidationThreshold:
    "The Liquidation Threshold (LT) is where your loan becomes under-collateralized, and consequently, part of your collateral becomes liquidatable.",
};

const MARKET_SECTIONS = Object.values(MarketSectionTypes);

export { MARKET_SECTIONS, TOOLTIP_DESCRIPTIONS };
