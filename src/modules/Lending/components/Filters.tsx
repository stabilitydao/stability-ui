import { useEffect, memo } from "react";

import type { Dispatch, SetStateAction } from "react";

import type { TTableActiveParams, TTableFilters } from "@types";

interface IProps {
  filters: TTableFilters[];
  setFilters: Dispatch<SetStateAction<TTableFilters[]>>;
  setTableParams: Dispatch<SetStateAction<TTableActiveParams>>;
}

const Filters: React.FC<IProps> = memo(
  ({ filters, setFilters, setTableParams }) => {
    const searchParams = new URLSearchParams(window.location.search);

    const activeFiltersHandler = (filter: TTableFilters, option?: string) => {
      const filterName = filters.find((item) => item.name === filter.name);
      if (!filterName) return;

      ///// for vaults url filters
      const newUrl = new URL(window.location.href);
      const params = new URLSearchParams(newUrl.search);
      /////

      let updatedFilters: TTableFilters[] = [];

      switch (filter.type) {
        case "sample":
          updatedFilters = filters.map((f) =>
            f.name === filterName.name
              ? { ...f, state: option !== "All" ? true : false }
              : f
          );

          const sampleFilter = updatedFilters.find(
            (f) => f.name === filterName.name
          );

          if (sampleFilter?.name.toLowerCase() === "active") {
            sampleFilter.state
              ? params.delete("deprecated")
              : params.set("deprecated", "true");
          }
          setFilters(updatedFilters);
          break;

        default:
          console.error("NO FILTER CASE");
          break;
      }

      let activeFiltersCount = 0;

      updatedFilters.forEach((filter) => {
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

      setTableParams((prev) => ({ ...prev, filters: activeFiltersCount }));

      newUrl.search = `?${params.toString()}`;
      window.history.pushState({}, "", newUrl.toString());
    };

    useEffect(() => {
      if (!searchParams.get("strategies")) {
        // setActiveStrategies("All");
      }
    }, [searchParams]);

    return filters.length ? (
      <div className="flex items-center justify-evenly flex-wrap gap-2 select-none font-manrope text-[16px] font-semibold flex-shrink-0">
        {filters.map((filter: TTableFilters) => (
          <div data-testid="filter" key={filter.name}>
            {filter.type === "sample" ? (
              <div
                key={filter.name}
                className="flex items-center justify-center bg-transparent border border-[#23252A] h-[48px] rounded-lg"
              >
                <div className="flex items-center justify-center p-2">
                  <p
                    onClick={() => activeFiltersHandler(filter)}
                    className={`h-8 px-4 py-1 cursor-pointer rounded-lg  ${
                      filter.state
                        ? "bg-[#22242A] border border-[#2C2E33]"
                        : "text-[#97979A]" //hover
                    }`}
                  >
                    {filter.name}
                  </p>

                  <p
                    onClick={() => activeFiltersHandler(filter, "All")}
                    className={`h-8 px-4 py-1 cursor-pointer rounded-lg ${
                      !filter.state
                        ? "bg-[#22242A] border border-[#2C2E33]"
                        : "text-[#97979A]" //hover
                    }`}
                  >
                    All
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    ) : null;
  }
);

export { Filters };
