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
import { Toast, FullPageLoader, ErrorMessage } from "@ui";

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
      <div className="w-full mx-auto font-manrope flex gap-6">
        <div>
          <VaultBar vault={localVault} />
          <div className="flex items-center justigy-center w-full flex-col xl:flex-row">
            <InfoBar network={network} vault={localVault} />

            <Toast network={network} />

            <div className="flex flex-col gap-5 xl:hidden my-5 w-full">
              <InvestForm network={network} vault={localVault} />
              <Contracts vault={localVault} network={network} />
            </div>
          </div>
          <HistoricalRate
            network={network}
            address={vault.toLowerCase() as TAddress}
            created={Number(localVault.created)}
            vaultStrategy={localVault.strategy}
            lastHardWork={Number(localVault.lastHardWork)}
          />

          <YieldRates vault={localVault} />

          <div className="flex md:flex-nowrap flex-wrap gap-6 w-full my-6">
            <div className="w-full xl:w-1/2">
              <VaultInfo network={network} vault={localVault} />
            </div>
            <div className="w-full xl:w-1/2">
              <Strategy network={network} vault={localVault} />
            </div>
          </div>
          {isLeverageLending && <LeverageLending vault={localVault} />}
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
        </div>

        <div className="hidden xl:flex flex-col gap-5">
          <InvestForm network={network} vault={localVault} />
          <Contracts vault={localVault} network={network} />
        </div>
      </div>
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
