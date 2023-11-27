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
} from "@store";
import { VaultABI, StrategyABI, ERC20ABI, PlatformABI, platform } from "@web3";
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
  const [platformData, setPlatformData] = useState<PlatformData | undefined>(
    undefined
  );
  const _publicClient = usePublicClient();

  useEffect(() => {
    platformVersion();
  }, []);

  const platformVersion = async () => {
    try {
      const v: string = (await readContract(_publicClient, {
        address: platform,
        abi: PlatformABI,
        functionName: "platformVersion",
      })) as string;
      setPlatformData({ platformVersion: v });
    } catch (error) {
      console.error("Error fetching platform version:", error);
    }
  };

  return (
    <div className="dao pt-2">
      <h1 className="text-xxl text-gradient mb-3">Platform</h1>
      <h2>Version: {platformData?.platformVersion}</h2>
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
