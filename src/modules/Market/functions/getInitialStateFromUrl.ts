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
    MarketSectionTypes.Borrow,
    MarketSectionTypes.Leverage,
    MarketSectionTypes.Information,
    MarketSectionTypes.Users,
  ];

  const section = validSections.includes(sectionUrl as MarketSectionTypes)
    ? (sectionUrl as MarketSectionTypes)
    : MarketSectionTypes.Deposit;

  return { asset: assetUrl, section };
};
