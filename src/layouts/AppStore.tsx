import type React from "react";

import { useEffect } from "react";
import { formatUnits } from "viem";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { useAccount, usePublicClient } from "wagmi";

import { WagmiLayout } from "@layouts";

import {
  account,
  network,
  platformsData,
  platformVersions,
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
  currentChainID,
  assetsPrices,
  assetsBalances,
  vaultData,
} from "@store";

import {
  wagmiConfig,
  platforms,
  PlatformABI,
  IVaultManagerABI,
  retroIchiFactory,
  quickSwapIchiFactory,
} from "@web3";

import {
  formatFromBigInt,
  calculateAPY,
  getStrategyInfo,
  getTokenData,
  addAssetsBalance,
  addVaultData,
  getTimeDifference,
  determineAPR,
} from "@utils";

import {
  GRAPH_ENDPOINTS,
  GRAPH_QUERY,
  STABILITY_API,
  TOKENS_ASSETS,
  YEARN_PROTOCOLS,
  STRATEGY_SPECIFIC_SUBSTITUTE,
  CHAINS,
} from "@constants";

import type {
  TAddress,
  TAssetPrices,
  THoldData,
  TYearnProtocol,
  TPlatformsData,
} from "@types";

const AppStore = (props: React.PropsWithChildren) => {
  const { address, isConnected } = useAccount();

  const { chain } = useAccount();

  const _publicClient = usePublicClient();

  const maticClient = usePublicClient({
    chainId: 137,
    config: wagmiConfig,
  });

  const baseClient = usePublicClient({
    chainId: 8453,
    config: wagmiConfig,
  });

  const $lastTx = useStore(lastTx);
  const $reload = useStore(reload);

  let localVaults: any = {};
  let prices: any = {};

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

    let localAPRfilter = APRsFiler ? JSON.parse(APRsFiler) : "weekly";

    if (localAPRfilter === "week") {
      localAPRfilter = "weekly";
    } else if (localAPRfilter === "24h") {
      localAPRfilter = "daily";
    }

    aprFilter.set(localAPRfilter);
  };

  const getDataFromStabilityAPI = async () => {
    try {
      const response = await axios.get(STABILITY_API);

      stabilityAPIData = response.data;

      if (stabilityAPIData?.assetPrices) {
        assetsPrices.set(stabilityAPIData?.assetPrices);
        prices = stabilityAPIData?.assetPrices;
      }
      apiData.set(stabilityAPIData);
    } catch (error) {
      console.error("API ERROR:", error);
    }
  };

  const setGraphData = async (
    data: any,
    prices: TAssetPrices,
    chainID: string
  ) => {
    const graphVaults = await data.vaultEntities.reduce(
      async (vaultsPromise: Promise<any>, vault: any) => {
        const vaults = await vaultsPromise;

        const APIData =
          stabilityAPIData?.underlyings?.[chainID]?.[
            vault.underlying.toLowerCase()
          ];

        const APIVault =
          stabilityAPIData?.vaults[chainID][vault.id.toLowerCase()];

        const strategyInfo = getStrategyInfo(APIVault?.symbol);

        const strategyName = strategyInfo?.shortName;

        const strategyEntity = data.strategyEntities.find(
          (obj: any) => obj.id === vault.strategy
        );

        const NOW = Math.floor(Date.now() / 1000);

        const almRebalanceEntity = vault.almRebalanceHistoryEntity[0];

        let dailyAPR = 0;
        let rebalances = {};

        if (APIData?.apr?.daily) {
          dailyAPR = APIData.apr.daily;
        }

        ///////
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
        const lastHistoryData = vault.vaultHistoryEntity[0];

        ///// APR DATA CALCULATION
        let poolSwapFeesAPRDaily = 0;
        let poolSwapFeesAPRWeekly = 0;

        const dailyFarmApr = lastHistoryData?.APR24H
          ? Number(formatUnits(lastHistoryData.APR24H, 3)).toFixed(2)
          : 0;

        const weeklyFarmApr = lastHistoryData?.APRWeekly
          ? Number(formatUnits(lastHistoryData.APRWeekly, 3)).toFixed(2)
          : 0;

        if (APIData) {
          poolSwapFeesAPRDaily = APIData?.apr?.daily || 0;
          poolSwapFeesAPRWeekly =
            APIData?.apr?.weekly || APIData?.apr?.monthly || 0;
        }
        if (
          (strategyName === "IQMF" || strategyName === "IRMF") &&
          chainID == "137"
        ) {
          let fee = 0;

          if (strategyName === "IRMF") {
            try {
              const baseFee = await maticClient.readContract({
                address: retroIchiFactory,
                abi: [
                  {
                    inputs: [],
                    name: "baseFee",
                    outputs: [
                      { internalType: "uint256", name: "", type: "uint256" },
                    ],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "baseFee",
              });

              fee = Number(formatUnits(baseFee, 16));
            } catch (error) {
              console.log("Retro fee error:", error);
            }
          }
          if (strategyName === "IQMF") {
            try {
              const ammFee = await maticClient.readContract({
                address: quickSwapIchiFactory,
                abi: [
                  {
                    inputs: [],
                    name: "ammFee",
                    outputs: [
                      { internalType: "uint256", name: "", type: "uint256" },
                    ],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "ammFee",
              });

              const baseFee = await maticClient.readContract({
                address: quickSwapIchiFactory,
                abi: [
                  {
                    inputs: [],
                    name: "baseFee",
                    outputs: [
                      { internalType: "uint256", name: "", type: "uint256" },
                    ],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "baseFee",
              });

              fee = Number(formatUnits(ammFee + baseFee, 16));
            } catch (error) {
              console.log("Ichi fee error:", error);
            }
          }
          //////
          poolSwapFeesAPRDaily =
            Number(formatUnits(almRebalanceEntity.APR24H, 8)) -
            (Number(formatUnits(almRebalanceEntity.APR24H, 8)) / 100) * fee;

          poolSwapFeesAPRWeekly =
            Number(formatUnits(almRebalanceEntity.APRWeekly, 8)) -
            (Number(formatUnits(almRebalanceEntity.APRWeekly, 8)) / 100) * fee;

          dailyAPR =
            Number(formatUnits(almRebalanceEntity.APRFromLastEvent, 8)) -
            (Number(formatUnits(almRebalanceEntity.APRFromLastEvent, 8)) /
              100) *
              fee;

          if (!poolSwapFeesAPRDaily) poolSwapFeesAPRDaily = 0;
          if (!poolSwapFeesAPRWeekly) poolSwapFeesAPRWeekly = 0;
          if (!dailyAPR) dailyAPR = 0;

          // rebalances
          const totalRebalances = vault.almRebalanceHistoryEntity;

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

        ///////
        const dailyTotalAPRWithFees =
          Number(poolSwapFeesAPRDaily) + Number(dailyFarmApr);
        const weeklyTotalAPRWithFees =
          Number(poolSwapFeesAPRWeekly) + Number(weeklyFarmApr);

        const APRArray = {
          withFees: {
            latest: String(APR),
            daily: determineAPR(
              lastHistoryData?.APR24H,
              dailyTotalAPRWithFees,
              APR
            ),
            weekly: determineAPR(
              lastHistoryData?.APRWeekly,
              weeklyTotalAPRWithFees,
              APR
            ),
          },
          withoutFees: {
            latest: APRWithoutFees,
            daily: determineAPR(
              lastHistoryData?.APR24H,
              dailyFarmApr,
              APRWithoutFees
            ),
            weekly: determineAPR(
              lastHistoryData?.APRWeekly,
              weeklyFarmApr,
              APRWithoutFees
            ),
          },
        };
        const APYArray = {
          withFees: {
            latest: APY,
            daily: determineAPR(
              lastHistoryData?.APR24H,
              calculateAPY(dailyTotalAPRWithFees).toFixed(2),
              APY
            ),
            weekly: determineAPR(
              lastHistoryData?.APRWeekly,
              calculateAPY(weeklyTotalAPRWithFees).toFixed(2),
              APY
            ),
          },
          withoutFees: {
            latest: APYWithoutFees,
            daily: determineAPR(
              lastHistoryData?.APR24H,
              calculateAPY(dailyFarmApr).toFixed(2),
              APYWithoutFees
            ),
            weekly: determineAPR(
              lastHistoryData?.APRWeekly,
              calculateAPY(weeklyFarmApr).toFixed(2),
              APYWithoutFees
            ),
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

        const latestFarmAPR = String(
          Number(formatUnits(BigInt(vault.apr), 3)).toFixed(2)
        );

        const farmAPR = {
          latest: latestFarmAPR,
          daily: determineAPR(
            lastHistoryData?.APR24H,
            dailyFarmApr,
            latestFarmAPR
          ),
          weekly: determineAPR(
            lastHistoryData?.APRWeekly,
            weeklyFarmApr,
            latestFarmAPR
          ),
        };

        // IL
        let IL = strategyInfo?.il?.rate || 0;
        switch (APIVault?.risk?.symbol) {
          case "REKT":
            IL = 9;
            break;
          case "REKT+":
            IL = 10;
            break;
          default:
            break;
        }

        ///// VS HODL
        const lifetimeVsHoldAPR = lastHistoryData?.lifetimeVsHoldAPR
          ? Number(lastHistoryData?.lifetimeVsHoldAPR).toFixed(2)
          : 0;

        const daysFromCreation = Number(lastHistoryData?.daysFromCreation) || 1;

        const vsHoldAPR = (
          (Number(lifetimeVsHoldAPR) / 365) *
          Number(daysFromCreation)
        ).toFixed(2);

        let lifetimeTokensHold: THoldData[] = [];

        if (lastHistoryData?.lifetimeTokensVsHoldAPR && prices) {
          lifetimeTokensHold = vault.strategyAssets.map(
            (asset: string, index: number) => {
              const price = Number(prices[asset.toLowerCase()]?.price);

              const priceOnCreation = Number(
                formatUnits(BigInt(vault.AssetsPricesOnCreation[index]), 18)
              );

              const priceDifference =
                ((price - priceOnCreation) / priceOnCreation) * 100;

              const yearPercentDiff = Number(
                lastHistoryData?.lifetimeTokensVsHoldAPR[index]
              );

              const percentDiff = (yearPercentDiff / 365) * daysFromCreation;

              return {
                symbol: getTokenData(asset)?.symbol || "",
                initPrice: priceOnCreation.toFixed(2),
                price: price.toFixed(2),
                priceDifference: priceDifference.toFixed(2),
                latestAPR: percentDiff.toFixed(2),
                APR: yearPercentDiff.toFixed(2),
              };
            }
          );
        }

        const isVsActive =
          getTimeDifference(vault.created).days > 2 &&
          !!Number(APIVault.sharePrice);

        /////***** YEARN PROTOCOLS *****/////
        let yearnProtocols: TYearnProtocol[] = [];
        let strategySpecific = "";

        if (vault.strategySpecific && strategyInfo.shortName === "Y") {
          YEARN_PROTOCOLS.map((protocol: string) => {
            if (vault.strategySpecific.toLowerCase().includes(protocol)) {
              switch (protocol) {
                case "aave":
                  yearnProtocols.push({
                    title: "Aave",
                    link: "/protocols/Aave.png",
                  });
                  break;
                case "compound":
                  yearnProtocols.push({
                    title: "Compound",
                    link: "/protocols/Compound.png",
                  });
                  break;
                case "stargate":
                  yearnProtocols.push({
                    title: "Stargate",
                    link: "/protocols/Stargate.svg",
                  });
                  break;
                case "stmatic":
                  yearnProtocols.push({
                    title: "Lido",
                    link: "/protocols/Lido.png",
                  });
                  break;
                default:
                  break;
              }
            }
          });
        }

        if (STRATEGY_SPECIFIC_SUBSTITUTE[vault.id]) {
          strategySpecific = STRATEGY_SPECIFIC_SUBSTITUTE[vault.id];
        } else {
          strategySpecific =
            strategyInfo?.shortName === "DQMF"
              ? vault.strategySpecific.replace(
                  /\s*0x[a-fA-F0-9]+\.\.[a-fA-F0-9]+\s*/,
                  ""
                )
              : vault.strategySpecific;
        }
        /////
        vaults[vault.id] = {
          address: vault.id,
          name: vault.name,
          symbol: vault.symbol,
          created: vault.created,
          assetsPricesOnCreation: vault.AssetsPricesOnCreation,
          type: vault.vaultType,
          strategy: vault.strategyId,
          shareprice: APIVault.sharePrice,
          tvl: APIVault.tvl,
          strategySpecific,
          balance: "",
          lastHardWork: vault.lastHardWork,
          hardWorkOnDeposit: vault?.hardWorkOnDeposit,
          daily: (Number(APR) / 365).toFixed(2),
          assets,
          assetsProportions,
          strategyInfo,
          il: IL,
          underlying: vault.underlying,
          strategyAddress: vault.strategy,
          strategyDescription: vault.strategyDescription,
          status: Number(vault.vaultStatus),
          version: vault.version,
          strategyVersion: strategyEntity.version,
          underlyingSymbol: strategyEntity.underlyingSymbol,
          NFTtokenID: vault.NFTtokenID,
          gasReserve: vault.gasReserve,
          rebalances,
          earningData: {
            apr: APRArray,
            apy: APYArray,
            poolSwapFeesAPR,
            farmAPR,
          },
          sortAPR: APRArray?.withFees?.latest,
          pool: APIVault.pool,
          alm: APIVault.alm,
          risk: APIVault?.risk,
          vsHoldAPR: Number(vsHoldAPR),
          lifetimeVsHoldAPR: Number(lifetimeVsHoldAPR),
          lifetimeTokensHold,
          isVsActive,
          yearnProtocols,
          network: chainID,
        };

        return vaults;
      },
      Promise.resolve({})
    );
    localVaults[chainID] = graphVaults;
  };

  const getData = async () => {
    let graphResponse: any;
    let retries = 0;
    let apiError: string = "";
    const maxRetries = 2;

    const versions: Record<string, string> = {};
    const vaultsTokens: { [key: string]: string[] } = {};
    const platformData: TPlatformsData = {};
    const strategyTypeEntities: { [key: string]: any } = {};
    const vaultTypeEntities: { [key: string]: any } = {};
    const assetBalances: { [key: string]: bigint } = {};
    const vaultsData: { [key: string]: bigint } = {};

    await Promise.all(
      CHAINS.map(async (chain) => {
        while (retries < maxRetries) {
          try {
            graphResponse = await axios.post(GRAPH_ENDPOINTS[chain.id], {
              query: GRAPH_QUERY,
            });

            if (
              graphResponse.data.errors &&
              graphResponse.data.errors.length > 0
            ) {
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

        /////***** SET PLATFORM DATA *****/////
        if (graphResponse?.data?.data?.platformEntities[0]?.version) {
          versions[String(chain.id)] =
            graphResponse?.data?.data?.platformEntities[0]?.version;
        }

        //todo: change this to data from backend
        await setGraphData(
          graphResponse.data.data,
          prices[chain.id],
          String(chain.id)
        );
        let contractData: any;
        if (chain.id === "137") {
          contractData = await maticClient.readContract({
            address: platforms[chain.id],
            abi: PlatformABI,
            functionName: "getData",
          });
        }
        if (chain.id === "8453") {
          contractData = await baseClient.readContract({
            address: platforms[chain.id],
            abi: PlatformABI,
            functionName: "getData",
          });
        }
        // get from graph platform bcAssets(blockhain assets)
        if (contractData[1]) {
          vaultsTokens[String(chain.id)] = contractData[1].map(
            (address: TAddress) => address.toLowerCase()
          ) as TAddress[];
        }

        if (contractData?.length) {
          const buildingPrices: { [vaultType: string]: bigint } = {};
          for (let i = 0; i < contractData[1].length; i++) {
            buildingPrices[contractData[3][i]] = contractData[5][i];
          }
          platformData[String(chain.id)] = {
            platform: platforms[chain.id],
            factory: contractData[0][0],
            buildingPermitToken: contractData[0][3],
            buildingPayPerVaultToken: contractData[0][4],
            zap: contractData[0][7],
            buildingPrices,
          };
        }

        if (isConnected) {
          isWeb3Load.set(true);
          let contractBalance: any;
          let contractVaults: any;
          try {
            if (chain.id === "137") {
              contractBalance = await maticClient.readContract({
                address: platforms[chain.id],
                abi: PlatformABI,
                functionName: "getBalance",
                args: [address as TAddress],
              });
            }
            if (chain.id === "8453") {
              contractBalance = await baseClient.readContract({
                address: platforms[chain.id],
                abi: PlatformABI,
                functionName: "getBalance",
                args: [address as TAddress],
              });
            }

            if (contractBalance?.length) {
              const buildingPayPerVaultTokenBalance: bigint =
                contractBalance[8];
              const erc20Balance: { [token: string]: bigint } = {};
              const erc721Balance: { [token: string]: bigint } = {};
              //function -> .set vault/
              vaultsData[String(chain.id)] = addVaultData(contractBalance);
              assetBalances[String(chain.id)] =
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

              balances.set(contractBalance);
            }

            if (chain.id === "137") {
              contractVaults = await maticClient.readContract({
                address: contractBalance[6][1],
                abi: IVaultManagerABI,
                functionName: "vaults",
              });
            }
            if (chain.id === "8453") {
              contractVaults = await baseClient.readContract({
                address: contractBalance[6][1],
                abi: IVaultManagerABI,
                functionName: "vaults",
              });
            }

            if (contractVaults) {
              const vaultsPromise = await Promise.all(
                contractVaults[0].map(async (vault: any, index: number) => {
                  return {
                    [vault.toLowerCase()]: {
                      ...localVaults[chain.id][vault.toLowerCase()],
                      balance: contractBalance[5][index],
                    },
                  };
                })
              );

              localVaults[chain.id] = vaultsPromise.reduce(
                (acc, curr) => ({ ...acc, ...curr }),
                {}
              );
            }
            isVaultsLoaded.set(true);
          } catch (txError: any) {
            console.log("BLOCKCHAIN ERROR:", txError);
            error.set({
              state: true,
              type: "WEB3",
              description: txError.message,
            });
          }
          isWeb3Load.set(false);
        } else {
          isWeb3Load.set(false);
        }
        isWeb3Load.set(false);

        strategyTypeEntities[String(chain.id)] =
          graphResponse.data.data.strategyConfigEntities.reduce(
            (versions: any, version: any) => {
              versions[version.id.toLowerCase()] = version.version;

              return versions;
            },
            {}
          );
        vaultTypeEntities[String(chain.id)] =
          graphResponse.data.data.vaultTypeEntities.reduce(
            (versions: any, version: any) => {
              versions[version.id] = version.version;

              return versions;
            },
            {}
          );
      })
    );

    // assetsPrices.set(assetPrice);
    assetsBalances.set(assetBalances);
    vaultData.set(vaultsData);
    vaults.set(localVaults);
    tokens.set(vaultsTokens);
    platformsData.set(platformData);
    platformVersions.set(versions);
    strategyTypes.set(strategyTypeEntities);
    vaultTypes.set(vaultTypeEntities);
    isVaultsLoaded.set(true);
  };

  const fetchAllData = async () => {
    error.set({ state: false, type: "", description: "" });

    getLocalStorageData();

    await getDataFromStabilityAPI();

    getData();

    currentChainID.set(String(chain?.id));
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
