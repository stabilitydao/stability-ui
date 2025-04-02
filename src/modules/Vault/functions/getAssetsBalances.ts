import { formatUnits } from "viem";

import { getTokenData } from "@utils";

import type { Dispatch, SetStateAction } from "react";

import type { TVaultBalance, TBalances, TUnderlyingToken } from "@types";

/**
 * Processes and formats the balances of multiple assets based on their decimals, and sets the formatted balances
 *
 * @example
 * ```
 * getAssetsBalances(balances, setBalances, ["0xToken1", "0xToken2"], underlyingToken);
 * ```
 *
 * @param {TBalances} balances - Object containing the raw balances of assets (typically in `bigint` format)
 * @param {SetStateAction<TVaultBalance>} setBalances - Function to update the state with the formatted vault balances
 * @param {string[]} options - Array of asset addresses (ERC-20 tokens) to retrieve and format balances for
 * @param {TUnderlyingToken} underlyingToken - Underlying token object containing address and balance information
 *
 * @returns {void} This function does not return a value. It updates the `setBalances` state with the formatted balances.
 */

export const getAssetsBalances = (
  balances: TBalances,
  setBalances: Dispatch<SetStateAction<TVaultBalance>>,
  options: string[],
  underlyingToken: TUnderlyingToken
): void => {
  const balance: TVaultBalance = {};

  if (balances) {
    for (let i = 0; i < options.length; i++) {
      const assetBalance = balances[options[i].toLowerCase()];

      const decimals = getTokenData(options[i])?.decimals;

      if (assetBalance && decimals) {
        balance[options[i]] = formatUnits(assetBalance, decimals);
      }
    }
  }

  if (underlyingToken?.address === options[0]) {
    balance[options[0]] = underlyingToken.balance;
  }

  setBalances(balance);
};
