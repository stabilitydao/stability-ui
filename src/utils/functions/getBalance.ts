import { ERC20ABI } from "@web3";

import type { TAddress } from "@types";

export const getBalance = async (
  client: any,
  tokenAddress: TAddress,
  ownerAddress: TAddress
): Promise<bigint> => {
  const balance = await client.readContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [ownerAddress],
  });

  return balance;
};
