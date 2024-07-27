import axios from "axios";

import { formatUnits } from "viem";

import { getTokenData } from "./getTokenData";

import type { TAddress } from "@types";

type ReturnData = {
  symbol: string;
  address: string;
  amountIn: string;
  amountOut: string;
  router: string;
  txData: string;
  img: string;
};

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
      amountIn: formatUnits(BigInt(amount), decimals),
      amountOut: "0",
      router: "",
      txData: "",
      img: tokenData?.logoURI as string,
    };
  }

  const url = `https://api.stabilitydao.org/swap/${network}/${fromAddress}/${toAddress}/${amount}`;

  const maxRetries = 3;
  let currentRetry = 0;

  while (currentRetry < maxRetries) {
    try {
      const response = await axios.get(url);

      setError(false);

      return {
        symbol: symbol as string,
        address: address,
        amountIn: formatUnits(BigInt(amount), decimals),
        amountOut: formatUnits(response?.data[0].amountOut, tokenDecimals),
        router: response?.data[0].router,
        txData: response?.data[0].txData,
        img: tokenData?.logoURI as string,
      };
    } catch (error) {
      currentRetry++;
      if (currentRetry < maxRetries) {
        console.log(`Retrying (${currentRetry}/${maxRetries})...`, url);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.error("1INCH API ERROR:", error);
        setError(true);

        return {
          symbol: symbol as string,
          address: address,
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
