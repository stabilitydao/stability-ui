import { useState, useEffect, useRef, memo } from "react";

import type { Dispatch, SetStateAction } from "react";

import { Checkbox } from "@ui";

import type { TTableFilters, TTAbleFiltersVariant } from "@types";

interface IProps {
  filters: TTableFilters[];
  setFilters: Dispatch<SetStateAction<TTableFilters[]>>;
}

const Filters: React.FC<IProps> = memo(({ filters, setFilters }) => {
  const searchParams = new URLSearchParams(window.location.search);

  const [dropDownSelector, setDropDownSelector] = useState<boolean>(false);

  const [activeStrategies, setActiveStrategies] = useState(
    searchParams.get("strategies") ? searchParams.get("strategies") : "All"
  );

  const dropDownRef = useRef<HTMLDivElement>(null);

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
      // case "multiple":
      // const updatedFiltersMultiple = filters.map((f) =>
      //   f.name === filterName.name
      //     ? {
      //         ...f,
      //         variants:
      //           f.variants?.map((variant: TTAbleFiltersVariant) =>
      //             variant.name === option
      //               ? { ...variant, state: !variant.state }
      //               : { ...variant, state: false }
      //           ) || [],
      //       }
      //     : f
      // );

      // const multipleFilter = updatedFiltersMultiple.find(
      //   (f) => f.name === filterName.name
      // );

      // if (multipleFilter?.name.toLowerCase() === "strategy") {
      //   const strategy =
      //     multipleFilter?.variants &&
      //     multipleFilter?.variants.find((variant) => variant.state);
      //   strategy
      //     ? params.set("strategy", strategy.name)
      //     : params.delete("strategy");
      // }

      // setFilters(updatedFiltersMultiple);
      // break;
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
      case "dropdown":
        let updatedFiltersDropDown = filters.map((f) =>
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

        updatedFiltersDropDown = updatedFiltersDropDown.map((f) =>
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

        const dropDownFilter = updatedFiltersDropDown.find(
          (f) => f.name === filterName.name
        );

        if (dropDownFilter?.name.toLowerCase() === "strategies") {
          const strategies =
            dropDownFilter?.variants?.filter((variant) => variant.state) || [];

          if (strategies.length) {
            params.set(
              "strategies",
              strategies.map(({ name }) => name).join(",")
            );
          } else {
            params.delete("strategies");
          }

          // // UI representation
          if (strategies.length) {
            setActiveStrategies(strategies.map(({ name }) => name).join(","));
          } else {
            setActiveStrategies("All");
          }
        }
        // setDropDownSelector(false);
        setFilters(updatedFiltersDropDown);
        break;
      default:
        console.error("NO FILTER CASE");
        break;
    }
    newUrl.search = `?${params.toString()}`;
    window.history.pushState({}, "", newUrl.toString());
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropDownRef.current &&
        !dropDownRef.current?.contains(event.target as Node)
      ) {
        setDropDownSelector(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    filters.length && (
      <div className="flex items-center justify-evenly flex-wrap gap-3 py-3 md:py-9 select-none lg:min-w-[60%] font-manrope text-[14px] font-semibold">
        {filters.map((filter: TTableFilters) => (
          <div data-testid="filter" key={filter.name}>
            {filter.type === "single" ? (
              <label className="inline-flex items-center cursor-pointer bg-accent-900 h-10 rounded-2xl">
                <div className="flex items-center gap-[10px] py-[10px] px-4">
                  <Checkbox
                    checked={filter.state}
                    onChange={() => activeFiltersHandler(filter)}
                  />
                  <span className="text-neutral-50">{filter.name}</span>
                </div>
              </label>
            ) : filter.type === "multiple" ? (
              <div
                key={filter.name}
                className="w-[160px] flex items-center bg-button rounded-md"
              >
                {filter.variants?.map((variant: TTAbleFiltersVariant) => (
                  <p
                    key={variant.name}
                    onClick={() => activeFiltersHandler(filter, variant.name)}
                    className={`px-2 py-1 cursor-pointer ${
                      variant.state
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-80"
                    }`}
                  >
                    {variant.name}
                  </p>
                ))}
              </div>
            ) : filter.type === "dropdown" ? (
              <div className="relative select-none w-[220px]">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropDownSelector((prevState) => !prevState);
                  }}
                  data-testid="strategyFilterDropdown"
                  className="flex items-center justify-between gap-3 px-3 py-1 h-10 bg-accent-900 text-neutral-50 rounded-2xl cursor-pointer"
                >
                  <p className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {filter.name}: {activeStrategies}
                  </p>
                  <img
                    className={`transition delay-[50ms] ${
                      dropDownSelector ? "rotate-[180deg]" : "rotate-[0deg]"
                    }`}
                    src="/arrow-down.svg"
                    alt="arrowDown"
                  />
                </div>
                <div
                  ref={dropDownRef}
                  className={`bg-accent-900 mt-2 rounded-2xl w-full z-20 ${
                    dropDownSelector
                      ? "absolute transition delay-[50ms]"
                      : "hidden"
                  } `}
                >
                  <div className="flex flex-col items-start">
                    {filter.variants?.map(
                      (variant: TTAbleFiltersVariant, index: number) => (
                        <div
                          key={variant.name}
                          onClick={() =>
                            activeFiltersHandler(filter, variant.name)
                          }
                          className={`${!index ? "rounded-t-2xl" : ""} ${index === filter?.variants.length - 1 ? "rounded-b-2xl" : ""} py-[10px] px-4 cursor-pointer w-full flex items-center gap-2 ${
                            variant.state ? "bg-accent-800" : ""
                          }`}
                          data-testid="strategy"
                          title={variant.title}
                        >
                          <Checkbox
                            checked={variant.state}
                            onChange={() =>
                              activeFiltersHandler(filter, variant.name)
                            }
                          />
                          <span className="text-[12px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {variant.title}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              filter.type === "sample" && (
                <div
                  key={filter.name}
                  className="flex items-center justify-center bg-accent-900 h-10 rounded-2xl"
                >
                  <div className="flex items-center justify-center px-1">
                    <p
                      onClick={() => activeFiltersHandler(filter, "All")}
                      className={`py-1 px-4 cursor-pointer rounded-xl ${
                        !filter.state
                          ? "bg-accent-500 text-neutral-50 h-8"
                          : "text-accent-400 h-full hover:bg-accent-800 hover:text-accent-400"
                      }`}
                    >
                      All
                    </p>
                    <p
                      onClick={() => activeFiltersHandler(filter)}
                      className={`px-2 py-1 cursor-pointer rounded-xl  ${
                        filter.state
                          ? "bg-accent-500 text-neutral-50 h-8"
                          : "text-accent-400 h-full hover:bg-accent-800 hover:text-accent-400"
                      }`}
                    >
                      {filter.name}
                    </p>
                  </div>
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
