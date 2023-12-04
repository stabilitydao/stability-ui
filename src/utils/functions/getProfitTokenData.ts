import tokenlist from "../../stability.tokenlist.json";
import { PROFIT } from "../../constants/tokens";

export const getProfitToken = tokenlist.tokens.find(
  token => token.address === PROFIT[0]
);
