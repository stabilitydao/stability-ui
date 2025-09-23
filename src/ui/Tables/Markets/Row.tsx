import { cn, formatNumber, getTokenData } from "@utils";

import { TMarket, TMarketAsset } from "@types";

interface IProps {
  market: TMarket;
}

const Row: React.FC<IProps> = ({ market }) => {
  return (
    <a
      className="border border-[#23252A] rounded-lg min-w-max md:min-w-full"
      href={`/lending/146/${market.name}`}
    >
      {market.assets.map((asset: TMarketAsset, index: number) => {
        const assetData = getTokenData(asset.address);

        return (
          <div
            key={market.name + asset.address}
            className={cn(
              "text-center bg-[#101012] cursor-pointer h-[56px] font-medium relative flex items-center",
              market.assets.length - 1 != index && "border-b border-b-[#23252A]"
            )}
          >
            <div className="sticky bg-[#101012] lg:bg-transparent top-0 left-0 flex items-center w-[150px] md:w-[20%] justify-between gap-3 px-2 md:px-4 h-[56px] z-10 border-r border-[#23252A] lg:border-r-0">
              {!index ? (
                <div className="flex items-center gap-3">
                  <img
                    src={market.network.logoURI}
                    alt={market.network.name}
                    className="w-6 h-6 rounded-full"
                  />

                  <span className="text-[14px] leading-5">{market.name}</span>
                </div>
              ) : null}
            </div>
            <div className="px-2 md:px-4 text-left text-[16px] w-[100px] md:w-[15%] flex items-center gap-2">
              <img
                src={assetData?.logoURI}
                alt={assetData?.symbol}
                className="w-6 h-6 rounded-full"
              />
              <span>{assetData?.symbol}</span>
            </div>
            <div className="px-2 md:px-4 text-right text-[16px] w-[100px] md:w-[13%]">
              {formatNumber(asset.supplyAPR, "format")}%
            </div>
            <div className="px-2 md:px-4 text-right text-[16px] w-[100px] md:w-[13%]">
              {formatNumber(asset.borrowAPR, "format")}%
            </div>
            <div className="px-2 md:px-4 text-right text-[16px] w-[100px] md:w-[13%]">
              {formatNumber(asset.supplyTVL, "abbreviate")}
            </div>
            <div className="px-2 md:px-4 text-right text-[16px] w-[150px] md:w-[13%]">
              {formatNumber(asset.borrowTVL, "abbreviate")}
            </div>
            <div className="px-2 md:px-4 text-right text-[16px] w-[150px] md:w-[13%]">
              {asset.maxLtv}% / {asset.liquidationThreshold}%
            </div>
          </div>
        );
      })}
    </a>
  );
};

export { Row };
