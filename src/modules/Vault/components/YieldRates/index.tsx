import { memo, useState, useEffect } from "react";
import { useStore } from "@nanostores/react";

// import Tippy from "@tippyjs/react";

import { HoldTable, VSHoldTableCell, YieldTableCell } from "./table";

import { HeadingText } from "@ui";

import { connected } from "@store";

import { getTimeDifference, formatNumber, cn } from "@utils";

import "tippy.js/dist/tippy.css";

import type { TVault, THoldData, TShareData } from "@types";

interface IProps {
  vault: TVault;
}

const YieldRates: React.FC<IProps> = memo(({ vault }) => {
  const $connected = useStore(connected);

  const [shareData, setShareData] = useState<TShareData>({});
  const [activeTable, setActiveTable] = useState("income");

  // const vsHoldExplanation =
  //   "VS HODL APR compares depositing tokens into a vault vs holding them in a wallet with its ratio and timeline.";

  const totalAPY = [
    { data: vault?.earningData?.apy?.latest, testID: "yieldLatestAPY" },
    { data: vault?.earningData?.apy?.daily, testID: "yieldDailyAPY" },
    { data: vault?.earningData?.apy?.weekly, testID: "yieldWeeklyAPY" },
  ];
  const totalAPR = [
    { data: vault?.earningData?.apr?.latest, testID: "yieldLatestAPR" },
    { data: vault?.earningData?.apr?.daily, testID: "yieldDailyAPR" },
    { data: vault?.earningData?.apr?.weekly, testID: "yieldWeeklyAPR" },
  ];
  const poolSwapFeeAPR = [
    {
      data: vault?.earningData?.poolSwapFeesAPR?.latest,
      testID: "yieldLatestPoolAPR",
    },
    {
      data: vault?.earningData?.poolSwapFeesAPR?.daily,
      testID: "yieldDailyPoolAPR",
    },
    {
      data: vault?.earningData?.poolSwapFeesAPR?.weekly,
      testID: "yieldWeeklyPoolAPR",
    },
  ];
  const farmAPR = [
    { data: vault?.earningData?.farmAPR?.latest, testID: "yieldLatestFarmAPR" },
    { data: vault?.earningData?.farmAPR?.daily, testID: "yieldDailyFarmAPR" },
    { data: vault?.earningData?.farmAPR?.weekly, testID: "yieldWeeklyFarmAPR" },
  ];
  const vsHold = [
    { data: vault.vsHold24H },
    { data: vault.vsHoldWeekly },
    { data: vault.vsHoldAPR, testID: "vaultVsHoldLifetime" },
    { data: vault.lifetimeVsHold, testID: "vaultVsHold" },
  ];

  const getShareData = async () => {
    if (!Number(vault.sharePriceLast)) {
      return;
    }

    const sharePriceOnCreation = 1;
    const sharePrice = Number(vault.sharePriceLast);

    const sharePriceDifference = (sharePrice - sharePriceOnCreation) * 100;

    setShareData({
      sharePriceOnCreation: "1",
      sharePrice: sharePrice.toFixed(2),
      yieldPercent: sharePriceDifference.toFixed(2),
    });
  };

  useEffect(() => {
    getShareData();
  }, [$connected]);
  return (
    <div className="my-6">
      <div className="flex md:tems-center justify-between flex-col md:flex-row mb-4 gap-3 md:gap-0">
        <HeadingText text="Yield Rates" scale={2} styles="text-left" />

        <div className="flex items-center font-semibold relative text-[14px] leading-5 gap-2">
          <p
            className={cn(
              "whitespace-nowrap cursor-pointer z-20 text-center px-4 py-2 rounded-lg",
              activeTable === "income"
                ? "text-white border !border-[#2C2E33] bg-[#22242A]"
                : "text-[#97979A] border !border-[#23252A]"
            )}
            onClick={() => setActiveTable("income")}
          >
            Income
          </p>
          <p
            className={cn(
              "whitespace-nowrap cursor-pointer z-20 text-center px-4 py-2 rounded-lg",
              activeTable === "vsHodl"
                ? "text-white border !border-[#2C2E33] bg-[#22242A]"
                : "text-[#97979A] border !border-[#23252A]"
            )}
            onClick={() => setActiveTable("vsHodl")}
          >
            VS HODL
          </p>
          <p
            className={cn(
              "whitespace-nowrap cursor-pointer z-20 text-center px-4 py-2 rounded-lg",
              activeTable === "prices"
                ? "text-white border !border-[#2C2E33] bg-[#22242A]"
                : "text-[#97979A] border !border-[#23252A]"
            )}
            onClick={() => setActiveTable("prices")}
          >
            Prices
          </p>
        </div>
      </div>

      {!!vault?.earningData && activeTable === "income" && (
        <div className="w-full">
          <div className="flex items-center bg-[#151618] border border-[#23252A] text-[#97979A] text-[14px] leading-5 h-[48px] rounded-t-lg overflow-hidden">
            <div className="px-4 w-1/4 md:w-[40%]"></div>
            <div className="text-right w-1/4 md:w-1/5">Latest</div>
            <div className="text-right w-1/4 md:w-1/5">24H</div>
            <div className="text-right w-1/4 md:w-1/5 pr-4">Week</div>
          </div>

          <div className="flex h-[48px] md:h-[64px] items-center text-[14px] md:text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]">
            <div className="pr-0 md:pr-4 pl-4 w-1/4 md:w-[40%]">Total APY</div>
            {totalAPY.map(({ data, testID }, index) => (
              <YieldTableCell
                key={testID}
                isSharePrice={!!Number(vault.shareprice)}
                data={formatNumber(data, "formatAPR")}
                testID={testID}
                customClassName={totalAPY.length - 1 === index ? "pr-4" : ""}
              />
            ))}
          </div>

          <div className="flex h-[48px] md:h-[64px] items-center text-[14px] md:text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]">
            <div className="pr-0 md:pr-4 pl-4 w-1/4 md:w-[40%]">Total APR</div>
            {totalAPR.map(({ data, testID }, index) => (
              <YieldTableCell
                key={testID}
                isSharePrice={!!Number(vault.shareprice)}
                data={formatNumber(data, "formatAPR")}
                testID={testID}
                customClassName={totalAPR.length - 1 === index ? "pr-4" : ""}
              />
            ))}
          </div>

          {vault.strategyInfo.shortId !== "CF" && vault.pool && (
            <div className="flex h-[48px] md:h-[64px] items-center text-[14px] md:text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]">
              <div className="pr-0 md:pr-4 pl-4 w-1/4 md:w-[40%]">
                Pool swap fees APR
              </div>
              {poolSwapFeeAPR.map(({ data, testID }, index) => (
                <YieldTableCell
                  key={testID}
                  isSharePrice={!!Number(vault.shareprice)}
                  data={formatNumber(data, "formatAPR")}
                  testID={testID}
                  customClassName={
                    poolSwapFeeAPR.length - 1 === index ? "pr-4" : ""
                  }
                />
              ))}
            </div>
          )}

          <div className="flex h-[48px] md:h-[64px] items-center text-[14px] md:text-[16px] border-b border-x border-[#23252A] font-semibold rounded-b-lg bg-[#101012]">
            <div className="pr-0 md:pr-4 pl-4 w-1/4 md:w-[40%]">
              {vault.strategyInfo.shortId === "CF"
                ? "Strategy APR"
                : "Farm APR"}
            </div>
            {farmAPR.map(({ data, testID }, index) => (
              <YieldTableCell
                key={testID}
                isSharePrice={!!Number(vault.shareprice)}
                data={formatNumber(data, "formatAPR")}
                testID={testID}
                customClassName={farmAPR.length - 1 === index ? "pr-4" : ""}
              />
            ))}
          </div>
        </div>
      )}

      {!!vault.assetsVsHold && activeTable === "vsHodl" && (
        <div className="w-full">
          <div className="flex items-center bg-[#151618] border border-[#23252A] text-[#97979A] text-[12px] md:text-[14px] leading-5 h-[48px] rounded-t-lg overflow-hidden">
            <div className="px-4 w-1/5 md:w-[30%]"></div>
            <div className="text-right w-1/5 md:w-[17.5%]">APR 24H</div>
            <div className="text-right w-1/5 md:w-[17.5%]">APR Week</div>
            <div className="text-right w-1/5 md:w-[17.5%]">est APR</div>
            <div className="text-right w-1/5 md:w-[17.5%] pr-4">
              {getTimeDifference(vault.created).days} days
            </div>
          </div>

          <div className="flex h-[48px] md:h-[64px] items-center text-[12px] md:text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]">
            <div className="pr-0 md:pr-4 pl-4 w-1/5 md:w-[30%] text-[8px] md:text-[16px]">
              VAULT VS HODL
            </div>
            {vsHold.map((cell, index) => (
              <VSHoldTableCell
                key={`${cell.data}-${index}`}
                isVsActive={vault.isVsActive}
                vsHold={cell.data}
                testID={cell.testID ?? ""}
                customClassName={vsHold.length - 1 === index ? "pr-4" : ""}
              />
            ))}
          </div>
          {vault.assetsVsHold.map((aprsData: THoldData, index: number) => {
            const assetData = [
              { data: Number(aprsData.dailyAPR) },
              { data: Number(aprsData.weeklyAPR) },
              {
                data: Number(aprsData.APR),
                testID: `assetsVsHold${index}`,
              },
              {
                data: Number(aprsData.latestAPR),
                testID: `tokensHold${index}`,
              },
            ];

            return (
              <div
                key={`row-${index}-${aprsData.symbol}`}
                className={cn(
                  "flex h-[48px] md:h-[64px] items-center text-[12px] md:text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]",
                  vault.assetsVsHold.length - 1 === index && "rounded-b-lg"
                )}
              >
                <div className="pr-0 md:pr-4 pl-4 w-1/5 md:w-[30%] text-[8px] md:text-[16px]">
                  VAULT VS {aprsData?.symbol} HODL
                </div>
                {assetData.map((cell, index) => (
                  <VSHoldTableCell
                    key={`${cell.data}+${index}`}
                    isVsActive={vault.isVsActive}
                    vsHold={cell.data}
                    testID={cell.testID ?? ""}
                    customClassName={
                      assetData.length - 1 === index ? "pr-4" : ""
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {!!vault.assetsVsHold && activeTable === "prices" && (
        <HoldTable
          shareData={shareData}
          holdData={vault.assetsVsHold}
          daysFromCreation={getTimeDifference(vault?.created)?.days}
        />
      )}
    </div>
  );
});

export { YieldRates };
