import type { TAddress, TLocalStorageToken } from "@types";

type TProps = {
  hash: TAddress;
  status: string;
  timestamp: number;
  tokens: Record<TAddress, TLocalStorageToken>;
  type: string;
  vault: TAddress;
};

/**
 * Saves transaction data to local storage with the key "lastTx"
 *
 * @example
 *
 * ```
 * const transactionData = {
 *   hash: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
 *   status: "success",
 *   timestamp: 1694638383,
 *   tokens: [
 *     { "0x123...":  {...} },
 *     { "0xabc...":  {...} }
 *   ],
 *   type: "deposit",
 *   vault: "0xabcdef1234567890abcdef1234567890abcdef12"
 * };
 * setLocalStoreHash(transactionData);
 * ```
 *
 * @param {Object} obj - The transaction object to store
 * @param {string} obj.hash - Transaction hash
 * @param {string} obj.status - Status of the transaction (e.g., "success", "pending")
 * @param {number} obj.timestamp - Timestamp of the transaction
 * @param {Object[]} obj.tokens - List of token data involved in the transaction
 * @param {Object.<string, string >} obj.tokens[] - Token address and data transferred
 * @param {string} obj.type - Type of the transaction (e.g., "deposit", "withdrawal")
 * @param {string} obj.vault - Vault address associated with the transaction
 *
 * @returns {void}
 */

const setLocalStoreHash = (obj: TProps): void => {
  localStorage.setItem("lastTx", JSON.stringify(obj));
};

export { setLocalStoreHash };
