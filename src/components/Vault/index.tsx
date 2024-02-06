import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";

import { WagmiConfig } from "wagmi";

import { VaultBar } from "./VaultBar";
import { VaultActionForm } from "./VaultActionForm";
import { StatisticBar } from "./StatisticBar";
import { Strategy } from "./Strategy";
import { Assets } from "./Assets";
import { UserBar } from "./UserBar";
import { Toast } from "@components";
//import { Chart } from "./Chart";

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

            {/* <Chart /> */}

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
    <h1>Loading Vault...</h1>
  );
};
export { Vault };
