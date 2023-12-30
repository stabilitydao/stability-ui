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
  vaults,
  vaultAssets,
  isVaultsLoaded,
  balances,
  tokens,
  connected,
  apiData,
  lastTx,
} from "@store";
import {
  platform,
  PlatformABI,
  IVaultManagerABI,
  ERC20MetadataUpgradeableABI,
  VaultABI,
  StrategyABI,
} from "@web3";

import {
  addAssetsPrice,
  formatFromBigInt,
  calculateAPY,
  getStrategyInfo,
  getTokenData,
  addAssetsBalance,
  addVaultData,
} from "@utils";

import {
  GRAPH_ENDPOINT,
  GRAPH_QUERY,
  STABILITY_API,
  TOKENS_ASSETS,
} from "@constants";

import type { TAddress } from "@types";

const AppStore = (props: React.PropsWithChildren) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const _publicClient = usePublicClient();
  const $lastTx = useStore(lastTx);

  let stabilityAPIData: any;
  const getData = async () => {
    const graphResponse = await axios.post(GRAPH_ENDPOINT, {
      query: GRAPH_QUERY,
    });
    if (isConnected) {
      const contractData = await readContract(_publicClient, {
        address: platform,
        abi: PlatformABI,
        functionName: "getData",
      });
      console.log("getData", contractData);
      if (contractData[1]) {
        tokens.set(
          contractData[1].map((address) => address.toLowerCase()) as TAddress[]
        );
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
        args: [address as TAddress],
      });

      console.log("getBalance", contractBalance);
      if (contractBalance?.length) {
        const buildingPayPerVaultTokenBalance: bigint = contractBalance[8];
        const erc20Balance: { [token: string]: bigint } = {};
        const erc721Balance: { [token: string]: bigint } = {};
        //function -> .set vault/
        addVaultData(contractBalance);
        addAssetsPrice(contractBalance);
        addAssetsBalance(contractBalance);
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

      if (contractBalance) {
        balances.set(contractBalance);
      }
      if (vaultInfoes) {
        vaultAssets.set(vaultInfoes);
      }
      if (contractVaults) {
        const vaultsPromise = await Promise.all(
          contractVaults[0].map(async (vault: any, index: number) => {
            const assetsWithApr: string[] = [];
            const assetsAprs: string[] = [];
            let monthlyAPR = 0;

            const graphVault = graphResponse.data.data.vaultEntities.find(
              (obj: any) => obj.id === vault.toLowerCase()
            );

            const assetsProportions = graphVault.assetsProportions
              ? graphVault.assetsProportions.map((proportion: bigint) =>
                  Math.round(Number(formatUnits(proportion, 16)))
                )
              : [];

            const APIData =
              stabilityAPIData?.underlyings?.["137"]?.[
                graphVault.underlying.toLowerCase()
              ];

            if (APIData?.apr?.daily?.feeApr) {
              monthlyAPR = APIData.apr.daily.feeApr;
              assetsWithApr.push("Pool swap fees");
              assetsAprs.push((Number(monthlyAPR) * 100).toFixed(2));
            }

            const APR = (
              formatFromBigInt(
                String(contractVaults[7][index]),
                3,
                "withDecimals"
              ) +
              Number(monthlyAPR) * 100
            ).toFixed(2);

            const APY = calculateAPY(APR).toFixed(2);
            let assets;
            if (vaultInfoes.length) {
              const token1 = getTokenData(vaultInfoes[index][1][0]);
              const token2 = getTokenData(vaultInfoes[index][1][1]);
              if (token1 && token2) {
                const token1Extended = TOKENS_ASSETS.find((tokenAsset) =>
                  tokenAsset.addresses.includes(token1.address)
                );
                const token2Extended = TOKENS_ASSETS.find((tokenAsset) =>
                  tokenAsset.addresses.includes(token2.address)
                );

                assets = [
                  {
                    address: token1?.address.toLowerCase(),
                    logo: token1?.logoURI,
                    symbol: token1?.symbol,
                    name: token1?.name,
                    color: token1Extended?.color,
                  },
                  {
                    address: token2?.address.toLowerCase(),
                    logo: token2?.logoURI,
                    symbol: token2?.symbol,
                    name: token2?.name,
                    color: token2Extended?.color,
                  },
                ];
              }
            }
            return {
              [vault.toLowerCase()]: {
                address: vault.toLowerCase(),
                name: contractVaults[1][index],
                symbol: contractVaults[2][index],
                type: contractVaults[3][index],
                strategy: contractVaults[4][index],
                shareprice: String(contractVaults[5][index]),
                tvl: String(contractVaults[6][index]),
                apr: String(APR),
                apy: APY,
                strategyApr: contractVaults[8][index],
                strategySpecific: contractVaults[9][index],
                balance: contractBalance[5][index],
                lastHardWork: vaultInfoes[index][5],
                daily: (Number(APR) / 365).toFixed(2),
                monthlyUnderlyingApr: monthlyAPR,
                assets,
                assetsProportions,
                assetsWithApr,
                assetsAprs,
                strategyInfo: getStrategyInfo(contractVaults[2][index]),
                underlying: graphVault.underlying,
                strategyAddress: graphVault.strategy,
              },
            };
          })
        );
        const vaultsObject = vaultsPromise.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {}
        );
        vaults.set(vaultsObject);
      }
      isVaultsLoaded.set(true);
    } else {
      const graphVaults = graphResponse.data.data.vaultEntities.reduce(
        (vaults: any, vault: any) => {
          //APY
          const APIData =
            stabilityAPIData?.underlyings?.["137"]?.[
              vault.underlying.toLowerCase()
            ];

          let monthlyAPR = 0;
          const assetsWithApr: string[] = [];
          const assetsAprs: string[] = [];

          if (APIData?.apr?.daily?.feeApr) {
            monthlyAPR = APIData.apr.daily.feeApr;
            assetsWithApr.push("Pool swap fees");
            assetsAprs.push((Number(monthlyAPR) * 100).toFixed(2));
          }
          /////
          const APR = (
            formatFromBigInt(String(vault.apr), 3, "withDecimals") +
            Number(monthlyAPR) * 100
          ).toFixed(2);

          const APY = calculateAPY(APR).toFixed(2);
          //

          //AssetsProportions
          const assetsProportions = vault.assetsProportions
            ? vault.assetsProportions.map((proportion: any) =>
                Math.round(Number(formatUnits(proportion, 16)))
              )
            : [];
          //

          let assets;

          if (vault.strategyAssets.length) {
            const token1 = getTokenData(vault.strategyAssets[0]);
            const token2 = getTokenData(vault.strategyAssets[1]);

            if (token1 && token2) {
              const token1Extended = TOKENS_ASSETS.find((tokenAsset) =>
                tokenAsset.addresses.includes(token1.address)
              );
              const token2Extended = TOKENS_ASSETS.find((tokenAsset) =>
                tokenAsset.addresses.includes(token2.address)
              );

              assets = [
                {
                  address: token1?.address,
                  logo: token1?.logoURI,
                  symbol: token1?.symbol,
                  name: token1?.name,
                  color: token1Extended?.color,
                },
                {
                  address: token2?.address,
                  logo: token2?.logoURI,
                  symbol: token2?.symbol,
                  name: token2?.name,
                  color: token2Extended?.color,
                },
              ];
            }
          }
          //
          vaults[vault.id] = {
            address: vault.id,
            name: vault.name,
            symbol: vault.symbol,
            type: vault.vaultType,
            strategy: vault.strategyId,
            shareprice: vault.sharePrice,
            tvl: vault.tvl,
            apr: String(APR),
            apy: APY,
            strategyApr: vault.apr, // todo in strategy
            strategySpecific: vault.strategySpecific,
            balance: "",
            lastHardWork: vault.lastHardWork,
            daily: (Number(APR) / 365).toFixed(2),
            monthlyUnderlyingApr: monthlyAPR,
            assets,
            assetsProportions,
            assetsWithApr: assetsWithApr,
            assetsAprs: assetsAprs,
            strategyInfo: getStrategyInfo(vault.symbol),
            underlying: vault.underlying,
            strategyAddress: vault.strategy,
          };
          return vaults;
        },
        {}
      );

      tokens.set(graphResponse.data.data.platformEntities[0].bcAssets);
      vaults.set(graphVaults);
      isVaultsLoaded.set(true);
    }
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
    getDataFromStabilityAPI();
    getData();
    account.set(address);
    publicClient.set(_publicClient);
    network.set(chain?.name);
    connected.set(isConnected);
  }, [address, chain?.id, isConnected, $lastTx]);

  return <div className="flex flex-col flex-1">{props.children}</div>;
};

export { AppStore };
