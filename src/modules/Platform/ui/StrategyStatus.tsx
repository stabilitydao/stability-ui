import { STATE_COLORS } from "../constants";

import type { TStrategyState } from "@types";

type TProps = {
  state: TStrategyState;
};

const StrategyStatus: React.FC<TProps> = ({ state }) => {
  const bgColor = STATE_COLORS[state] || "bg-gray-800";

  const baseClasses =
    "inline-flex text-[12px] px-3 py-1 rounded-2xl justify-center w-[120px] whitespace-nowrap text-white font-bold";

  return <span className={`${baseClasses} ${bgColor}`}>{state}</span>;
};

export { StrategyStatus };
