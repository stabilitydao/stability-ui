import type React from "react";
import { useEffect } from "react";
import { formatUnits } from "viem";
import axios from "axios";

import { useStore } from "@nanostores/react";

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
  tokens,
  connected,
  apiData,
  lastTx,
  grtVaults,
} from "@store";
import {
  platform,
  PlatformABI,
  IVaultManagerABI,
  ERC20MetadataUpgradeableABI,
} from "@web3";

import {
  addAssetsPrice,
  formatFromBigInt,
  calculateAPY,
  getStrategyInfo,
} from "@utils";

import { GRAPH_ENDPOINT, GRAPH_VAULTS, STABILITY_API } from "@constants";

import type { TAddress } from "@types";

const AppStore = (props: React.PropsWithChildren) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const _publicClient = usePublicClient();
  const $lastTx = useStore(lastTx);

  let stabilityAPIData: any;
  const getData = async () => {
    if (address && chain?.id) {
      const contractData = await readContract(_publicClient, {
        address: platform,
        abi: PlatformABI,
        functionName: "getData",
      });
      console.log("getData", contractData);

      if (contractData[1]) {
        tokens.set(contractData[1] as TAddress[]);
      }

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
          zap: contractData[0][7],
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
    //else

    const graphResponse = await axios.post(GRAPH_ENDPOINT, {
      query: GRAPH_VAULTS,
    });

    // assets
    //let assets;
    // if ($vaultAssets.length) {
    //   const token1 = getTokenData($vaultAssets[index][1][0]);
    //   const token2 = getTokenData($vaultAssets[index][1][1]);

    //   if (token1 && token2) {
    //     const token1Extended = TOKENS_ASSETS.find((tokenAsset) =>
    //       tokenAsset.addresses.includes(token1.address)
    //     );
    //     const token2Extended = TOKENS_ASSETS.find((tokenAsset) =>
    //       tokenAsset.addresses.includes(token2.address)
    //     );

    //     assets = [
    //       {
    //         logo: token1?.logoURI,
    //         symbol: token1?.symbol,
    //         name: token1?.name,
    //         color: token1Extended?.color,
    //       },
    //       {
    //         logo: token2?.logoURI,
    //         symbol: token2?.symbol,
    //         name: token2?.name,
    //         color: token2Extended?.color,
    //       },
    //     ];
    //   }
    // }
    //

    const graphVaults = graphResponse.data.data.vaultEntities.reduce(
      (vaults: any, vault: any) => {
        //APY
        const data =
          stabilityAPIData?.underlyings?.["137"]?.[
            vault.underlying.toLowerCase()
          ];

        let monthlyApr = 0;
        if (data) {
          monthlyApr = data.apr.daily.feeApr;
        }
        /////
        const APR = (
          formatFromBigInt(String(vault.apr), 3, "withDecimals") +
          Number(monthlyApr) * 100
        ).toFixed(2);

        const APY = calculateAPY(APR).toFixed(2);
        //

        //AssetsProportions
        const assetsProportions = vault.assetsProportions
          ? vault.assetsProportions.map((proportion: any) =>
              Math.round(Number(formatUnits(proportion, 16)))
            )
          : [];

        vaults[vault.id] = {
          address: vault.id,
          name: vault.name,
          apr: vault.apr,
          apy: APY,
          //todo assets
          assetsProportions,
          //todo balance
          monthlyUnderlyingApr: monthlyApr,
          shareprice: vault.sharePrice,
          strategy: vault.strategyId,
          strategyApr: vault.apr,
          strategyInfo: getStrategyInfo(vault.symbol),
          //todo strategySpecific
          symbol: vault.symbol,
          tvl: vault.tvl,
          type: vault.vaultType,
        };
        return vaults;
      },
      {}
    );

    grtVaults.set(graphVaults);
    console.log("graph", graphVaults);
  };
  const getDataFromStabilityAPI = async () => {
    try {
      const response = await axios.get(STABILITY_API);
      stabilityAPIData = response.data;
      apiData.set(stabilityAPIData);
    } catch (error) {
      console.log("API ERROR:", error);
    }
  };

  useEffect(() => {
    account.set(address);
    publicClient.set(_publicClient);
    network.set(chain?.name);
    connected.set(isConnected);
    getDataFromStabilityAPI();
    getData();
  }, [address, chain?.id, isConnected, $lastTx]);

  return <>{props.children}</>;
};

export { AppStore };
