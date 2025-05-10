import { useState, useEffect, memo } from "react";

import { ArrowIcon } from "@ui";

import { cn } from "@utils";

import { PAGINATIONS_VARIANTS } from "@constants";

import type { TVault } from "@types";

interface IProps {
  pagination: number;
  vaults: TVault[];
  tab: number;
  display: string;
  setTab: (number: number) => void;
  setPagination: (number: number) => void;
}

const Pagination: React.FC<IProps> = memo(
  ({ pagination, vaults, tab, display, setTab, setPagination }) => {
    const newUrl = new URL(window.location.href);
    const params = new URLSearchParams(newUrl.search);

    const paginationNumbers = [];

    for (let i = 1; i <= Math.ceil(vaults.length / pagination); i++) {
      paginationNumbers.push(i);
    }

    const VISIBLE_VAULTS = {
      first: tab === 1 ? tab : pagination * (tab - 1) + 1,
      latest:
        pagination * tab >= vaults.length ? vaults.length : pagination * tab,
    };

    const [isPagesPopup, setIsPagesPopup] = useState<boolean>(false);
    const [isItemsPopup, setIsItemsPopup] = useState<boolean>(false);

    useEffect(() => {
      if (tab === 1) {
        params.delete("page");
      } else {
        params.set("page", String(tab));
      }

      newUrl.search = `?${params.toString()}`;
      window.history.pushState({}, "", newUrl.toString());
    }, [tab]);

    return (
      <div
        className={cn(
          "bg-[#151618] border border-[#23252A] rounded-b-lg h-[48px] text-[14px] select-none",
          display === "grid" && "rounded-lg mt-6"
        )}
      >
        <div className="px-4 h-full flex items-center justify-between">
          <div className="flex items-center">
            <div
              className="flex items-center gap-4 py-3 pr-4 border-r border-[#23252A] h-full cursor-pointer relative"
              onClick={() => setIsItemsPopup((prev) => !prev)}
            >
              <span className="text-[#97979a]">Items per page:</span>
              <div className="flex items-center gap-1">
                <span>{pagination}</span>
                <ArrowIcon isActive={true} rotate={isItemsPopup ? 180 : 0} />
              </div>
              <div
                className={cn(
                  "absolute bottom-full mb-1 w-full rounded-lg bg-[#101012] z-10",
                  !isItemsPopup && "hidden"
                )}
              >
                {PAGINATIONS_VARIANTS.map((number) => (
                  <p
                    className={`px-4 rounded-[4px] cursor-pointer py-2 bg-accent-900 hover:bg-accent-800 ${
                      pagination === number
                        ? "outline outline-accent-500 outline-[1.5px] cursor-default"
                        : ""
                    }`}
                    onClick={() => {
                      setPagination(number);
                      setTab(1);
                    }}
                    key={`${number}-pagination`}
                  >
                    {number}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 py-3 px-4 border-r border-[#23252A] h-full">
              {!!VISIBLE_VAULTS.latest ? (
                <span className="text-[#97979a]">
                  {VISIBLE_VAULTS.first}-{VISIBLE_VAULTS.latest} of{" "}
                  {vaults.length} items
                </span>
              ) : (
                <span className="text-[#97979a]">{vaults.length} items</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex items-center gap-1 py-3",
                tab - 1 && "cursor-pointer"
              )}
              onClick={() => tab - 1 && setTab(tab - 1)}
            >
              <ArrowIcon isActive={!!(tab - 1)} rotate={90} />
              <span
                className={cn(
                  "text-[14px] text-[#97979a]",
                  tab - 1 && "text-white"
                )}
              >
                Previous
              </span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 cursor-pointer py-3 relative",
                paginationNumbers.length < 2 && "cursor-default"
              )}
              onClick={() =>
                paginationNumbers.length > 1 && setIsPagesPopup((prev) => !prev)
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
                  rotate={isPagesPopup ? 180 : 0}
                />
              </div>
              <span className="text-[#97979a]">
                of {paginationNumbers.length} pages
              </span>
              <div
                className={cn(
                  "absolute bottom-full mb-1 w-full rounded-lg bg-[#101012] z-10",
                  !isPagesPopup && "hidden"
                )}
              >
                {paginationNumbers.map((number) => (
                  <p
                    className={`px-4 rounded-[4px] cursor-pointer py-2 bg-accent-900 hover:bg-accent-800 ${
                      tab === number
                        ? "outline outline-accent-500 outline-[1.5px] cursor-default"
                        : ""
                    }`}
                    onClick={() => setTab(number)}
                    key={number}
                  >
                    {number}
                  </p>
                ))}
              </div>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 py-3",
                tab + 1 <= paginationNumbers.length && "cursor-pointer"
              )}
              onClick={() =>
                tab + 1 <= paginationNumbers.length && setTab(tab + 1)
              }
            >
              <span
                className={cn(
                  "text-[14px] text-[#97979a]",
                  tab + 1 <= paginationNumbers.length && "text-white"
                )}
              >
                Next
              </span>
              <ArrowIcon
                isActive={tab + 1 <= paginationNumbers.length}
                rotate={270}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export { Pagination };
