import { useState, useEffect, useRef } from "react";

import { Dispatch, SetStateAction } from "react";

import { motion } from "framer-motion";

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
  const carouselRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setWidth(scrollWidth - offsetWidth);
    }
  }, []);

  return (
    <div className="w-full md:w-auto overflow-hidden md:overflow-visible">
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
            const assetData = getTokenData(asset.address) as TTokenData;

            return (
              <motion.div
                key={asset.address}
                className={cn(
                  "min-w-[80px] flex-shrink-0 flex items-center gap-2 py-2 px-3 rounded-lg border",
                  asset.address === activeAsset?.address
                    ? "bg-[#232429] border-[#35363B]"
                    : " bg-transparent border-[#232429]"
                )}
                onClick={() => setActiveAsset(asset)}
              >
                <img
                  src={assetData.logoURI}
                  alt={assetData.symbol}
                  className="w-5 h-5 rounded-full pointer-events-none select-none"
                />
                <span
                  className={cn(
                    "text-[14px] leading-5 font-medium pointer-events-none select-none",
                    asset.address === activeAsset?.address
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
                className="w-5 h-5 rounded-full pointer-events-none select-none"
              />
              <span
                className={cn(
                  "text-[14px] leading-5 font-medium pointer-events-none select-none",
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
    </div>
  );
};

export { AssetSelector };
