import { useState } from "react";

import { isMobile } from "react-device-detect";

import {
  TimeDifferenceIndicator,
  ArrowIcon,
  StrategyBadge,
  ArrowRightIcon,
} from "@ui";

import { formatNumber, cn } from "@utils";

import { SILO_POINTS } from "@constants";

import { TVault, TAPRModal } from "@types";

interface IProps {
  APRs: {
    APR: string;
    APY: string;
    swapFees: string;
    strategyAPR: string;
    dailyAPR: string;
    gemsAPR: string;
  };
  vault: TVault;
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const Row: React.FC<IProps> = ({ APRs, vault, setModalState }) => {
  const [expandedData, setExpandedData] = useState(false);

  const isSTBLVault =
    Array.isArray(vault?.assets) &&
    vault.assets.some((asset) => asset?.symbol && asset?.symbol === "STBL");

  const link = vault?.isMetaVault
    ? `/metavaults/metavault/${vault.address}`
    : `/vaults/vault/${vault.network}/${vault.address}`;

  return (
    <div className="border border-[#23252A] border-b-0">
      <a
        className="text-center bg-[#101012] cursor-pointer h-[56px] font-medium relative flex items-center"
        data-testid="vault"
        href={link}
        onClick={(e) => {
          if (window.innerWidth <= 1280) {
            e.preventDefault();
            setExpandedData((prev) => !prev);
          }
        }}
      >
        <div className="flex items-center w-full xl:w-[30%] justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              {vault?.isMetaVault ? (
                <img
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  src={`/features/${vault.symbol}.png`}
                  alt="logo"
                />
              ) : (
                vault.assets.map((asset, index) => (
                  <img
                    src={asset?.logo}
                    alt={asset?.symbol}
                    className={`w-8 h-8 rounded-full ${
                      !index && vault.assets.length > 1 && "mr-[-8px] z-[5]"
                    }`}
                    key={asset?.logo + index}
                  />
                ))
              )}
            </div>
            <span className="font-semibold text-[16px] max-w-[130px] truncate overflow-hidden whitespace-nowrap">
              {vault?.isMetaVault ? vault.symbol : vault.assetsSymbol}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1">
            {!vault.symbol.includes("PT-") && !vault?.isMetaVault && (
              <div
                title="Sonic Activity Points"
                className="rounded-[4px] border border-[#48c05c] bg-[#192c1e] h-6 flex items-center justify-center"
              >
                <div className="flex items-center gap-1 px-2">
                  <img
                    src="/sonic.png"
                    alt="sonic"
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="text-[12px]">
                    x{vault.sonicActivePoints}
                  </span>
                </div>
              </div>
            )}
            {SILO_POINTS[vault.address as keyof typeof SILO_POINTS] &&
              !vault?.isMetaVault && (
                <div
                  title="Silo Points per $ / day"
                  className="rounded-[4px] border border-[#FFA500] bg-[#36280f] h-6 flex items-center justify-center"
                >
                  <div className="flex items-center gap-1 px-2">
                    <img
                      src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                      alt="silo"
                      className="w-4 h-4 rounded-full"
                    />
                    <span className="text-[12px]">
                      {SILO_POINTS[vault.address as keyof typeof SILO_POINTS]}
                    </span>
                  </div>
                </div>
              )}

