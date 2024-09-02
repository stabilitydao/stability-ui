import { formatUnits } from "viem";

import { getTokenData } from "@utils";

import type { SetStateAction } from "react";
import type { TVaultBalance, TBalances, TUnderlyingToken } from "@types";

const getAssetsBalances = (
  balances: TBalances,
  setBalances: SetStateAction<TVaultBalance>,
  options: string[],
  underlyingToken: TUnderlyingToken
): void => {
  const balance: TVaultBalance = {};

  if (balances) {
    for (let i = 0; i < options.length; i++) {
      const decimals = getTokenData(options[i])?.decimals;

      if (decimals) {
        balance[options[i]] = formatUnits(
          balances[options[i].toLowerCase()],
          decimals
        );
      }
    }
  }
  if (underlyingToken?.address === options[0]) {
    balance[options[0]] = underlyingToken.balance;
  }

  setBalances(balance);
};

export { getAssetsBalances };
