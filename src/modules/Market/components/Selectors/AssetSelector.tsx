import { useState, useEffect, useRef } from "react";

import { motion } from "framer-motion";

import { cn, getTokenData, useWindowWidth } from "@utils";

import { TMarketAsset, TTokenData, MarketSectionTypes } from "@types";

type TProps = {
  assets: TMarketAsset[];
  activeSection: MarketSectionTypes;
  activeAsset: TMarketAsset | undefined;
  handleAssetChange: (asset: TMarketAsset) => void;
};

const AssetSelector: React.FC<TProps> = ({
  assets,
  activeSection,
  activeAsset,
  handleAssetChange,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);

  const windowWidth = useWindowWidth();

  useEffect(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setWidth(scrollWidth - offsetWidth);
    }
  }, []);

  const isHidden =
    activeSection === MarketSectionTypes.Users ||
    (assets.length === 2 &&
      windowWidth >= 1024 &&
      activeSection === MarketSectionTypes.Information);

  return (
    <div
      className={cn(
        "w-full md:w-auto overflow-hidden md:overflow-visible",
        isHidden && "opacity-0 pointer-events-none"
      )}
    >
      <motion.div
        ref={carouselRef}
        className="block md:hidden cursor-grab overflow-hidden"
      >
        <motion.div
          className="flex items-center gap-2"
          drag="x"
          dragConstraints={{ right: 0, left: -width }}
          whileTap={{ cursor: "grabbing" }}
        >
          {assets.map((asset) => {
            const assetData = getTokenData(asset.asset) as TTokenData;

            if (
              !asset.isBorrowable &&
              activeSection === MarketSectionTypes.Borrow
            ) {
              return null;
            }

            return (
              <motion.div
                key={asset.asset}
                className={cn(
                  "min-w-[80px] flex-shrink-0 flex items-center gap-2 py-2 px-3 rounded-lg border",
                  asset.asset === activeAsset?.asset
                    ? "bg-[#232429] border-[#35363B]"
                    : " bg-transparent border-[#232429]"
                )}
                onClick={() => handleAssetChange(asset)}
              >
                <img
                  src={assetData.logoURI}
                  alt={assetData.symbol}
                  className="w-5 h-5 rounded-full pointer-events-none select-none"
                />
                <span
                  className={cn(
                    "text-[14px] leading-5 font-medium pointer-events-none select-none",
                    asset.asset === activeAsset?.asset
                      ? "text-white"
                      : "text-[#7C7E81]"
                  )}
                >
                  {assetData.symbol}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {assets.map((asset) => {
          const assetData = getTokenData(asset.asset) as TTokenData;

          if (
            !asset.isBorrowable &&
            activeSection === MarketSectionTypes.Borrow
          ) {
            return null;
          }

          return (
            <div
              key={asset.asset}
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-lg border cursor-pointer",
                asset.asset === activeAsset?.asset
                  ? "bg-[#232429] border-[#35363B]"
                  : " bg-transparent border-[#232429]"
              )}
              onClick={() => handleAssetChange(asset)}
            >
              <img
                src={assetData.logoURI}
                alt={assetData.symbol}
                className="w-5 h-5 rounded-full pointer-events-none select-none"
              />
              <span
                className={cn(
                  "text-[14px] leading-5 font-medium pointer-events-none select-none",
                  asset.asset === activeAsset?.asset
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
    </div>
  );
};

export { AssetSelector };
