import { memo } from "react";

import { formatNumber } from "@utils";

import type { TMetaVault } from "@types";

interface IProps {
  metaVaults: TMetaVault[];
}

const MetaVaultsLinks: React.FC<IProps> = memo(({ metaVaults }) => {
  return (
    <div className="flex items-center flex-wrap gap-3 md:gap-[25px]">
      {metaVaults.map((metaVault) => (
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
                  {metaVault.symbol === "metaUSD"
                    ? "Stablecoins"
                    : metaVault.symbol}{" "}
                  deployed across protocols automatically rebalanced for maximum
                  returns on sonic
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                <div className="flex flex-col items-start text-[16px] py-2 px-3 bg-[#1D1E23] rounded-lg border border-[#35363B] min-w-full md:min-w-[150px]">
                  <span className="text-[#97979A]">TVL</span>
                  <span className="font-semibold">
                    {formatNumber(metaVault.deposited, "abbreviate")}
                  </span>
                </div>
                <div className="flex flex-col items-start text-[16px] py-2 px-3 bg-[#1D1E23] rounded-lg border border-[#35363B] min-w-full md:min-w-[150px]">
                  <span className="text-[#97979A]">APR</span>
                  <span className="font-semibold text-[#48c05c]">
                    {formatNumber(metaVault.APR, "formatAPR")}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
});

export { MetaVaultsLinks };
