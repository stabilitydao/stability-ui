import { useEffect, memo } from "react";
import { PAGINATION_VAULTS } from "@constants";

import type { TVault } from "@types";

interface IProps {
  vaults: TVault[];
  tab: number;
  setTab: (number: number) => void;
}

const Pagination: React.FC<IProps> = memo(({ vaults, tab, setTab }) => {
  const newUrl = new URL(window.location.href);
  const params = new URLSearchParams(newUrl.search);

  const paginationNumbers = [];

  for (let i = 1; i <= Math.ceil(vaults.length / PAGINATION_VAULTS); i++) {
    paginationNumbers.push(i);
  }

  const VISIBLE_VAULTS = {
    first: tab === 1 ? tab : PAGINATION_VAULTS * (tab - 1) + 1,
    latest:
      PAGINATION_VAULTS * tab >= vaults.length
        ? vaults.length
        : PAGINATION_VAULTS * tab,
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

  return (
    paginationNumbers.length > 1 && (
      <div className="flex items-center gap-5 mt-3 font-manrope">
        <div className="flex gap-3 select-none">
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
        <p className="text-[18px] font-semibold">
          Vaults: {VISIBLE_VAULTS.first}-{VISIBLE_VAULTS.latest} of{" "}
          {vaults.length}
        </p>
      </div>
    )
  );
});

export { Pagination };
