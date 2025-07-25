import type React from "react";

import { useEffect } from "react";

import { formatUnits } from "viem";

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
  metaVaults,
  marketPrices,
} from "@store";

import {
  platforms,
  frontendContracts,
  web3clients,
  IMetaVaultABI,
} from "@web3";

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
  enrichAndResolveMetaVaults,
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
  TMetaVault,
  TMarketPrices,
  // TAsset,
} from "@types";

import type { Vaults, Vault } from "@stabilitydao/stability/out/api.types";

const AppStore = (props: React.PropsWithChildren): JSX.Element => {
  const { isConnected, address } = useAccount();

  const { chain } = useAccount();

  const _publicClient = usePublicClient();

  const $lastTx = useStore(lastTx);
  const $reload = useStore(reload);
  const $metaVaults = useStore(metaVaults);

  let isError = false;

  const localVaults: {
    [network: string]: TVaults;
  } = {};

  const localMetaVaults: { [network: string]: TMetaVault[] } = {};

  let prices: TMultichainPrices = {};

  let stabilityAPIData: TAPIData = {};

  const handleError = (errType: string, description: string) => {
    error.set({ state: true, type: errType, description });
    isError = true;
  };

  const getDataFromStabilityAPI = async () => {
    const maxRetries = 3;

    try {
      let isResponse = false;

      for (let currentRetry = 0; currentRetry < maxRetries; currentRetry++) {
        for (const seed of seeds) {
          try {
            const response = await axios.get(seed);

            stabilityAPIData = response.data;

            if (stabilityAPIData?.error) {
              handleError("API", stabilityAPIData?.error);
              return;
            }

            if (stabilityAPIData?.assetPrices) {
              assetsPrices.set(stabilityAPIData.assetPrices);
              prices = stabilityAPIData.assetPrices;
            }

            apiData.set(stabilityAPIData);
            isResponse = true;
            break;
          } catch (err) {
            console.log("API Error:", err);
            console.log(
              `Retrying (${currentRetry + 1}/${maxRetries})...`,
              seed
            );
          }
        }

        if (isResponse) break;

        await new Promise((resolve) => setTimeout(resolve, 1000));
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

        let strategySpecific: string = vault.strategySpecific || "";

        const strategyInfo = getStrategyInfo(
          vault.strategyId,
          vault.strategyShortId as StrategyShortId,
          strategySpecific as string,
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
        let totalAPRArray = {
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
        let gemsAPR = {
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

          gemsAPR = {
            latest: String(
              Number(APRArray.latest) *
                stabilityAPIData.rewards.gemsAprMultiplier
            ),
            daily: String(
              Number(APRArray.daily) *
                stabilityAPIData.rewards.gemsAprMultiplier
            ),
            weekly: String(
              Number(APRArray.weekly) *
                stabilityAPIData.rewards.gemsAprMultiplier
            ),
          };

          totalAPRArray = {
            latest: (Number(APRArray.latest) + Number(gemsAPR.latest)).toFixed(
              2
            ),
            daily: (Number(APRArray.daily) + Number(gemsAPR.daily)).toFixed(2),
            weekly: (Number(APRArray.weekly) + Number(gemsAPR.weekly)).toFixed(
              2
            ),
          };

          APY = calculateAPY(totalAPRArray.latest).toFixed(2);

          APYArray = {
            latest: Number(totalAPRArray.latest) < 0 ? "0" : APY,
            daily:
              Number(totalAPRArray.daily) < 0
                ? "0"
                : determineAPR(
                    vault?.income?.apr24h,
                    calculateAPY(totalAPRArray.daily).toFixed(2),
                    APY,
                    vault.strategyShortId
                  ),
            weekly:
              Number(totalAPRArray.weekly) < 0
                ? "0"
                : determineAPR(
                    vault?.income?.aprWeek,
                    calculateAPY(Number(totalAPRArray.weekly)).toFixed(2),
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
        let sonicPoints: undefined | number = undefined;
        let ringsPoints: undefined | number = undefined;

        let liveAPR: undefined | number = undefined;
        let assetAPR: undefined | number = undefined;

        if (chainID === "146") {
          // Points
          switch (vault?.address?.toLowerCase()) {
            case "0x4422117b942f4a87261c52348c36aefb0dcddb1a":
              sonicPoints = 72;
              break;
            case "0x908db38302177901b10ffa74fa80adaeb0351ff1":
              sonicPoints = 108;
              ringsPoints = 18;
              break;
            case "0x46bc0f0073ff1a6281d401cdc6cd56cec0495047":
              sonicPoints = 48;
              ringsPoints = 9;
              break;
            default:
              const scProportionIndex = assets.findIndex((asset) =>
                ["scETH", "scUSD"].includes(asset?.symbol as string)
              );

              let points = strategyAssets.reduce((acc, asset, index) => {
                let whitelistAssetPoints =
                  (sonicWhitelistedAssets[
                    asset as keyof typeof sonicWhitelistedAssets
                  ] ?? 0) * 2;
                return (
                  acc +
                  ((assetsProportions?.[index] ?? 0) / 100) *
                    whitelistAssetPoints
                );
              }, 0);

              const pointsMultiplier =
                extractPointsMultiplier(strategySpecific);

              if (pointsMultiplier) {
                points *= pointsMultiplier;
              }

              if (scProportionIndex !== -1) {
                const scProportion = assetsProportions[scProportionIndex];

                ringsPoints = Number(((scProportion / 100) * 1.5).toFixed(2));
              }

              sonicPoints = Number(points.toFixed(1));
              break;
          }
          // Leverage lending live APR & asset APR
          if (
            vault?.address?.toLowerCase() ===
            "0x2fbeba931563feaab73e8c66d7499c49c8ada224"
          ) {
            const stS = (stabilityAPIData?.underlyings?.[146] as any)?.[
              "0xE5DA20F15420aD15DE0fa650600aFc998bbE3955"
            ];

            if (stS) {
              const supplyAPR = vault?.leverageLending?.supplyApr ?? 0;
              const borrowAPR = vault?.leverageLending?.borrowApr ?? 0;
              const leverage = vault?.leverageLending?.leverage ?? 0;
              const stSAPR = stS?.apr?.daily ?? 0;

              liveAPR = (supplyAPR - borrowAPR - stSAPR) * leverage;
            }
          } else if (vault?.leverageLending && vault?.assets?.length === 1) {
            const LLAssets = stabilityAPIData?.underlyings?.[146];

            const assetAPRData = LLAssets?.[vault?.assets?.[0]];

            if (assetAPRData) {
              const supplyAPR = vault?.leverageLending?.supplyApr ?? 0;
              const borrowAPR = vault?.leverageLending?.borrowApr ?? 0;
              const leverage = vault?.leverageLending?.leverage ?? 0;
              const dailyAPR = assetAPRData?.apr?.daily ?? 0;

              assetAPR = dailyAPR;
              liveAPR = (dailyAPR + supplyAPR - borrowAPR) * leverage;
            }
          }
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
              apr: totalAPRArray,
              apy: APYArray,
              poolSwapFeesAPR,
              farmAPR,
              gemsAPR,
            },
            sortAPR: totalAPRArray?.latest,
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
            sonicPoints,
            ringsPoints,
            leverageLending: vault?.leverageLending,
            liveAPR,
            assetAPR,
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
    const _marketPrices: TMarketPrices = {};

    /***** PRICES *****/
    if (stabilityAPIData.prices) {
      Object.entries(stabilityAPIData.prices).forEach(([key, value]) => {
        const isIntegerPrice = ["BTC", "ETH"].includes(key);
        _marketPrices[key] = {
          ...value,
          price: isIntegerPrice
            ? Math.round(parseFloat(value.price)).toString()
            : value.price,
        };
      });

      marketPrices.set(_marketPrices);
    }

    /***** VAULTS *****/
    await Promise.all(
      Object.keys(stabilityAPIData?.vaults as TVaults).map(async (key) => {
        const chain = CHAINS.find(({ id }) => id === key);
        if (!chain) return;
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
          factory: deployments[chain.id].core.factory.toLowerCase() as TAddress,
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

            let localClient = web3clients[chain.id] ?? web3clients["146"];

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
                        const vaultKey = vault.toLowerCase();
                        const vaultData = localVaults[chain.id][vaultKey];

                        const balance = vaultsBalances?.[index];

                        if (vaultData && balance !== undefined) {
                          const sharePrice = Number(vaultData.shareprice ?? 0);
                          const formattedBalance = Number(
                            formatUnits(BigInt(balance), 18)
                          );
                          const balanceInUSD = formattedBalance * sharePrice;

                          return {
                            [vaultKey]: {
                              ...vaultData,
                              balance,
                              balanceInUSD,
                            },
                          };
                        }

                        return null;
                      }
                    )
                  );

                  localVaults[chain.id] = vaultsPromise
                    .filter(Boolean)
                    .reduce(
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
      })
    );

    /***** META VAULTS *****/
    await Promise.all(
      Object.keys(stabilityAPIData?.metaVaults as TMetaVault[]).map(
        async (key) => {
          const chain = CHAINS.find(({ id }) => id === key);
          if (!chain) return;
          /////***** SET VAULTS DATA *****/////
          const APIMetaVaultsData = Object.values(
            stabilityAPIData?.metaVaults?.[chain.id] as Vaults
          );

          if (APIMetaVaultsData.length) {
            const _metaVaults = APIMetaVaultsData.map((metaVault) => {
              const isSMetaVault = ["metaS", "metawS"].includes(
                metaVault?.symbol
              );

              let merklAPR = 0;

              let totalAPR = 0;

              let gemsAPR = 0;

              let sonicPoints = 0;

              if (["metaUSD", "metaS"].includes(metaVault.symbol)) {
                const multiplier =
                  stabilityAPIData?.rewards?.metaVaultAprMultiplier?.[
                    metaVault.address
                  ] || 0;

                if (multiplier) {
                  gemsAPR = Number(metaVault.APR) * Number(multiplier);
                }

                merklAPR = Number(metaVault.merklAPR);

                if (metaVault.symbol === "metaUSD") {
                  sonicPoints = 10;
                } else {
                  sonicPoints = 12;
                }
              }

              totalAPR = Number(metaVault.APR) + merklAPR + gemsAPR;

              return {
                ...metaVault,
                status: "Active",
                isMetaVault: true,
                balanceInUSD: 0,
                deposited: formatUnits(
                  metaVault.deposited,
                  isSMetaVault ? 18 : 6
                ),
                gemsAPR,
                merklAPR,
                totalAPR,
                sonicPoints,
              };
            });

            localMetaVaults[chain.id] = enrichAndResolveMetaVaults(
              localVaults[chain.id],
              _metaVaults
            );

            if (isConnected) {
              let localClient = web3clients[chain.id] ?? web3clients["146"];

              try {
                const balances = await Promise.all(
                  localMetaVaults[chain.id].map(async (mv) => {
                    const isSMetaVault = ["metaS", "metawS"].includes(
                      mv?.symbol
                    );

                    let balanceInUSD = 0;

                    const metaVaultBalance = (await localClient.readContract({
                      address: mv.address,
                      abi: IMetaVaultABI,
                      functionName: "balanceOf",
                      args: [address as TAddress],
                    })) as bigint;

                    const formattedBalance = Number(
                      formatUnits(BigInt(metaVaultBalance), 18)
                    );

                    const price = isSMetaVault
                      ? Number(_marketPrices?.S?.price ?? 1)
                      : 1;

                    balanceInUSD = formattedBalance * price;

                    return {
                      ...mv,
                      balance: metaVaultBalance,
                      balanceInUSD,
                    };
                  })
                );

                localMetaVaults[chain.id] = balances;
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
      )
    );

    isWeb3Load.set(false);
    assetsBalances.set(assetBalances);
    vaultData.set(vaultsData);
    vaults.set(localVaults);
    metaVaults.set(localMetaVaults);
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
    if (!$metaVaults) {
      const metaVaultsWithName = deployments["146"].metaVaults?.map(
        (metaV) => ({ ...metaV, name: getTokenData(metaV.address)?.name })
      );

      metaVaults.set({ "146": metaVaultsWithName });
    }
    fetchAllData();
  }, [address, chain?.id, isConnected, $lastTx, $reload]);

  return (
    <WagmiLayout>
      <div className="flex flex-col flex-1">{props.children}</div>
    </WagmiLayout>
  );
};

export { AppStore };
