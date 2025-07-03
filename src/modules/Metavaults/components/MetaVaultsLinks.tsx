import { memo } from "react";

import { useStore } from "@nanostores/react";

import { Skeleton } from "@ui";

import { formatNumber, cn } from "@utils";

import { isWeb3Load } from "@store";

import type { Dispatch, SetStateAction } from "react";

import type { TMetaVault } from "@types";

import type { TModal } from "../";

interface IProps {
  metaVaults: TMetaVault[];
  setModal: Dispatch<SetStateAction<TModal>>;
}

const MetaVaultsLinks: React.FC<IProps> = memo(({ metaVaults, setModal }) => {
  const $isWeb3Load = useStore(isWeb3Load);

  return (
    <div className="flex items-center flex-wrap gap-3 md:gap-[25px]">
      {metaVaults.map((metaVault) => {
        let TVL = "0";
        if (metaVault.deposited) {
          if (["metaS", "metawS"].includes(metaVault?.symbol)) {
            TVL = `${String(formatNumber(metaVault.deposited, "abbreviate")).slice(1)} S`;
          } else {
            TVL = formatNumber(metaVault.deposited, "abbreviate") as string;
          }
        }

        return (
          <a
            key={metaVault.address}
            href={`/metavaults/metavault/${metaVault.address.toLowerCase()}`}
            className={cn(
              "rounded-lg border border-[#23252A] max-w-[352px]",
              metaVault?.symbol === "metaUSD" ? "metaUSD" : "metaS"
            )}
          >
            <div className="p-4 md:p-6 flex flex-col">
              <img
                className="w-12 h-12 md:w-16 md:h-16 rounded-full mb-6 md:mb-10"
                src={`/features/${metaVault.symbol}.png`}
                alt="logo"
              />
              <div className="flex flex-col gap-6 z-10">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[24px] font-semibold">
                      {metaVault.name}
                    </span>
                    {!!metaVault.sonicPoints && (
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

                          <span className="font-semibold text-[12px]">
                            AP x{metaVault.sonicPoints}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[#97979A] text-[16px]">
                    {metaVault?.symbol === "metaUSD"
                      ? "Stablecoins"
                      : metaVault?.symbol?.slice(4)}{" "}
                    deployed across protocols automatically rebalanced for
                    maximum returns on sonic
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap md:flex-nowrap">
                  <div className="flex flex-col items-start text-[16px] py-2 px-3 bg-[#1D1E23] rounded-lg border border-[#35363B] min-w-full md:min-w-[48%]">
                    <span className="text-[#97979A]">TVL</span>
                    {$isWeb3Load ? (
                      <Skeleton height={25} width={70} />
                    ) : (
                      <span className="font-semibold">{TVL}</span>
                    )}
                  </div>
                  <div
                    className="flex flex-col items-start text-[16px] py-2 px-3 bg-[#1D1E23] rounded-lg border border-[#35363B] min-w-full md:min-w-[48%] cursor-help"
                    onClick={(e) => {
                      e.preventDefault();
                      setModal({
                        APR: metaVault?.APR24h,
                        merklAPR: metaVault?.merklAPR,
                        gemsAPR: metaVault?.gemsAPR,
                        totalAPR: metaVault?.totalAPR,
                        isOpen: true,
                      });
                    }}
                  >
                    <p className="flex items-center justify-between w-full">
                      <span className="text-[#97979A]">TOTAL APR</span>
                      <img src="/icons/stars.svg" alt="stars" />
                    </p>
                    {$isWeb3Load ? (
                      <Skeleton height={25} width={70} />
                    ) : (
                      <span className="font-semibold text-[#48c05c]">
                        {formatNumber(metaVault?.totalAPR || 0, "formatAPR")}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
});

export { MetaVaultsLinks };
