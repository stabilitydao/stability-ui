import type { TVault, TTAbleFiltersVariant, TTableFilters } from "@types";

/**
 * Initializes the filters for a table based on the vault data, URL parameters, and network selection
 *
 * @example
 * ```
 * const vaults = [
 *   { strategyInfo: { shortName: "Strategy A" } },
 *   { strategyInfo: { shortName: "Strategy B" } },
 * ];
 * const filters = [{ name: "Strategy", variants: [] }];
 * initFilters(vaults, filters, setTableFilters, networksHandler);
 * ```
 *
 * @param {TVault[]} vaults - An array of vault objects, used to extract unique strategy short names for filtering
 * @param {TTableFilters[]} tableFilters - Current state of the table filters, which will be updated
 * @param {React.Dispatch<React.SetStateAction<TTableFilters[]>>} setTableFilters - Function to update the table filters
 * @param {(chain: string) => void} networksHandler - Callback function to handle the selection of a network based on the chain parameter
 */

export const initFilters = (
  vaults: TVault[],
  tableFilters: TTableFilters[],
  setTableFilters: React.Dispatch<React.SetStateAction<TTableFilters[]>>,
  networksHandler: (chain: string) => void
): void => {
  const shortNames: string[] = [
    ...new Set(vaults.map((vault) => vault.strategyInfo.shortName)),
  ];

  const convertedShortNames = shortNames.map((name: string) => ({
    name: name,
    state: false,
  }));

  let newFilters = tableFilters.map((f) =>
    f.name === "Strategy" ? { ...f, variants: convertedShortNames } : f
  );

  //set URL filters
  const searchParams = new URLSearchParams(window.location.search);

  const tagsParam = searchParams.get("tags");
  const strategyParam = searchParams.get("strategy");
  const vaultsParam = searchParams.get("vaults");
  const statusParam = searchParams.get("status");
  const chainParam = searchParams.get("chain");

  if (tagsParam) {
    newFilters = newFilters.map((f) =>
      f.name.toLowerCase() === tagsParam ? { ...f, state: true } : f
    );
  }
  if (strategyParam) {
    newFilters = newFilters.map((f) => {
      return f.name.toLowerCase() === "strategy"
        ? {
            ...f,
            variants:
              f.variants?.map((variant: TTAbleFiltersVariant) => {
                return variant.name.toLowerCase() ===
                  strategyParam.toLowerCase()
                  ? { ...variant, state: true }
                  : { ...variant, state: false };
              }) || [],
          }
        : f;
    });
  }
  if (vaultsParam) {
    newFilters = newFilters.map((f) => {
      if (f.name.toLowerCase() === "my vaults") {
        return vaultsParam === "my"
          ? { ...f, state: true }
          : { ...f, state: false };
      }
      return f;
    });
  }
  if (statusParam) {
    newFilters = newFilters.map((f) => {
      if (f.name.toLowerCase() === "active") {
        return statusParam === "active"
          ? { ...f, state: true }
          : { ...f, state: false };
      }
      return f;
    });
  }
  if (chainParam) {
    networksHandler(chainParam);
  }
  setTableFilters(newFilters);
};
