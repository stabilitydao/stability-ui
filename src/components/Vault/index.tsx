import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";

import { VaultBar } from "./VaultBar";
import { VaultActionForm } from "./VaultActionForm";
import { StatisticBar } from "./StatisticBar";
import { Strategy } from "./Strategy";
import { Assets } from "./Assets";
import { UserBar } from "./UserBar";
import { HistoricalRate } from "./HistoricalRate";
import { VaultInfo } from "./VaultInfo";

import { WagmiLayout } from "@layouts";
import { Toast, Loader, ErrorMessage } from "@components";

import { vaultData, vaults, error } from "@store";

import type { TAddress } from "@types";

interface IProps {
  vault: TAddress;
}

const Vault: React.FC<IProps> = ({ vault }) => {
  const $vaultData = useStore(vaultData);
  const $vaults = useStore(vaults);

  const $error = useStore(error);

  const [localVault, setLocalVault] = useState<any>();

  useEffect(() => {
    if ($vaults && vault) {
      setLocalVault($vaults[vault.toLowerCase()]);
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
        <VaultBar vault={localVault} />
        <div className="flex items-start gap-5 mt-6 flex-col-reverse md:flex-row">
          <div className="w-full md:w-1/2 lg:w-3/5 ">
            <StatisticBar vault={localVault} />

            <UserBar vault={localVault} />

            <HistoricalRate
              address={vault.toLowerCase() as TAddress}
              vaultStrategy={localVault.strategy}
            />
            <Toast />
          </div>
          <div className="w-full md:w-1/2 lg:w-2/5">
            <VaultActionForm vault={localVault} />
          </div>
        </div>
        <div className="mt-5">
          <VaultInfo vault={localVault} />
        </div>

        <Strategy vault={localVault} />

        <Assets
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
