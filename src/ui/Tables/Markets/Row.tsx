import { useState } from "react";

import Tippy from "@tippyjs/react";

import { UtilizationTooltip } from "./UtilizationTooltip";

import { ProgressCircle, Badge } from "@ui";

import { cn, formatNumber, getTokenData, useWindowWidth } from "@utils";

import { MarketTypes, TMarket, TMarketReserve } from "@types";

import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";

interface IProps {
  market: TMarket;
}

const Row: React.FC<IProps> = ({ market }) => {
  const windowWidth = useWindowWidth();

  const [showAll, setShowAll] = useState(false);

  return (
    <a
      className="border border-[#23252A] rounded-lg min-w-max md:min-w-full"
      href={`/lending/${market?.network?.id}/${market?.marketId?.replace(/\s+/g, "-")}`}
    >
      {market?.reserves?.map((asset: TMarketReserve, index: number) => {
        const assetData = getTokenData(asset?.address);

        const isHidden =
          market?.type === MarketTypes.NonIsolated && index > 1 && !showAll;

        const lastVisibleIndex =
          market?.type === MarketTypes.NonIsolated
            ? Math.min(1, market?.reserves?.length - 1) +
              (showAll ? market?.reserves?.length - 2 : 0)
            : market?.reserves?.length - 1;

        const isNotLastVisible = index !== lastVisibleIndex && !isHidden;

        return (
          <div
            key={market?.marketId + asset?.address}
            className={cn(
              "text-center bg-[#101012] cursor-pointer h-[56px] font-medium relative flex items-center",
              isHidden && "hidden"
            )}
          >
            <div className="sticky bg-[#101012] lg:bg-transparent top-0 left-0 flex items-center w-[150px] md:w-[20%] justify-between gap-3 px-2 md:px-4 h-[56px] z-10 border-r border-[#23252A]">
              {!index ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={market?.network?.logoURI}
                      alt={market?.network?.name}
                      className="w-6 h-6 rounded-full"
                    />

                    <span className="text-[12px] leading-4 md:text-[14px] md:leading-5">
                      {market?.marketId}
                    </span>
                  </div>
                </div>
              ) : null}
              {index === 1 && market?.deprecated ? (
                <Badge state="error" text="Bad debts" greater={true} />
              ) : null}
            </div>
            <div
              className={cn(
                "px-2 md:px-4 text-left text-[16px] w-[100px] md:w-[15%] flex items-center gap-2 h-full",
                isNotLastVisible && "border-b border-b-[#23252A]"
              )}
            >
              <img
                src={assetData?.logoURI}
                alt={assetData?.symbol}
                className="w-6 h-6 rounded-full"
              />
              <span>{assetData?.symbol}</span>
            </div>
            <div
              className={cn(
                "px-2 md:px-4 flex items-center justify-end text-[16px] w-[100px] md:w-[13%] h-full",
                isNotLastVisible && "border-b border-b-[#23252A]"
              )}
            >
              {!!Number(asset?.supplyAPR) &&
                `${formatNumber(asset?.supplyAPR, "format")}%`}
            </div>
            <div
              className={cn(
                "px-2 md:px-4 flex items-center justify-end text-[16px] w-[100px] md:w-[13%] h-full",
                isNotLastVisible && "border-b border-b-[#23252A]"
              )}
            >
              {!!Number(asset?.borrowAPR) &&
                `${formatNumber(asset?.borrowAPR, "format")}%`}
            </div>
            <div
              className={cn(
                "px-2 md:px-4 flex items-center justify-end text-[16px] w-[100px] md:w-[13%] h-full",
                isNotLastVisible && "border-b border-b-[#23252A]"
              )}
            >
              {!!Number(asset?.supplyTVLInUSD) &&
                formatNumber(asset?.supplyTVLInUSD, "abbreviate")}
            </div>
            {Number(asset?.utilization) ? (
              <Tippy
                content={<UtilizationTooltip asset={asset} />}
                placement="top"
                animation="shift-away"
                interactive={true}
                delay={[100, 50]}
                theme="custom"
              >
                <div
                  className={cn(
                    "px-2 md:px-4 flex items-center justify-end gap-2 text-[16px] w-[150px] md:w-[13%] h-full cursor-help",
                    isNotLastVisible && "border-b border-b-[#23252A]"
                  )}
                  onClick={(e) => {
                    if (windowWidth <= 767) {
                      e.stopPropagation();
                      e.preventDefault();
                    }
                  }}
                >
                  <ProgressCircle
                    percentage={Number(Number(asset?.utilization).toFixed(2))}
                  />
                  <span
                    className={cn(
                      Number(asset?.utilization) === 100 && "text-[#DE4343]"
                    )}
                  >
                    {Number(asset?.utilization).toFixed(2)}%
                  </span>
                </div>
              </Tippy>
            ) : (
              <div
                className={cn(
                  "px-2 md:px-4 w-[150px] md:w-[13%] h-full",
                  isNotLastVisible && "border-b border-b-[#23252A]"
                )}
              />
            )}
            <div
              className={cn(
                "px-2 md:px-4 flex items-center justify-end text-[16px] w-[150px] md:w-[13%] h-full whitespace-nowrap",
                isNotLastVisible && "border-b border-b-[#23252A]"
              )}
            >
              {!!Number(asset?.maxLtv) &&
                !!Number(asset?.liquidationThreshold) &&
                `${asset?.maxLtv}% / ${asset?.liquidationThreshold}%`}
            </div>
          </div>
        );
      })}

      {market?.type === MarketTypes.NonIsolated ? (
        <div
          className="bg-[#101012] border-t border-[#23252A] h-[36px] cursor-pointer flex items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAll((prev) => !prev);
          }}
        >
          <div className="flex items-center justify-center gap-2 w-full sticky top-0 left-1/2 -translate-x-1/2 max-w-[300px] md:max-w-full md:relative">
            <p className="font-medium text-[14px] text-[#9180F4]">
              {showAll ? "Hide" : `Show all ${market?.reserves?.length}`}
            </p>
            <img
              className={cn(
                "transition delay-[50ms] w-3 h-3",
                showAll ? "rotate-[180deg]" : "rotate-[0deg]"
              )}
              src="/icons/arrow-down.svg"
              alt="arrowDown"
            />
          </div>
        </div>
      ) : null}
    </a>
  );
};

export { Row };
