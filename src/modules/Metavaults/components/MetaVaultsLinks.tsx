import { memo } from "react";

import { useStore } from "@nanostores/react";

import { Skeleton } from "@ui";

import { formatNumber } from "@utils";

import { isWeb3Load } from "@store";

import type { TMetaVault } from "@types";

interface IProps {
  metaVaults: TMetaVault[];
}

const MetaVaultsLinks: React.FC<IProps> = memo(({ metaVaults }) => {
  const $isWeb3Load = useStore(isWeb3Load);

  return (
    <div className="flex items-center flex-wrap gap-3 md:gap-[25px]">
      {metaVaults.map((metaVault) => {
        let TVL = "0";
        if (metaVault.deposited) {
          if (["metaS", "metawS"].includes(metaVault?.symbol)) {
            TVL = `${formatNumber(metaVault.deposited, "abbreviate").slice(1)} S`;
          } else {
            TVL = formatNumber(metaVault.deposited, "abbreviate");
          }
        }

        return (
          <a
            key={metaVault.address}
            href={`/metavaults/metavault/${metaVault.address}`}
            className="rounded-lg bg-[#101012] border border-[#23252A] max-w-[352px]"
          >
            <div className="p-4 md:p-6 flex flex-col gap-6 md:gap-10">
              <img
                className="w-12 h-12 md:w-16 md:h-16 rounded-full"
                src={`/features/${metaVault.symbol}.png`}
                alt="logo"
              />
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[24px] font-semibold">
                    {metaVault.name}
                  </span>

                  <p className="text-[#97979A] text-[16px]">
                    {metaVault?.symbol === "metaUSD"
                      ? "Stablecoins"
                      : metaVault?.symbol?.slice(4)}{" "}
                    deployed across protocols automatically rebalanced for
                    maximum returns on sonic
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                  <div className="flex flex-col items-start text-[16px] py-2 px-3 bg-[#1D1E23] rounded-lg border border-[#35363B] min-w-full md:min-w-[150px]">
                    <span className="text-[#97979A]">TVL</span>
                    {$isWeb3Load ? (
                      <Skeleton height={25} width={70} />
                    ) : (
                      <span className="font-semibold">{TVL}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-start text-[16px] py-2 px-3 bg-[#1D1E23] rounded-lg border border-[#35363B] min-w-full md:min-w-[150px] tooltip cursor-help">
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

                    <div className="visible__tooltip">
                      <div className="flex items-start flex-col gap-2">
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-between">
                            <p className="leading-5 text-[#97979A] font-medium">
                              APR
                            </p>
                            <p className="text-end font-semibold">
                              {formatNumber(metaVault?.APR, "formatAPR")}%
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="leading-5 text-[#97979A] font-medium">
                              Merkl APR
                            </p>
                            <p className="text-end font-semibold">
                              {formatNumber(metaVault?.merklAPR, "formatAPR")}%
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="leading-5 text-[#97979A] font-medium">
                              sGEM1 APR
                            </p>
                            <p className="text-end font-semibold">
                              {formatNumber(metaVault?.gemsAPR, "formatAPR")}%
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="leading-5 text-[#97979A] font-medium">
                              Total APR
                            </p>
                            <p className="text-end font-semibold">
                              {formatNumber(metaVault?.totalAPR, "formatAPR")}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <i></i>
                    </div>
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
