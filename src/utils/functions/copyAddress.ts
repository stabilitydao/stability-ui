import { getAddress } from "viem";

import type { TAddress } from "@types";

export const copyAddress = async (address: TAddress): Promise<void> => {
  try {
    await navigator.clipboard.writeText(getAddress(address));
  } catch (error) {
    console.error("Error copying address:", error);
  }
};
