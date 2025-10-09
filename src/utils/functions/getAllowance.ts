import { ERC20ABI } from "@web3";

import type { TAddress } from "@types";

import type { PublicClient } from "viem";

export const getAllowance = async (
  client: PublicClient,
  tokenAddress: TAddress,
  ownerAddress: TAddress,
  spenderAddress: TAddress
): Promise<bigint> => {
  const allowance = await client.readContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [ownerAddress, spenderAddress],
  });

  return allowance;
};
