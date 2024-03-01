import type React from "react";

import { useEffect } from "react";
import { formatUnits } from "viem";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { useAccount, usePublicClient } from "wagmi";
import { readContract } from "@wagmi/core";

import { WagmiLayout } from "@layouts";

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
  reload,
  error,
  isWeb3Load,
  aprFilter,
} from "@store";
import {
  wagmiConfig,
  priceReader,
  platform,
  PlatformABI,
  IVaultManagerABI,
  ERC20MetadataUpgradeableABI,
  ICHIABI,
  PriceReaderABI,
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
  TIMESTAMPS_IN_SECONDS,
} from "@constants";

import type { TAddress, TIQMFAlm } from "@types";

const AppStore = (props: React.PropsWithChildren) => {
  const { address, isConnected } = useAccount();

  const { chain } = useAccount();

  const _publicClient = usePublicClient();
  const $lastTx = useStore(lastTx);
  const $reload = useStore(reload);

  let stabilityAPIData: any;
  const getLocalStorageData = () => {
    const savedSettings = localStorage.getItem("transactionSettings");
    const savedHideFeeAPR = localStorage.getItem("hideFeeAPR");
    const APRsFiler = localStorage.getItem("APRsFiler");
    if (savedSettings) {
      const savedData = JSON.parse(savedSettings);
      transactionSettings.set(savedData);
    }

    if (savedHideFeeAPR) {
      const savedData = JSON.parse(savedHideFeeAPR);
      hideFeeApr.set(savedData);
    }
    if (APRsFiler) {
      const savedData = JSON.parse(APRsFiler);
      aprFilter.set(savedData);
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

  const setGraphData = async (data: any) => {
    const graphVaults = await data.vaultEntities.reduce(
      async (vaultsPromise: Promise<any>, vault: any) => {
        const vaults = await vaultsPromise;
        const strategyInfo = getStrategyInfo(vault.symbol);
        const strategyName = strategyInfo?.shortName;
        const APIData =
          stabilityAPIData?.underlyings?.["137"]?.[
            vault.underlying.toLowerCase()
          ];
        const strategyEntity = data.strategyEntities.find(
          (obj: any) => obj.id === vault.strategy
        );
        const almRebalanceEntity = vault.almRebalanceEntity[0];

        let dailyAPR = 0;
        const assetsWithApr: string[] = [];
        const assetsAprs: string[] = [];
        let rebalances = {};

        if (APIData?.apr?.daily) {
          dailyAPR = APIData.apr.daily;
          assetsWithApr.push("Pool swap fees");
          assetsAprs.push(Number(dailyAPR).toFixed(2));
        }
        if (strategyName === "IQMF" || strategyName === "IRMF") {
          dailyAPR = Number(
            formatUnits(almRebalanceEntity.APRFromLastEvent, 8)
          );
          assetsWithApr.push("Pool swap fees");
          assetsAprs.push(Number(dailyAPR).toFixed(2));
        }

        // if (strategyInfo?.shortName === "IQMF") {
        //   console.log(vault);
        //   const YEAR = 525600;
        //   const NOW = Math.floor(Date.now() / 1000);
        //   const dailyAPRs = [];
        //   const dailyWeights = [];
        //   const weeklyAPRs = [];
        //   const weeklyWeights = [];
        //   let dailyThreshold = 0;
        //   let weeklyThreshold = 0;

        //   const lastFeeAMLEntitity = data.lastFeeAMLEntities.find(
        //     (entity) => entity.id === vault.underlying
        //   );

        //   const IQMFAlms = vault.almRebalanceEntity;

        //   const _24HRebalances = IQMFAlms.filter(
        //     (obj: any) => Number(obj.timestamp) >= NOW - 86400
        //   ).length;
        //   const _7DRebalances = IQMFAlms.filter(
        //     (obj: any) => Number(obj.timestamp) >= NOW - 86400 * 7
        //   ).length;

        //   rebalances = { daily: _24HRebalances, weekly: _7DRebalances };

        //   const APRs = lastFeeAMLEntitity.APRS.map(
        //     (value: string) => (Number(value) / 10000000000) * 100
        //   );

        //   const timestamps = lastFeeAMLEntitity.timestamps;

        //   const collectFees = await _publicClient.simulateContract({
        //     address: vault.underlying,
        //     abi: ICHIABI,
        //     functionName: "collectFees",
        //   });
        //   const token0 = await readContract(wagmiConfig, {
        //     address: vault.underlying,
        //     abi: ICHIABI,
        //     functionName: "token0",
        //   });
        //   const token1 = await readContract(wagmiConfig, {
        //     address: vault.underlying,
        //     abi: ICHIABI,
        //     functionName: "token1",
        //   });
        //   const getTotalAmounts = await readContract(wagmiConfig, {
        //     address: vault.underlying,
        //     abi: ICHIABI,
        //     functionName: "getTotalAmounts",
        //   });
        //   const price = await readContract(wagmiConfig, {
        //     address: priceReader,
        //     abi: PriceReaderABI,
        //     functionName: "getAssetsPrice",
        //     args: [
        //       [token0, token1, token0, token1],
        //       [...collectFees.result, getTotalAmounts[0], getTotalAmounts[1]],
        //     ],
        //   });
        //   const feePrice = Number(price[1][0] + price[1][1]);
        //   const totalPrice = Number(price[1][2] + price[1][3]);

        //   let minutes = (NOW - timestamps[timestamps.length - 1]) / 60;
        //   let apr = (feePrice / totalPrice / minutes) * YEAR * 100;
        //   APRs.push(apr);
        //   timestamps.push(NOW);

        //   APRs.reverse();
        //   timestamps.reverse();

        //   // daily
        //   for (let i = 0; i < APRs.length; i++) {
        //     if (APRs.length === i + 1) {
        //       break;
        //     }
        //     let diff = timestamps[i] - timestamps[i + 1];

        //     if (dailyThreshold + diff <= TIMESTAMPS_IN_SECONDS.DAY) {
        //       dailyThreshold += diff;
        //       dailyWeights.push(diff / TIMESTAMPS_IN_SECONDS.DAY);
        //     } else {
        //       dailyWeights.push(
        //         (TIMESTAMPS_IN_SECONDS.DAY - dailyThreshold) /
        //           TIMESTAMPS_IN_SECONDS.DAY
        //       );
        //       break;
        //     }
        //   }
        //   for (let i = 0; i < dailyWeights.length; i++) {
        //     dailyAPRs.push(APRs[i] * dailyWeights[i]);
        //   }
        //   // weekly
        //   for (let i = 0; i < APRs.length; i++) {
        //     if (APRs.length === i + 1) {
        //       break;
        //     }
        //     let diff = timestamps[i] - timestamps[i + 1];

        //     if (weeklyThreshold + diff <= TIMESTAMPS_IN_SECONDS.WEEK) {
        //       weeklyThreshold += diff;
        //       weeklyWeights.push(diff / TIMESTAMPS_IN_SECONDS.WEEK);
        //     } else {
        //       weeklyWeights.push(
        //         (TIMESTAMPS_IN_SECONDS.WEEK - weeklyThreshold) /
        //           TIMESTAMPS_IN_SECONDS.WEEK
        //       );
        //       break;
        //     }
        //   }
        //   for (let i = 0; i < weeklyWeights.length; i++) {
        //     weeklyAPRs.push(APRs[i] * weeklyWeights[i]);
        //   }
        //   if (dailyAPRs.length) {
        //     dailyAPR = dailyAPRs.reduce((acc, value) => (acc += value), 0);

        //     assetsWithApr.push("Pool swap fees");
        //     assetsAprs.push(Number(dailyAPR).toFixed(2));
        //   }
        //   if (weeklyAPRs.length) {
        //     let weeklyAPR = weeklyAPRs.reduce(
        //       (acc, value) => (acc += value),
        //       0
        //     );
        //     assetsAprs.push(Number(weeklyAPR).toFixed(2));
        //   }
        //   assetsAprs.push(Number(apr).toFixed(2));
        // }

        const APR = (
          formatFromBigInt(String(vault.apr), 3, "withDecimals") +
          Number(dailyAPR)
        ).toFixed(2);

        const APY = calculateAPY(APR).toFixed(2);

        const APRWithoutFees = formatFromBigInt(
          String(vault.apr),
          3,
          "withDecimals"
        ).toFixed(2);
        const APYWithoutFees = calculateAPY(APRWithoutFees).toFixed(2);

        const assetsProportions = vault.assetsProportions
          ? vault.assetsProportions.map((proportion: any) =>
              Math.round(Number(formatUnits(proportion, 16)))
            )
          : [];

        const assetsPromise = Promise.all(
          vault.strategyAssets.map(async (strategyAsset: any) => {
            const token = getTokenData(strategyAsset);
            if (token) {
              const tokenExtended = TOKENS_ASSETS.find((tokenAsset) =>
                tokenAsset.addresses.includes(token.address as TAddress)
              );
              return {
                address: token?.address,
                logo: token?.logoURI,
                symbol: token?.symbol,
                name: token?.name,
                color: tokenExtended?.color,
              };
            }
          })
        );

        const assets = await assetsPromise;
        /////
        const aprData = vault.vaultHistoryEntity[0];

        let lastPoolSwapFeesAPR = 0;
        let poolSwapFeesAPRDaily = 0;
        let poolSwapFeesAPRWeekly = 0;

        const dailyFarmApr = aprData?.APR24H
          ? Number(formatUnits(aprData.APR24H, 3)).toFixed(2)
          : 0;

        const weeklyFarmApr = aprData?.APRWeekly
          ? Number(formatUnits(aprData.APRWeekly, 3)).toFixed(2)
          : 0;

        if (APIData) {
          poolSwapFeesAPRDaily = APIData?.apr?.daily || 0;
          poolSwapFeesAPRWeekly =
            APIData?.apr?.weekly || APIData?.apr?.monthly || 0;
        }
        if (strategyName === "IQMF" || strategyName === "IRMF") {
          lastPoolSwapFeesAPR = Number(
            formatUnits(almRebalanceEntity.APRFromLastEvent, 8)
          );
          poolSwapFeesAPRDaily = Number(
            formatUnits(almRebalanceEntity.APR24H, 8)
          );
          poolSwapFeesAPRWeekly = Number(
            formatUnits(almRebalanceEntity.APRWeekly, 8)
          );
        }

        const dailyTotalAPRWithFees =
          Number(poolSwapFeesAPRDaily) + Number(dailyFarmApr);
        const weeklyTotalAPRWithFees =
          Number(poolSwapFeesAPRWeekly) + Number(weeklyFarmApr);

        const APRArray = {
          withFees: {
            latest: String(APR),
            daily: `${dailyTotalAPRWithFees.toFixed(2)}`,
            weekly: `${weeklyTotalAPRWithFees.toFixed(2)}`,
          },
          withoutFees: {
            latest: APRWithoutFees,
            daily: `${Number(dailyFarmApr).toFixed(2)}`,
            weekly: `${Number(weeklyFarmApr).toFixed(2)}`,
          },
        };
        const APYArray = {
          withFees: {
            latest: APY,
            daily: `${calculateAPY(dailyTotalAPRWithFees).toFixed(2)}`,
            weekly: `${calculateAPY(weeklyTotalAPRWithFees).toFixed(2)}`,
          },
          withoutFees: {
            latest: APYWithoutFees,
            daily: `${calculateAPY(dailyFarmApr).toFixed(2)}`,
            weekly: `${calculateAPY(weeklyFarmApr).toFixed(2)}`,
          },
        };

        const poolSwapFeesAPR =
          strategyName != "CF"
            ? {
                latest:
                  strategyName === "IQMF" || strategyName === "IRMF"
                    ? lastPoolSwapFeesAPR
                    : assetsAprs[0],
                daily: `${poolSwapFeesAPRDaily.toFixed(2)}`,
                weekly: `${poolSwapFeesAPRWeekly.toFixed(2)}`,
              }
            : { latest: "-", daily: "-", weekly: "-" };
        const farmAPR = {
          latest: String(Number(formatUnits(BigInt(vault.apr), 3)).toFixed(2)),
          daily: aprData?.APR24H ? String(dailyFarmApr) : "-",
          weekly: aprData?.APRWeekly ? String(weeklyFarmApr) : "-",
        };
        /////
        vaults[vault.id] = {
          address: vault.id,
          name: vault.name,
          symbol: vault.symbol,
          created: vault.created,
          assetsPricesOnCreation: vault.AssetsPricesOnCreation,
          type: vault.vaultType,
          strategy: vault.strategyId,
          shareprice: vault.sharePrice,
          tvl: vault.tvl,
          apr: String(APR),
          apy: APY,
          aprWithoutFees: APRWithoutFees,
          apyWithoutFees: APYWithoutFees,
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
          strategyInfo: strategyInfo,
          il: strategyInfo?.il?.rate,
          underlying: vault.underlying,
          strategyAddress: vault.strategy,
          strategyDescription: vault.strategyDescription,
          status: Number(vault.vaultStatus),
          version: vault.version,
          strategyVersion: strategyEntity.version,
          rebalances: rebalances,
          aprData: aprData,
          feesData: { apr: APRArray, apy: APYArray, poolSwapFeesAPR, farmAPR },
        };

        return vaults;
      },
      Promise.resolve({})
    );

    tokens.set(data.platformEntities[0].bcAssets);
    vaults.set(graphVaults);
    isVaultsLoaded.set(true);
  };

  const getData = async () => {
    let graphResponse: any;
    let retries = 0;
    let apiError: string = "";
    const maxRetries = 2;

    while (retries < maxRetries) {
      try {
        graphResponse = await axios.post(GRAPH_ENDPOINT, {
          query: GRAPH_QUERY,
        });
        if (graphResponse.data.errors && graphResponse.data.errors.length > 0) {
          throw new Error("GRAPH API ERROR");
        }
        break;
      } catch (error: any) {
        retries++;
        apiError = error.message as string;
        console.log("GRAPH API ERROR:", error);
      }
    }
    if (retries >= maxRetries) {
      error.set({ state: true, type: "API", description: apiError });

      throw new Error(
        "Maximum number of retry attempts reached for graph request"
      );
    }
    await setGraphData(graphResponse.data.data);
    if (isConnected) {
      isWeb3Load.set(true);
      try {
        const contractData: any = await readContract(wagmiConfig, {
          address: platform,
          abi: PlatformABI,
          functionName: "getData",
        });
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

        const contractBalance: any = await readContract(wagmiConfig, {
          address: platform,
          abi: PlatformABI,
          functionName: "getBalance",
          args: [address as TAddress],
        });

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

        const contractVaults: any = await readContract(wagmiConfig, {
          address: contractBalance[6][1],
          abi: IVaultManagerABI,
          functionName: "vaults",
        });

        const vaultInfoes: any[] = await Promise.all(
          contractVaults[0].map(async (vault: string) => {
            const response: any = await readContract(wagmiConfig, {
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
              const symbol = await readContract(wagmiConfig, {
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
              const strategyName = strategyInfo?.shortName;
              const assetsWithApr: string[] = [];
              const assetsAprs: string[] = [];
              let dailyAPR = 0;
              let rebalances = {};

              const graphVault = graphResponse.data.data.vaultEntities.find(
                (obj: any) => obj.id === vault.toLowerCase()
              );
              const almRebalanceEntity = graphVault.almRebalanceEntity[0];

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

              if (APIData?.apr?.daily) {
                dailyAPR = APIData.apr.daily;
                assetsWithApr.push("Pool swap fees");
                assetsAprs.push(Number(dailyAPR).toFixed(2));
              }
              if (strategyName === "IQMF" || strategyName === "IRMF") {
                dailyAPR = Number(
                  formatUnits(almRebalanceEntity.APRFromLastEvent, 8)
                );
                assetsWithApr.push("Pool swap fees");
                assetsAprs.push(Number(dailyAPR).toFixed(2));
              }

              // if (strategyInfo?.shortName === "IQMF") {
              //   const YEAR = 525600;
              //   const NOW = Math.floor(Date.now() / 1000);
              //   const dailyAPRs = [];
              //   const dailyWeights = [];
              //   const weeklyAPRs = [];
              //   const weeklyWeights = [];
              //   let dailyThreshold = 0;
              //   let weeklyThreshold = 0;

              //   const lastFeeAMLEntitity =
              //     graphResponse.data.data.lastFeeAMLEntities.find(
              //       (entity) => entity.id === graphVault.underlying
              //     );
              //   const IQMFAlms = graphVault.almRebalanceEntity;

              //   const _24HRebalances = IQMFAlms.filter(
              //     (obj: any) => Number(obj.timestamp) >= NOW - 86400
              //   ).length;
              //   const _7DRebalances = IQMFAlms.filter(
              //     (obj: any) => Number(obj.timestamp) >= NOW - 86400 * 7
              //   ).length;

              //   rebalances = { daily: _24HRebalances, weekly: _7DRebalances };

              //   const APRs = lastFeeAMLEntitity.APRS.map(
              //     (value: string) => (Number(value) / 10000000000) * 100
              //   );

              //   const timestamps = lastFeeAMLEntitity.timestamps;

              //   const collectFees = await _publicClient.simulateContract({
              //     address: graphVault.underlying,
              //     abi: ICHIABI,
              //     functionName: "collectFees",
              //   });
              //   const token0 = await readContract(wagmiConfig, {
              //     address: graphVault.underlying,
              //     abi: ICHIABI,
              //     functionName: "token0",
              //   });
              //   const token1 = await readContract(wagmiConfig, {
              //     address: graphVault.underlying,
              //     abi: ICHIABI,
              //     functionName: "token1",
              //   });
              //   const getTotalAmounts = await readContract(wagmiConfig, {
              //     address: graphVault.underlying,
              //     abi: ICHIABI,
              //     functionName: "getTotalAmounts",
              //   });
              //   const price = await readContract(wagmiConfig, {
              //     address: priceReader,
              //     abi: PriceReaderABI,
              //     functionName: "getAssetsPrice",
              //     args: [
              //       [token0, token1, token0, token1],
              //       [
              //         ...collectFees.result,
              //         getTotalAmounts[0],
              //         getTotalAmounts[1],
              //       ],
              //     ],
              //   });
              //   const feePrice = Number(price[1][0] + price[1][1]);
              //   const totalPrice = Number(price[1][2] + price[1][3]);

              //   let minutes = (NOW - timestamps[timestamps.length - 1]) / 60;
              //   let apr = (feePrice / totalPrice / minutes) * YEAR * 100;
              //   APRs.push(apr);
              //   timestamps.push(NOW);

              //   APRs.reverse();
              //   timestamps.reverse();
              //   // daily
              //   for (let i = 0; i < APRs.length; i++) {
              //     if (APRs.length === i + 1) {
              //       break;
              //     }
              //     let diff = timestamps[i] - timestamps[i + 1];

              //     if (dailyThreshold + diff <= TIMESTAMPS_IN_SECONDS.DAY) {
              //       dailyThreshold += diff;

              //       dailyWeights.push(diff / TIMESTAMPS_IN_SECONDS.DAY);
              //     } else {
              //       dailyWeights.push(
              //         (TIMESTAMPS_IN_SECONDS.DAY - dailyThreshold) /
              //           TIMESTAMPS_IN_SECONDS.DAY
              //       );
              //       break;
              //     }
              //   }
              //   for (let i = 0; i < dailyWeights.length; i++) {
              //     dailyAPRs.push(APRs[i] * dailyWeights[i]);
              //   }
              //   // weekly
              //   for (let i = 0; i < APRs.length; i++) {
              //     if (APRs.length === i + 1) {
              //       break;
              //     }
              //     let diff = timestamps[i] - timestamps[i + 1];

              //     if (weeklyThreshold + diff <= TIMESTAMPS_IN_SECONDS.WEEK) {
              //       weeklyThreshold += diff;
              //       weeklyWeights.push(diff / TIMESTAMPS_IN_SECONDS.WEEK);
              //     } else {
              //       weeklyWeights.push(
              //         (TIMESTAMPS_IN_SECONDS.WEEK - weeklyThreshold) /
              //           TIMESTAMPS_IN_SECONDS.WEEK
              //       );
              //       break;
              //     }
              //   }

              //   for (let i = 0; i < weeklyWeights.length; i++) {
              //     weeklyAPRs.push(APRs[i] * weeklyWeights[i]);
              //   }

              //   if (dailyAPRs.length) {
              //     dailyAPR = dailyAPRs.reduce(
              //       (acc, value) => (acc += value),
              //       0
              //     );
              //     assetsWithApr.push("Pool swap fees");
              //     assetsAprs.push(Number(dailyAPR).toFixed(2));
              //   }
              //   if (weeklyAPRs.length) {
              //     let weeklyAPR = weeklyAPRs.reduce(
              //       (acc, value) => (acc += value),
              //       0
              //     );
              //     assetsAprs.push(Number(weeklyAPR).toFixed(2));
              //   }
              //   assetsAprs.push(Number(apr).toFixed(2));
              // }

              const APR = (
                formatFromBigInt(
                  String(contractVaults[7][index]),
                  3,
                  "withDecimals"
                ) + Number(dailyAPR)
              ).toFixed(2);

              const APY = calculateAPY(APR).toFixed(2);

              const APRWithoutFees = formatFromBigInt(
                String(contractVaults[7][index]),
                3,
                "withDecimals"
              ).toFixed(2);
              const APYWithoutFees = calculateAPY(APRWithoutFees).toFixed(2);

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

              /////
              const aprData = graphVault.vaultHistoryEntity[0];

              let lastPoolSwapFeesAPR = 0;
              let poolSwapFeesAPRDaily = 0;
              let poolSwapFeesAPRWeekly = 0;

              const dailyFarmApr = aprData?.APR24H
                ? Number(formatUnits(aprData.APR24H, 3)).toFixed(2)
                : 0;

              const weeklyFarmApr = aprData?.APRWeekly
                ? Number(formatUnits(aprData.APRWeekly, 3)).toFixed(2)
                : 0;

              if (APIData) {
                poolSwapFeesAPRDaily = APIData?.apr?.daily || 0;
                poolSwapFeesAPRWeekly =
                  APIData?.apr?.weekly || APIData?.apr?.monthly || 0;
              }

              if (strategyName === "IQMF" || strategyName === "IRMF") {
                lastPoolSwapFeesAPR = Number(
                  formatUnits(almRebalanceEntity.APRFromLastEvent, 8)
                );
                poolSwapFeesAPRDaily = Number(
                  formatUnits(almRebalanceEntity.APR24H, 8)
                );
                poolSwapFeesAPRWeekly = Number(
                  formatUnits(almRebalanceEntity.APRWeekly, 8)
                );
              }

              const dailyTotalAPRWithFees =
                Number(poolSwapFeesAPRDaily) + Number(dailyFarmApr);
              const weeklyTotalAPRWithFees =
                Number(poolSwapFeesAPRWeekly) + Number(weeklyFarmApr);

              const APRArray = {
                withFees: {
                  latest: String(APR),
                  daily: `${dailyTotalAPRWithFees.toFixed(2)}`,
                  weekly: `${weeklyTotalAPRWithFees.toFixed(2)}`,
                },
                withoutFees: {
                  latest: APRWithoutFees,
                  daily: `${Number(dailyFarmApr).toFixed(2)}`,
                  weekly: `${Number(weeklyFarmApr).toFixed(2)}`,
                },
              };
              const APYArray = {
                withFees: {
                  latest: APY,
                  daily: `${calculateAPY(dailyTotalAPRWithFees).toFixed(2)}`,
                  weekly: `${calculateAPY(weeklyTotalAPRWithFees).toFixed(2)}`,
                },
                withoutFees: {
                  latest: APYWithoutFees,
                  daily: `${calculateAPY(dailyFarmApr).toFixed(2)}`,
                  weekly: `${calculateAPY(weeklyFarmApr).toFixed(2)}`,
                },
              };

              const poolSwapFeesAPR =
                strategyName != "CF"
                  ? {
                      latest:
                        strategyName === "IQMF" || strategyName === "IRMF"
                          ? lastPoolSwapFeesAPR
                          : assetsAprs[0],
                      daily: `${poolSwapFeesAPRDaily.toFixed(2)}`,
                      weekly: `${poolSwapFeesAPRWeekly.toFixed(2)}`,
                    }
                  : { latest: "-", daily: "-", weekly: "-" };
              const farmAPR = {
                latest: String(
                  Number(
                    formatUnits(BigInt(contractVaults[8][index]), 3)
                  ).toFixed(2)
                ),
                daily: aprData?.APR24H ? String(dailyFarmApr) : "-",
                weekly: aprData?.APRWeekly ? String(weeklyFarmApr) : "-",
              };
              /////

              return {
                [vault.toLowerCase()]: {
                  address: vault.toLowerCase(),
                  name: contractVaults[1][index],
                  symbol: contractVaults[2][index],
                  created: graphVault.created,
                  assetsPricesOnCreation: graphVault.AssetsPricesOnCreation,
                  type: contractVaults[3][index],
                  strategy: contractVaults[4][index].toLowerCase(),
                  shareprice: String(contractVaults[5][index]),
                  tvl: String(contractVaults[6][index]),
                  apr: String(APR),
                  apy: APY,
                  aprWithoutFees: APRWithoutFees,
                  apyWithoutFees: APYWithoutFees,
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
                  rebalances: rebalances,
                  aprData: aprData,
                  feesData: {
                    apr: APRArray,
                    apy: APYArray,
                    poolSwapFeesAPR,
                    farmAPR,
                  },
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
      } catch (txError: any) {
        console.log("BLOCKCHAIN ERROR:", txError);
        error.set({ state: true, type: "WEB3", description: txError.message });
      }
      isWeb3Load.set(false);
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
    error.set({ state: false, type: "", description: "" });
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
  }, [address, chain?.id, isConnected, $lastTx, $reload]);

  return (
    <WagmiLayout>
      <div className="flex flex-col flex-1">{props.children}</div>
    </WagmiLayout>
  );
};

export { AppStore };
