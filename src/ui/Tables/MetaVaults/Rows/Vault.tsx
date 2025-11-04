import { useState } from "react";

import {
  ArrowIcon,
  TimeDifferenceIndicator,
  StrategyBadge,
  ArrowRightIcon,
} from "@ui";

import { cn, formatNumber } from "@utils";

import {
  VAULTS_WITH_NAME,
  PROTOCOLS,
  META_VAULTS_EXCEPTIONS,
} from "@constants";

import { TVault, TAPRModal, VaultTypes } from "@types";

interface IProps {
  isProDisplay: boolean;
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
  isProDisplay,
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

  const symbol =
    vault.type === VaultTypes.Vault
      ? VAULTS_WITH_NAME[vault.address] || vault.assetsSymbol
      : vault.symbol;

  const isDimmed =
    activeVault?.isHovered && activeVault.address !== vault.address;

  const rawProtocol =
    vault.type === VaultTypes.Vault ? vault?.strategyInfo?.protocols[0] : null;

  const _protocolException = rawProtocol?.name?.includes("Aave")
    ? PROTOCOLS.stability
    : rawProtocol?.name?.includes("Compound")
      ? PROTOCOLS.enclabs
      : rawProtocol;

  const protocol = META_VAULTS_EXCEPTIONS.some(
    (address) => address === vault.address
  )
    ? rawProtocol
    : _protocolException;

  const link =
    vault?.type === VaultTypes.Vault
      ? `/vaults/${vault.network}/${vault.address}`
      : `/metavaults/${vault.network}/${vault.address}`;

  return (
    <div className="border-t border-[#23252A]">
      <a
        className={cn(
          "text-center bg-[#101012] h-[56px] font-medium relative flex items-center cursor-default md:cursor-pointer",
          isDimmed ? "opacity-30" : "opacity-100"
        )}
        href={link}
        onClick={(e) => {
          if (!isProDisplay && window.innerWidth <= 860) {
            e.preventDefault();
            setExpandedData((prev) => !prev);
          }
        }}
      >
        <div
          className={cn(
            "flex items-center justify-between px-4",
            isProDisplay
              ? "sticky bg-[#101012] lg:bg-transparent top-0 left-0 z-10 h-[56px] w-[200px] border-r border-[#23252A] md:border-r-0 md:w-[40%]"
              : "w-full md:w-[40%]"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              inserted && "ml-3 md:ml-5",
              isProDisplay ? "gap-2 md:gap-3" : "gap-3"
            )}
          >
            <div className="flex items-center justify-center">
              {vault.type === VaultTypes.Vault ? (
                <div className="flex items-center">
                  {vault.assets.map((asset, index) => (
                    <img
                      src={asset?.logo}
                      alt={asset?.symbol}
                      className={cn(
                        "rounded-full flex-shrink-0",
                        isProDisplay ? "w-5 h-5 md:w-8 md:h-8 mr-1" : "w-8 h-8",
                        !index && vault.assets.length > 1 && "mr-[-8px] z-[5]"
                      )}
                      key={asset?.logo + index}
                    />
                  ))}
                  {isProDisplay ? (
                    <StrategyBadge
                      info={vault.strategyInfo}
                      specific={vault.strategySpecific}
                    />
                  ) : (
                    <img
                      src={protocol?.logoSrc}
                      alt={protocol?.name}
                      title={protocol?.name}
                      className={cn(
                        "rounded-full flex-shrink-0 ml-1",
                        isProDisplay ? "w-5 h-5 md:w-8 md:h-8" : "w-8 h-8"
                      )}
                    />
                  )}
                </div>
              ) : (
                <img
                  className={cn(
                    "rounded-full flex-shrink-0",
                    isProDisplay ? "w-5 h-5 md:w-8 md:h-8" : "w-8 h-8"
                  )}
                  src={`/features/${vault.symbol}.png`}
                  alt="logo"
                />
              )}
            </div>
            <span
              className={cn(
                "font-semibold truncate",
                isProDisplay
                  ? "text-[12px] hidden xl:flex md:text-[16px] md:max-w-[120px] min-[830px]:max-w-[95px] xl:max-w-full"
                  : "text-[16px] max-w-[160px] md:max-w-[100px] min-[830px]:max-w-[130px]",
                !inserted && "flex"
              )}
              title={symbol}
            >
              {symbol}
            </span>
          </div>

          {!isProDisplay && (
            <div className="flex items-center justify-center gap-1 flex-shrink-0">
              <div className="block md:hidden ml-2">
                <ArrowIcon isActive={true} rotate={expandedData ? 180 : 0} />
              </div>
            </div>
          )}
        </div>
        <div
          onClick={(e) => {
            if (window.innerWidth <= 860 && vault.type === VaultTypes.Vault) {
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
            "px-4 w-[15%]",
            vault.type === VaultTypes.Vault && "tooltip cursor-help",
            isProDisplay ? "w-[100px] md:w-[15%]" : "hidden md:block"
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
            className={cn(
              vault.type === VaultTypes.Vault ? "visible__tooltip" : "hidden"
            )}
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
        <div
          className={cn(
            "px-4 text-right text-[14px] w-[15%]",
            isProDisplay ? "w-[100px] md:w-[15%]" : "hidden md:block"
          )}
        >
          {Number(vault?.proportions?.allocation) ? (
            <span>
              {formatNumber(
                vault?.proportions?.allocation as number,
                Number(vault?.proportions?.allocation) < 1
                  ? "smallNumbers"
                  : "abbreviate"
              )?.slice(1)}
            </span>
          ) : null}
        </div>
        <div
          className={cn(
            "px-4 text-right text-[14px] w-[30%]",
            isProDisplay ? "w-[200px] md:w-[30%]" : "hidden md:block"
          )}
        >
          {vault?.proportions?.current || vault?.proportions?.target ? (
            <span>
              {Number(vault.proportions?.current).toFixed(2)}% /{" "}
              {Number(vault.proportions?.target).toFixed(2)}%
            </span>
          ) : null}
        </div>
      </a>
      {expandedData ? (
        <div className="flex flex-col items-center justify-between gap-1 px-4 py-2 bg-[#18191c] border-t border-[#23252A] md:hidden">
          {vault.type === VaultTypes.Vault && (
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
          {vault.type === VaultTypes.Vault && (
            <div className="flex items-center justify-between w-full">
              <span className="text-[#909193] text-[14px] leading-5 font-medium">
                Last Hard Work
              </span>
              <TimeDifferenceIndicator unix={vault.lastHardWork} />
            </div>
          )}

          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Allocation
            </span>

            <span className="text-[16px]">
              {formatNumber(
                vault?.proportions?.allocation as number,
                "abbreviate"
              )?.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="text-[#909193] text-[14px] leading-5 font-medium">
              Proportions
            </span>
            {(vault?.proportions?.current || vault?.proportions?.target) && (
              <span className="text-[16px]">
                {Number(vault.proportions?.current).toFixed(2)}% /{" "}
                {Number(vault.proportions?.target).toFixed(2)}%
              </span>
            )}
          </div>

          <a
            href={link}
            className="text-[#816FEA] text-[14px] leading-4 font-medium flex items-center justify-end gap-1 w-full mt-1"
          >
            {vault.type === VaultTypes.Vault ? "View Vault" : "View Meta Vault"}
            <ArrowRightIcon />
          </a>
        </div>
      ) : null}
    </div>
  );
};

export { Vault };
