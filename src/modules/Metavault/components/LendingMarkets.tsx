import { useState, useEffect } from "react";

import { ArrowIcon } from "@ui";

import { cn } from "@utils";

import type { TMarketInfo } from "@types";

const LendingMarkets = (): JSX.Element => {
  const [markets, setMarkets] = useState<TMarketInfo[]>([]);
  const [expandedData, setExpandedData] = useState(true);

  useEffect(() => {
    try {
      const marketsInfo = [
        {
          logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png`,
          symbol: "Silo wmetaUSD - USDC",
          link: "https://v2.silo.finance/markets/sonic/wmetausd-usdc-121?action=deposit",
        },
        {
          logo: `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/enclabs.svg`,
          symbol: "Enclabs wmetaUSD",
          link: "https://www.enclabs.finance/#/core-pool/market/0x1D801dC616C79c499C5d38c998Ef2D0D6Cf868e8?chainId=146",
        },
      ];
      setMarkets(marketsInfo);
    } catch (error) {
      console.error("Failed to set lending markets data:", error);
    }
  }, []);

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-center bg-[#151618] border border-[#23252A] text-[#97979A] text-[14px] leading-5 h-[48px] rounded-t-lg overflow-hidden cursor-pointer",
          !expandedData && "rounded-b-lg"
        )}
        onClick={() => setExpandedData((prev) => !prev)}
      >
        <div className="px-4 flex items-center justify-between gap-2 cursor-pointer">
          Lending Markets{" "}
          <ArrowIcon isActive={false} rotate={expandedData ? 180 : 0} />
        </div>
      </div>
      {expandedData &&
        markets.map(({ logo, symbol, link }, index: number) => (
          <a
            key={link + index}
            className={cn(
              "flex h-[64px] items-center text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012] cursor-pointer",
              markets.length - 1 === index && "rounded-b-lg"
            )}
            href={link}
            target="_blank"
          >
            <div className="px-4 w-full flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full"
                src={logo}
                alt="logo"
                title={symbol}
              />

              <span className="text-[14px] leading-5 font-semibold whitespace-nowrap">
                {symbol}
              </span>
            </div>
          </a>
        ))}
    </div>
  );
};

export { LendingMarkets };
