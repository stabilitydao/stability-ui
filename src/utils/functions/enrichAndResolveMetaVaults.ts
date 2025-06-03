import type { TMetaVault, TVaults, TAddress, TEndMetaVaults } from "@types";

/**
 * Recursively enriches a list of meta vaults with aggregated strategy IDs, protocol names,
 * and resolved end vault structures. The function traverses each meta vault and collects:
 *
 * - all unique strategy shortIds used in terminal (non-meta) vaults;
 * - all protocol names used across strategies;
 * - all end vaults, represented as either:
 *    - `{ vault: string, isMetaVault: false }` — for regular vaults,
 *    - `{ metaVault: string, vaults: string[], isMetaVault: true }` — for nested meta vaults.
 *
 * It also handles cyclic references by tracking visited vaults,
 * and removes duplicates in the resulting `endVaults` array.
 *
 * @example
 * ```ts
 * const enriched = enrichAndResolveMetaVaults(vaults, metaVaults);
 * console.log(enriched[0].strategies); // ["strategy1", "strategy2"]
 * console.log(enriched[0].protocols);  // ["Aave", "Curve"]
 * console.log(enriched[0].endVaults);  // [
 *   { vault: "0xabc...", isMetaVault: false },
 *   { metaVault: "0xmeta...", vaults: ["0xaaa", "0xbbb"], isMetaVault: true }
 * ]
 * ```
 *
 * @param {TVaults} vaults - A dictionary of vaults keyed by address, containing strategy and protocol information.
 * @param {TMetaVault[]} metaVaults - A list of meta vaults, each containing nested vault addresses (which may refer to meta vaults or base vaults).
 *
 * @returns {TMetaVault[]} A new array of meta vaults enriched with resolved strategies, protocols, and structured end vault information.
 */

const enrichAndResolveMetaVaults = (
  vaults: TVaults,
  metaVaults: TMetaVault[]
): TMetaVault[] => {
  const collectAll = (
    vaultAddress: TAddress,
    visited = new Set<string>()
  ): {
    strategies: string[];
    protocols: string[];
    endVaults: TEndMetaVaults;
  } => {
    const strategies: string[] = [];
    const protocols: string[] = [];
    const endVaults: TEndMetaVaults = [];

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

      endVaults.push({ vault: vaultKey, isMetaVault: false });
    } else {
      const keyMetaVault = metaVaults.find(
        (metaVault) => metaVault.address.toLowerCase() === vaultKey
      );

      if (keyMetaVault) {
        const nestedVaults: TAddress[] = [];

        for (const subVault of keyMetaVault.vaults) {
          const result = collectAll(subVault, visited);

          result.strategies.forEach((strategy) => {
            if (!strategies.includes(strategy)) strategies.push(strategy);
          });

          result.protocols.forEach((protocol) => {
            if (!protocols.includes(protocol)) protocols.push(protocol);
          });

          result.endVaults.forEach((endVaultObj) => {
            if ("vault" in endVaultObj) {
              nestedVaults.push(endVaultObj?.vault);
            } else {
              const alreadyExists = endVaults.some(
                (ev) =>
                  "metaVault" in ev &&
                  ev?.metaVault?.toLowerCase() ===
                    endVaultObj?.metaVault?.toLowerCase()
              );
              if (!alreadyExists) endVaults.push(endVaultObj);
            }
          });
        }

        if (nestedVaults.length > 0) {
          endVaults.push({
            metaVault: vaultKey,
            vaults: nestedVaults,
            isMetaVault: true,
          });
        }
      }
    }

    return { strategies, protocols, endVaults };
  };

  return metaVaults.map((meta) => {
    const visited = new Set<string>();

    const allStrategies: string[] = [];
    const allProtocols: string[] = [];
    const allEndVaults: TEndMetaVaults = [];

    for (const vault of meta.vaults) {
      const { strategies, protocols, endVaults } = collectAll(vault, visited);

      strategies.forEach((strategy) => {
        if (!allStrategies.includes(strategy)) allStrategies.push(strategy);
      });

      protocols.forEach((protocol) => {
        if (!allProtocols.includes(protocol)) allProtocols.push(protocol);
      });

      endVaults.forEach((ev) => {
        const isDuplicate = allEndVaults.some((existing) => {
          if ("vault" in ev && "vault" in existing) {
            return existing.vault === ev.vault;
          }
          if ("metaVault" in ev && "metaVault" in existing) {
            return existing.metaVault === ev.metaVault;
          }
          return false;
        });

        if (!isDuplicate) allEndVaults.push(ev);
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
