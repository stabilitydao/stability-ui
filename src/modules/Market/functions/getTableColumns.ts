import { MARKET_USERS_TABLE } from "@constants";

import { MarketTypes, TTableColumn } from "@types";

export const getTableColumns = (marketType: MarketTypes): TTableColumn[] => {
  if (marketType === MarketTypes.NonIsolated) {
    return MARKET_USERS_TABLE.filter((column) => column.key !== "LTV");
  }

  if (marketType === MarketTypes.Stable) {
    return MARKET_USERS_TABLE.filter(
      (column) => column.key !== "liquidationPrice"
    );
  }

  // @dev default(isolated)
  return MARKET_USERS_TABLE;
};
