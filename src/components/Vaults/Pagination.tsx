import { memo } from "react";
import { PAGINATION_VAULTS } from "@constants";

import type { TVault } from "@types";

interface IProps {
  vaults: TVault[];
  tab: number;
  setTab: (number: number) => void;
}

const Pagination: React.FC<IProps> = memo(
  ({ vaults, tab, setTab }) => {
    const paginationNumbers = [];
    for (let i = 1; i <= Math.ceil(vaults.length / PAGINATION_VAULTS); i++) {
      paginationNumbers.push(i);
    }
    if (paginationNumbers.length <= 1) {
      return;
    }
    return (
      <div className="flex gap-3 mt-3 select-none">
        {paginationNumbers.map((number) => (
          <p
            className={`px-4 rounded-[4px] cursor-pointer py-2 bg-[#2c2f38] ${
              tab === number
                ? "border-[2px] border-[#957DFA] cursor-default"
                : "hover:bg-[#3d404b]"
            }`}
            onClick={() => setTab(number)}
            key={number}
          >
            {number}
          </p>
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return nextProps.vaults.length > PAGINATION_VAULTS;
  }
);

export { Pagination };
