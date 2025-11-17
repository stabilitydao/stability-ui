import { DAOSectionTypes } from "@types";

export const getInitialStateFromUrl = (): {
  section: DAOSectionTypes;
} => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  const sectionUrl = params.get("section");

  const validSections = [
    DAOSectionTypes.Governance,
    DAOSectionTypes.InterChain,
    DAOSectionTypes.Tokenomics,
    DAOSectionTypes.Holders,
  ];

  const section = validSections.includes(sectionUrl as DAOSectionTypes)
    ? (sectionUrl as DAOSectionTypes)
    : DAOSectionTypes.Governance;

  return { section };
};
