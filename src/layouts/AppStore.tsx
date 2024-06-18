import type React from "react";

import { useEffect } from "react";
import { formatUnits } from "viem";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { useAccount, usePublicClient } from "wagmi";

import { WagmiLayout } from "@layouts";

import { deployments } from "@stabilitydao/stability";

import {
  account,
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
  calculateAPY,
  getStrategyInfo,
  getTokenData,
  addAssetsBalance,
  addVaultData,
  getTimeDifference,
  determineAPR,
} from "@utils";

import {
  STABILITY_API,
  TOKENS_ASSETS,
  YEARN_PROTOCOLS,
  STRATEGY_SPECIFIC_SUBSTITUTE,
  CHAINS,
} from "@constants";

import type {
  TAddress,
  THoldData,
  TYearnProtocol,
  TPlatformsData,
  TVaults,
  TPriceInfo,
  TMultichainPrices,
  TAPIData,
  TVault,
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

  const localVaults: {
    [network: string]: TVaults[];
  } = {};

  let prices: TMultichainPrices = {};

  let stabilityAPIData: TAPIData = {};

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

      stabilityAPIData = response.data as TAPIData;

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
    prices: TPriceInfo[],
    chainID: string
  ) => {
    const graphVaults = await data.reduce(
      async (vaultsPromise: Promise<TVaults>, vault: TVault) => {
        const vaults = await vaultsPromise;

        const APIData =
          stabilityAPIData?.underlyings?.[chainID]?.[
            vault.underlying.toLowerCase()
          ];

        const APIVault = vault;

        const strategyAssets = APIVault.assets.map((asset: TAddress) =>
          asset.toLowerCase()
        );

        const strategyInfo = getStrategyInfo(APIVault?.symbol);

        const strategyName = strategyInfo?.shortName;

        const NOW = Math.floor(Date.now() / 1000);

        const almRebalanceEntity = APIVault.almRebalanceRawData[0];

        let dailyAPR = 0;
        let rebalances = {};

        if (APIData?.apr?.daily) {
          dailyAPR = APIData.apr.daily;
        }

        ///////
        const decimals = APIVault.assets.map(
          (asset: TAddress) => getTokenData(asset)?.decimals
        );

        const assetsAmounts = APIVault.assetsAmounts.map(
          (amount: string, index: number) =>
            formatUnits(amount, decimals[index])
        );
        const assetsPrices = APIVault.assets.map(
          (asset) => prices[asset.toLowerCase()].price
        );
        const assetsAmountsInUSD = assetsAmounts.map(
          (amount, index) => amount * assetsPrices[index]
        );

        const assetsAmountsSum = assetsAmountsInUSD.reduce(
          (acc: number, cur: string) => acc + Number(cur),
          0
        );
        const assetsProportions = assetsAmountsSum
          ? assetsAmountsInUSD.map((amount: string) =>
              Math.round((Number(amount) / assetsAmountsSum) * 100)
            )
          : assetsAmountsInUSD.map((_) => 50);

        const assetsPromise = Promise.all(
          strategyAssets.map(async (strategyAsset: TAddress) => {
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

        const lastHistoryData = APIVault.apr;

        ///// APR DATA CALCULATION
        let poolSwapFeesAPRDaily = 0;
        let poolSwapFeesAPRWeekly = 0;

        const dailyFarmApr = lastHistoryData?.income24h
          ? Number(lastHistoryData?.income24h)
          : 0;

        const weeklyFarmApr = lastHistoryData?.incomeWeek
          ? Number(lastHistoryData?.incomeWeek)
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
            Number(formatUnits(almRebalanceEntity[0], 8)) -
            (Number(formatUnits(almRebalanceEntity[0], 8)) / 100) * fee;

          poolSwapFeesAPRWeekly =
            Number(formatUnits(almRebalanceEntity[2], 8)) -
            (Number(formatUnits(almRebalanceEntity[2], 8)) / 100) * fee;

          dailyAPR =
            Number(formatUnits(almRebalanceEntity[1], 8)) -
            (Number(formatUnits(almRebalanceEntity[1], 8)) / 100) * fee;

          if (!poolSwapFeesAPRDaily) poolSwapFeesAPRDaily = 0;
          if (!poolSwapFeesAPRWeekly) poolSwapFeesAPRWeekly = 0;
          if (!dailyAPR) dailyAPR = 0;

          // rebalances
          const totalRebalances = APIVault.almRebalanceRawData;

          const _24HRebalances = totalRebalances.filter(
            (obj: string[]) => Number(obj[3]) >= NOW - 86400
          ).length;
          const _7DRebalances = totalRebalances.filter(
            (obj: string[]) => Number(obj[3]) >= NOW - 86400 * 7
          ).length;

          rebalances = { daily: _24HRebalances, weekly: _7DRebalances };
        }

        const APR = (
          Number(APIVault.apr.incomeLatest) + Number(dailyAPR)
        ).toFixed(2);

        const APY = calculateAPY(APR).toFixed(2);

        const APRWithoutFees = APIVault.apr.incomeLatest;

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
              lastHistoryData?.income24h,
              dailyTotalAPRWithFees,
              APR
            ),
            weekly: determineAPR(
              lastHistoryData?.incomeWeek,
              weeklyTotalAPRWithFees,
              APR
            ),
          },
          withoutFees: {
            latest: APRWithoutFees,
            daily: determineAPR(
              lastHistoryData?.income24h,
              dailyFarmApr,
              APRWithoutFees
            ),
            weekly: determineAPR(
              lastHistoryData?.incomeWeek,
              weeklyFarmApr,
              APRWithoutFees
            ),
          },
        };
        const APYArray = {
          withFees: {
            latest: APY,
            daily: determineAPR(
              lastHistoryData?.income24h,
              calculateAPY(dailyTotalAPRWithFees).toFixed(2),
              APY
            ),
            weekly: determineAPR(
              lastHistoryData?.incomeWeek,
              calculateAPY(weeklyTotalAPRWithFees).toFixed(2),
              APY
            ),
          },
          withoutFees: {
            latest: APYWithoutFees,
            daily: determineAPR(
              lastHistoryData?.income24h,
              calculateAPY(dailyFarmApr).toFixed(2),
              APYWithoutFees
            ),
            weekly: determineAPR(
              lastHistoryData?.incomeWeek,
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

        const latestFarmAPR = APIVault.apr.incomeLatest;

        const farmAPR = {
          latest: latestFarmAPR,
          daily: determineAPR(
            lastHistoryData?.income24h,
            dailyFarmApr,
            latestFarmAPR
          ),
          weekly: determineAPR(
            lastHistoryData?.incomeWeek,
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
        const lifetimeVsHoldAPR = lastHistoryData?.vsHoldLifetime
          ? Number(lastHistoryData?.vsHoldLifetime).toFixed(2)
          : 0;

        const currentTime = Math.floor(Date.now() / 1000);

        const vaultCreated = APIVault.created;

        const differenceInSecondsFromCreation = currentTime - vaultCreated;

        const secondsInADay = 60 * 60 * 24;

        const daysFromCreation = Math.round(
          differenceInSecondsFromCreation / secondsInADay
        );

        const vsHoldAPR = (
          (Number(lifetimeVsHoldAPR) / 365) *
          Number(daysFromCreation)
        ).toFixed(2);

        let lifetimeTokensHold: THoldData[] = [];

        if (lastHistoryData?.vsHoldAssetsLifetime && prices) {
          lifetimeTokensHold = strategyAssets.map(
            (asset: TAddress, index: number) => {
              const price = Number(prices[asset.toLowerCase()]?.price);

              const priceOnCreation = Number(
                formatUnits(BigInt(APIVault.assetsPricesOnCreation[index]), 18)
              );

              const priceDifference =
                ((price - priceOnCreation) / priceOnCreation) * 100;

              const yearPercentDiff = Number(
                lastHistoryData?.vsHoldAssetsLifetime[index]
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
          getTimeDifference(APIVault.created).days > 2 &&
          !!Number(APIVault.sharePrice);

        /////***** YEARN PROTOCOLS *****/////
        let yearnProtocols: TYearnProtocol[] = [];
        let strategySpecific = "";

        if (APIVault.strategySpecific && strategyInfo.shortName === "Y") {
          YEARN_PROTOCOLS.map((protocol: string) => {
            if (APIVault.strategySpecific.toLowerCase().includes(protocol)) {
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

        if (STRATEGY_SPECIFIC_SUBSTITUTE[APIVault.address.toLowerCase()]) {
          strategySpecific =
            STRATEGY_SPECIFIC_SUBSTITUTE[APIVault.address.toLowerCase()];
        } else {
          strategySpecific =
            strategyInfo?.shortName === "DQMF"
              ? APIVault.strategySpecific.replace(
                  /\s*0x[a-fA-F0-9]+\.\.[a-fA-F0-9]+\s*/,
                  ""
                )
              : APIVault.strategySpecific;
        }
        /////

        const strategyVersion =
          stabilityAPIData.platforms[chainID].versions.strategy[
            APIVault.strategyId
          ];

        vaults[APIVault.address.toLowerCase()] = {
          address: APIVault.address.toLowerCase(),
          name: APIVault.name,
          symbol: APIVault.symbol,
          created: APIVault.created,
          assetsPricesOnCreation: APIVault.assetsPricesOnCreation,
          type: APIVault.vaultType,
          strategy: APIVault.strategyId,
          shareprice: APIVault.sharePrice,
          tvl: APIVault.tvl,
          strategySpecific,
          balance: "",
          lastHardWork: APIVault.lastHardWork,
          hardWorkOnDeposit: APIVault.hardWorkOnDeposit,
          daily: (Number(APR) / 365).toFixed(2),
          assets,
          assetsProportions,
          strategyInfo,
          il: IL,
          underlying: APIVault.underlying,
          strategyAddress: APIVault.strategy.toLowerCase(),
          strategyDescription: APIVault.strategyDescription,
          status: APIVault.status,
          version: APIVault.version,
          strategyVersion: strategyVersion,
          underlyingSymbol: APIVault?.underlyingSymbol || "",
          NFTtokenID: APIVault.vaultManagerId,
          gasReserve: APIVault.gasReserve,
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
    const versions: Record<string, string> = {};
    const vaultsTokens: { [key: string]: string[] } = {};
    const platformData: TPlatformsData = {};
    const strategyTypeEntities: { [key: string]: any } = {};
    const vaultTypeEntities: { [key: string]: any } = {};
    const assetBalances: { [key: string]: bigint } = {};
    const vaultsData: { [key: string]: bigint } = {};

    await Promise.all(
      CHAINS.map(async (chain) => {
        const tempData = Object.entries(stabilityAPIData.vaults[chain.id]).map(
          (obj) => obj[1]
        );

        await setGraphData(tempData, prices[chain.id], String(chain.id));

        /////***** SET PLATFORM DATA *****/////

        vaultsTokens[String(chain.id)] = stabilityAPIData?.platforms[chain.id]
          .bcAssets as TAddress[];

        versions[String(chain.id)] =
          stabilityAPIData?.platforms[chain.id]?.versions?.platform;

        platformData[String(chain.id)] = {
          platform: platforms[chain.id],
          factory: deployments[chain.id].factory.toLowerCase(),
          buildingPermitToken:
            stabilityAPIData?.platforms[chain.id]?.buildingPermitToken,
          buildingPayPerVaultToken:
            stabilityAPIData?.platforms[chain.id]?.buildingPayPerVaultToken,
          zap: deployments[chain.id].zap.toLowerCase(),
        };

        strategyTypeEntities[String(chain.id)] =
          stabilityAPIData.platforms[chain.id].versions.strategy;
        vaultTypeEntities[String(chain.id)] =
          stabilityAPIData.platforms[chain.id].versions.vaultType;

        /////***** SET USER BALANCES *****/////
        if (isConnected) {
          isWeb3Load.set(true);

          let localClient = maticClient;
          if (chain.id === "8453") {
            localClient = baseClient;
          }

          try {
            const contractBalance = await localClient.readContract({
              address: platforms[chain.id],
              abi: PlatformABI,
              functionName: "getBalance",
              args: [address as TAddress],
            });
            const contractVaults = await localClient.readContract({
              address: contractBalance[6][1],
              abi: IVaultManagerABI,
              functionName: "vaults",
            });

            if (contractBalance) {
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
        }
      })
    );
    isWeb3Load.set(false);

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

    if (chain?.id) {
      currentChainID.set(String(chain?.id));
    }

    account.set(address);
    publicClient.set(_publicClient);
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
