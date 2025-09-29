import { Dispatch, SetStateAction } from "react";

import { cn, getTokenData } from "@utils";

import { TMarketAsset, TTokenData } from "@types";

type TProps = {
  assets: TMarketAsset[];
  activeAsset: TMarketAsset | undefined;
  setActiveAsset: Dispatch<SetStateAction<TMarketAsset | undefined>>;
};

const AssetSelector: React.FC<TProps> = ({
  assets,
  activeAsset,
  setActiveAsset,
}) => {
  return (
    <div className="flex items-center gap-2">
      {assets.map((asset) => {
        const assetData = getTokenData(asset.address) as TTokenData;

        return (
          <div
            key={asset.address}
            className={cn(
              "flex items-center gap-2 py-2 px-3 rounded-lg border cursor-pointer",
              asset.address === activeAsset?.address
                ? "bg-[#232429] border-[#35363B]"
                : " bg-transparent border-[#232429]"
            )}
            onClick={() => setActiveAsset(asset)}
          >
            <img
              src={assetData.logoURI}
              alt={assetData.symbol}
              className="w-5 h-5 rounded-full"
            />
            <span
              className={cn(
                "text-[14px] leading-5 font-medium",
                asset.address === activeAsset?.address
                  ? "text-white"
                  : "text-[#7C7E81]"
              )}
            >
              {assetData.symbol}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export { AssetSelector };
