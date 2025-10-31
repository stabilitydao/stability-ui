import { MarketSectionTypes } from "@types";

export const getInitialStateFromUrl = (): {
  asset: string;
  section: MarketSectionTypes;
  sortType: string;
} => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  const assetUrl = params.get("asset") as string;
  const sectionUrl = params.get("section");
  const sortUrl = params.get("sort");

  const validSections = [
    MarketSectionTypes.Withdraw,
    MarketSectionTypes.Borrow,
    MarketSectionTypes.Repay,
    // MarketSectionTypes.Leverage,
    MarketSectionTypes.Information,
    MarketSectionTypes.Users,
    MarketSectionTypes.Liquidations,
  ];

  const section = validSections.includes(sectionUrl as MarketSectionTypes)
    ? (sectionUrl as MarketSectionTypes)
    : MarketSectionTypes.Supply;

  const sortType = sortUrl ? sortUrl : "";

  return { asset: assetUrl, section, sortType };
};
