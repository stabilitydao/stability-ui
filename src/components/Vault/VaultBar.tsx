import { memo } from "react";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const VaultBar: React.FC<IProps> = memo(({ vault }) => {
  return (
    <div className="flex justify-between items-center p-0">
      <div className="flex flex-col items-start gap-4 w-full lg:justify-between flex-wrap">
        <span className="inline-flex text-[32px] font-medium whitespace-nowrap">
          {vault.symbol}
        </span>

        <span className="text-[18px] lg:text-[20px]">{vault.name}</span>
      </div>
    </div>
  );
});

export { VaultBar };
