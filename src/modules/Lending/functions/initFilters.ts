import type {
  TVault,
  TTAbleFiltersVariant,
  TTableFilters,
  TTableActiveParams,
} from "@types";

/**
 * Initializes the filters for a table based on the vault data, URL parameters, and network selection
 *
 * @example
 * ```
 * const vaults = [
 *   { strategyInfo: { shortId: "Strategy A" } },
 *   { strategyInfo: { shortId: "Strategy B" } },
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
  networksHandler: (chains: string[]) => void,
  setTableParams: React.Dispatch<React.SetStateAction<TTableActiveParams>>
): void => {
  const shortNames = Array.from(
    new Map(
      vaults
        .filter((vault) => vault?.strategyInfo)
        .map((vault) => [
          vault.strategyInfo.shortId,
          {
            name: vault.strategyInfo.shortId,
            title: vault.strategy,
          },
        ])
    ).values()
  );

  const convertedShortNames = shortNames.map(({ name, title }) => ({
    name,
    title,
    state: false,
  }));

  let newFilters = tableFilters.map((f) =>
    f.name === "Strategies" ? { ...f, variants: convertedShortNames } : f
  );

  //set URL filters
  const searchParams = new URLSearchParams(window.location.search);

  const tagsParam = searchParams.get("tags");
  const strategiesParams = searchParams
    .get("strategies")
    ?.split(",")
    ?.map((strategy) => strategy.toLowerCase());

  const vaultsParam = searchParams.get("vaults");
  const statusParam = searchParams.get("status");
  const chainsParam = searchParams.getAll("chain");

  if (tagsParam) {
    newFilters = newFilters.map((f) =>
      f.name.toLowerCase() === tagsParam ? { ...f, state: true } : f
    );
  }

  if (strategiesParams?.length) {
    newFilters = newFilters.map((f) => {
      return f.name.toLowerCase() === "strategies"
        ? {
            ...f,
            variants:
              f.variants?.map((variant: TTAbleFiltersVariant) => {
                return strategiesParams.includes(variant.name.toLowerCase())
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

  let activeFiltersCount = 0;

  newFilters.forEach((filter) => {
    if (filter.variants) {
      filter.variants.forEach((variant) => {
        if (variant.state) {
          activeFiltersCount++;
        }
      });
    } else if (!filter.state && filter.name === "Active") {
      activeFiltersCount++;
    } else if (filter.state && filter.name !== "Active") {
      activeFiltersCount++;
    }
  });

  if (activeFiltersCount) {
    setTableParams((prev) => ({ ...prev, filters: activeFiltersCount }));
  }

  if (chainsParam.length) {
    networksHandler(chainsParam);
  }
  setTableFilters(newFilters);
};
