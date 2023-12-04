import tokenlist from "../../stability.tokenlist.json";
import { SDIV } from "../../constants/tokens";

export const getSdivToken = tokenlist.tokens.find(
  token => token.address === SDIV[0]
);
