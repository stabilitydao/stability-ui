import { waitForTransactionReceipt } from "@wagmi/core";

import { wagmiConfig } from "@web3";

import type { TAddress } from "@types";

const getTransactionReceipt = async (hash: TAddress): Promise<unknown> => {
  const interval = 2000;
  const maxConfirmations = 30;

  let transactionConfirmations = 3;

  while (transactionConfirmations <= maxConfirmations) {
    await new Promise((resolve) => setTimeout(resolve, interval));

    try {
      const transaction = await waitForTransactionReceipt(wagmiConfig, {
        confirmations: transactionConfirmations,
        hash: hash,
      });

      if (transaction.status === "success") {
        return transaction;
      }
    } catch (error) {
      console.error("Error getting transaction status:", error);
    }

    transactionConfirmations += 3;
  }

  throw new Error(
    "Transaction was not confirmed after the maximum number of attempts"
  );
};
export { getTransactionReceipt };
