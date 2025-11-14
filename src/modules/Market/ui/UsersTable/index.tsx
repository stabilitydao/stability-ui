import { AddressCell } from "./AddressCell";

import { LoadTable, EmptyTable } from "@ui";

import { formatNumber, cn } from "@utils";

import { TMarketUser } from "@types";

type TProps = {
  isLoading: boolean;
  data: TMarketUser[];
};

const UsersTable: React.FC<TProps> = ({ isLoading, data }) => {
  if (isLoading) {
    return <LoadTable />;
  }

  return (
    <div>
      {data.length ? (
        <div>
          {data.map((user: TMarketUser) => (
            <div
              key={user?.address}
              className="border border-[#23252A] border-b-0 text-center bg-[#101012] h-[56px] font-medium relative flex items-center text-[12px] md:text-[16px] leading-5"
            >
              <AddressCell address={user?.address} />
              <div className="px-2 md:px-4 w-1/4 text-end">
                {user?.collateral
                  ? formatNumber(user?.collateral, "abbreviate")?.slice(1)
                  : ""}
              </div>
              <div className="px-2 md:px-4 w-1/4 text-end">
                {user?.debt
                  ? formatNumber(user?.debt, "abbreviate")?.slice(1)
                  : ""}
              </div>
              <div
                className={cn("px-2 md:px-4 w-1/4 text-end", user?.LTVColor)}
              >
                {user?.LTV ? `${(user?.LTV * 100).toFixed(2)}%` : ""}
              </div>
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
