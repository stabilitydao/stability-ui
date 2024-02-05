import type React from "react";
import { useEffect } from "react";
import { formatUnits } from "viem";
import axios from "axios";
import { useStore } from "@nanostores/react";

import { readContract } from "viem/actions";
import { useAccount, usePublicClient, useNetwork, WagmiConfig } from "wagmi";

import { wagmiConfig } from "@web3";

import {
  account,
  network,
  platformData,
  platformVersion,
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
  vaultTypes,
  strategyTypes,
  transactionSettings,
  hideFeeApr,
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

import type { TAddress, TIQMFAlm } from "@types";

const AppStore = (props: React.PropsWithChildren) => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const _publicClient = usePublicClient();
  const $lastTx = useStore(lastTx);
  const $hideFeeAPR = useStore(hideFeeApr);

  let stabilityAPIData: any;
  const getLocalStorageData = () => {
    const savedSettings = localStorage.getItem("transactionSettings");
    const savedHideFeeAPR = localStorage.getItem("hideFeeAPR");
    if (savedSettings) {
      const savedData = JSON.parse(savedSettings);
      transactionSettings.set(savedData);
    }

    if (savedHideFeeAPR) {
      const savedData = JSON.parse(savedHideFeeAPR);
      hideFeeApr.set(savedData);
    }
  };
  const getDataFromStabilityAPI = async () => {
    try {
      const response = await axios.get(STABILITY_API);
      stabilityAPIData = response.data;
      apiData.set(stabilityAPIData);
    } catch (error) {
      console.error("API ERROR:", error);
    }
  };

  const getData = async () => {
    const graphResponse = await axios.post(GRAPH_ENDPOINT, {
      query: GRAPH_QUERY,
    });
    if (isConnected) {
      const contractData: any = await readContract(_publicClient, {
        address: platform,
        abi: PlatformABI,
        functionName: "getData",
      });
      console.log("getData", contractData);
      if (contractData[1]) {
        tokens.set(
          contractData[1].map((address: TAddress) =>
            address.toLowerCase()
          ) as TAddress[]
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
            const strategyInfo = getStrategyInfo(contractVaults[2][index]);
            const assetsWithApr: string[] = [];
            const assetsAprs: string[] = [];
            let dailyAPR = 0;

            const graphVault = graphResponse.data.data.vaultEntities.find(
              (obj: any) => obj.id === vault.toLowerCase()
            );

            const strategyEntity =
              graphResponse.data.data.strategyEntities.find(
                (obj: any) => obj.id === graphVault.strategy
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

            if (APIData?.apr?.daily && !$hideFeeAPR) {
              dailyAPR = APIData.apr.daily;
              assetsWithApr.push("Pool swap fees");
              assetsAprs.push(Number(dailyAPR).toFixed(2));
            }

            // if (strategyInfo?.shortName === "IQMF") {
            //   const IQMFAlms = graphResponse.data.data.almrebalanceEntities
            //     .filter((obj: TIQMFAlm) => obj.alm === graphVault.underlying)
            //     .sort(
            //       (a: TIQMFAlm, b: TIQMFAlm) =>
            //         Number(b.timestamp) - Number(a.timestamp)
            //     );

            //   const minutesBetweenRebalances =
            //     (Number(IQMFAlms[0].timestamp) -
            //       Number(IQMFAlms[1].timestamp)) /
            //     60;

            //   const ICHI_APR =
            //     (IQMFAlms[0].feeUSD /
            //       IQMFAlms[0].totalUSD /
            //       minutesBetweenRebalances) *
            //     525600 *
            //     100;

            //   console.log("ich", ICHI_APR);
            // }

            const APR = (
              formatFromBigInt(
                String(contractVaults[7][index]),
                3,
                "withDecimals"
              ) + Number(dailyAPR)
            ).toFixed(2);

            const APY = calculateAPY(APR).toFixed(2);

            const assets: any[] = [];
            if (vaultInfoes.length) {
              vaultInfoes[index][1].forEach((strategyAsset: any) => {
                const token = getTokenData(strategyAsset);
                if (token) {
                  const tokenExtended = TOKENS_ASSETS.find((tokenAsset) =>
                    tokenAsset.addresses.includes(token.address as TAddress)
                  );

                  assets.push({
                    address: token?.address,
                    logo: token?.logoURI,
                    symbol: token?.symbol,
                    name: token?.name,
                    color: tokenExtended?.color,
                  });
                }
              });
            }
            return {
              [vault.toLowerCase()]: {
                address: vault.toLowerCase(),
                name: contractVaults[1][index],
                symbol: contractVaults[2][index],
                type: contractVaults[3][index],
                strategy: contractVaults[4][index].toLowerCase(),
                shareprice: String(contractVaults[5][index]),
                tvl: String(contractVaults[6][index]),
                apr: String(APR),
                apy: APY,
                strategyApr: contractVaults[8][index],
                strategySpecific: contractVaults[9][index],
                balance: contractBalance[5][index],
                lastHardWork: vaultInfoes[index][5],
                daily: (Number(APR) / 365).toFixed(2),
                monthlyUnderlyingApr: dailyAPR,
                assets,
                assetsProportions,
                assetsWithApr,
                assetsAprs,
                strategyInfo: strategyInfo,
                il: strategyInfo?.il?.rate,
                underlying: graphVault.underlying,
                strategyAddress: graphVault.strategy,
                strategyDescription: graphVault.strategyDescription,
                status: Number(graphVault.vaultStatus),
                version: graphVault.version,
                strategyVersion: strategyEntity.version,
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
          const strategyEntity = graphResponse.data.data.strategyEntities.find(
            (obj: any) => obj.id === vault.strategy
          );

          let dailyAPR = 0;
          const assetsWithApr: string[] = [];
          const assetsAprs: string[] = [];

          if (APIData?.apr?.daily && !$hideFeeAPR) {
            dailyAPR = APIData.apr.daily;
            assetsWithApr.push("Pool swap fees");
            assetsAprs.push(Number(dailyAPR).toFixed(2));
          }
          /////
          const APR = (
            formatFromBigInt(String(vault.apr), 3, "withDecimals") +
            Number(dailyAPR)
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

          const assets: any[] = [];

          if (vault.strategyAssets.length) {
            vault.strategyAssets.forEach((strategyAsset: any) => {
              const token = getTokenData(strategyAsset);
              if (token) {
                const tokenExtended = TOKENS_ASSETS.find((tokenAsset) =>
                  tokenAsset.addresses.includes(token.address as TAddress)
                );
                assets.push({
                  address: token?.address,
                  logo: token?.logoURI,
                  symbol: token?.symbol,
                  name: token?.name,
                  color: tokenExtended?.color,
                });
              }
            });
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
            strategyApr: vault.apr,
            strategySpecific: vault.strategySpecific,
            balance: "",
            lastHardWork: vault.lastHardWork,
            daily: (Number(APR) / 365).toFixed(2),
            monthlyUnderlyingApr: dailyAPR,
            assets,
            assetsProportions,
            assetsWithApr: assetsWithApr,
            assetsAprs: assetsAprs,
            strategyInfo: getStrategyInfo(vault.symbol),
            il: getStrategyInfo(vault.symbol)?.il?.rate,
            underlying: vault.underlying,
            strategyAddress: vault.strategy,
            strategyDescription: vault.strategyDescription,
            status: Number(vault.vaultStatus),
            version: vault.version,
            strategyVersion: strategyEntity.version,
          };
          return vaults;
        },
        {}
      );
      tokens.set(graphResponse.data.data.platformEntities[0].bcAssets);
      vaults.set(graphVaults);
      isVaultsLoaded.set(true);
    }
    const strategyTypeEntities =
      graphResponse.data.data.strategyConfigEntities.reduce(
        (versions: any, version: any) => {
          versions[version.id.toLowerCase()] = version.version;

          return versions;
        },
        {}
      );
    const vaultTypeEntities = graphResponse.data.data.vaultTypeEntities.reduce(
      (versions: any, version: any) => {
        versions[version.id] = version.version;

        return versions;
      },
      {}
    );

    strategyTypes.set(strategyTypeEntities);
    vaultTypes.set(vaultTypeEntities);
    if (graphResponse?.data?.data?.platformEntities[0]?.version)
      platformVersion.set(graphResponse.data.data.platformEntities[0].version);
  };
  const fetchAllData = async () => {
    getLocalStorageData();
    await getDataFromStabilityAPI();
    getData();
    account.set(address);
    publicClient.set(_publicClient);
    network.set(chain?.name);
    connected.set(isConnected);
  };

  useEffect(() => {
    fetchAllData();
  }, [address, chain?.id, isConnected, $lastTx, $hideFeeAPR]);

  return (
    <WagmiConfig config={wagmiConfig}>
      <div className="flex flex-col flex-1">{props.children}</div>
    </WagmiConfig>
  );
};

export { AppStore };
