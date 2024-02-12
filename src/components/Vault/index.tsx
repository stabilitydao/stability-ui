import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";

import { WagmiConfig } from "wagmi";

import { VaultBar } from "./VaultBar";
import { VaultActionForm } from "./VaultActionForm";
import { StatisticBar } from "./StatisticBar";
import { Strategy } from "./Strategy";
import { Assets } from "./Assets";
import { UserBar } from "./UserBar";
import { HistoricalRate } from "./HistoricalRate";
import { Toast, Loader } from "@components";

import { vaultData, vaults, vaultAssets } from "@store";

import { wagmiConfig } from "@web3";

import type { TAddress } from "@types";

interface IProps {
  vault: TAddress;
}

const Vault: React.FC<IProps> = ({ vault }) => {
  const $vaultData = useStore(vaultData);
  const $vaultAssets: any = useStore(vaultAssets);
  const $vaults = useStore(vaults);

  const [localVault, setLocalVault] = useState<any>();

  useEffect(() => {
    if ($vaults && vault) {
      setLocalVault($vaults[vault.toLowerCase()]);
    }
  }, [$vaults, $vaultData, $vaultAssets]);
  return vault && localVault ? (
    <WagmiConfig config={wagmiConfig}>
      <main className="w-full mx-auto">
        <VaultBar vault={localVault} />
        <div className="flex items-start gap-5 mt-6 flex-col-reverse md:flex-row">
          <div className="w-full md:w-1/2 lg:w-3/5 ">
            <StatisticBar vault={localVault} />

            <HistoricalRate address={vault.toLowerCase() as TAddress} />

            <Strategy vault={localVault} />

            <Assets assets={localVault?.assets} />
            <Toast />
          </div>
          <div className="w-full md:w-1/2 lg:w-2/5">
            <UserBar vault={localVault} />

            <VaultActionForm vault={localVault} />
          </div>
        </div>
      </main>
    </WagmiConfig>
  ) : (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <Loader width="100" height="100" color="#ccb3f3" />
    </div>
  );
};
export { Vault };
