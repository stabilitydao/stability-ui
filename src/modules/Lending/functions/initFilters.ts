import type { TTAbleFiltersVariant, TTableFilters, TMarket } from "@types";

/**
 * Initializes the filters for a table based on the vault data, URL parameters, and network selection
 *
 * @example
 * ```
 * const markets = [
 *   { name: "main" },
 *   { name: "someName" },
 * ];
 * const filters = [{ name: "Markets", variants: [] }];
 * initFilters(markets, filters, setTableFilters);
 * ```
 *
 * @param {any[]} markets - An array of market objects, used to extract unique strategy short names for filtering
 * @param {TTableFilters[]} tableFilters - Current state of the table filters, which will be updated
 * @param {React.Dispatch<React.SetStateAction<TTableFilters[]>>} setTableFilters - Function to update the table filters
 */

export const initFilters = (
  markets: TMarket[],
  tableFilters: TTableFilters[],
  setTableFilters: React.Dispatch<React.SetStateAction<TTableFilters[]>>,
  networksHandler: (chains: string[]) => void
): void => {
  const marketsNames = markets.map((market) => market.name);

  const convertedMarketNames = marketsNames.map((name) => ({
    name,
    state: false,
  }));

  let newFilters = tableFilters.map((f) =>
    f.name === "Markets" ? { ...f, variants: convertedMarketNames } : f
  );

  //set URL filters
  const searchParams = new URLSearchParams(window.location.search);

  const marketsParams = searchParams
    .get("markets")
    ?.split(",")
    ?.map((market) => market);

  const chainsParam = searchParams.getAll("chain");

  if (marketsParams?.length) {
    newFilters = newFilters.map((f) => {
      return f.name.toLowerCase() === "markets"
        ? {
            ...f,
            variants:
              f.variants?.map((variant: TTAbleFiltersVariant) => {
                return marketsParams.includes(variant.name)
                  ? { ...variant, state: true }
                  : { ...variant, state: false };
              }) || [],
          }
        : f;
    });
  }

  if (chainsParam.length) {
    networksHandler(chainsParam);
  }
  setTableFilters(newFilters);
};
