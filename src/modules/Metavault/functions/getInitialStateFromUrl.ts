import { MetaVaultDisplayTypes, MetaVaultSectionTypes } from "@types";

export const getInitialStateFromUrl = (): {
  display: MetaVaultDisplayTypes;
  section: MetaVaultSectionTypes;
} => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  const displayUrl = params.get("display");
  const sectionUrl = params.get("section");

  const display =
    displayUrl === MetaVaultDisplayTypes.Pro
      ? MetaVaultDisplayTypes.Pro
      : MetaVaultDisplayTypes.Lite;

  const validSections = [
    MetaVaultSectionTypes.Operations,
    MetaVaultSectionTypes.Allocations,
    MetaVaultSectionTypes.Charts,
  ];

  const section = validSections.includes(sectionUrl as MetaVaultSectionTypes)
    ? (sectionUrl as MetaVaultSectionTypes)
    : MetaVaultSectionTypes.Operations;

  return { display, section };
};
