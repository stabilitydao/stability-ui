import { memo } from "react";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const LiquidityPool: React.FC<IProps> = memo(({ vault }) => {
  return (
    <div>
      <div className="flex justify-between items-center h-[60px]">
        <h2 className="text-[28px] text-start ml-4">Liquidity pool</h2>
      </div>
    </div>
  );
});

export { LiquidityPool };