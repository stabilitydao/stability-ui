import { useState, useEffect, useRef, memo } from "react";

import type { Dispatch, SetStateAction } from "react";

import { Checkbox, Toggler, FiltersIcon } from "@ui";

import { cn, useClickOutside, useModalClickOutside } from "@utils";

import type {
  TTableActiveParams,
  TTableFilters,
  TTAbleFiltersVariant,
} from "@types";

interface IProps {
  filters: TTableFilters[];
  setFilters: Dispatch<SetStateAction<TTableFilters[]>>;
  allParams: number;
  setTableParams: Dispatch<SetStateAction<TTableActiveParams>>;
  resetTable: () => void;
}

const Filters: React.FC<IProps> = memo(
  ({ filters, setFilters, allParams, setTableParams, resetTable }) => {
    const searchParams = new URLSearchParams(window.location.search);

    const [dropDownSelector, setDropDownSelector] = useState<boolean>(false);

    const [modal, setModal] = useState<boolean>(false);

    const [activeStrategies, setActiveStrategies] = useState(
      searchParams.get("strategies") ? searchParams.get("strategies") : "All"
    );

    const dropDownRef = useRef<HTMLDivElement>(null);

    const modalRef = useRef<HTMLDivElement>(null);

    const mobileOrder = ["Active", "My vaults", "Strategies", "Stablecoins"];

    const activeFiltersHandler = (filter: TTableFilters, option?: string) => {
      const filterName = filters.find((item) => item.name === filter.name);
      if (!filterName) return;

      ///// for vaults url filters
      const newUrl = new URL(window.location.href);
      const params = new URLSearchParams(newUrl.search);
      /////

      let updatedFilters: TTableFilters[] = [];

      switch (filter.type) {
        case "single":
          if (filter.name.toLowerCase() === "stablecoins") {
            !filter.state
              ? params.set("tags", "stablecoins")
              : params.delete("tags");
          }

          updatedFilters = filters.map((f) =>
            f.name === filterName.name ? { ...f, state: !f.state } : f
          );

          setFilters(updatedFilters);
          break;
        case "sample":
          updatedFilters = filters.map((f) =>
            f.name === filterName.name
              ? { ...f, state: option !== "All" ? true : false }
              : f
          );
          const sampleFilter = updatedFilters.find(
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
          setFilters(updatedFilters);
          break;
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

          if (dropDownFilter?.name.toLowerCase() === "strategies") {
            const strategies =
              dropDownFilter?.variants?.filter((variant) => variant.state) ||
              [];

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
        setActiveStrategies("All");
      }
    }, [searchParams]);

    useClickOutside(dropDownRef, () => setDropDownSelector(false));
    useModalClickOutside(modalRef, () => setModal((prev) => !prev));

    return filters.length ? (
      <div>
        <div className="hidden xl:flex items-center justify-evenly flex-wrap gap-2 select-none font-manrope text-[16px] font-semibold flex-shrink-0">
          {filters.map((filter: TTableFilters) => (
            <div data-testid="filter" key={filter.name}>
              {filter.type === "single" ? (
                <label className="inline-flex items-center cursor-pointer bg-transparent h-[48px] border border-[#23252A] rounded-lg">
                  <div className="flex items-center gap-3 py-[13px] px-5">
                    <Checkbox
                      checked={filter.state}
                      onChange={() => activeFiltersHandler(filter)}
                    />
                    <span>{filter.name}</span>
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
                <div className="relative select-none w-[200px]">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropDownSelector((prevState) => !prevState);
                    }}
                    data-testid="strategyFilterDropdown"
                    className="flex items-center justify-between gap-1 px-5 py-[13px] h-[48px] bg-transparent border border-[#23252A] rounded-lg cursor-pointer"
                  >
                    <p className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap text-[16px]">
                      <span className="text-[#97979A]">{filter.name}: </span>
                      <span>{activeStrategies}</span>
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
                          onClick={() =>
                            activeFiltersHandler(filter, variant.name)
                          }
                          className={cn(
                            "p-[6px] cursor-pointer w-full flex items-center gap-2"
                          )}
                          data-testid="strategy"
                          title={variant.title}
                        >
                          <Checkbox
                            checked={variant.state}
                            onChange={() =>
                              activeFiltersHandler(filter, variant.name)
                            }
                          />
                          <span className="text-[14px] leading-[20px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                            {variant.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                filter.type === "sample" && (
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
                )
              )}
            </div>
          ))}
          <div
            className={`flex items-center justify-center h-[48px] rounded-lg w-[100px] border border-[#2C2E33] ${allParams ? "opacity-100 cursor-pointer" : "opacity-30"}`}
            onClick={allParams ? resetTable : undefined}
          >
            <div className="flex items-center justify-center gap-2">
              <p>Clear</p>
              {allParams ? (
                <span className="bg-[#22242A] border border-[#2C2E33] rounded-lg w-[20px] text-center">
                  {allParams}
                </span>
              ) : (
                <img
                  className="w-3 h-3 mx-1"
                  src="/icons/circle-xmark.png"
                  alt="close"
                />
              )}
            </div>
          </div>
        </div>
        <div
          className={cn(
            "border border-[#35363b] bg-[#1d1e23] rounded-lg cursor-pointer block xl:hidden ml-auto relative"
          )}
          onClick={() => setModal(true)}
        >
          <div className="p-3">
            <FiltersIcon isActive={!!allParams} />
          </div>
        </div>
        {modal && (
          <div className="fixed inset-0 z-[1400] bg-black/60 backdrop-blur-sm flex items-center justify-center xl:hidden">
            <div
              ref={modalRef}
              className="relative w-[90%] max-w-[400px] max-h-[80vh] bg-[#111114] border border-[#232429] rounded-lg"
            >
              <div className="flex justify-between items-center p-4 border-b border-[#232429]">
                <h2 className="text-[18px] leading-6 font-semibold">Filters</h2>
                <button onClick={() => setModal(false)}>
                  <img src="/icons/xmark.svg" alt="close" className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3 p-4">
                {filters
                  .sort(
                    (a, b) =>
                      mobileOrder.indexOf(a.name) - mobileOrder.indexOf(b.name)
                  )
                  .map((filter) => {
                    const fitlerName =
                      filter.name === "Active" ? "Status" : filter.name;
                    return (
                      <div
                        key={fitlerName}
                        className="flex items-center justify-between gap-2"
                      >
                        <p className="text-[14px] leading-5 font-medium">
                          {fitlerName}
                        </p>
                        {filter.type === "single" ? (
                          <Toggler
                            checked={filter.state}
                            onChange={() => activeFiltersHandler(filter)}
                          />
                        ) : filter.type === "sample" ? (
                          <div className="flex bg-[#18191c] border border-[#232429] rounded-lg text-[14px] leading-4">
                            <button
                              onClick={() =>
                                activeFiltersHandler(filter, "All")
                              }
                              className={`px-3 py-1 rounded ${
                                !filter.state
                                  ? "bg-[#232429] border border-[#232429]"
                                  : "text-[#97979A]"
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={() => activeFiltersHandler(filter)}
                              className={`px-3 py-1 rounded ${
                                filter.state
                                  ? "bg-[#232429] border border-[#232429]"
                                  : "text-[#97979A]"
                              }`}
                            >
                              {filter.name}
                            </button>
                          </div>
                        ) : filter.type === "dropdown" ? (
                          <div className="relative select-none w-full">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setDropDownSelector((prevState) => !prevState);
                              }}
                              data-testid="strategyFilterDropdown"
                              className="flex items-center justify-between gap-2 px-3 py-1 h-[32px] bg-[#1D1E23] border border-[#35363B] rounded-lg cursor-pointer"
                            >
                              <p className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-[16px] leading-6 font-medium w-full">
                                <span className="text-[#97979A] flex-shrink-0">
                                  {filter.name}:{" "}
                                </span>
                                <span className="inline-block max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">
                                  {activeStrategies}
                                </span>
                              </p>
                              <img
                                className={cn(
                                  "transition delay-[50ms] w-4 h-4",
                                  dropDownSelector
                                    ? "rotate-[180deg]"
                                    : "rotate-[0deg]"
                                )}
                                src="/arrow-down.svg"
                                alt="arrowDown"
                              />
                            </div>

                            <div
                              ref={dropDownRef}
                              className={cn(
                                "absolute left-0 right-0 bg-[#1C1D1F] border border-[#383B42] p-[6px] rounded-lg z-20 mt-2 hide-scrollbar max-h-[40vh] overflow-y-auto",
                                dropDownSelector
                                  ? "block transition delay-[50ms]"
                                  : "hidden"
                              )}
                            >
                              <div className="flex flex-col items-start">
                                {filter.variants?.map(
                                  (variant: TTAbleFiltersVariant) => (
                                    <div
                                      key={variant.name}
                                      onClick={() =>
                                        activeFiltersHandler(
                                          filter,
                                          variant.name
                                        )
                                      }
                                      className="p-[6px] cursor-pointer w-full flex items-center gap-2"
                                      data-testid="strategy"
                                      title={variant.title}
                                    >
                                      <Checkbox
                                        checked={variant.state}
                                        onChange={() =>
                                          activeFiltersHandler(
                                            filter,
                                            variant.name
                                          )
                                        }
                                      />
                                      <span className="text-[14px] leading-[20px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                                        {variant.title}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
              </div>

              <div className="flex justify-between items-center px-4 pb-4">
                <button
                  onClick={() => allParams && resetTable()}
                  className={cn(
                    "text-[#816FEA] text-[14px] leading-5 font-semibold",
                    !allParams && "opacity-50"
                  )}
                >
                  Clear all
                </button>
                <button
                  onClick={() => allParams && setModal(false)}
                  className={cn(
                    "text-[14px] leading-5 font-semibold px-4 py-3 bg-[#816FEA] rounded-lg",
                    !allParams && "opacity-50"
                  )}
                >
                  View results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    ) : null;
  }
);

export { Filters };
