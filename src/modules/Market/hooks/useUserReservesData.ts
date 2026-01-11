import { useEffect } from "react";

import { useStore } from "@nanostores/react";

import { formatUnits, erc20Abi, Abi } from "viem";

import { getTokenData } from "@utils";

import { web3clients, AaveProtocolDataProviderABI, AavePoolABI } from "@web3";

import {
  account,
  connected,
  currentChainID,
  lastTx,
  userReservesData,
  userReservesLoading,
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
  const $userReservesLoading = useStore(userReservesLoading);

  const marketId = market.marketId;
  const client = web3clients[market.network?.id as keyof typeof web3clients];
  const pool = market.pool;
  const provider = market.protocolDataProvider;

  const isLoading = $userReservesLoading[marketId] ?? false;

  const fetchUserReservesData = async () => {
    if (
      !$connected ||
      !$account ||
      !market?.reserves?.length ||
      !market?.reserves?.every(
        (reserve) => reserve?.price && reserve?.price != "0"
      )
    ) {
      userReservesLoading.setKey(marketId, false);
      return;
    }

    userReservesLoading.setKey(marketId, true);

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
        console.warn("Failed to get user account data:", err);
      }

      const contracts = market.reserves.flatMap((asset) => {
        const address = asset.address as TAddress;
        const aToken = asset.aToken as TAddress;

        const calls = [
          {
            address: aToken,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [$account],
          },
          {
            address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [$account],
          },
          {
            address,
            abi: erc20Abi,
            functionName: "allowance",
            args: [$account, pool],
          },
        ];

        if (asset.isBorrowable) {
          calls.push({
            address: provider,
            abi: AaveProtocolDataProviderABI as Abi,
            functionName: "getUserReserveData",
            args: [address, $account],
          });
        }

        return calls;
      });

      const results = await client.multicall({
        contracts,
        allowFailure: false,
      });

      let index = 0;

      for (const asset of market.reserves) {
        const address = asset.address as TAddress;
        const decimals = getTokenData(address)?.decimals ?? 18;
        const priceUSD = Number(asset.price);

        const rawATokenBalance = results[index++] as bigint;
        const rawBalance = results[index++] as bigint;
        const rawAllowance = results[index++] as bigint;

        const withdraw = formatUnits(rawATokenBalance, decimals);
        const balance = formatUnits(rawBalance, decimals);
        const allowance = formatUnits(rawAllowance, decimals);

        let maxWithdraw = "0";

        if (Number(withdraw)) {
          try {
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

            let maxWithdrawTokens = maxWithdrawUSD / priceUSD;

            let _maxWithdraw = withdraw;

            if (maxWithdrawTokens < Number(withdraw)) {
              maxWithdrawTokens *= 0.998999;
              _maxWithdraw = maxWithdrawTokens.toString();
            }

            maxWithdraw = _maxWithdraw;
          } catch (err) {
            console.warn("Failed to calculate maxWithdraw:", err);
          }
        }

        const reserveData: any = {
          supply: { balance, allowance },
          withdraw: { balance: withdraw, maxWithdraw },
        };

        if (asset.isBorrowable) {
          const userReserveData = results[index++] as bigint[];
          const rawVariableDebt = userReserveData[2];

          const repayBalance = formatUnits(rawVariableDebt, decimals);

          let borrow = { balance: "0", maxBorrow: "0" };

          if (availableBorrowsBase > 0 && priceUSD > 0) {
            const rawAmount =
              (availableBorrowsBase / priceUSD) * 10 ** decimals;

            const safeAmount = BigInt(Math.floor(rawAmount * 0.999999));
            const maxBorrow = formatUnits(safeAmount, decimals);

            const availableToBorrow = Number(asset.availableToBorrow) || 0;

            borrow = {
              balance: String(Math.min(availableToBorrow, Number(maxBorrow))),
              maxBorrow,
            };
          }

          reserveData.borrow = borrow;
          reserveData.repay = {
            balance: repayBalance,
            allowance,
          };
        }

        reservesMap[address] = reserveData;
      }

      userReservesData.setKey(marketId, reservesMap);
    } catch (err) {
      console.error("Failed to fetch user reserves data:", err);
    } finally {
      userReservesLoading.setKey(marketId, false);
    }
  };

  useEffect(() => {
    if (!$userReservesData[marketId]) {
      fetchUserReservesData();
    }
  }, [$account, $connected, $currentChainID, $lastTx, marketId, market]);

  return {
    data: $userReservesData[marketId],
    isLoading,
    refetch: fetchUserReservesData,
  };
};
