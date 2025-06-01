import { useState, useEffect, useRef } from "react";

import { motion } from "framer-motion";

import { useStore } from "@nanostores/react";

import { cn, formatNumber } from "@utils";

import { marketPrices } from "@store";

import type { TMarketPrice } from "@types";

interface IProps {
  isMobile?: boolean;
}

const Prices: React.FC<IProps> = ({ isMobile = false }): JSX.Element => {
  const $marketPrices = useStore(marketPrices);

  const [prices, setPrices] = useState<[string, TMarketPrice][]>([]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if ($marketPrices) {
      const sortedPrices = Object.entries($marketPrices).sort(
        (a, b) => Number(b[1].price) - Number(a[1].price)
      );

      setPrices(sortedPrices);
    }
  }, [$marketPrices]);

  useEffect(() => {
    if (isMobile && carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setWidth(scrollWidth - offsetWidth);
    }
  }, [prices, isMobile]);

  if (isMobile) {
    return (
      <div className="w-full text-white overflow-hidden">
        <motion.div
          ref={carouselRef}
          className="cursor-grab overflow-hidden -mx-4 px-4"
        >
          <motion.div
            className="flex gap-3"
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            whileTap={{ cursor: "grabbing" }}
          >
            {prices.map(([symbol, data]) => (
              <motion.div
                key={symbol}
                className="min-w-[180px] flex-shrink-0 border border-[#23252A] rounded-lg px-4 py-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 mb-1">
                  <img
                    src={`/features/${symbol.toLowerCase()}.png`}
                    alt={symbol}
                    className="w-6 h-6"
                  />
                  <span className="text-[14px] font-semibold">{symbol}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[12px] font-semibold">
                    {formatNumber(
                      data.price,
                      Number(data.price) < 1
                        ? "formatWithLongDecimalPart"
                        : "format"
                    )}
                    $
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium",
                      data.priceChange >= 0
                        ? "text-[#48C05C]"
                        : "text-[#DE4343]"
                    )}
                  >
                    {data.priceChange > 0 ? "+" : ""}
                    {data.priceChange}%
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full text-white">
      {prices.map(([symbol, data]) => (
        <div
          key={symbol}
          title={symbol}
          className="flex items-center justify-between border border-[#23252A] rounded-lg px-4 py-2"
        >
          <div className="flex items-center gap-3">
            <img
              src={`/features/${symbol.toLowerCase()}.png`}
              alt={symbol}
              className="w-6 h-6"
            />
            <span className="text-[14px] font-semibold">{symbol}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[12px] font-semibold">
              {formatNumber(
                data.price,
                Number(data.price) < 1 ? "formatWithLongDecimalPart" : "format"
              )}
              $
            </span>
            <span
              className={cn(
                "text-[10px] font-medium",
                data.priceChange >= 0 ? "text-[#48C05C]" : "text-[#DE4343]"
              )}
            >
              {data.priceChange > 0 ? "+" : ""}
              {data.priceChange}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export { Prices };
