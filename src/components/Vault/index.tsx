import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";

import { VaultBar } from "./VaultBar";
import { VaultActionForm } from "./VaultActionForm";
import { StatisticBar } from "./StatisticBar";
import { Strategy } from "./Strategy";
import { Assets } from "./Assets";
import { UserBar } from "./UserBar";
//import { Chart } from "./Chart";

import { vaultData, vaults, vaultAssets } from "@store";

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
    <main className="w-full mx-auto">
      <VaultBar vault={localVault} />
      <div className="flex items-start gap-5 mt-6 flex-col-reverse md:flex-row">
        <div className="w-full md:w-1/2 lg:w-3/5 ">
          <StatisticBar vault={localVault} />

          {/* <Chart /> */}

          <Strategy vault={localVault} />

          <Assets assets={localVault?.assets} />
        </div>
        <div className="w-full md:w-1/2 lg:w-2/5">
          <UserBar vault={localVault} />

          <VaultActionForm vault={localVault} />
        </div>
      </div>
    </main>
  ) : (
    <h1>Loading Vault..</h1>
  );
};
export { Vault };
