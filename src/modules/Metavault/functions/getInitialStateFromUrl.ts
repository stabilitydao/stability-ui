import { MetaVaultDisplayTypes, MetaVaultSectionTypes } from "@types";

export const getInitialStateFromUrl = (): {
  display: MetaVaultDisplayTypes;
  section: MetaVaultSectionTypes;
  sortType: string;
} => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  const displayUrl = params.get("display");
  const sectionUrl = params.get("section");
  const sortUrl = params.get("sort");

  const display =
    displayUrl === MetaVaultDisplayTypes.Pro
      ? MetaVaultDisplayTypes.Pro
      : MetaVaultDisplayTypes.Lite;

  const validSections = [
    MetaVaultSectionTypes.Operations,
    MetaVaultSectionTypes.Allocations,
    MetaVaultSectionTypes.Charts,
    MetaVaultSectionTypes.Users,
  ];

  const section = validSections.includes(sectionUrl as MetaVaultSectionTypes)
    ? (sectionUrl as MetaVaultSectionTypes)
    : MetaVaultSectionTypes.Allocations;

  const sortType = sortUrl ? sortUrl : "";

  return { display, section, sortType };
};
