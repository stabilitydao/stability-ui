import type React from "react";

import { useEffect } from "react";

import { formatUnits } from "viem";

import axios from "axios";

import { useStore } from "@nanostores/react";

import { useAccount, usePublicClient } from "wagmi";

import { WagmiLayout } from "@layouts";

import { deployments, getAsset, seeds } from "@stabilitydao/stability";

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
  reload,
  error,
  isWeb3Load,
  currentChainID,
  assetsPrices,
  assetsBalances,
  vaultData,
} from "@store";

import { wagmiConfig, platforms, PlatformABI, IVaultManagerABI } from "@web3";

import {
  calculateAPY,
  getStrategyInfo,
  getTokenData,
  addAssetsBalance,
  addVaultData,
  getTimeDifference,
  determineAPR,
  getLocalStorageData,
} from "@utils";

import {
  YEARN_PROTOCOLS,
  STRATEGY_SPECIFIC_SUBSTITUTE,
  CHAINS,
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
  TPlatformGetBalance,
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

  const $lastTx = useStore(lastTx);
  const $reload = useStore(reload);

  const localVaults: {
    [network: string]: TVaults;
  } = {};

  let prices: TMultichainPrices = {};

  let stabilityAPIData: TAPIData = {};

  const getDataFromStabilityAPI = async () => {
    try {
      const response = await axios.get(seeds[0]);
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

        const strategyInfo = getStrategyInfo(vault?.symbol, vault.strategyId);

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
        let poolSwapFeesAPRDaily = 0;
        let poolSwapFeesAPRWeekly = 0;

        const dailyFarmApr = vault.apr?.income24h
          ? Number(vault.apr?.income24h)
          : 0;

        const weeklyFarmApr = vault.apr?.incomeWeek
          ? Number(vault.apr?.incomeWeek)
          : 0;

        if (underlying) {
          poolSwapFeesAPRDaily = underlying?.apr?.daily || 0;
          poolSwapFeesAPRWeekly =
            underlying?.apr?.weekly || underlying?.apr?.monthly || 0;
        }
        if (strategyName === "IQMF" || strategyName === "IRMF") {
          let fee = vault?.almFee?.income || 0;

          //////
          poolSwapFeesAPRDaily =
            Number(formatUnits(almRebalanceEntity?.[0] || 0n, 8)) -
            (Number(formatUnits(almRebalanceEntity?.[0] || 0n, 8)) / 100) * fee;

          poolSwapFeesAPRWeekly =
            Number(formatUnits(almRebalanceEntity?.[2] || 0n, 8)) -
            (Number(formatUnits(almRebalanceEntity?.[2] || 0n, 8)) / 100) * fee;

          dailyAPR =
            Number(formatUnits(almRebalanceEntity?.[1] || 0n, 8)) -
            (Number(formatUnits(almRebalanceEntity?.[1] || 0n, 8)) / 100) * fee;

          if (!poolSwapFeesAPRDaily) poolSwapFeesAPRDaily = 0;
          if (!poolSwapFeesAPRWeekly) poolSwapFeesAPRWeekly = 0;
          if (!dailyAPR) dailyAPR = 0;

          // rebalances
          const totalRebalances = vault.almRebalanceRawData || [];

          const _24HRebalances = totalRebalances.filter(
            (obj: string[]) => Number(obj[3]) >= NOW - 86400
          ).length;
          const _7DRebalances = totalRebalances.filter(
            (obj: string[]) => Number(obj[3]) >= NOW - 86400 * 7
          ).length;

          rebalances = { daily: _24HRebalances, weekly: _7DRebalances };
        }

        const APR = (
          Number(vault?.apr?.incomeLatest) + Number(dailyAPR)
        ).toFixed(2);

        const APY = calculateAPY(APR).toFixed(2);

        const APRWithoutFees = Number(vault?.apr?.incomeLatest).toFixed(2) || 0;

        ///////
        const dailyTotalAPRWithFees =
          Number(poolSwapFeesAPRDaily) + Number(dailyFarmApr);
        const weeklyTotalAPRWithFees =
          Number(poolSwapFeesAPRWeekly) + Number(weeklyFarmApr);

        const APRArray = {
          latest: String(APR),
          daily: determineAPR(vault.apr?.income24h, dailyTotalAPRWithFees, APR),
          weekly: determineAPR(
            vault.apr?.incomeWeek,
            weeklyTotalAPRWithFees,
            APR
          ),
        };
        const APYArray = {
          latest: APY,
          daily: determineAPR(
            vault.apr?.income24h,
            calculateAPY(dailyTotalAPRWithFees).toFixed(2),
            APY
          ),
          weekly: determineAPR(
            vault.apr?.incomeWeek,
            calculateAPY(weeklyTotalAPRWithFees).toFixed(2),
            APY
          ),
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
          latest: APRWithoutFees,
          daily: determineAPR(
            vault.apr?.income24h,
            dailyFarmApr,
            APRWithoutFees
          ),
          weekly: determineAPR(
            vault.apr?.incomeWeek,
            weeklyFarmApr,
            APRWithoutFees
          ),
        };

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

        const lifetimeVsHoldAPR =
          vault.apr?.vsHoldLifetime &&
          getTimeDifference(vaultCreated)?.days >= 3
            ? Number(vault.apr?.vsHoldLifetime).toFixed(2)
            : 0;

        const currentTime = Math.floor(Date.now() / 1000);

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
        if (vault.apr?.vsHoldAssetsLifetime && prices) {
          lifetimeTokensHold = strategyAssets.map(
            (asset: string, index: number) => {
              const price = vault?.assetsPricesLast?.[index]
                ? Number(vault?.assetsPricesLast?.[index])
                : Number(prices[asset?.toLowerCase()]?.price);

              const priceOnCreation = Number(
                formatUnits(
                  BigInt(vault?.assetsPricesOnCreation?.[index] || 0),
                  18
                )
              );

              const priceDifference =
                ((price - priceOnCreation) / priceOnCreation) * 100;

              const yearPercentDiff =
                Number(vault.apr?.vsHoldAssetsLifetime[index]) || 0;

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
          getTimeDifference(vaultCreated).days > 2 &&
          !!Number(vault.sharePrice);

        /////***** YEARN PROTOCOLS *****/////
        let yearnProtocols: TYearnProtocol[] = [];
        let strategySpecific: string = "";

        if (vault.strategySpecific && strategyInfo.shortId === "Y") {
          YEARN_PROTOCOLS.map((protocol: string) => {
            if (vault?.strategySpecific?.toLowerCase().includes(protocol)) {
              switch (protocol) {
                case "aave":
                  yearnProtocols.push({
                    title: "Aave",
                    link: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Aave.svg",
                  });
                  break;
                case "compound":
                  yearnProtocols.push({
                    title: "Compound",
                    link: "https://raw.githubusercontent.com/stabilitydao/.github/main/assets/Compound.svg",
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

        (vaults as { [key: string]: unknown })[vault?.address?.toLowerCase()] =
          {
            address: vault.address.toLowerCase(),
            name: vault.name,
            symbol: vault.symbol,
            created: vaultCreated,
            assetsPricesOnCreation: vault.assetsPricesOnCreation,
            type: vault.vaultType,
            strategy: vault.strategyId,
            shareprice: vault.sharePrice,
            tvl: vault.tvl,
            strategySpecific,
            balance: "",
            lastHardWork: vault.lastHardWork,
            hardWorkOnDeposit: vault.hardWorkOnDeposit,
            daily: (Number(APR) / 365).toFixed(2),
            assets,
            assetsSymbol,
            assetsProportions,
            strategyInfo,
            il: IL,
            underlying: vault.underlying,
            strategyAddress: vault?.strategy?.toLowerCase(),
            strategyDescription: vault.strategyDescription,
            status: vault.status,
            version: vault.version,
            strategyVersion: vault.strategyVersion,
            underlyingSymbol: vault?.underlyingSymbol || "",
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
        /////***** SET VAULTS DATA *****/////
        const APIVaultsData = Object.entries(
          stabilityAPIData?.vaults?.[chain.id] as Vaults
        ).map(([, vault]) => vault);

        await setVaultsData(APIVaultsData, prices?.[chain.id], chain.id);

        /////***** SET PLATFORM DATA *****/////

        vaultsTokens[chain.id] =
          stabilityAPIData?.platforms?.[chain.id]?.bcAssets ?? [];

        versions[chain.id] =
          stabilityAPIData?.platforms?.[chain.id]?.versions?.platform ?? "";

        platformData[chain.id] = {
          platform: platforms[chain.id],
          factory: deployments[chain.id].core.factory.toLowerCase() as TAddress,
          buildingPermitToken: stabilityAPIData?.platforms?.[chain.id]
            ?.buildingPermitToken as TAddress,
          buildingPayPerVaultToken: stabilityAPIData?.platforms?.[chain.id]
            ?.buildingPayPerVaultToken as TAddress,
          zap: deployments[chain.id].core.zap.toLowerCase() as TAddress,
        };

        /////***** SET USER BALANCES *****/////
        if (isConnected) {
          isWeb3Load.set(true);

          let localClient = maticClient;
          if (chain.id === "8453") {
            localClient = baseClient;
          }

          try {
            const contractBalance = (await localClient?.readContract({
              address: platforms[chain.id],
              abi: PlatformABI,
              functionName: "getBalance",
              args: [address as TAddress],
            })) as TPlatformGetBalance;

            const contractVaults = (await localClient?.readContract({
              address: contractBalance[6][1] as TAddress,
              abi: IVaultManagerABI,
              functionName: "vaults",
            })) as string[];

            if (contractBalance) {
              const buildingPayPerVaultTokenBalance: bigint =
                contractBalance[8];
              const erc20Balance: { [token: string]: bigint } = {};
              const erc721Balance: { [token: string]: bigint } = {};
              //function -> .set vault/

              vaultsData[chain.id] = addVaultData(
                contractBalance as TPlatformGetBalance
              );

              assetBalances[chain.id] = addAssetsBalance(
                contractBalance as TPlatformGetBalance
              );

              for (let i = 0; i < contractBalance[1].length; i++) {
                erc20Balance[String(contractBalance[0][i])] = BigInt(
                  contractBalance[2][i]
                );
              }

              for (let i = 0; i < contractBalance[6].length; i++) {
                erc721Balance[contractBalance[6][i]] =
                  contractBalance?.[7]?.[i];
              }

              userBalance.set({
                buildingPayPerVaultTokenBalance,
                erc20Balance,
                erc721Balance,
              });

              balances.set(contractBalance);
            }

            if (Array.isArray(contractVaults[0])) {
              const vaultsPromise = await Promise.all(
                contractVaults[0].map(async (vault: string, index: number) => {
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
              description: txError?.message,
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
