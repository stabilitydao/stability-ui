import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits, parseUnits } from "viem";
import { readContract } from "viem/actions";
import {
  useAccount,
  usePublicClient,
  useNetwork,
  useWalletClient,
  useFeeData,
} from "wagmi";
import {
  vaultData,
  assets,
  assetsPrices,
  assetsBalances,
  account,
  platformData,
  vaults,
  publicClient,
} from "@store";
import {
  VaultABI,
  StrategyABI,
  ERC20ABI,
  PlatformABI,
  platform,
  VaultManager,
  FactoryABI,
  IVaultManagerABI,
} from "@web3";
import tokensJson from "../../stability.tokenlist.json";
import { getTokenData } from "@utils";

import type {
  TToken,
  TAddress,
  TVaultsAddress,
  TVaultAllowance,
  TVaultInput,
  TVaultBalance,
  PlatformData,
} from "@types";

function DAO() {
  const [_platformData, setPlatformData] = useState<PlatformData | undefined>(
    undefined
  );
  const $publicClient = useStore(publicClient);
  const $platformData = useStore(platformData);
  console.log(platform);
  console.log($platformData);

  useEffect(() => {
    fetchData();
  }, [$platformData]);

  const fetchData = async () => {
    if ($publicClient && $platformData) {
      const platformData: PlatformData[] = [];
      try {
        const platformVersion: string = (await $publicClient.readContract({
          address: platform,
          abi: PlatformABI,
          functionName: "platformVersion",
        })) as string;
        console.log(platformVersion);

        const deployedVaults = await $publicClient.readContract({
          address: VaultManager,
          functionName: "vaults",
          abi: IVaultManagerABI,
        });
        console.log(deployedVaults);

        const deployedVaultss = await $publicClient.readContract({
          address: $platformData.factory,
          functionName: "deployedVaults",
          abi: FactoryABI,
        });

        console.log(deployedVaultss);

        const whatToBuild = await $publicClient.readContract({
          address: $platformData.factory,
          functionName: "whatToBuild",
          abi: FactoryABI,
        });

        console.log(whatToBuild);
      } catch (error) {
        console.error("Error fetching platform data:", error);
      }
    }
  };

  return (
    <div className="dao pt-2">
      <h1 className="text-xxl text-gradient mb-3">Platform</h1>
      <h2>Version: {_platformData?.platformVersion}</h2>
      <br />

      <h1 className="text-xxl text-gradient mb-3">Tokenomics</h1>
      <div></div>
      <br />

      <h1 className="text-xxl text-gradient mb-3">Governance</h1>
      <div></div>
      <br />

      <h1 className="text-xxl text-gradient mb-3">Team</h1>
      <div></div>
      <br />
    </div>
  );
}

export { DAO };
