import { useState, useEffect, useRef, memo } from "react";

import type { Dispatch, SetStateAction } from "react";

import { Checkbox } from "@ui";

import { cn, useClickOutside } from "@utils";

import type { TTableFilters, TTAbleFiltersVariant } from "@types";

interface IProps {
  filters: TTableFilters[];
  setFilters: Dispatch<SetStateAction<TTableFilters[]>>;
}

const Filters: React.FC<IProps> = memo(({ filters, setFilters }) => {
  const searchParams = new URLSearchParams(window.location.search);

  const [dropDownSelector, setDropDownSelector] = useState<boolean>(false);

  const [activeMarkets, setActiveMarkets] = useState(
    searchParams.get("markets") ? searchParams.get("markets") : "All"
  );

  const dropDownRef = useRef<HTMLDivElement>(null);

  const activeFiltersHandler = (filter: TTableFilters, option?: string) => {
    const filterName = filters.find((item) => item.name === filter.name);
    if (!filterName) return;

    ///// for vaults url filters
    const newUrl = new URL(window.location.href);
    const params = new URLSearchParams(newUrl.search);
    /////

    let updatedFilters: TTableFilters[] = [];

    switch (filter.type) {
      case "dropdown":
        updatedFilters = filters.map((f) =>
          f.name === filterName.name
            ? {
                ...f,
                variants: f.variants?.map((variant: TTAbleFiltersVariant) =>
                  variant.name === option
                    ? { ...variant, state: !variant.state }
                    : { ...variant }
                ),
              }
            : f
        );

        updatedFilters = updatedFilters.map((f) =>
          f.name === filterName.name &&
          f.variants?.every((variant) => variant.state)
            ? {
                ...f,
                variants: f.variants.map((variant) => ({
                  ...variant,
                  state: false,
                })),
              }
            : f
        );

        const dropDownFilter = updatedFilters.find(
          (f) => f.name === filterName.name
        );

        if (dropDownFilter?.name.toLowerCase() === "markets") {
          const markets =
            dropDownFilter?.variants?.filter((variant) => variant.state) || [];

          if (markets.length) {
            params.set("markets", markets.map(({ name }) => name).join(","));
          } else {
            params.delete("markets");
          }

          // // UI representation
          if (markets.length) {
            setActiveMarkets(markets.map(({ name }) => name).join(","));
          } else {
            setActiveMarkets("All");
          }
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

  useEffect(() => {
    if (!searchParams.get("markets")) {
      setActiveMarkets("All");
    }
  }, [searchParams]);

  useClickOutside(dropDownRef, () => setDropDownSelector(false));

  return filters.length ? (
    <div className="flex items-center justify-evenly flex-wrap gap-2 select-none font-manrope text-[16px] font-semibold flex-shrink-0">
      {filters.map((filter: TTableFilters) => (
        <div data-testid="filter" key={filter.name}>
          {filter.type === "dropdown" ? (
            <div className="relative select-none w-[200px]">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setDropDownSelector((prevState) => !prevState);
                }}
                className="flex items-center justify-between gap-1 px-5 py-[13px] h-[48px] bg-transparent border border-[#23252A] rounded-lg cursor-pointer"
              >
                <p className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-[16px]">
                  <span className="text-[#97979A]">{filter.name}: </span>
                  <span>{activeMarkets}</span>
                </p>
                <img
                  className={cn(
                    "transition delay-[50ms] w-4 h-4",
                    dropDownSelector ? "rotate-[180deg]" : "rotate-[0deg]"
                  )}
                  src="/arrow-down.svg"
                  alt="arrowDown"
                />
              </div>
              <div
                ref={dropDownRef}
                className={cn(
                  "bg-[#1C1D1F] border border-[#383B42] p-[6px] rounded-lg w-full z-20 mt-2",
                  dropDownSelector
                    ? "absolute transition delay-[50ms]"
                    : "hidden"
                )}
              >
                <div className="flex flex-col items-start">
                  {filter.variants?.map((variant: TTAbleFiltersVariant) => (
                    <div
                      key={variant.name}
                      onClick={() => activeFiltersHandler(filter, variant.name)}
                      className={cn(
                        "p-[6px] cursor-pointer w-full flex items-center gap-2"
                      )}
                      title={variant.title}
                    >
                      <Checkbox
                        checked={variant.state}
                        onChange={() =>
                          activeFiltersHandler(filter, variant.name)
                        }
                      />
                      <span className="text-[14px] leading-[20px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                        {variant.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  ) : null;
});

export { Filters };
