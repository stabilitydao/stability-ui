import axios from "axios";

import { formatUnits } from "viem";

import { getTokenData } from "./getTokenData";

import type { TAddress } from "@types";

type ReturnData = {
  symbol: string;
  address: string;
  agg: string;
  amountIn: string;
  amountOut: string;
  router: string;
  txData: string;
  img: string;
};

/**
 * Fetches swap route data from 1inch API for a given token pair and amount
 *
 * @example
 * ```
 * const swapData = await get1InchRoutes(
 *   "137",
 *   "0xTokenAddress1",
 *   "0xTokenAddress2",
 *   18,
 *   "1000000000000000000",
 *   setError,
 *   "deposit"
 * );
 * ```
 *
 * @param {string} network - Network on which the swap will occur (e.g., "137")
 * @param {TAddress} fromAddress - Contract address of the token being swapped from
 * @param {TAddress} toAddress - Contract address of the token being swapped to
 * @param {number} decimals - Number of decimals for the token being swapped from
 * @param {string | bigint} amount - Amount of tokens being swapped (in smallest unit)
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setError - A React state dispatch function for setting error state
 * @param {string} type - The type of transaction, e.g., "deposit" or "withdraw"
 *
 * @returns {Promise<ReturnData | undefined>} A Promise that resolves to an object containing details of the swap route, or `undefined` if an error occurs
 *
 * @remarks
 * - This function makes multiple attempts (up to 3 retries) to fetch data from the 1inch API in case of errors
 * - In case of an API failure after retries, the function logs an error and sets the `setError` state to `true`
 *
 */

export const get1InchRoutes = async (
  network: string,
  fromAddress: TAddress,
  toAddress: TAddress,
  decimals: number,
  amount: string | bigint,
  setError: React.Dispatch<React.SetStateAction<boolean>>,
  type: string
): Promise<ReturnData | undefined> => {
  const tokenData = getTokenData(toAddress);
  const symbol = tokenData?.symbol;
  const tokenDecimals = tokenData?.decimals || 18;
  const address = type === "deposit" ? toAddress : fromAddress;

  if (
    fromAddress.toLowerCase() === toAddress.toLowerCase() ||
    !Number(amount)
  ) {
    return {
      symbol: symbol as string,
      address: address,
      agg: "",
      amountIn: formatUnits(BigInt(amount), decimals),
      amountOut: "0",
      router: "",
      txData: "",
      img: tokenData?.logoURI as string,
    };
  }

  // todo get node with Swap service from main api reply
  const url = `https://api.stability.farm/swap/${network}/${fromAddress}/${toAddress}/${amount}`;
  // const url = `https://api.stabilitydao.org/swap/${network}/${fromAddress}/${toAddress}/${amount}`;

  const maxRetries = 3;
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      const response = await axios.get(url);

      const firstCorrectResponse = response?.data.find((res) => res?.amountOut);

      if (!firstCorrectResponse) {
        throw new Error("ZAP error");
      }

      setError(false);

      return {
        symbol: symbol as string,
        address: address,
        agg: firstCorrectResponse.agg.toLowerCase(),
        amountIn: formatUnits(BigInt(amount), decimals),
        amountOut: formatUnits(firstCorrectResponse.amountOut, tokenDecimals),
        router: firstCorrectResponse.router,
        txData: firstCorrectResponse.txData,
        img: tokenData?.logoURI as string,
      };
    } catch (error) {
      currentRetry++;
      if (currentRetry < maxRetries) {
        console.log(`Retrying (${currentRetry}/${maxRetries})...`, url);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.error("1inch api error:", error);
        setError(true);

        return {
          symbol: symbol as string,
          address: address,
          agg: "",
          amountIn: formatUnits(BigInt(amount), decimals),
          amountOut: "0",
          router: "",
          txData: "",
          img: tokenData?.logoURI as string,
        };
      }
    }
  }
};
