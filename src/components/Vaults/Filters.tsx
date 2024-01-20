import { memo } from "react";
import type { TTableFilters, TTAbleFiltersVariant } from "@types";

interface IProps {
  filters: TTableFilters[];
  setFilters: any;
}

const Filters: React.FC<IProps> = memo(({ filters, setFilters }) => {
  const activeFiltersHandler = (filter: TTableFilters, option?: string) => {
    const filterName = filters.find((item) => item.name === filter.name);
    if (!filterName) return;

    ///// for vaults url filters
    const newUrl = new URL(window.location.href);
    const params = new URLSearchParams(newUrl.search);
    /////

    switch (filter.type) {
      case "single":
        if (filter.name.toLowerCase() === "stablecoins") {
          !filter.state
            ? params.set("tags", "stablecoins")
            : params.delete("tags");
        }
        const updatedFiltersSingle = filters.map((f) =>
          f.name === filterName.name ? { ...f, state: !f.state } : f
        );

        setFilters(updatedFiltersSingle);
        break;
      case "multiple":
        const updatedFiltersMultiple = filters.map((f) =>
          f.name === filterName.name
            ? {
                ...f,
                variants:
                  f.variants?.map((variant: TTAbleFiltersVariant) =>
                    variant.name === option
                      ? { ...variant, state: !variant.state }
                      : { ...variant, state: false }
                  ) || [],
              }
            : f
        );

        const multipleFilter = updatedFiltersMultiple.find(
          (f) => f.name === filterName.name
        );

        if (multipleFilter?.name.toLowerCase() === "strategy") {
          const strategy =
            multipleFilter?.variants &&
            multipleFilter?.variants.find((variant) => variant.state);
          strategy
            ? params.set("strategy", strategy.name)
            : params.delete("strategy");
        }

        setFilters(updatedFiltersMultiple);
        break;
      case "sample":
        const updatedFiltersSample = filters.map((f) =>
          f.name === filterName.name
            ? { ...f, state: option !== "All" ? true : false }
            : f
        );
        const sampleFilter = updatedFiltersSample.find(
          (f) => f.name === filterName.name
        );
        if (sampleFilter?.name.toLowerCase() === "my vaults") {
          sampleFilter.state
            ? params.set("vaults", "my")
            : params.delete("vaults");
        } else if (sampleFilter?.name.toLowerCase() === "active") {
          sampleFilter.state
            ? params.delete("status")
            : params.set("status", "all");
        }
        setFilters(updatedFiltersSample);
        break;
      default:
        console.error("NO FILTER CASE");
        break;
    }
    newUrl.search = `?${params.toString()}`;
    window.history.pushState({}, "", newUrl.toString());
  };
  return (
    filters.length && (
      <div className="flex items-center justify-evenly flex-wrap gap-3 py-3 md:py-5 select-none lg:min-w-[60%]">
        {filters.map((filter: TTableFilters) => (
          <div key={filter.name}>
            {filter.type === "single" ? (
              <div
                onClick={() => activeFiltersHandler(filter)}
                className={`${
                  filter.state &&
                  "bg-[#35373E] outline outline-1 outline-[#6376AF]"
                } bg-button rounded-md cursor-pointer`}
              >
                <p
                  className={`p-2 ${
                    filter.state ? "opacity-100" : "opacity-70 hover:opacity-80"
                  }`}
                >
                  {filter.name}
                </p>
              </div>
            ) : filter.type === "multiple" ? (
              <div
                key={filter.name}
                className="flex items-center bg-button rounded-md"
              >
                {filter.variants?.map((variant: TTAbleFiltersVariant) => (
                  <p
                    key={variant.name}
                    onClick={() => activeFiltersHandler(filter, variant.name)}
                    className={`p-2 cursor-pointer ${
                      variant.state
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-80"
                    }`}
                  >
                    {variant.name}
                  </p>
                ))}
              </div>
            ) : (
              filter.type === "sample" && (
                <div
                  key={filter.name}
                  className="flex items-center bg-button rounded-md"
                >
                  <p
                    onClick={() => activeFiltersHandler(filter, "All")}
                    className={`py-2 px-4 cursor-pointer hover:opacity-100 ${
                      !filter.state ? "bg-[#35373E] opacity-100" : "opacity-70"
                    } rounded-md`}
                  >
                    All
                  </p>
                  <p
                    onClick={() => activeFiltersHandler(filter)}
                    className={`p-2 cursor-pointer hover:opacity-100 ${
                      filter.state ? "bg-[#35373E] opacity-100" : "opacity-70"
                    } rounded-md`}
                  >
                    {filter.name}
                  </p>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    )
  );
});

export { Filters };
