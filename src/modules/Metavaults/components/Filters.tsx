import { memo } from "react";

import type { Dispatch, SetStateAction } from "react";

import type { TTableFilters } from "@types";

interface IProps {
  filters: TTableFilters[];
  setFilters: Dispatch<SetStateAction<TTableFilters[]>>;
}

const Filters: React.FC<IProps> = memo(({ filters, setFilters }) => {
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

        if (sampleFilter?.state) {
          params.delete("scope");
        } else {
          params.set("scope", "all");
        }

        setFilters(updatedFilters);
        break;
      default:
        console.error("NO FILTER CASE");
        break;
    }

    newUrl.search = `?${params.toString()}`;
    window.history.pushState({}, "", newUrl.toString());
  };

  return filters.length ? (
    <div>
      <div className="flex items-start justify-start flex-wrap gap-2 select-none font-manrope text-[16px] font-semibold flex-shrink-0">
        {filters.map((filter: TTableFilters) => (
          <div data-testid="filter" key={filter.name}>
            <div
              key={filter.name}
              className="flex items-center justify-center bg-transparent border border-[#23252A] h-[48px] rounded-lg"
            >
              <div className="flex items-center justify-center p-2">
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;
});

export { Filters };
