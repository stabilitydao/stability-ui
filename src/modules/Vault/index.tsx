import { useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";

import { VaultBar } from "./components/VaultBar";
import { InvestForm } from "./components/InvestForm";
import { Strategy } from "./components/Strategy";
import { Assets } from "./components/Assets";
import { InfoBar } from "./components/InfoBar";
import { HistoricalRate } from "./components/HistoricalRate";
import { VaultInfo } from "./components/VaultInfo";
import { Contracts } from "./components/Contracts";
import { YieldRates } from "./components/YieldRates";
import { LiquidityPool } from "./components/LiquidityPool";
import { UnderlyingALM } from "./components/UnderlyingALM";
import { LeverageLending } from "./components/LeverageLending";

import { WagmiLayout } from "@layouts";
import { Toast, FullPageLoader, ErrorMessage, Breadcrumbs } from "@ui";

import { vaultData, vaults, error } from "@store";

import type { TAddress, TVault } from "@types";

interface IProps {
  network: string;
  vault: TAddress;
}

const Vault: React.FC<IProps> = ({ network, vault }) => {
  const $vaultData = useStore(vaultData);
  const $vaults = useStore(vaults);

  const $error = useStore(error);

  const [localVault, setLocalVault] = useState<TVault>();

  const isALM = useMemo(
    () =>
      localVault?.alm &&
      ["Ichi", "DefiEdge", "Gamma"].includes(localVault.alm.protocol),
    [localVault]
  );

  const isLeverageLending = useMemo(
    () => !!localVault?.leverageLending,
    [localVault]
  );

  useEffect(() => {
    if ($vaults && vault) {
      setLocalVault($vaults[network][vault.toLowerCase()]);
    }
  }, [$vaults, $vaultData]);

  return vault && localVault ? (
    <WagmiLayout>
      <main className="w-full xl:min-w-[1200px] mx-auto font-manrope">
        <Breadcrumbs links={["Vaults", localVault.symbol]} />
        <VaultBar vault={localVault} />
        <div className="flex items-center lg:items-start justify-between gap-3 mt-6 flex-col lg:flex-row">
          <div className="w-full md:w-1/2 lg:w-3/5 md:min-w-[600px] lg:min-w-0">
            <InfoBar network={network} vault={localVault} />

            <Toast network={network} />
          </div>
          <InvestForm network={network} vault={localVault} />
        </div>

        <HistoricalRate
          network={network}
          address={vault.toLowerCase() as TAddress}
          created={Number(localVault.created)}
          vaultStrategy={localVault.strategy}
          lastHardWork={Number(localVault.lastHardWork)}
        />

        <div className="my-8 flex flex-col lg:flex-row items-start justify-start gap-5 w-full">
          <div className="w-full lg:w-1/2">
            <YieldRates vault={localVault} />
          </div>
          <div className="w-full lg:w-1/2">
            <Contracts vault={localVault} network={network} />
          </div>
        </div>
        <div className="my-8 flex flex-col lg:flex-row gap-5 w-full">
          <div className="w-full lg:w-1/2">
            <VaultInfo network={network} vault={localVault} />
          </div>
          <div className="w-full lg:w-1/2">
            <Strategy network={network} vault={localVault} />
          </div>
        </div>
        {isLeverageLending && (
          <LeverageLending data={localVault?.leverageLending} />
        )}

        <div className="my-8 flex flex-col lg:flex-row gap-5 w-full">
          <div className="w-full lg:w-1/2">
            {localVault.assets.length > 1 && localVault?.pool?.tvl && (
              <LiquidityPool network={network} vault={localVault} />
            )}
          </div>
          <div className="w-full lg:w-1/2">
            {isALM && <UnderlyingALM network={network} vault={localVault} />}
          </div>
        </div>
        <Assets
          network={network}
          assets={localVault?.assets}
          created={localVault.created}
          pricesOnCreation={localVault.assetsPricesOnCreation}
          strategy={localVault?.strategyAddress}
        />
      </main>
    </WagmiLayout>
  ) : (
    <div>
      <ErrorMessage type={$error.type} />{" "}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <FullPageLoader />
      </div>
    </div>
  );
};
export { Vault };
