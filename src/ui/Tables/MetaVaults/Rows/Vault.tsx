import { useState } from "react";

import {
  ArrowIcon,
  TimeDifferenceIndicator,
  StrategyBadge,
  ArrowRightIcon,
} from "@ui";

import { cn, formatNumber } from "@utils";

import { VAULTS_WITH_NAME, PROTOCOLS } from "@constants";

import { TVault, TAPRModal } from "@types";

interface IProps {
  APRs: {
    APR: string;
    APY?: string;
    swapFees?: string;
    strategyAPR?: string;
    dailyAPR?: string;
    gemsAPR?: string;
  };
  vault: TVault;
  activeVault: any;
  setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
  inserted?: boolean;
}

const Vault: React.FC<IProps> = ({
  APRs,
  vault,
  activeVault,
  setModalState,
  inserted = false,
}) => {
  const [expandedData, setExpandedData] = useState(false);

  const isSTBLVault =
    Array.isArray(vault?.assets) &&
    vault.assets.some((asset) => asset?.symbol && asset?.symbol === "STBL");

  const symbol = vault?.isMetaVault
    ? vault.symbol
    : VAULTS_WITH_NAME[vault.address] || vault.assetsSymbol;

  const isDimmed =
    activeVault?.isHovered && activeVault.address !== vault.address;

  const rawProtocol = !vault?.isMetaVault
    ? vault?.strategyInfo?.protocols[0]
    : null;

  const protocol = rawProtocol?.name?.includes("Aave")
    ? PROTOCOLS.stability
    : rawProtocol;

  return (
    <div className={cn("border-t border-[#23252A]")}>
      <a
        className={cn(
          "text-center bg-[#101012] h-[56px] font-medium relative flex items-center cursor-default min-[860px]:cursor-pointer",
          isDimmed ? "opacity-30" : "opacity-100"
        )}
        href={
          vault?.isMetaVault
            ? `/metavaults/metavault/${vault.address}`
            : `/vaults/vault/${vault.network}/${vault.address}`
        }
        onClick={(e) => {
          if (window.innerWidth <= 860) {
            e.preventDefault();
            setExpandedData((prev) => !prev);
          }
        }}
      >
        <div className="flex items-center w-full min-[860px]:w-[50%] justify-between px-4">
          <div
            className={cn(
              "flex items-center gap-3",
              inserted && "ml-3 min-[860px]:ml-5"
            )}
          >
            <div className="flex items-center justify-center">
              {vault?.isMetaVault ? (
                <img
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  src={`/features/${vault.symbol}.png`}
                  alt="logo"
                />
              ) : (
                <div className="flex items-center">
                  {vault.assets.map((asset, index) => (
                    <img
                      src={asset?.logo}
                      alt={asset?.symbol}
                      className={`w-8 h-8 rounded-full flex-shrink-0 ${
                        !index && vault.assets.length > 1 && "mr-[-8px] z-[5]"
                      }`}
                      key={asset?.logo + index}
                    />
                  ))}
                  {protocol && (
                    <img
                      src={protocol?.logoSrc}
                      alt={protocol?.name}
                      title={protocol?.name}
                      className="w-8 h-8 rounded-full flex-shrink-0 ml-1"
                    />
                  )}
                </div>
              )}
            </div>
            <span
              className="font-semibold text-[16px] truncate overflow-hidden whitespace-nowrap max-w-[200px] min-[860px]:max-w-full"
              title={symbol}
            >
              {symbol}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1 flex-shrink-0">
            <div className="block min-[860px]:hidden ml-2">
              <ArrowIcon isActive={true} rotate={expandedData ? 180 : 0} />
            </div>
          </div>
        </div>
        <div
          onClick={(e) => {
            if (window.innerHeight <= 860 && !vault?.isMetaVault) {
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
            "px-4 w-[20%] hidden min-[860px]:block",
            !vault?.isMetaVault && "tooltip cursor-help"
          )}
        >
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
          <div
            className={cn(!vault?.isMetaVault ? "visible__tooltip" : "hidden")}
          >
            <div className="flex items-start flex-col gap-2">
              <div className="flex flex-col gap-1 w-full">
                {!!vault?.risk?.isRektStrategy && (
                  <div className="flex flex-col items-center gap-2 mb-[10px]">
                    <h3 className="text-[#f52a11] font-bold">
                      {vault?.risk?.symbol} VAULT
                    </h3>
                    <p className="text-[12px] text-start">
                      Rekt vault regularly incurs losses, potentially leading to
                      rapid USD value decline, with returns insufficient to
                      offset the losses.
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="leading-5 text-[#97979A] font-medium">
                    Total APY
                  </p>
                  <p className="text-end font-semibold">
                    {formatNumber(APRs?.APY ?? 0, "formatAPR")}%
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
                        {formatNumber(APRs?.swapFees ?? 0, "formatAPR")}%
                      </p>
                    </div>
                  )}
                <div className="flex items-center justify-between">
                  <p className="leading-5 text-[#97979A] font-medium">
                    Strategy APR
                  </p>
                  <p className="text-end font-semibold">
                    {formatNumber(APRs?.strategyAPR ?? 0, "formatAPR")}%
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="leading-5 text-[#97979A] font-medium">Daily</p>
                  <p className="text-end font-semibold">
                    {formatNumber(APRs?.dailyAPR ?? 0, "formatAPR")}%
                  </p>
                </div>
                {!isSTBLVault && (
                  <div className="flex items-center justify-between">
                    <p className="leading-5 text-[#97979A] font-medium">
                      Gems APR
                    </p>
                    <p className="text-end font-semibold">
                      {formatNumber(APRs?.gemsAPR ?? 0, "formatAPR")}%
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
        </div>
        <div className="px-4 text-right text-[16px] w-[30%] hidden min-[860px]:block">
          {(vault?.proportions?.current || vault?.proportions?.target) && (
            <span>
              {Number(vault.proportions?.current).toFixed(2)}% /{" "}
              {Number(vault.proportions?.target).toFixed(2)}%
            </span>
          )}
        </div>
      </a>
      {expandedData ? (
        <div className="flex flex-col items-center justify-between gap-1 px-4 py-2 bg-[#18191c] border-t border-[#23252A] min-[860px]:hidden">
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
              Allocation
            </span>
            {(vault?.proportions?.current || vault?.proportions?.target) && (
              <span className="text-[16px]">
                {Number(vault.proportions?.current).toFixed(2)}% /{" "}
                {Number(vault.proportions?.target).toFixed(2)}%
              </span>
            )}
          </div>

          <a
            href={
              vault?.isMetaVault
                ? `/metavaults/metavault/${vault.address}`
                : `/vaults/vault/${vault.network}/${vault.address}`
            }
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

export { Vault };
