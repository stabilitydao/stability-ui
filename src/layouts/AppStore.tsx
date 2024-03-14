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
  platformZAP,
  publicClient,
  userBalance,
  vaults,
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
import { wagmiConfig, platform, PlatformABI, IVaultManagerABI } from "@web3";

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

  const { chain } = useAccount();

  const _publicClient = usePublicClient();
  const $lastTx = useStore(lastTx);
  const $reload = useStore(reload);

  let localVaults: any = {};

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

        const NOW = Math.floor(Date.now() / 1000);

        const almRebalanceEntity = vault.almRebalanceEntity[0];

        let dailyAPR = 0;
        let rebalances = {};

        if (APIData?.apr?.daily) {
          dailyAPR = APIData.apr.daily;
        }
        if (strategyName === "IQMF" || strategyName === "IRMF") {
          dailyAPR = Number(
            formatUnits(almRebalanceEntity.APRFromLastEvent, 8)
          );
          // rebalances
          const totalRebalances = vault.almRebalanceEntity;

          const _24HRebalances = totalRebalances.filter(
            (obj: any) => Number(obj.timestamp) >= NOW - 86400
          ).length;
          const _7DRebalances = totalRebalances.filter(
            (obj: any) => Number(obj.timestamp) >= NOW - 86400 * 7
          ).length;

          rebalances = { daily: _24HRebalances, weekly: _7DRebalances };
        }

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
                latest: Number(dailyAPR).toFixed(2),
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
          strategySpecific: vault.strategySpecific,
          balance: "",
          lastHardWork: vault.lastHardWork,
          hardWorkOnDeposit: vault?.hardWorkOnDeposit,
          apy: Number(APY).toFixed(2),
          daily: (Number(APR) / 365).toFixed(2),
          assets,
          assetsProportions,
          strategyInfo,
          il: strategyInfo?.il?.rate,
          underlying: vault.underlying,
          strategyAddress: vault.strategy,
          strategyDescription: vault.strategyDescription,
          status: Number(vault.vaultStatus),
          version: vault.version,
          strategyVersion: strategyEntity.version,
          NFTtokenID: vault.NFTtokenID,
          gasReserve: vault.gasReserve,
          rebalances,
          earningData: {
            apr: APRArray,
            apy: APYArray,
            poolSwapFeesAPR,
            farmAPR,
          },
          strategyPool: strategyEntity.pool,
        };

        return vaults;
      },
      Promise.resolve({})
    );
    localVaults = graphVaults;

    tokens.set(data.platformEntities[0].bcAssets);
    vaults.set(localVaults);
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

    if (contractData?.length) {
      const buildingPrices: { [vaultType: string]: bigint } = {};
      for (let i = 0; i < contractData[1].length; i++) {
        buildingPrices[contractData[3][i]] = contractData[5][i];
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

    if (isConnected) {
      isWeb3Load.set(true);
      try {
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

        if (contractBalance) {
          balances.set(contractBalance);
        }

        if (contractVaults) {
          const vaultsPromise = await Promise.all(
            contractVaults[0].map(async (vault: any, index: number) => {
              return {
                [vault.toLowerCase()]: {
                  ...localVaults[vault.toLowerCase()],
                  balance: contractBalance[5][index],
                  shareprice: String(contractVaults[5][index]),
                  tvl: String(contractVaults[6][index]),
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
    } else {
      // before backend
      const randomAddress: TAddress =
        "0xe319afa4d638f71400d4c7d60d90b0c227a5af48";
      const contractBalance: any = await readContract(wagmiConfig, {
        address: platform,
        abi: PlatformABI,
        functionName: "getBalance",
        args: [randomAddress],
      });
      addAssetsPrice(contractBalance);
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
    if (graphResponse?.data?.data?.platformEntities[0]?.version) {
      platformVersion.set(graphResponse.data.data.platformEntities[0].version);
    }
    if (graphResponse?.data?.data?.platformEntities[0]?.zap) {
      platformZAP.set(graphResponse?.data?.data?.platformEntities[0]?.zap);
    }
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
