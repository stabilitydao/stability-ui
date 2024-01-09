import { useEffect } from "react";
import type { TVaultFilters } from "@types";

interface IProps {
  filters: TVaultFilters[];
  setFilters: any;
}

const Filters: React.FC<IProps> = ({ filters, setFilters }) => {
  const activeFiltersHandler = (filter: TVaultFilters, option?: string) => {
    const filterName = filters.find((item) => item.name === filter.name);
    if (!filterName) return;

    switch (filter.type) {
      case "single":
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
                variants: f.variants.map((variant: any) =>
                  variant.name === option
                    ? { ...variant, state: !variant.state }
                    : { ...variant, state: false }
                ),
              }
            : f
        );
        setFilters(updatedFiltersMultiple);
        break;
      case "sample":
        const updatedFiltersSample = filters.map((f) =>
          f.name === filterName.name
            ? { ...f, state: option !== "All" ? true : false }
            : f
        );
        setFilters(updatedFiltersSample);
        break;
      default:
        console.error("NO FILTER CASE");
        break;
    }
  };

  return (
    filters.length && (
      <div className="flex items-center justify-evenly flex-wrap gap-3 py-3 md:py-5 select-none">
        {filters.map((filter: any) => (
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
                  className={`p-2 opacity-70 hover:opacity-100 ${
                    filter.state && "opacity-100"
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
                {filter.variants.map((variant: any) => (
                  <p
                    key={variant.name}
                    onClick={() => activeFiltersHandler(filter, variant.name)}
                    className={`p-2 cursor-pointer opacity-70 hover:opacity-100 ${
                      variant.state && "opacity-100"
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
                    className={`py-2 px-4 cursor-pointer opacity-70 hover:opacity-100 ${
                      !filter.state && "bg-[#35373E] opacity-100"
                    } rounded-md`}
                  >
                    All
                  </p>
                  <p
                    onClick={() => activeFiltersHandler(filter)}
                    className={`p-2 cursor-pointer opacity-70 hover:opacity-100 ${
                      filter.state && "bg-[#35373E] opacity-100"
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
};

export { Filters };
