import { PROTOCOLS } from "@constants";

/**
 * Returns logo URL for a given strategy based on its short name
 *
 * @example
 * ```
 * const logoUrl = getProtocolLogo("DQMF");
 * ```
 *
 * @param {string} strategyShortName - The short name of the strategy (e.g., "DQMF", "IQMF")
 *
 * @returns {string} The URL of logo image for protocol associated with the strategy
 */

export const getProtocolLogo = (strategyShortName: string): string => {
  let protocolLogo = "";

  switch (strategyShortName) {
    case "DQMF":
      protocolLogo = PROTOCOLS.defiedge.logoSrc;
      break;
    case "IQMF":
      protocolLogo = PROTOCOLS.ichi.logoSrc;
      break;
    case "IRMF":
      protocolLogo = PROTOCOLS.ichi.logoSrc;
      break;
    case "CCF":
      protocolLogo = PROTOCOLS.curve.logoSrc;
      break;
    case "Y":
      protocolLogo = PROTOCOLS.yearn.logoSrc;
      break;
    default:
      protocolLogo = PROTOCOLS.gamma.logoSrc;
      break;
  }
  return protocolLogo;
};
