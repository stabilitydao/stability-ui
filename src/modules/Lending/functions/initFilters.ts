import type { TMarket, TTableFilters, TTableActiveParams } from "@types";

export const initFilters = (
  markets: TMarket[],
  tableFilters: TTableFilters[],
  setTableFilters: React.Dispatch<React.SetStateAction<TTableFilters[]>>,
  networksHandler: (chains: string[]) => void,
  setTableParams: React.Dispatch<React.SetStateAction<TTableActiveParams>>
): void => {
  const searchParams = new URLSearchParams(window.location.search);

  let newFilters = tableFilters;

  const statusParam: boolean = !!searchParams.get("deprecated");

  newFilters = newFilters.map((f) => {
    if (f.name.toLowerCase() === "active") {
      return { ...f, state: !statusParam };
    }
    return f;
  });

  let activeFiltersCount = 0;

  if (activeFiltersCount) {
    setTableParams((prev) => ({ ...prev, filters: activeFiltersCount }));
  }

  setTableFilters(newFilters);
};
