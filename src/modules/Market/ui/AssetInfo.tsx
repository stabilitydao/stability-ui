import { AddressField } from "./AddressField";

import { CustomTooltip } from "@ui";

import { cn, formatNumber } from "@utils";

import { convertToUSD } from "../functions";

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
  const mintApp = assets.find(
    ({ symbol }) => symbol === asset?.assetData?.symbol
  )?.mintApp;

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isSingleAsset ? "w-full" : "w-full lg:w-1/2"
      )}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-3 text-[24px] leading-8 font-medium">
        <div className="flex items-center gap-2">
          <img
            src={asset?.assetData?.logoURI}
            alt={asset?.assetData?.symbol}
            title={asset?.assetData?.symbol}
            className="w-8 h-8 rounded-full hidden md:block"
          />
          <span>{asset?.assetData?.symbol}</span>
        </div>

        <span className="text-[#7C7E81]">{asset?.assetData?.name}</span>
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
              <span className="font-medium text-[16px] leading-6 text-[#7C7E81]">
                {asset?.assetData?.symbol} Price
              </span>
              <span className="font-semibold">
                {Number(asset?.price ?? 0) ? convertToUSD(asset?.price) : "-"}
              </span>
            </div>
            <div className="flex items-start justify-between text-[16px] leading-6 w-full gap-2">
              <CustomTooltip
                name={`${asset?.assetData?.symbol} TVL`}
                description={TOOLTIP_DESCRIPTIONS.assetTVL}
              />
              <span className="font-semibold">
                {formatNumber(asset?.supplyTVL, "abbreviate")?.slice(1)}{" "}
              </span>
            </div>
            <div className="flex items-start justify-between text-[16px] leading-6 w-full gap-2">
              <CustomTooltip
                name={`${asset?.assetData?.symbol} TVL, USD`}
                description={TOOLTIP_DESCRIPTIONS.assetTVLInUSD}
              />
              <span className="font-semibold">
                {formatNumber(asset?.supplyTVLInUSD, "abbreviate")}
              </span>
            </div>
            {!!Number(asset?.cap) && (
              <div className="flex items-start justify-between text-[16px] leading-6 w-full gap-2">
                <CustomTooltip
                  name={`${asset?.assetData?.symbol} Cap`}
                  description={TOOLTIP_DESCRIPTIONS.tokenCap}
                />
                <span className="font-semibold">
                  {formatNumber(asset?.cap, "abbreviate")?.slice(1)}{" "}
                </span>
              </div>
            )}
          </div>
          <div className="w-full flex flex-col items-start gap-2">
            <div className="flex items-center justify-between text-[16px] leading-6 w-full gap-2">
              <CustomTooltip
                name="Oracle"
                description={TOOLTIP_DESCRIPTIONS.oracle}
              />
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
                <CustomTooltip
                  name="Liquidation bonus"
                  description={TOOLTIP_DESCRIPTIONS.liquidationBonus}
                />
                <span className="font-semibold">
                  {asset?.liquidationBonus}%
                </span>
              </div>
            )}
            {asset?.isBorrowable && (
              <div className="flex items-center justify-between text-[16px] leading-6 w-full gap-2">
                <CustomTooltip
                  name="Reserve factor"
                  description={TOOLTIP_DESCRIPTIONS.reserveFactor}
                />
                <span className="font-semibold">{asset?.reserveFactor}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col items-start gap-2 w-full font-medium text-[16px] leading-6">
          <AddressField
            symbol={asset?.assetData?.symbol as string}
            address={asset?.assetData?.address as TAddress}
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
                <span className="text-[#9180F4]">
                  {asset?.assetData?.symbol}
                </span>

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
        {asset?.isBorrowable && (
          <div className="flex flex-col gap-3">
            <span className="text-[24px] leading-8 font-medium">IRM</span>
            <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col items-start gap-2 w-full font-medium text-[16px] leading-6">
              <div className="w-full flex flex-col items-start gap-2">
                <div className="flex items-start justify-between w-full gap-2">
                  <span className="font-medium text-[16px] leading-6 text-[#7C7E81]">
                    Max variable borrow rate
                  </span>
                  <span className="font-semibold">
                    {Number(
                      asset?.interestStrategy?.maxVariableBorrowRate ?? 0
                    ).toFixed(2)}
                    %
                  </span>
                </div>
                <div className="flex items-start justify-between w-full gap-2">
                  <span className="font-medium text-[16px] leading-6 text-[#7C7E81]">
                    Optimal usage ration
                  </span>
                  <span className="font-semibold">
                    {Number(
                      asset?.interestStrategy?.optimalUsageRation ?? 0
                    ).toFixed(2)}
                    %
                  </span>
                </div>
                <div className="flex items-start justify-between w-full gap-2">
                  <span className="font-medium text-[16px] leading-6 text-[#7C7E81]">
                    Variable rate slope 1
                  </span>
                  <span className="font-semibold">
                    {Number(
                      asset?.interestStrategy?.variableRateSlope1 ?? 0
                    ).toFixed(2)}
                    %
                  </span>
                </div>
                <div className="flex items-start justify-between w-full gap-2">
                  <span className="font-medium text-[16px] leading-6 text-[#7C7E81]">
                    Variable rate slope 2
                  </span>
                  <span className="font-semibold">
                    {Number(
                      asset?.interestStrategy?.variableRateSlope2 ?? 0
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { AssetInfo };
