import type React from "react";

import { useEffect } from "react";

import { createPublicClient, formatUnits, http } from "viem";

import { sonic } from "viem/chains";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { useAccount, usePublicClient } from "wagmi";

import { WagmiLayout } from "@layouts";

import {
  deployments,
  getAsset,
  getStrategyProtocols,
  seeds,
  StrategyShortId,
  sonicWhitelistedAssets,
} from "@stabilitydao/stability";

import {
  account,
  platformsData,
  platformVersions,
  publicClient,
  vaults,
  isVaultsLoaded,
  tokens,
  connected,
  apiData,
  lastTx,
  reload,
  error,
  isWeb3Load,
  currentChainID,
  assetsPrices,
  assetsBalances,
  vaultData,
} from "@store";

import { wagmiConfig, platforms, frontendContracts } from "@web3";

import {
  calculateAPY,
  getStrategyInfo,
  getTokenData,
  addAssetsBalance,
  addVaultData,
  getTimeDifference,
  determineAPR,
  getLocalStorageData,
  getContractDataWithPagination,
  extractPointsMultiplier,
} from "@utils";

import {
  YEARN_PROTOCOLS,
  STRATEGY_SPECIFIC_SUBSTITUTE,
  CHAINS,
  BIG_INT_VALUES,
} from "@constants";

import type {
  TAddress,
  THoldData,
  TYearnProtocol,
  TVaults,
  TMultichainPrices,
  TAPIData,
  TPriceInfo,
  TVaultDataKey,
  TFrontendBalances,
  TPlatformData,
  TBalances,
  TTokens,
  // TAsset,
} from "@types";

import type { Vaults, Vault } from "@stabilitydao/stability/out/api.types";

