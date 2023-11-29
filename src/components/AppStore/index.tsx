import type React from "react";
import { useEffect } from "react";
// import { parseUnits } from "viem";
import { readContract } from "viem/actions";
import {
  useAccount,
  usePublicClient,
  useNetwork,
  // useWalletClient,
} from "wagmi";
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
  isVaultsLoaded,
  balances,
} from "@store";
import {
  platform,
  PlatformABI,
  IVaultManagerABI,
  ERC20MetadataUpgradeableABI,
} from "@web3";

import { addAssetsPrice } from "@utils";

import type { TAddress } from "@types";

const AppStore = (props: React.PropsWithChildren) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const _publicClient = usePublicClient();

  const getData = async () => {
    if (address && chain?.id) {
      const contractData = await readContract(_publicClient, {
        address: platform,
        abi: PlatformABI,
        functionName: "getData",
      });

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

      /// debug visual
      // if (contractVaults?.length) {
      //   console.log('contractVaults', contractVaults)
      //   contractVaults[5][0] = parseUnits('1.09343432', 18)
      //   contractVaults[6][0] = parseUnits('814658.09343432', 18)
      //   contractVaults[7][0] = parseUnits('24.682', 16)
      //   contractVaults[8][0] = parseUnits('16.157', 16)
      // }
      ///////////////////////

      const vaultInfoes: any[] = await Promise.all(
        contractVaults[0].map(async (vault: string) => {
          const response: any = await readContract(_publicClient, {
            address: contractBalance[6][1],
            abi: IVaultManagerABI,
            functionName: "vaultInfo",
            args: [vault as TAddress],
          });
          return response;
        })
      );

      /// debug visual
      // if (vaultInfoes?.length) {
      //   console.log('vaultInfo', vaultInfoes[0])
      //   vaultInfoes[0][3] = [
      //     '0x45A3A657b834699f5cC902e796c547F826703b79',
      //     '0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4',
      //   ]
      //   vaultInfoes[0][4] = [
      //     parseUnits('9.6572445545', 16),
      //     parseUnits('3.5355231352413', 16)
      //   ]
      //   vaultInfoes[0][5] = BigInt(1700574478)
      //   console.log('vaultInfo test', vaultInfoes[0])
      // }
      ///////////////////////

      vaultInfoes.forEach(async (vaultInfo, index) => {
        if (vaultInfo[3]?.length) {
          for (let i = 0; i < vaultInfo[3]?.length; i++) {
            const assetWithApr = vaultInfo[3][i];
            const symbol = await readContract(_publicClient, {
              address: assetWithApr,
              abi: ERC20MetadataUpgradeableABI,
              functionName: "symbol",
            });
            vaultInfoes[index][3][i] = symbol;
          }
        }
      });
      isVaultsLoaded.set(true);
      if (contractBalance) {
        balances.set(contractBalance);
      }
      if (contractVaults) {
        vaults.set(contractVaults);
      }
      if (vaultInfoes) {
        vaultAssets.set(vaultInfoes);
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
