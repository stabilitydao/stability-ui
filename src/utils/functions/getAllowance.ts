import { ERC20ABI } from "@web3";

import type { TAddress } from "@types";

export const getAllowance = async (
  client: any,
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
