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
import { VaultABI, StrategyABI, ERC20ABI } from "@web3";
import tokensJson from "../../stability.tokenlist.json";
import { getTokenData } from "@utils";

function DAO() {
  const $vault = useStore(vaultData);

  useEffect(() => {
    async function getStrategy() {
      if ($vault) {
        let v: `0x${string}` | undefined = (await readContract(_publicClient, {
          address: vaultt,
          abi: VaultABI,
          functionName: "strategy",
        })) as `0x${string}` | undefined;
      }
    }
  }, []);

  return (
    <div className="dao pt-2">
      <h1 className="text-xxl text-gradient mb-3">Platform</h1>
      <div></div>
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
