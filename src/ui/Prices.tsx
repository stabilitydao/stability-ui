import { useState, useEffect, useRef } from "react";

import { motion } from "framer-motion";

import { useStore } from "@nanostores/react";

import { ArrowIcon } from "./Icons";

import { TextSkeleton } from "./Skeletons/TextSkeleton";

import { cn, formatNumber } from "@utils";

import { marketPrices } from "@store";

import type { TMarketPrice } from "@types";

interface IProps {
  isMobile?: boolean;
}

const getLocalStoragePrices = (
  key: string,
  defaultValue: boolean = true
): boolean => {
  if (typeof window === "undefined") return defaultValue;

  const stored = localStorage.getItem(key);

  if (stored === null) return defaultValue;

  return stored === "true";
};

const Prices: React.FC<IProps> = ({ isMobile = false }): JSX.Element => {
  const $marketPrices = useStore(marketPrices);

  const carouselRef = useRef<HTMLDivElement>(null);

  const [prices, setPrices] = useState<[string, TMarketPrice][]>([]);
  const [width, setWidth] = useState(0);

  const [isPricesVisible, setIsPricesVisible] = useState<boolean>(() =>
    getLocalStoragePrices("isPricesVisible", true)
  );

  const togglePricesVisible = () => {
    setIsPricesVisible((prev) => {
      const next = !prev;
      localStorage.setItem("isPricesVisible", next.toString());
      return next;
    });
  };

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
    <div
      className={cn(
        "flex flex-col gap-3 w-full text-white border border-[#232429] rounded-lg cursor-pointer",
        isPricesVisible ? "p-4" : "h-10 px-4 items-center justify-center w-full"
      )}
      onClick={togglePricesVisible}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-[#A3A4A6] text-[14px] leading-4 font-medium">
          Live Prices
        </span>
        <ArrowIcon isActive={false} rotate={isPricesVisible ? 180 : 0} />
      </div>
      {isPricesVisible && (
        <div className="flex flex-col gap-2">
          {prices.length
            ? prices.map(([symbol, data]) => (
                <div
                  className="flex items-center justify-between"
                  key={symbol}
                  title={symbol}
                >
                  <div className="flex justify-center items-center gap-[6px]">
                    <img
                      src={`/features/${symbol.toLowerCase()}.png`}
                      alt={symbol}
                      className="w-4 h-4"
                    />
                    <span className="text-[#A3A4A6] text-[12px] font-medium">
                      {symbol}
                    </span>
                  </div>
                  <div className="flex items-end text-[12px] leading-3 font-medium">
                    <span>
                      {formatNumber(
                        data.price,
                        Number(data.price) < 1
                          ? "formatWithLongDecimalPart"
                          : "format"
                      )}
                    </span>
                    <span
                      className={cn(
                        "w-[50px] text-end",
                        data.priceChange >= 0
                          ? "text-[#48C05C]"
                          : "text-[#DE4343]"
                      )}
                    >
                      {data.priceChange > 0 ? "+" : ""}
                      {data.priceChange}%
                    </span>
                  </div>
                </div>
              ))
            : [1, 2, 3, 4].map((key) => (
                <div
                  className="flex items-center justify-between"
                  key={`skeleton-${key}`}
                >
                  <div className="flex justify-center items-center gap-[6px]">
                    <div className="w-4 h-4 rounded-full bg-[#1B1D21]"></div>
                    <TextSkeleton lineHeight={18} width={30} />
                  </div>
                  <div className="flex items-end gap-1">
                    <TextSkeleton lineHeight={18} width={50} />
                    <TextSkeleton lineHeight={18} width={50} />
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
};

export { Prices };
