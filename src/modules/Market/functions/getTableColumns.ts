import { MARKET_USERS_TABLE } from "@constants";

import { MarketTypes, TTableColumn } from "@types";

export const getTableColumns = (marketType: MarketTypes): TTableColumn[] => {
  if ([MarketTypes.NonIsolated, MarketTypes.Stable].includes(marketType)) {
    return MARKET_USERS_TABLE.filter(
      (column) => column.key !== "liquidationPrice"
    );
  }

  // @dev default(isolated)
  return MARKET_USERS_TABLE;
};
