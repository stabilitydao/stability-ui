import { AddressCell } from "./AddressCell";

import { LoadTable, EmptyTable } from "@ui";

import { formatNumber, cn } from "@utils";

import { formatHealthFactor } from "../../functions";

import { USERS_TABLE_WIDTH } from "../../constants";

import { MarketTypes, TMarketUser, TTableColumn } from "@types";

type TProps = {
  isLoading: boolean;
  data: TMarketUser[];
  marketType: MarketTypes;
  columns: TTableColumn[];
};

const widthMap: Record<MarketTypes, Record<string, string>> = {
  [MarketTypes.Isolated]: {
    Collateral: "w-[100px] md:w-[16%]",
    Debt: "w-[100px] md:w-[16%]",
    "Health Factor": "w-[150px] md:w-[16%]",
    "Liquidation Price": "w-[150px] md:w-[16%]",
    LTV: "w-[100px] md:w-[16%]",
  },

  [MarketTypes.NonIsolated]: {
    Collateral: "w-[100px] md:w-1/5",
    Debt: "w-[100px] md:w-1/5",
    "Health Factor": "w-[150px] md:w-1/5",
    LTV: "w-[100px] md:w-1/5",
  },

  [MarketTypes.Stable]: {
    Collateral: "w-[100px] md:w-1/5",
    Debt: "w-[100px] md:w-1/5",
    "Health Factor": "w-[150px] md:w-1/5",
    LTV: "w-[100px] md:w-1/5",
  },
};

const UsersTable: React.FC<TProps> = ({
  isLoading,
  data,
  marketType,
  columns,
}) => {
  if (isLoading) {
    return <LoadTable />;
  }

  const renderCell = (user: TMarketUser, column: string) => {
    switch (column) {
      case "Collateral":
        return user.collateral
          ? formatNumber(user.collateral, "abbreviate")?.slice(1)
          : "";

      case "Debt":
        return user.debt ? formatNumber(user.debt, "abbreviate")?.slice(1) : "";

      case "Health Factor":
        return user.healthFactor ? formatHealthFactor(user.healthFactor) : "";

      case "Liquidation Price":
        return user.liquidationPrice
          ? formatNumber(user.liquidationPrice, "format")
          : "";

      case "LTV":
        return user.LTV ? `${user.LTV.toFixed(2)}%` : "";

      default:
        return null;
    }
  };

  const columnsWithoutUser = columns.slice(1);

  return (
    <div className={cn("md:min-w-full", USERS_TABLE_WIDTH[marketType])}>
      {data.length ? (
        <div>
          {data.map((user) => (
            <div
              key={user.address}
              className="border border-[#23252A] border-b-0 text-center bg-[#101012] h-[56px] font-medium relative flex items-center text-[12px] md:text-[16px]"
            >
              <AddressCell address={user.address} />
              {columnsWithoutUser.map((col) => (
                <div
                  key={col.name + user.address}
                  className={cn(
                    "px-2 md:px-4 text-end",
                    widthMap[marketType]?.[col.name],
                    col.name === "LTV" && user.LTVColor,
                    col.name === "Health Factor" && user.healthFactorColor
                  )}
                >
                  {renderCell(user, col.name)}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <EmptyTable text="No users yet" description="" />
      )}
    </div>
  );
};

export { UsersTable };
