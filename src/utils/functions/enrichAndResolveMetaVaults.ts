import type { TMetaVault, TVaults, TAddress } from "@types";

/**
 * Recursively enriches a list of meta vaults with aggregated strategy IDs, protocol names,
 * and terminal (end) vault addresses. Traverses through both direct vaults and nested meta vaults.
 *
 *
 * @example
 * ```ts
 * const enriched = enrichAndResolveMetaVaults(vaults, metaVaults);
 * console.log(enriched[0].strategies); // ["strategy1", "strategy2"]
 * console.log(enriched[0].protocols); // ["Aave", "Curve"]
 * console.log(enriched[0].endVaults); // ["0xabc...", "0xdef..."]
 * ```
 *
 * @param {TVaults} vaults - An object where keys are vault addresses.
 * @param {TMetaVault[]} metaVaults - A list of meta vaults, each containing nested vault addresses (which may be meta or end vaults).
 *
 * @returns {TMetaVault[]} An array of meta vaults, each enriched with resolved strategies, protocols, and endVaults.
 */

const enrichAndResolveMetaVaults = (
  vaults: TVaults,
  metaVaults: TMetaVault[]
): TMetaVault[] => {
  const collectAll = (vaultAddress: TAddress, visited = new Set()) => {
    const strategies: string[] = [];
    const protocols: string[] = [];
    const endVaults: TAddress[] = [];

    const vaultKey = vaultAddress.toLowerCase() as TAddress;

    if (visited.has(vaultKey)) return { strategies, protocols, endVaults };

    visited.add(vaultKey);

    const vaultData = vaults?.[vaultKey];

    if (vaultData?.strategyInfo) {
      const { shortId, protocols: vaultProtocols } = vaultData.strategyInfo;

      if (shortId) strategies.push(shortId);

      vaultProtocols?.forEach(({ name }) => {
        if (name) protocols.push(name);
      });

      endVaults.push(vaultKey);
    } else {
      const keyMetaVault = metaVaults.find(
        (metaVault) => metaVault.address.toLowerCase() === vaultKey
      );

      if (keyMetaVault) {
        for (const subVault of keyMetaVault.vaults) {
          const result = collectAll(subVault, visited);

          result.strategies.forEach((strategy) => {
            if (!strategies.includes(strategy)) strategies.push(strategy);
          });

          result.protocols.forEach((protocol) => {
            if (!protocols.includes(protocol)) protocols.push(protocol);
          });

          result.endVaults.forEach((endVault) => {
            if (!endVaults.includes(endVault)) endVaults.push(endVault);
          });
        }
      }
    }

    return { strategies, protocols, endVaults };
  };

  return metaVaults.map((meta) => {
    const visited = new Set();

    const allStrategies: string[] = [];
    const allProtocols: string[] = [];
    const allEndVaults: TAddress[] = [];

    for (const vault of meta.vaults) {
      const { strategies, protocols, endVaults } = collectAll(vault, visited);

      strategies.forEach((strategy) => {
        if (!allStrategies.includes(strategy)) allStrategies.push(strategy);
      });

      protocols.forEach((protocols) => {
        if (!allProtocols.includes(protocols)) allProtocols.push(protocols);
      });

      endVaults.forEach((endVault) => {
        if (!allEndVaults.includes(endVault)) allEndVaults.push(endVault);
      });
    }

    return {
      ...meta,
      strategies: allStrategies,
      protocols: allProtocols,
      endVaults: allEndVaults,
    };
  });
};

export { enrichAndResolveMetaVaults };
