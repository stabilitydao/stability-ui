import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";

import type { TAddress } from "@types";

type Arguments = {
  account: TAddress;
  tokenAddress?: TAddress;
};

export const useErc20Balance = ({ account, tokenAddress }: Arguments) => {
  const chainId = 137;
  const { address: currentWalletAddress } = useAccount();

  const userAccount = account || currentWalletAddress;
  const isEnabled = !!userAccount && !!tokenAddress && !!chainId;

  const erc20Contract = {
    chainId,
    address: tokenAddress,
    abi: erc20Abi,
  } as const;

  const {
    data: erc20Data,
    isLoading,
    isSuccess: isSuccessReadContracts,
    isFetching,
    isError,
    refetch,
    queryKey,
  } = useReadContracts({
    contracts: [
      {
        ...erc20Contract,
        functionName: "balanceOf",
        args: isEnabled ? [userAccount] : undefined,
      },
      {
        ...erc20Contract,
        functionName: "decimals",
      },
      {
        ...erc20Contract,
        functionName: "symbol",
      },
    ],
    query: {
      enabled: isEnabled,
    },
  });
  const [balanceData, decimalData, symbolData] = erc20Data || [];

  const isSuccess =
    isSuccessReadContracts &&
    !!balanceData?.result &&
    !!decimalData?.result &&
    !!symbolData?.result;

  return {
    data: isSuccess
      ? {
          value: balanceData.result,
          decimals: decimalData.result,
          symbol: symbolData.result,
          formatted: formatUnits(balanceData.result, decimalData.result),
        }
      : undefined,
    isLoading: isLoading && isEnabled,
    isSuccess,
    isError,
    isFetching,
    refetch: () => {
      if (isEnabled) {
        refetch();
      }
    },
  };
};
