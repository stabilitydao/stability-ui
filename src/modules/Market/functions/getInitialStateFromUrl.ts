import { MarketSectionTypes } from "@types";

export const getInitialStateFromUrl = (): {
  asset: string;
  section: MarketSectionTypes;
} => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  const assetUrl = params.get("asset") as string;
  const sectionUrl = params.get("section");

  const validSections = [
    MarketSectionTypes.Withdraw,
    MarketSectionTypes.Borrow,
    MarketSectionTypes.Repay,
    // MarketSectionTypes.Leverage,
    MarketSectionTypes.Information,
    MarketSectionTypes.Users,
  ];

  const section = validSections.includes(sectionUrl as MarketSectionTypes)
    ? (sectionUrl as MarketSectionTypes)
    : MarketSectionTypes.Supply;

  return { asset: assetUrl, section };
};
