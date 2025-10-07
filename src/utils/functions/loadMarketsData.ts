import type { TMarket, TMarketReserve } from "@types";

import { lendingMarkets } from "@stabilitydao/stability";

import { MarketData } from "@stabilitydao/stability/out/api.types";

const loadMarketsData = async (
  markets: MarketData
): Promise<{ [chainId: string]: TMarket[] }> => {
  const localMarkets: { [chainId: string]: TMarket[] } = {};

  for (const libMarket of lendingMarkets) {
    const chainId = libMarket.chainId;
    const marketId = libMarket.id;

    if (!localMarkets[chainId]) {
      localMarkets[chainId] = [];
    }

    const apiMarket = markets?.[+chainId]?.[marketId];

    const reserves: TMarketReserve[] = libMarket.reserves.map((reserve) => {
      const backendData =
        apiMarket?.reserves?.[reserve.asset.toLowerCase()] ?? {};

      return {
        address: reserve.asset,
        aToken: reserve.aToken,
        aTokenSymbol: reserve.aTokenSymbol,
        isBorrowable: reserve.isBorrowable,
        oracle: reserve.oracle,
        oracleName: reserve.oracleName,
        treasury: reserve.treasury,
        name: backendData?.name ?? "",
        debtToken: backendData?.debtToken ?? "",
        price: backendData?.price ?? "0",
        supplyAPR: backendData?.supplyAPR ?? "0",
        borrowAPR: backendData?.borrowAPR ?? "0",
        supplyTVL: backendData?.supplyTVL ?? "0",
        supplyTVLInUSD: backendData?.supplyTVLInUSD ?? "0",
        borrowTVL: backendData?.borrowTVL ?? "0",
        borrowTVLInUSD: backendData?.borrowTVLInUSD ?? "0",
        cap: backendData?.cap ?? "0",
        borrowCap: backendData?.borrowCap ?? "0",
        reserveFactor: backendData?.reserveFactor ?? "0",
        maxLtv: backendData?.maxLtv ?? "0",
        liquidationThreshold: backendData?.liquidationThreshold ?? "0",
        liquidationBonus: backendData?.liquidationBonus ?? "0",
        utilization: backendData?.utilization ?? "0",
        availableToBorrow: backendData?.availableToBorrow ?? "0",
        availableToBorrowInUSD: backendData?.availableToBorrowInUSD ?? "0",
      };
    });

    const mergedMarket: TMarket = {
      marketId: marketId,
      engine: libMarket.engine,
      pool: libMarket.pool,
      protocolDataProvider: libMarket.protocolDataProvider,
      deployed: libMarket.deployed,
      reserves,
    };

    localMarkets[chainId].push(mergedMarket);
  }

  return localMarkets;
};

export { loadMarketsData };