            {!!vault.ringsPoints && !vault?.isMetaVault && (
              <div
                title="Rings Points"
                className="rounded-[4px] border border-[#5E6AD2] bg-[#1C1E31] h-6 flex items-center justify-center"
              >
                <div className="flex items-center gap-1 px-2">
                  <img
                    src="/rings.png"
                    alt="rings"
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="text-[12px]">x{vault.ringsPoints}</span>
                </div>
              </div>
            )}
            <div className="block xl:hidden ml-2">
              <ArrowIcon isActive={true} rotate={expandedData ? 180 : 0} />
            </div>
          </div>
        </div>
        <div className="px-4 w-[17.5%] hidden xl:block">
          {!vault?.isMetaVault ? (
            <StrategyBadge
              info={vault.strategyInfo}
              specific={vault.strategySpecific}
            />
          ) : null}
        </div>
        <div
          onClick={(e) => {
            if (isMobile && !vault?.isMetaVault) {
              e.stopPropagation();
              setModalState({
                earningData: vault.earningData,
                daily: vault.daily,
                lastHardWork: vault.lastHardWork,
                symbol: vault?.risk?.symbol as string,
                state: true,
                pool: vault?.pool,
              });
            }
          }}
          className={cn(
            "px-4 w-[17.5%] hidden xl:block",
            !vault?.isMetaVault && "tooltip cursor-help"
          )}
        >
          <div
            className={`whitespace-nowrap w-full text-end flex items-center justify-end ${
              vault?.risk?.isRektStrategy ? "text-[#818181]" : "text-[#eaecef]"
            }`}
          >
            <div className="flex flex-col justify-end">
              <p className="text-[16px]">
                {formatNumber(APRs.APR, "formatAPR")}%
              </p>
              {!!vault?.liveAPR && (
                <p className="text-[14px] text-[#97979A]">
                  live. {vault?.liveAPR?.toFixed(2)}%
                </p>
              )}
            </div>
          </div>
          {!vault?.isMetaVault && (
            <div className="visible__tooltip">
              <div className="flex items-start flex-col gap-2">
                <div className="flex flex-col gap-1 w-full">
                  {!!vault?.risk?.isRektStrategy && (
                    <div className="flex flex-col items-center gap-2 mb-[10px]">
                      <h3 className="text-[#f52a11] font-bold">
                        {vault?.risk?.symbol} VAULT
                      </h3>
                      <p className="text-[12px] text-start">
                        Rekt vault regularly incurs losses, potentially leading
                        to rapid USD value decline, with returns insufficient to
                        offset the losses.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="leading-5 text-[#97979A] font-medium">
                      Total APY
                    </p>
                    <p className="text-end font-semibold">
                      {formatNumber(APRs.APY, "formatAPR")}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="leading-5 text-[#97979A] font-medium">
                      Total APR
                    </p>
                    <p className="text-end font-semibold">
                      {formatNumber(APRs.APR, "formatAPR")}%
                    </p>
                  </div>

                  {vault?.earningData?.poolSwapFeesAPR.daily != "-" &&
                    vault?.pool && (
                      <div className="flex items-center justify-between">
                        <p className="leading-5 text-[#97979A] font-medium">
                          Pool swap fees APR
                        </p>
                        <p className="text-end font-semibold">
                          {formatNumber(APRs.swapFees, "formatAPR")}%
                        </p>
                      </div>
                    )}
                  <div className="flex items-center justify-between">
                    <p className="leading-5 text-[#97979A] font-medium">
                      Strategy APR
                    </p>
                    <p className="text-end font-semibold">
                      {formatNumber(APRs.strategyAPR, "formatAPR")}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="leading-5 text-[#97979A] font-medium">
                      Daily
                    </p>
                    <p className="text-end font-semibold">
                      {formatNumber(APRs.dailyAPR, "formatAPR")}%
                    </p>
                  </div>
                  {!isSTBLVault && (
                    <div className="flex items-center justify-between">
                      <p className="leading-5 text-[#97979A] font-medium">
                        Gems APR
                      </p>
                      <p className="text-end font-semibold">
                        {formatNumber(APRs.gemsAPR, "formatAPR")}%
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="leading-5 text-[#97979A] font-medium">
                    Last Hard Work
                  </p>
                  <TimeDifferenceIndicator unix={vault.lastHardWork} />
                </div>
              </div>
              <i></i>
            </div>
          )}
        </div>
        <div className="px-4 text-right text-[16px] w-[17.5%] hidden xl:block">
          {formatNumber(vault.tvl, "abbreviate")}
        </div>
        <div className="px-4 text-right text-[16px] w-[17.5%] hidden xl:block">
          <p>${formatNumber(vault.balanceInUSD, "format")}</p>
        </div>
      </a>
      {expandedData ? (
        <div className="flex flex-col items-center justify-between gap-1 px-4 py-2 bg-[#18191c] border-t border-[#23252A] xl:hidden">
          {!vault?.isMetaVault && (
            <div className="flex items-center justify-between w-full">
              <span className="text-[#909193] text-[14px] leading-5 font-medium">
                Strategy
              </span>
              <StrategyBadge
                info={vault.strategyInfo}
                specific={vault.strategySpecific}
              />
            </div>
          )}
          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              APR
            </span>
            <div className="whitespace-nowrap w-full text-end flex items-center justify-end text-[#48c05c]">
              <div className="flex flex-col justify-end">
                <p className="text-[16px]">
                  {formatNumber(APRs.APR, "formatAPR")}%
                </p>
                {!!vault?.liveAPR && (
                  <p className="text-[14px] text-[#97979A]">
                    live. {vault?.liveAPR?.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              TVL
            </span>
            <span className="text-[16px]">
              {formatNumber(vault.tvl, "abbreviate")}
            </span>
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Balance
            </span>
            <span className="text-[16px]">
              ${formatNumber(vault.balanceInUSD, "format")}
            </span>
          </div>
          <a
            href={link}
            className="text-[#816FEA] text-[14px] leading-4 font-medium flex items-center justify-end gap-1 w-full mt-1"
          >
            {vault?.isMetaVault ? "View Meta Vault" : "View Vault"}
            <ArrowRightIcon />
          </a>
        </div>
      ) : null}
    </div>
  );
};

export { Row };
