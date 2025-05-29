import { memo } from "react";

import { formatNumber } from "@utils";

interface IProps {
  metaVaults: any; //todo type
}

const MetaVaultsLinks: React.FC<IProps> = memo(({ metaVaults }) => {
  return (
    <div className="flex items-center flex-wrap gap-[25px]">
      {metaVaults.map((metaVault) => (
        <a
          key={metaVault.address}
          href={`/metavaults/metavault/${metaVault.address}`}
          className="rounded-lg bg-[#101012] border border-[#23252A] max-w-[352px]"
        >
          <div className="p-6 flex flex-col gap-10">
            <img
              className="w-16 h-16 rounded-full"
              src={`/features/${metaVault.symbol}.png`}
              alt="logo"
            />
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[24px] font-semibold">
                  {metaVault.name}
                </span>
                <p className="text-[#97979A] text-[16px]">
                  {metaVault.symbol} stablecoins deployed across integrated
                  lending protocols automatically rebalanced on Sonic to
                  maximise returns
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[16px]">
                  <span className="text-[#97979A]">TVL</span>
                  <span className="font-semibold">
                    {formatNumber(metaVault.deposited, "abbreviate")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[16px]">
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
