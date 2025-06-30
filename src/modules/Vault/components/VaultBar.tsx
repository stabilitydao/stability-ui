import { memo } from "react";

import { VAULTS_WITH_NAME } from "@constants";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const VaultBar: React.FC<IProps> = memo(({ vault }) => {
  return (
    <div className="flex flex-col items-start gap-4 w-full lg:justify-between flex-wrap font-manrope">
      <h1 data-testid="vaultSymbol" className="page-title__font">
        {VAULTS_WITH_NAME[vault.address] || vault.name}
      </h1>
      {!!vault?.risk?.isRektStrategy && (
        <div className="text-[12px] lg:text-[14px] border border-[#b75457] text-[#f2aeae] bg-[#3f1f24] rounded-md">
          <p className="px-2 py-3">
            Attention! This is Rekt vault. Investing funds in such a vault
            results in regular losses, potentially causing a rapid decline in
            the USD value of the deposit. These outcomes can be attributed to
            various factors and their overlap, particularly the volatility of
            asset pairs, the peculiarities of AMMs, ALMs, strategy, and
            liquidity supply parameters, as well as fluctuating losses and
            income distribution. The vault operates with the goal of tracking
            strategy losses, protocols utilized in the strategy are not at
            fault.
          </p>
        </div>
      )}
    </div>
  );
});

export { VaultBar };
