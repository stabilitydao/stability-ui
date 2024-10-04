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

  const [activeStrategy, setActiveStrategy] = useState(
    searchParams.get("strategy") ? searchParams.get("strategy") : "All"
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
        const updatedFiltersDropDown = filters.map((f) =>
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

        const dropDownFilter = updatedFiltersDropDown.find(
          (f) => f.name === filterName.name
        );

        if (dropDownFilter?.name.toLowerCase() === "strategy") {
          const strategy =
            dropDownFilter?.variants &&
            dropDownFilter?.variants.find((variant) => variant.state);

          strategy
            ? params.set("strategy", strategy.name)
            : params.delete("strategy");

          // UI representation
          if (strategy) {
            setActiveStrategy(strategy.name);
          } else {
            setActiveStrategy("All");
          }
        }
        setDropDownSelector(false);
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
              <label className="inline-flex items-center cursor-pointer bg-[#1F0F50] h-10 rounded-2xl">
                <div className="flex items-center gap-[10px] py-[10px] px-4">
                  <Checkbox
                    checked={filter.state}
                    onChange={() => activeFiltersHandler(filter)}
                  />
                  <span className="text-[#F9F8FA]">{filter.name}</span>
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
              <div className="relative select-none w-[176px]">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropDownSelector((prevState) => !prevState);
                  }}
                  data-testid="strategyFilterDropdown"
                  className="flex items-center justify-between gap-3 px-3 py-1 h-10 bg-[#1F0F50] text-[#F9F8FA] rounded-2xl cursor-pointer"
                >
                  <p>
                    {filter.name}: {activeStrategy}
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
                  className={`bg-[#1F0F50] mt-2 rounded-2xl w-full z-20 ${
                    dropDownSelector
                      ? "absolute transition delay-[50ms]"
                      : "hidden"
                  } `}
                >
                  <div className="flex flex-col items-start">
                    {filter.variants?.map(
                      (variant: TTAbleFiltersVariant, index: number) => (
                        <p
                          key={variant.name}
                          onClick={() =>
                            activeFiltersHandler(filter, variant.name)
                          }
                          className={`${!index && "rounded-t-2xl"} ${index === filter?.variants.length - 1 ? "rounded-b-2xl" : ""} py-[10px] px-4 cursor-pointer w-full ${
                            variant.state ? "bg-[#2B1570]" : ""
                          }`}
                          data-testid="strategy"
                        >
                          {variant.name}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              filter.type === "sample" && (
                <div
                  key={filter.name}
                  className="flex items-center justify-center bg-[#1F0F50] h-10 rounded-2xl"
                >
                  <div className="flex items-center justify-center px-1">
                    <p
                      onClick={() => activeFiltersHandler(filter, "All")}
                      className={`py-1 px-4 cursor-pointer hover:bg-[#2B1570] hover:text-[#8F7AFC] rounded-xl ${
                        !filter.state
                          ? "bg-[#612FFB] text-[#F9F8FA] h-8 hover:bg-[#612FFB] hover:text-[#F9F8FA]"
                          : "text-[#8F7AFC] h-full"
                      } rounded-md`}
                    >
                      All
                    </p>
                    <p
                      onClick={() => activeFiltersHandler(filter)}
                      className={`px-2 py-1 cursor-pointer hover:bg-[#2B1570] hover:text-[#8F7AFC] rounded-xl  ${
                        filter.state
                          ? "bg-[#612FFB] text-[#F9F8FA] h-8 hover:bg-[#612FFB] hover:text-[#F9F8FA]"
                          : "text-[#8F7AFC] h-full"
                      } rounded-md`}
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
