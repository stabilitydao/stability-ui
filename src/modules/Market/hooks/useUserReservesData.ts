import { useState, useEffect } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits } from "viem";

import { getBalance, getAllowance, getTokenData } from "@utils";

import { web3clients, AaveProtocolDataProviderABI, AavePoolABI } from "@web3";

import {
  account,
  connected,
  currentChainID,
  lastTx,
  userReservesData,
} from "@store";

import { TAddress, TUserReservesMap, TMarket } from "@types";

type TResult = {
  data: TUserReservesMap | undefined;
  isLoading: boolean;
  refetch: () => void;
};

export const useUserReservesData = (market: TMarket): TResult => {
  const $account = useStore(account);
  const $connected = useStore(connected);
  const $currentChainID = useStore(currentChainID);
  const $lastTx = useStore(lastTx);
  const $userReservesData = useStore(userReservesData);

  const marketId = market.marketId;
  const client = web3clients[market.network?.id as keyof typeof web3clients];
  const pool = market.pool;
  const provider = market.protocolDataProvider;

  const [isLoading, setIsLoading] = useState(!$userReservesData[marketId]);

  const fetchUserReservesData = async () => {
    if (!$connected || !$account || !market?.reserves?.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const reservesMap: TUserReservesMap = {};

      let totalCollateralBase = 0;
      let totalDebtBase = 0;
      let availableBorrowsBase = 0;
      let liquidationThreshold = 0;

      try {
        const userData = (await client.readContract({
          address: pool,
          abi: AavePoolABI,
          functionName: "getUserAccountData",
          args: [$account],
        })) as bigint[];

        totalCollateralBase = Number(formatUnits(userData[0], 8));
        totalDebtBase = Number(formatUnits(userData[1], 8));
        availableBorrowsBase = Number(formatUnits(userData[2], 8));
        liquidationThreshold = Number(userData[3]) / 10000;
      } catch (err) {
        console.warn("Failed to get availableBorrowsBase:", err);
      }

      for (const asset of market.reserves) {
        const address = asset.address as TAddress;
        const aTokenAddress = asset.aToken as TAddress;
        const decimals = getTokenData(address)?.decimals ?? 18;

        const rawATokenBalance = await getBalance(
          client,
          aTokenAddress,
          $account
        );

        const withdraw = formatUnits(rawATokenBalance, decimals);

        let maxWithdraw = "0";

        if (Number(withdraw)) {
          try {
            const priceUSD = Number(asset.price);

            if (!!priceUSD) {
              let maxWithdrawUSD = 0;

              if (!totalDebtBase) {
                maxWithdrawUSD = Number(withdraw) * priceUSD;
              } else {
                const minCollateralUSD = totalDebtBase / liquidationThreshold;
                maxWithdrawUSD = Math.max(
                  totalCollateralBase - minCollateralUSD,
                  0
                );
              }

              const maxWithdrawTokens = maxWithdrawUSD / priceUSD;

              const _maxWithdraw = Math.min(
                maxWithdrawTokens,
                Number(withdraw)
              );

              maxWithdraw = _maxWithdraw.toString();
            }
          } catch (err) {
            console.warn("Failed to calculate maxWithdraw:", err);
          }
        }

        const [rawBalance, rawAllowance] = await Promise.all([
          getBalance(client, address, $account),
          getAllowance(client, address, $account, pool),
        ]);

        const balance = formatUnits(rawBalance, decimals);
        const allowance = formatUnits(rawAllowance, decimals);

        const reserveData: any = {
          supply: { balance, allowance },
          withdraw: { balance: withdraw, maxWithdraw },
        };

        if (asset.isBorrowable) {
          const tokenPrice = Number(asset.price);
          let borrow = { balance: "0" };

          if (availableBorrowsBase > 0 && tokenPrice > 0) {
            const rawAmount =
              (availableBorrowsBase / tokenPrice) * 10 ** decimals;
            const safeAmount = BigInt(Math.floor(rawAmount * 0.999999));
            borrow = {
              balance: formatUnits(safeAmount, decimals),
            };
          }

          reserveData.borrow = borrow;

          const userReserveData = (await client.readContract({
            address: provider,
            abi: AaveProtocolDataProviderABI,
            functionName: "getUserReserveData",
            args: [address, $account],
          })) as bigint[];

          const rawVariableDebt = userReserveData[2];

          const repayBalance = formatUnits(rawVariableDebt, decimals);

          const rawRepayAllowance = await getAllowance(
            client,
            address,
            $account,
            pool
          );

          const repayAllowance = formatUnits(rawRepayAllowance, decimals);

          reserveData.repay = {
            balance: repayBalance,
            allowance: repayAllowance,
          };
        }

        reservesMap[address] = reserveData;
      }

      userReservesData.setKey(marketId, reservesMap);
    } catch (err) {
      console.error("Failed to fetch user reserves data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!$userReservesData[marketId]) {
      fetchUserReservesData();
    }
  }, [$account, $connected, $currentChainID, $lastTx, marketId]);

  return {
    data: $userReservesData[marketId],
    isLoading,
    refetch: fetchUserReservesData,
  };
};
