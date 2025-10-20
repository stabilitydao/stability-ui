import { AddressField } from "./AddressField";

import { CustomTooltip } from "@ui";

import { getTokenData, cn, formatNumber } from "@utils";

import { TOOLTIP_DESCRIPTIONS } from "../constants";

import type { TMarketReserve, TAddress, TNetwork } from "@types";

import { assets } from "@stabilitydao/stability";

type TProps = {
  asset: TMarketReserve;
  isSingleAsset?: boolean;
  network: TNetwork | undefined;
};

const AssetInfo: React.FC<TProps> = ({
  asset,
  isSingleAsset = false,
  network,
}) => {
  const assetData = getTokenData(asset?.address as TAddress);

  const mintApp = assets.find(
    ({ symbol }) => symbol === assetData?.symbol
  )?.mintApp;

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isSingleAsset ? "w-full" : "w-full lg:w-1/2"
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-3 text-[24px] leading-8 font-medium">
        <span>{assetData?.symbol}</span>
        <span className="text-[#7C7E81]">{assetData?.name}</span>
      </div>
      <div className="flex flex-col gap-4">
        <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-center gap-4 md:gap-6 w-full font-medium">
          <div className="w-1/2 flex flex-col items-start">
            <span className="text-[#7C7E81] text-[14px] leading-5">
              Supply APR
            </span>
            <span className="text-[32px] leading-10">
              {Number(asset?.supplyAPR).toFixed(2)}%
            </span>
          </div>
          {asset?.isBorrowable && (
            <div className="w-1/2 flex flex-col items-start">
              <span className="text-[#7C7E81] text-[14px] leading-5">
                Borrow APR
              </span>
              <span className="text-[32px] leading-10">
                {Number(asset?.borrowAPR).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex items-start flex-col gap-2 w-full font-medium">
          <div className="w-full flex flex-col items-start gap-2">
            {asset?.isBorrowable && (
              <div className="flex items-center justify-between text-[16px] leading-6 w-full gap-2">
                <CustomTooltip
                  name="Utilization"
                  description={TOOLTIP_DESCRIPTIONS.utilization}
                />
                <span
                  className={cn(
                    "font-semibold",
                    Number(asset?.utilization) === 100 && "text-[#DE4343]"
                  )}
                >
                  {Number(asset?.utilization).toFixed(2)}%
                </span>
              </div>
            )}
            {/* <div className="flex items-center justify-between text-[16px] leading-6 w-full gap-2">
              <CustomTooltip name="IRM" description="desc" />
              <span className="font-semibold">Dynamic IRM</span>
            </div> */}
            {asset?.isBorrowable && (
              <div className="flex items-start justify-between text-[16px] leading-6 w-full gap-2">
                <span className="font-medium text-[16px] leading-6 text-[#7C7E81]">
                  Available to borrow
                </span>
                <div className="flex flex-col items-end">
                  <span className="font-semibold">
                    {formatNumber(
                      asset?.availableToBorrow,
                      "abbreviate"
                    )?.slice(1)}
                  </span>
                  <span className="text-[#7C7E81] text-[14px] leading-5 font-medium">
                    {formatNumber(asset?.availableToBorrowInUSD, "abbreviate")}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-start justify-between text-[16px] leading-6 w-full gap-2">
              <CustomTooltip
                name={`${assetData?.symbol} TVL`}
                description={TOOLTIP_DESCRIPTIONS.assetTVL}
              />
              <span className="font-semibold">
                {formatNumber(asset?.supplyTVL, "abbreviate")?.slice(1)}{" "}
              </span>
            </div>
            <div className="flex items-start justify-between text-[16px] leading-6 w-full gap-2">
              <CustomTooltip
                name={`${assetData?.symbol} TVL, USD`}
                description={TOOLTIP_DESCRIPTIONS.assetTVLInUSD}
              />
              <span className="font-semibold">
                {formatNumber(asset?.supplyTVLInUSD, "abbreviate")}
              </span>
            </div>
            {!!Number(asset?.cap) && (
              <div className="flex items-start justify-between text-[16px] leading-6 w-full gap-2">
                <CustomTooltip
                  name={`${assetData?.symbol} Cap`}
                  description="desc"
                />
                <span className="font-semibold">
                  {formatNumber(asset?.cap, "abbreviate")?.slice(1)}{" "}
                </span>
              </div>
            )}
          </div>
          <div className="w-full flex flex-col items-start gap-2">
            <div className="flex items-center justify-between text-[16px] leading-6 w-full gap-2">
              <CustomTooltip name="Oracle" description="desc" />
              <span className="font-semibold truncated-text text-end">
                {asset?.oracleName}
              </span>
            </div>
            {!!Number(asset?.maxLtv) && (
              <div className="flex items-center justify-between text-[16px] leading-6 w-full gap-2">
                <CustomTooltip
                  name="Max LTV"
                  description={TOOLTIP_DESCRIPTIONS.maxLTV}
                />
                <span className="font-semibold">{asset?.maxLtv}%</span>
              </div>
            )}

            {!!Number(asset?.liquidationThreshold) && (
              <div className="flex items-center justify-between text-[16px] leading-6 w-full gap-2">
                <CustomTooltip
                  name="Liquidation threshold"
                  description={TOOLTIP_DESCRIPTIONS.liquidationThreshold}
                />
                <span className="font-semibold">
                  {asset?.liquidationThreshold}%
                </span>
              </div>
            )}

            {!!Number(asset?.liquidationBonus) && (
              <div className="flex items-center justify-between text-[16px] leading-6 w-full gap-2">
                <CustomTooltip name="Liquidation bonus" description="desc" />
                <span className="font-semibold">
                  {asset?.liquidationBonus}%
                </span>
              </div>
            )}
            {asset?.isBorrowable && (
              <div className="flex items-center justify-between text-[16px] leading-6 w-full gap-2">
                <CustomTooltip name="Reserve factor" description="desc" />
                <span className="font-semibold">{asset?.reserveFactor}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col items-start gap-2 w-full font-medium text-[16px] leading-6">
          <AddressField
            symbol={assetData?.symbol as string}
            address={assetData?.address as TAddress}
            explorer={network?.explorer ?? ""}
          />

          <AddressField
            symbol={asset?.aTokenSymbol as string}
            address={asset?.aToken as TAddress}
            explorer={network?.explorer ?? ""}
          />

          {mintApp && (
            <div className="flex items-center justify-between w-full">
              <span className="text-[#7C7E81]">Mint</span>
              <div className="flex items-center gap-3">
                <span className="text-[#9180F4]">{assetData?.symbol}</span>

                <a href={mintApp} target="_blank">
                  <img
                    src="/icons/purple_link.png"
                    alt="external link"
                    className="w-3 h-3 cursor-pointer"
                  />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { AssetInfo };
