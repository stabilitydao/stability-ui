import { getAddress } from "viem";

import { account } from "@store";

import { ERC20ABI } from "@web3";

import type { TAddress } from "@types";

const getAssetAllowance = async (
  client: unknown,
  asset: TAddress,
  tab: string,
  vaultAddress: TAddress,
  underlyingAddress: TAddress,
  zap: TAddress
): Promise<bigint> => {
  asset = getAddress(asset) as TAddress;

  const address = tab === "Deposit" ? asset : vaultAddress;

  const fromAddress: TAddress =
    tab === "Deposit" && asset === underlyingAddress ? vaultAddress : zap;

  const allowanceData = await client?.readContract({
    address: address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [account.get() as TAddress, fromAddress],
  });

  return allowanceData;
};

export { getAssetAllowance };
