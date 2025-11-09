import { useState, memo } from "react";

import { ArrowIcon } from "@ui";

import { cn } from "@utils";

import { LENDING_MARKETS } from "@constants";

import { TAddress } from "@types";

interface IProps {
  metavault: TAddress;
}

const LendingMarkets: React.FC<IProps> = memo(({ metavault }) => {
  const key = metavault as keyof typeof LENDING_MARKETS;

  if (!LENDING_MARKETS[key]) return null;

  const [expandedData, setExpandedData] = useState(true);

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
        LENDING_MARKETS[key].map(
          ({ logo, symbol, link, isBlank }, index: number) => (
            <a
              key={link + index}
              className={cn(
                "flex h-[64px] items-center text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012] cursor-pointer",
                LENDING_MARKETS[key].length - 1 === index && "rounded-b-lg"
              )}
              href={link}
              target={isBlank ? "_blank" : "_self"}
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
          )
        )}
    </div>
  );
});

export { LendingMarkets };
