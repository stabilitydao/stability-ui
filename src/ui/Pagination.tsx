import { useState, useEffect, memo, useRef } from "react";

import { ArrowIcon } from "@ui";

import { cn, useClickOutside } from "@utils";

import { PAGINATIONS_VARIANTS } from "@constants";

import { DisplayTypes } from "@types";

interface IProps {
  pagination: number;
  data: unknown[];
  tab: number;
  display?: DisplayTypes;
  setTab: (number: number) => void;
  setPagination: (number: number) => void;
}

const Pagination: React.FC<IProps> = memo(
  ({
    pagination,
    data,
    tab,
    display = DisplayTypes.Rows,
    setTab,
    setPagination,
  }) => {
    const newUrl = new URL(window.location.href);
    const params = new URLSearchParams(newUrl.search);

    const itemsDropDownRef = useRef<HTMLDivElement>(null);
    const pagesDropDownRef = useRef<HTMLDivElement>(null);

    const [isPagesDropDown, setIsPagesDropDown] = useState<boolean>(false);
    const [isItemsDropDown, setIsItemsDropDown] = useState<boolean>(false);

    const paginationNumbers = [];

    for (let i = 1; i <= Math.ceil(data.length / pagination); i++) {
      paginationNumbers.push(i);
    }

    const VISIBLE_VAULTS = {
      first: tab === 1 ? tab : pagination * (tab - 1) + 1,
      latest: pagination * tab >= data.length ? data.length : pagination * tab,
    };

    useEffect(() => {
      if (tab === 1) {
        params.delete("page");
      } else {
        params.set("page", String(tab));
      }

      newUrl.search = `?${params.toString()}`;
      window.history.pushState({}, "", newUrl.toString());
    }, [tab]);

    useClickOutside(itemsDropDownRef, () => setIsItemsDropDown(false));
    useClickOutside(pagesDropDownRef, () => setIsPagesDropDown(false));

    return (
      <div
        className={cn(
          "bg-[#151618] border border-[#23252A] rounded-b-lg h-[48px] text-[14px] select-none",
          display === "grid" && "rounded-lg mt-6"
        )}
      >
        <div className="px-0 md:px-4 h-full flex items-center justify-between">
          <div className="flex items-center">
            <div
              ref={itemsDropDownRef}
              className="hidden md:flex items-center gap-4 py-3 pr-4 border-r border-[#23252A] h-full cursor-pointer relative"
              onClick={() => setIsItemsDropDown((prev) => !prev)}
            >
              <span className="text-[#97979a]">Items per page:</span>
              <div className="flex items-center gap-1">
                <span>{pagination}</span>
                <ArrowIcon isActive={true} rotate={isItemsDropDown ? 180 : 0} />
              </div>
              <div
                className={cn(
                  "absolute bottom-full mb-2 w-full rounded-lg bg-[#1C1D1F] border border-[#383B42] p-[6px] z-10",
                  !isItemsDropDown && "hidden"
                )}
              >
                {PAGINATIONS_VARIANTS[
                  display as keyof typeof PAGINATIONS_VARIANTS
                ].map((number) => (
                  <div
                    className={`p-[6px] rounded-lg flex items-center justify-between ${
                      pagination === number
                        ? "bg-[#27292E] cursor-default"
                        : "cursor-pointer"
                    }`}
                    onClick={() => {
                      setPagination(number);
                      setTab(1);
                    }}
                    key={`${number}-pagination`}
                  >
                    <span>{number}</span>
                    {pagination === number && (
                      <img src="/icons/checkmark.svg" alt="Checkmark" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 py-3 px-4 border-r border-[#23252A] h-full">
              {!!VISIBLE_VAULTS.latest ? (
                <span className="text-[#97979a]">
                  {VISIBLE_VAULTS.first}-{VISIBLE_VAULTS.latest} of{" "}
                  {data.length} items
                </span>
              ) : (
                <span className="text-[#97979a]">{data.length} items</span>
              )}
            </div>
          </div>

          <div className="flex items-center md:gap-4">
            <div
              className={cn(
                "flex items-center gap-1 md:py-3",
                tab - 1 && "cursor-pointer"
              )}
              onClick={() => tab - 1 && setTab(tab - 1)}
            >
              <div className="md:p-0 p-4 md:border-l-0 border-l border-[#23252A]">
                <ArrowIcon isActive={!!(tab - 1)} rotate={90} />
              </div>

              <span
                className={cn(
                  "text-[14px] text-[#97979a] hidden md:block",
                  tab - 1 && "text-white"
                )}
              >
                Previous
              </span>
            </div>
            <div
              ref={pagesDropDownRef}
              className={cn(
                "hidden md:flex items-center gap-1 cursor-pointer py-3 relative",
                paginationNumbers.length < 2 && "cursor-default"
              )}
              onClick={() =>
                paginationNumbers.length > 1 &&
                setIsPagesDropDown((prev) => !prev)
              }
            >
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    paginationNumbers.length < 2 && "text-[#97979a]"
                  )}
                >
                  {!!VISIBLE_VAULTS.latest ? tab : 0}
                </span>
                <ArrowIcon
                  isActive={paginationNumbers.length > 1}
                  rotate={isPagesDropDown ? 180 : 0}
                />
              </div>
              <span className="text-[#97979a]">
                of {paginationNumbers.length} pages
              </span>
              <div
                className={cn(
                  "absolute bottom-full mb-2 w-full rounded-lg bg-[#1C1D1F] border border-[#383B42] p-[6px] z-10 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#383B42] scrollbar-track-transparent",
                  !isPagesDropDown && "hidden"
                )}
              >
                {paginationNumbers.map((number) => (
                  <div
                    className={`p-[6px] rounded-lg flex items-center justify-between ${
                      tab === number
                        ? "bg-[#27292E] cursor-default"
                        : "cursor-pointer"
                    }`}
                    onClick={() => setTab(number)}
                    key={`${number}-page`}
                  >
                    <span>{number}</span>
                    {tab === number && (
                      <img src="/icons/checkmark.svg" alt="Checkmark" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 md:py-3",
                tab + 1 <= paginationNumbers.length && "cursor-pointer"
              )}
              onClick={() =>
                tab + 1 <= paginationNumbers.length && setTab(tab + 1)
              }
            >
              <span
                className={cn(
                  "text-[14px] text-[#97979a] hidden md:block",
                  tab + 1 <= paginationNumbers.length && "text-white"
                )}
              >
                Next
              </span>
              <div className="md:p-0 p-4 md:border-l-0 border-l border-[#23252A]">
                <ArrowIcon
                  isActive={tab + 1 <= paginationNumbers.length}
                  rotate={270}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export { Pagination };
