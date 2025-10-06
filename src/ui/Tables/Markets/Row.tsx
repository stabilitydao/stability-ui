import Tippy from "@tippyjs/react";

import { ProgressCircle } from "@ui";

import { cn, formatNumber, getTokenData } from "@utils";

import { TMarket, TMarketAsset } from "@types";

import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";

interface IProps {
  market: TMarket;
}

const Row: React.FC<IProps> = ({ market }) => {
  return (
    <a
      className="border border-[#23252A] rounded-lg min-w-max md:min-w-full"
      href={`/lending/146/${market?.name}`}
    >
      {market?.assets?.map((asset: TMarketAsset, index: number) => {
        const assetData = getTokenData(asset?.address);

        return (
          <div
            key={market?.name + asset?.address}
            className="text-center bg-[#101012] cursor-pointer h-[56px] font-medium relative flex items-center"
          >
            <div className="sticky bg-[#101012] lg:bg-transparent top-0 left-0 flex items-center w-[150px] md:w-[20%] justify-between gap-3 px-2 md:px-4 h-[56px] z-10 border-r border-[#23252A]">
              {!index ? (
                <div className="flex items-center gap-3">
                  <img
                    src={market?.network?.logoURI}
                    alt={market?.network?.name}
                    className="w-6 h-6 rounded-full"
                  />

                  <span className="text-[12px] leading-4 md:text-[14px] md:leading-5">
                    {market?.name}
                  </span>
                </div>
              ) : null}
            </div>
            <div
              className={cn(
                "px-2 md:px-4 text-left text-[16px] w-[100px] md:w-[15%] flex items-center gap-2 h-full",
                market?.assets?.length - 1 != index &&
                  "border-b border-b-[#23252A]"
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
                market?.assets?.length - 1 != index &&
                  "border-b border-b-[#23252A]"
              )}
            >
              {!!Number(asset?.supplyAPR) &&
                `${formatNumber(asset?.supplyAPR, "format")}%`}
            </div>
            <div
              className={cn(
                "px-2 md:px-4 flex items-center justify-end text-[16px] w-[100px] md:w-[13%] h-full",
                market?.assets?.length - 1 != index &&
                  "border-b border-b-[#23252A]"
              )}
            >
              {!!Number(asset?.borrowAPR) &&
                `${formatNumber(asset?.borrowAPR, "format")}%`}
            </div>
            <div
              className={cn(
                "px-2 md:px-4 flex items-center justify-end text-[16px] w-[100px] md:w-[13%] h-full",
                market.assets.length - 1 != index &&
                  "border-b border-b-[#23252A]"
              )}
            >
              {!!Number(asset?.supplyTVLInUSD) &&
                formatNumber(asset?.supplyTVLInUSD, "abbreviate")}
            </div>
            {Number(asset?.supplyTVLInUSD) ? (
              <Tippy
                content="desc"
                placement="top"
                animation="shift-away"
                interactive={true}
                delay={[100, 50]}
                theme="custom"
              >
                <div
                  className={cn(
                    "px-2 md:px-4 flex items-center justify-end gap-2 text-[16px] w-[150px] md:w-[13%] h-full cursor-help",
                    market.assets.length - 1 != index &&
                      "border-b border-b-[#23252A]"
                  )}
                >
                  <ProgressCircle
                    percentage={Number(Number(asset?.utilization).toFixed(2))}
                  />
                  <span>{Number(asset?.utilization).toFixed(2)}%</span>
                </div>
              </Tippy>
            ) : (
              <div
                className={cn(
                  "px-2 md:px-4 w-[150px] md:w-[13%] h-full",
                  market?.assets?.length - 1 != index &&
                    "border-b border-b-[#23252A]"
                )}
              />
            )}

            <div
              className={cn(
                "px-2 md:px-4 flex items-center justify-end text-[16px] w-[150px] md:w-[13%] h-full whitespace-nowrap",
                market.assets.length - 1 != index &&
                  "border-b border-b-[#23252A]"
              )}
            >
              {!!Number(asset?.maxLtv) &&
                !!Number(asset?.liquidationThreshold) &&
                `${asset?.maxLtv}% / ${asset?.liquidationThreshold}%`}
            </div>
          </div>
        );
      })}
    </a>
  );
};

export { Row };
