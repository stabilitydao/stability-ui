import { useStore } from "@nanostores/react";

import { AddressCell } from "./AddressCell";

import { LoadTable, EmptyTable } from "@ui";

import { account } from "@store";

import { convertToUSD } from "../../functions/convertToUSD";

import { TLiquidation } from "@types";

type TProps = {
  isLoading: boolean;
  data: TLiquidation[];
};

const LiquidationTable: React.FC<TProps> = ({ isLoading, data }) => {
  const $account = useStore(account);

  if (isLoading) {
    return <LoadTable />;
  }

  return (
    <div className="w-[750px] md:w-full">
      {data.length ? (
        <div>
          {data.map((liquidation, index) => (
            <div
              key={`${liquidation?.user}-${index}`}
              className="border border-[#23252A] border-b-0 text-center bg-[#101012] h-[56px] font-medium relative flex items-center text-[12px] md:text-[16px] leading-5"
            >
              <AddressCell
                address={liquidation?.user}
                title={liquidation?.user}
                highlighted={
                  $account?.toLowerCase() === liquidation?.user?.toLowerCase()
                }
                isSticky={true}
              />
              <AddressCell
                address={liquidation?.liquidator}
                title={liquidation?.liquidator}
              />
              <div className="px-2 md:px-4 w-[150px] md:w-1/5 text-end">
                {convertToUSD(liquidation?.liquidated)}
              </div>
              <div className="px-2 md:px-4 w-[150px] md:w-1/5 text-end">
                {convertToUSD(liquidation?.debt)}
              </div>
              <div className="px-2 md:px-4 w-[150px] md:w-1/5 text-end whitespace-nowrap">
                {liquidation?.date}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyTable text="No liquidations yet" description="" />
      )}
    </div>
  );
};

export { LiquidationTable };
