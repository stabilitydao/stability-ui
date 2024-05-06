import { PROTOCOLS } from "@constants";

export const getProtocolLogo = (strategyShortName: string) => {
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