const AppStore = (props: React.PropsWithChildren): JSX.Element => {
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

  const realClient = usePublicClient({
    chainId: 111188,
    config: wagmiConfig,
  });
  /*const sonicClient = usePublicClient({
    chainId: 146,
    config: wagmiConfig,
  });*/
  const sonicClient = createPublicClient({
    chain: sonic,
    transport: http(
      import.meta.env.PUBLIC_SONIC_RPC || "https://sonic.drpc.org"
    ),
  });

  const $lastTx = useStore(lastTx);
  const $reload = useStore(reload);

  let isError = false;

  const localVaults: {
    [network: string]: TVaults;
  } = {};

  let prices: TMultichainPrices = {};

  let stabilityAPIData: TAPIData = {};

  const handleError = (errType: string, description: string) => {
    error.set({ state: true, type: errType, description });
    isError = true;
  };

  const getDataFromStabilityAPI = async () => {
    const maxRetries = 3;
    let isResponse = false;
    try {
      for (const seed of seeds) {
        let currentRetry = 0;

        while (currentRetry < maxRetries) {
          try {
            const response = await axios.get(seed);

            stabilityAPIData = response.data;

            if (stabilityAPIData?.error) {
              handleError("API", stabilityAPIData?.error);
              return;
            }

            if (stabilityAPIData?.assetPrices) {
              assetsPrices.set(stabilityAPIData?.assetPrices);
              prices = stabilityAPIData?.assetPrices;
            }

            apiData.set(stabilityAPIData);
            isResponse = true;
            break;
          } catch (err) {
            console.log("API Error:", err);
            currentRetry++;
            if (currentRetry < maxRetries) {
              console.log(`Retrying (${currentRetry}/${maxRetries})...`, seed);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        if (isResponse) break;
      }
      if (!isResponse) {
        throw new Error("API error");
      }
    } catch (err) {
      console.error("API error:", err);
      handleError("API", err as string);
    }
  };

  const setVaultsData = async (
    data: any,
    prices: { [key: string]: TPriceInfo },
    chainID: string
  ) => {
    const APIVaults = await data.reduce(
      async (vaultsPromise: Promise<Vaults>, vault: Vault) => {
        const vaults = await vaultsPromise;

        const underlying =
          stabilityAPIData?.underlyings?.[chainID]?.[
            //@ts-ignore
            vault?.underlying?.toLowerCase()
          ];

        const strategyAssets: string[] =
          vault?.assets?.map((asset: string) => asset.toLowerCase()) || [];

        const strategyInfo = getStrategyInfo(
          vault?.symbol,
          vault.strategyId,
          vault.strategyShortId as StrategyShortId,
          vault.strategySpecific as string,
          vault.assets as TAddress[]
        );

        const strategyName = strategyInfo?.shortId;

        const NOW = Math.floor(Date.now() / 1000);

        const almRebalanceEntity = vault?.almRebalanceRawData?.[0]?.map(
          (_: string) => BigInt(_)
        );

        let dailyAPR = 0;
        let rebalances = {};

        if (underlying?.apr?.daily) {
          dailyAPR = underlying.apr.daily;
        }

        ///////
        const decimals = vault?.assets?.map(
          (asset: string) => getTokenData(asset)?.decimals
        );

        const assetsAmounts = vault?.assetsAmounts?.map(
          (amount: string, index: number) =>
            formatUnits(BigInt(amount), decimals?.[index] || 18)
        );
        const assetsPrices = vault?.assets?.map(
          (asset: string) => prices?.[asset?.toLowerCase()]?.price
        );

        const assetsAmountsInUSD = assetsAmounts?.map(
          (amount: string, index: number) =>
            Number(amount) * Number(assetsPrices?.[index])
        );

        const assetsAmountsSum = assetsAmountsInUSD?.reduce(
          (acc: number, cur: number) => acc + cur,
          0
        );

        const assetsProportions = assetsAmountsSum
          ? assetsAmountsInUSD?.map((amount: string | number) =>
              Math.round((Number(amount) / assetsAmountsSum) * 100)
            )
          : assetsAmountsInUSD?.map((_: number) => 50);

        const assets = strategyAssets.map((strategyAsset: string) => {
          const token = getTokenData(strategyAsset);
          if (token) {
            const tokenExtended = getAsset(chainID, token.address);

            return {
              address: token?.address,
              logo: token?.logoURI,
              symbol: token?.symbol,
              name: token?.name,
              color: tokenExtended?.color,
            };
          }
        });

        ///// APR DATA CALCULATION
        const daysFromLastHardWork = getTimeDifference(
          vault.lastHardWork as number
        )?.days;

        let poolSwapFeesAPRDaily = 0;
        let poolSwapFeesAPRWeekly = 0;
        let dailyFarmApr = 0;
        let weeklyFarmApr = 0;
        let APR = "0";
        let APY = "0";
        let APRWithoutFees = "0";
        let APRArray = {
          latest: "0",
          daily: "0",
          weekly: "0",
        };
        let APYArray = {
          latest: "0",
          daily: "0",
          weekly: "0",
        };
        let poolSwapFeesAPR = {
          latest: "0",
          daily: "0",
          weekly: "0",
        };
        let farmAPR = {
          latest: "0",
          daily: "0",
          weekly: "0",
        };

        const fee = vault?.almFee?.income || 0;

        if (daysFromLastHardWork < 3) {
          dailyFarmApr = vault.income?.apr24h
            ? Number(vault.income?.apr24h)
            : 0;

          weeklyFarmApr = vault.income?.aprWeek
            ? Number(vault.income?.aprWeek)
            : 0;

          if (underlying) {
            poolSwapFeesAPRDaily = underlying?.apr?.daily || 0;
            poolSwapFeesAPRWeekly =
              underlying?.apr?.weekly || underlying?.apr?.monthly || 0;
          }
          if (strategyName === "IQMF" || strategyName === "IRMF") {
            //////
            poolSwapFeesAPRDaily =
              Number(
                formatUnits(almRebalanceEntity?.[0] || BIG_INT_VALUES.ZERO, 8)
              ) -
              (Number(
                formatUnits(almRebalanceEntity?.[0] || BIG_INT_VALUES.ZERO, 8)
              ) /
                100) *
                fee;

            poolSwapFeesAPRWeekly =
              Number(
                formatUnits(almRebalanceEntity?.[2] || BIG_INT_VALUES.ZERO, 8)
              ) -
              (Number(
                formatUnits(almRebalanceEntity?.[2] || BIG_INT_VALUES.ZERO, 8)
              ) /
                100) *
                fee;

            dailyAPR =
              Number(
                formatUnits(almRebalanceEntity?.[1] || BIG_INT_VALUES.ZERO, 8)
              ) -
              (Number(
                formatUnits(almRebalanceEntity?.[1] || BIG_INT_VALUES.ZERO, 8)
              ) /
                100) *
                fee;

            if (!poolSwapFeesAPRDaily) poolSwapFeesAPRDaily = 0;
            if (!poolSwapFeesAPRWeekly) poolSwapFeesAPRWeekly = 0;
            if (!dailyAPR) dailyAPR = 0;
          }

          APR = (Number(vault?.income?.aprLatest) + Number(dailyAPR)).toFixed(
            2
          );

          APY = calculateAPY(APR).toFixed(2);

          APRWithoutFees = Number(vault?.income?.aprLatest).toFixed(2) || "0";

          ///////
          const dailyTotalAPRWithFees =
            Number(poolSwapFeesAPRDaily) + dailyFarmApr;
          const weeklyTotalAPRWithFees =
            Number(poolSwapFeesAPRWeekly) + Number(weeklyFarmApr);

          APRArray = {
            latest: Number(APR) < 0 ? "0" : APR,
            daily:
              Number(dailyTotalAPRWithFees) < 0
                ? "0"
                : determineAPR(
                    vault?.income?.apr24h,
                    dailyTotalAPRWithFees,
                    APR,
                    vault.strategyShortId
                  ),
            weekly:
              Number(weeklyTotalAPRWithFees) < 0
                ? "0"
                : determineAPR(
                    vault?.income?.aprWeek,
                    weeklyTotalAPRWithFees,
                    APR,
                    vault.strategyShortId
                  ),
          };
          APYArray = {
            latest: Number(APR) < 0 ? "0" : APY,
            daily:
              dailyTotalAPRWithFees < 0
                ? "0"
                : determineAPR(
                    vault?.income?.apr24h,
                    calculateAPY(dailyTotalAPRWithFees).toFixed(2),
                    APY,
                    vault.strategyShortId
                  ),
            weekly:
              weeklyTotalAPRWithFees < 0
                ? "0"
                : determineAPR(
                    vault?.income?.aprWeek,
                    calculateAPY(weeklyTotalAPRWithFees).toFixed(2),
                    APY,
                    vault.strategyShortId
                  ),
          };

          poolSwapFeesAPR =
            strategyName != "CF"
              ? {
                  latest: Number(dailyAPR).toFixed(2),
                  daily: `${poolSwapFeesAPRDaily.toFixed(2)}`,
                  weekly: `${poolSwapFeesAPRWeekly.toFixed(2)}`,
                }
              : { latest: "-", daily: "-", weekly: "-" };

          farmAPR = {
            latest: Number(APRWithoutFees) < 0 ? "0" : APRWithoutFees,
            daily:
              Number(dailyFarmApr) < 0
                ? "0"
                : determineAPR(
                    vault?.income?.apr24h,
                    dailyFarmApr,
                    APRWithoutFees,
                    vault.strategyShortId
                  ),
            weekly:
              Number(weeklyFarmApr) < 0
                ? "0"
                : determineAPR(
                    vault?.income?.aprWeek,
                    weeklyFarmApr,
                    APRWithoutFees,
                    vault.strategyShortId
                  ),
          };
        }

        // rebalances
        const totalRebalances = vault.almRebalanceRawData || [];

        const _24HRebalances = totalRebalances.filter(
          (obj: string[]) => Number(obj[3]) >= NOW - 86400
        ).length;
        const _7DRebalances = totalRebalances.filter(
          (obj: string[]) => Number(obj[3]) >= NOW - 86400 * 7
        ).length;

        rebalances = { daily: _24HRebalances, weekly: _7DRebalances };

        // IL
        let IL = strategyInfo?.il?.rate || 0;
        switch (vault?.risk?.symbol) {
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
        const vaultCreated = vault.created as number;

        const daysFromCreation = getTimeDifference(vaultCreated)?.days;

        const vsHold24H =
          vault.vsHold?.apr24h && daysFromCreation >= 3
            ? Number(vault.vsHold?.apr24h).toFixed(2)
            : 0;

        const vsHoldWeekly =
          vault.vsHold?.aprWeek && daysFromCreation >= 3
            ? Number(vault.vsHold?.aprWeek).toFixed(2)
            : 0;

        const lifetimeVsHold =
          vault.vsHold?.lifetime && daysFromCreation >= 3
            ? Number(vault.vsHold?.lifetime).toFixed(2)
            : 0;

        const vsHoldAPR =
          vault.vsHold?.aprLifetime && daysFromCreation >= 3
            ? Number(vault.vsHold?.aprLifetime).toFixed(2)
            : 0;

        let assetsVsHold: THoldData[] = [];
        if (vault.vsHold?.lifetimeAssets && prices) {
          assetsVsHold = strategyAssets.map((asset: string, index: number) => {
            const price = vault?.assetsPricesLast?.[index]
              ? Number(vault?.assetsPricesLast?.[index])
              : Number(prices[asset?.toLowerCase()]?.price);

            const priceOnCreation = Number(
              formatUnits(
                BigInt(vault?.assetsPricesOnCreation?.[index] ?? 1),
                18
              )
            );

            const priceDifference =
              ((price - priceOnCreation) / priceOnCreation) * 100;

            return {
              symbol: getTokenData(asset)?.symbol || "",
              initPrice: priceOnCreation.toFixed(2),
              price: price.toFixed(2),
              priceDifference: priceDifference.toFixed(2),
              dailyAPR: Number(vault.vsHold?.aprAssets24h[index] ?? 0).toFixed(
                2
              ),
              weeklyAPR: Number(
                vault.vsHold?.aprAssetsWeek[index] ?? 0
              ).toFixed(2),
              latestAPR: Number(
                vault.vsHold?.lifetimeAssets[index] ?? 0
              ).toFixed(2),
              APR: Number(vault.vsHold?.aprAssetsLifetime[index] ?? 0).toFixed(
                2
              ),
            };
          });
        }

        const isVsActive = daysFromCreation >= 10 && !!Number(vault.sharePrice);

        /////***** YEARN PROTOCOLS *****/////
        let yearnProtocols: TYearnProtocol[] = [];
        let strategySpecific: string = "";

        if (vault.strategySpecific && strategyInfo?.shortId === "Y") {
          YEARN_PROTOCOLS.map((protocol: string) => {
            if (vault?.strategySpecific?.toLowerCase().includes(protocol)) {
              switch (protocol) {
                case "aave":
                  yearnProtocols.push({
                    title: "Aave",
                    link: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Aave.png",
                  });
                  break;
                case "compound":
                  yearnProtocols.push({
                    title: "Compound",
                    link: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Compound.png",
                  });
                  break;
                case "stargate":
                  yearnProtocols.push({
                    title: "Stargate",
                    link: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Stargate.svg",
                  });
                  break;
                case "stmatic":
                  yearnProtocols.push({
                    title: "Lido",
                    link: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Lido.svg",
                  });
                  break;
                default:
                  break;
              }
            }
          });
        }

        if (STRATEGY_SPECIFIC_SUBSTITUTE[vault.address.toLowerCase()]) {
          strategySpecific =
            STRATEGY_SPECIFIC_SUBSTITUTE[vault.address.toLowerCase()];
        } else {
          strategySpecific =
            strategyInfo?.shortId === "DQMF"
              ? (vault?.strategySpecific?.replace(
                  /\s*0x[a-fA-F0-9]+\.\.[a-fA-F0-9]+\s*/,
                  ""
                ) as string)
              : (vault?.strategySpecific as string);
        }
        /////
        const assetsSymbol = assets.map((asset) => asset?.symbol).join("+");

        const shareprice = !Number(vault.sharePrice) ? "1" : vault.sharePrice;

        const sharePriceLast = !Number(vault.sharePriceLast)
          ? "1"
          : vault.sharePriceLast;

        const strategyProtocols = getStrategyProtocols(
          strategyInfo.shortId as StrategyShortId
        );

        const underlyingLogo = strategyProtocols.length
          ? `https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${strategyProtocols[0].img}`
          : "";

        const underlyingData = {
          address: vault.underlying,
          symbol: vault.underlyingSymbol,
          decimals: vault.underlyingDecimals,
          logo: underlyingLogo,
        };

        /***** SONIC ACTIVE POINTS *****/
        let sonicActivePoints: undefined | number = undefined;

        if (chainID === "146") {
          let points = strategyAssets.reduce((acc, asset, index) => {
            let whitelistAssetPoints =
              (sonicWhitelistedAssets[
                asset as keyof typeof sonicWhitelistedAssets
              ] ?? 0) * 2;
            return (
              acc +
              ((assetsProportions?.[index] ?? 0) / 100) * whitelistAssetPoints
            );
          }, 0);

          const pointsMultiplier = extractPointsMultiplier(strategySpecific);

          if (pointsMultiplier) {
            points *= pointsMultiplier;
          }

          sonicActivePoints = Number(points.toFixed(1));
        }

        (vaults as { [key: string]: unknown })[vault?.address?.toLowerCase()] =
          {
            address: vault.address.toLowerCase(),
            name: vault.name,
            symbol: vault.symbol,
            created: vaultCreated,
            assetsPricesOnCreation: vault.assetsPricesOnCreation,
            type: vault.vaultType,
            strategy: vault.strategyId,
            shareprice,
            sharePriceLast,
            tvl: vault.tvl,
            strategySpecific,
            balance: "",
            balanceInUSD: 0,
            lastHardWork: vault.lastHardWork,
            hardWorkOnDeposit: vault.hardWorkOnDeposit,
            daily: (Number(APR) / 365).toFixed(2),
            assets,
            assetsSymbol,
            assetsProportions,
            strategyInfo,
            il: IL,
            underlying: underlyingData,
            strategyAddress: vault?.strategy?.toLowerCase(),
            strategyDescription: vault.strategyDescription,
            status: vault.status,
            version: vault.version,
            strategyVersion: vault.strategyVersion,
            NFTtokenID: vault.vaultManagerId,
            gasReserve: vault.gasReserve,
            rebalances,
            earningData: {
              apr: APRArray,
              apy: APYArray,
              poolSwapFeesAPR,
              farmAPR,
            },
            sortAPR: APRArray?.latest,
            pool: vault.pool,
            alm: vault.alm,
            risk: vault?.risk,
            lifetimeVsHold: Number(lifetimeVsHold),
            vsHold24H: Number(vsHold24H),
            vsHoldWeekly: Number(vsHoldWeekly),
            vsHoldAPR: Number(vsHoldAPR),
            assetsVsHold,
            isVsActive,
            yearnProtocols,
            network: chainID,
            sonicActivePoints,
            leverageLending: vault?.leverageLending,
          };

        return vaults;
      },
      Promise.resolve({})
    );

    localVaults[chainID] = APIVaults;
  };

  const getData = async () => {
    const versions: Record<string, string> = {};
    const vaultsTokens: TTokens = {};
    const platformData: TPlatformData = {};
    const assetBalances: { [key: string]: TBalances } = {};
    const vaultsData: TVaultDataKey = {};

    await Promise.all(
      CHAINS.map(async (chain) => {
        if (chain.id === "146") {
          /////***** SET VAULTS DATA *****/////
          const APIVaultsData = Object.values(
            stabilityAPIData?.vaults?.[chain.id] as Vaults
          );

          /////***** SET PLATFORM DATA *****/////

          vaultsTokens[chain.id] =
            stabilityAPIData?.platforms?.[chain.id]?.bcAssets ?? [];

          versions[chain.id] =
            stabilityAPIData?.platforms?.[chain.id]?.versions?.platform ?? "";

          platformData[chain.id] = {
            platform: platforms[chain.id],
            factory: deployments[
              chain.id
            ].core.factory.toLowerCase() as TAddress,
            buildingPermitToken: stabilityAPIData?.platforms?.[chain.id]
              ?.buildingPermitToken as TAddress,
            buildingPayPerVaultToken: stabilityAPIData?.platforms?.[chain.id]
              ?.buildingPayPerVaultToken as TAddress,
            zap: deployments[chain.id].core.zap.toLowerCase() as TAddress,
          };

          if (APIVaultsData.length) {
            await setVaultsData(APIVaultsData, prices?.[chain.id], chain.id);
            /////***** SET USER BALANCES *****/////
            if (isConnected) {
              isWeb3Load.set(true);

              let localClient = maticClient;
              if (chain.id === "8453") {
                localClient = baseClient;
              } else if (chain.id === "111188") {
                localClient = realClient;
              } else if (chain.id === "146") {
                localClient = sonicClient;
              }

              try {
                const contractAssetsBalances =
                  await getContractDataWithPagination(
                    localClient,
                    frontendContracts[chain.id],
                    "getBalanceAssets",
                    address as TAddress,
                    0
                  );

                const contractVaultsBalances =
                  await getContractDataWithPagination(
                    localClient,
                    frontendContracts[chain.id],
                    "getBalanceVaults",
                    address as TAddress,
                    0
                  );

                if (
                  contractVaultsBalances.length === 4 &&
                  contractAssetsBalances.length === 4
                ) {
                  const vaultsAddresses = contractVaultsBalances?.[1];
                  const vaultsBalances = contractVaultsBalances?.[3];

                  const erc20Balance: { [token: string]: bigint } = {};
                  //function -> .set vault/

                  vaultsData[chain.id] = addVaultData(
                    contractVaultsBalances as TFrontendBalances
                  );

                  assetBalances[chain.id] = addAssetsBalance(
                    contractAssetsBalances as TFrontendBalances
                  );

                  for (let i = 0; i < contractAssetsBalances[1].length; i++) {
                    erc20Balance[String(contractAssetsBalances[1][i])] = BigInt(
                      contractAssetsBalances[3][i]
                    );
                  }

                  if (Array.isArray(vaultsAddresses)) {
                    const vaultsPromise = await Promise.all(
                      vaultsAddresses.map(
                        async (vault: string, index: number) => {
                          if (localVaults[chain.id][vault.toLowerCase()]) {
                            return {
                              [vault.toLowerCase()]: {
                                ...localVaults[chain.id][vault.toLowerCase()],
                                balance: vaultsBalances?.[index],
                              },
                            };
                          }
                        }
                      )
                    );

                    localVaults[chain.id] = vaultsPromise.reduce(
                      (acc, curr) => ({ ...acc, ...curr }),
                      {}
                    ) as TVaults;
                  }
                  isVaultsLoaded.set(true);
                }
              } catch (txError: any) {
                console.log("BLOCKCHAIN ERROR:", txError);

                error.set({
                  state: true,
                  type: "WEB3",
                  description: txError?.message,
                });
              }
            }
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
    isVaultsLoaded.set(true);
  };

  const fetchAllData = async () => {
    error.set({ state: false, type: "", description: "" });

    getLocalStorageData();

    await getDataFromStabilityAPI();

    if (!isError) {
      getData();
    }

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
