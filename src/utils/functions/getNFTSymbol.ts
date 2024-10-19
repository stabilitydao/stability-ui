import {
  ChainName,
  deployments,
  getChainByName,
} from "@stabilitydao/stability";

/**
 * Retrieves the NFT symbol based on the chain name and contract address
 *
 * This function checks whether the provided address matches specific core contracts (VaultManager or StrategyLogic)
 * deployed on the specified blockchain. It returns a symbol representing the contract type if a match is found
 *
 * @example
 * ```typescript
 * const symbol = getNFTSymbol("Ethereum", "0x123...456");
 * console.log(symbol); // Output could be "VAULT", "STRATEGY", or "" if no match is found
 * ```
 *
 * @param {ChainName} chainName - Name of the blockchain (e.g., Ethereum, Polygon, etc.)
 * @param {`0x${string}`} address - Contract address to check, prefixed with "0x"
 * @returns {string} - Returns "VAULT" if the address matches the VaultManager, "STRATEGY" if it matches the StrategyLogic,
 *                     or an empty string if no match is found.
 */

const getNFTSymbol = (chainName: ChainName, address: `0x${string}`): string => {
  // check VaultManager and StrategyLogic
  const chain = getChainByName(chainName);
  if (deployments[chain.chainId.toString()]) {
    if (
      deployments[chain.chainId.toString()].core.vaultManager.toLowerCase() ===
      address.toLowerCase()
    ) {
      return "VAULT";
    }
    if (
      deployments[chain.chainId.toString()].core.strategyLogic.toLowerCase() ===
      address.toLowerCase()
    ) {
      return "STRATEGY";
    }
  }
  return "";
};

export { getNFTSymbol };
