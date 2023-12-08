import axios from "axios";

import { formatUnits } from "viem";

import { getTokenData } from "./getTokenData";

import type { TAddress } from "@types";

// get1InchRoutes is a temp frunction before graph
export const get1InchRoutes = async (
  fromAddress: TAddress,
  toAddress: TAddress,
  decimals: number,
  amount: string,
  setError: React.Dispatch<React.SetStateAction<boolean>>,
  setButton: React.Dispatch<React.SetStateAction<string>>
) => {
  const tokenData = getTokenData(toAddress);
  const symbol = tokenData?.symbol;
  const tokenDecimals = tokenData?.decimals || 18;

  if (fromAddress === toAddress) {
    return {
      symbol: symbol as string,
      amountIn: formatUnits(amount as any, decimals),
      address: toAddress,
      amountOut: "0",
      router: "",
      txData: "",
      img: tokenData?.logoURI as string,
    };
  }

  const url = `https://api.stabilitydao.org/swap/137/${fromAddress}/${toAddress}/${amount}`;

  const maxRetries = 3;
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      const response = await axios.get(url);
      setError(false);
      setButton("deposit");
      return {
        symbol: symbol as string,
        address: toAddress,
        amountIn: formatUnits(amount as any, decimals),
        amountOut: formatUnits(response?.data[0].amountOut, tokenDecimals),
        router: response?.data[0].router,
        txData: response?.data[0].txData,
        img: tokenData?.logoURI as string,
      };
    } catch (error) {
      currentRetry++;
      if (currentRetry < maxRetries) {
        console.log(`Retrying (${currentRetry}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log("1INCH API ERROR:", error);
        setError(true);

        return {
          symbol: symbol as string,
          address: toAddress,
          amountIn: formatUnits(amount as any, decimals),
          amountOut: "0",
          router: "",
          txData: "",
          img: tokenData?.logoURI as string,
        };
      }
    }
  }
};