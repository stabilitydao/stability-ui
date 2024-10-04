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
import { YieldBar } from "./components/YieldBar";
import { LiquidityPool } from "./components/LiquidityPool";
import { UnderlyingALM } from "./components/UnderlyingALM";

import { WagmiLayout } from "@layouts";
import { Toast, Loader, ErrorMessage, Breadcrumbs } from "@ui";

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

  useEffect(() => {
    if ($vaults && vault) {
      setLocalVault($vaults[network][vault.toLowerCase()]);
    }
  }, [$vaults, $vaultData]);

  if ($error.state && $error.type === "API") {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <ErrorMessage type="API" />
      </div>
    );
  }
  return vault && localVault ? (
    <WagmiLayout>
      <main className="w-full mx-auto">
        <Breadcrumbs links={["Vaults", localVault.symbol]} />
        <VaultBar vault={localVault} />
        <div className="flex items-start gap-5 mt-6 flex-col-reverse md:flex-row">
          <div className="w-full md:w-1/2 lg:w-3/5 ">
            <InfoBar network={network} vault={localVault} />

            <HistoricalRate
              network={network}
              address={vault.toLowerCase() as TAddress}
              vaultStrategy={localVault.strategy}
            />

            <Toast network={network} />
          </div>
          <div className="w-full md:w-1/2 lg:w-2/5">
            <InvestForm network={network} vault={localVault} />
          </div>
        </div>

        <div className="my-8 flex flex-col lg:flex-row items-start justify-start gap-5 w-full">
          <div className="w-full lg:w-1/2">
            <YieldBar vault={localVault} />
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

        <div className="my-8 flex flex-col lg:flex-row gap-5 w-full">
          <div className="w-full lg:w-1/2">
            {localVault.assets.length > 1 &&
              localVault?.pool &&
              localVault?.strategy != "Curve Convex Farm" && (
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
      <ErrorMessage type="WEB3" />
    </WagmiLayout>
  ) : (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Loader width="100" height="100" />
    </div>
  );
};
export { Vault };
