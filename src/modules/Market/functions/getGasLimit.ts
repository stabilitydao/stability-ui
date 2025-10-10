import { DEFAULT_TRANSACTION_SETTINGS } from "@constants";

import { TAddress } from "@types";

import type { PublicClient, Abi } from "viem";

const FALLBACK_GAS_LIMIT = BigInt(1_000_000);

export const getGasLimit = async (
  client: PublicClient,
  address: TAddress,
  abi: Abi,
  functionName: string,
  args: unknown[],
  account: TAddress
): Promise<bigint> => {
  try {
    const gas = await client.estimateContractGas({
      address,
      abi,
      functionName,
      args,
      account,
    });

    return BigInt(
      Math.trunc(Number(gas) * Number(DEFAULT_TRANSACTION_SETTINGS.gasLimit))
    );
  } catch (error) {
    console.error("Failed to get gasLimit", error);

    return FALLBACK_GAS_LIMIT;
  }
};
