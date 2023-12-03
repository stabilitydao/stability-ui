import tokenlist from "../../stability.tokenlist.json";
import { PROFIT } from "../../constants/tokens";

export const profitToken = tokenlist.tokens.find(
  token => token.address === PROFIT[0]
);
