import type React from "react";
import { useEffect } from "react";
import { readContract } from "viem/actions";
import {
  useAccount,
  usePublicClient,
  useNetwork,
  // useWalletClient,
} from "wagmi";
import { addAssetsPrice } from "../Vault";
import {
  account,
  network,
  platformData,
  publicClient,
  userBalance,
  addAssetBalance,
  addVaultData,
  vaults,
  vaultAssets,
} from "@store";
import { platform, PlatformABI, IVaultManagerABI } from "@web3";

const AppStore = (props: React.PropsWithChildren) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const _publicClient = usePublicClient();

  const getData = async () => {
    if (address && chain?.id) {
      const contractData = await readContract(_publicClient, {
        address: platform,
        abi: PlatformABI,
        functionName: "getData",
      });
      console.log("getData", contractData);

      if (contractData && Array.isArray(contractData)) {
        const buildingPrices: { [vaultType: string]: bigint } = {};
        for (let i = 0; i < contractData[1].length; i++) {
          buildingPrices[contractData[3][i]] = contractData[5][i]; //buildingPrices[vaultType] = buildingPrice
        }
        platformData.set({
          platform,
          factory: contractData[0][0],
          buildingPermitToken: contractData[0][3],
          buildingPayPerVaultToken: contractData[0][4],
          buildingPrices,
        });
      }

      const contractBalance: any = await readContract(_publicClient, {
        address: platform,
        abi: PlatformABI,
        functionName: "getBalance",
        args: [address],
      });

      console.log("Platform.getBalance", contractBalance);
      if (contractBalance?.length) {
        const buildingPayPerVaultTokenBalance: bigint = contractBalance[8];
        const erc20Balance: { [token: string]: bigint } = {};
        const erc721Balance: { [token: string]: bigint } = {};
        console.log(contractBalance);
        //function -> .set vault/
        addVaultData(contractBalance);
        addAssetsPrice(contractBalance);
        addAssetBalance(contractBalance);

        //

        for (let i = 0; i < contractBalance[1].length; i++) {
          erc20Balance[contractBalance[1][i]] = contractBalance[3][i];
        }

        for (let i = 0; i < contractBalance[6].length; i++) {
          erc721Balance[contractBalance[6][i]] = contractBalance[7][i];
        }

        userBalance.set({
          buildingPayPerVaultTokenBalance,
          erc20Balance,
          erc721Balance,
        });
      }

      const contractVaults: any = await readContract(_publicClient, {
        address: contractBalance[6][1],
        abi: IVaultManagerABI,
        functionName: "vaults",
      });
      const assets: any[] = await Promise.all(
        contractVaults[0].map(async (vault: string) => {
          const response: any = await readContract(_publicClient, {
            address: contractBalance[6][1],
            abi: IVaultManagerABI,
            functionName: "vaultInfo",
            args: [vault],
          });
          return response[1];
        })
      );
      if (contractVaults) {
        vaults.set(contractVaults);
      }
      if (assets) {
        vaultAssets.set(assets);
      }
    }
  };

  useEffect(() => {
    account.set(address);
    publicClient.set(_publicClient);
    network.set(chain?.name);
    getData();
  }, [address, chain?.id]);

  return <>{props.children}</>;
};

export { AppStore };
