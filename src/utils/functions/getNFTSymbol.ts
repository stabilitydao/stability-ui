import {
  ChainName,
  deployments,
  getChainByName,
} from "@stabilitydao/stability";

//todo: add description & tests

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
