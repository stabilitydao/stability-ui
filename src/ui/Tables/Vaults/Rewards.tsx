import { useState } from "react";

import { motion } from "framer-motion";

import { SILO_POINTS } from "@constants";

import { TAddress } from "@types";

interface IProps {
  address: TAddress;
  symbol: string;
  points: { sonic: number | undefined; rings: number | undefined };
}

const Rewards: React.FC<IProps> = ({ address, symbol, points }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        className="flex items-center gap-1 w-max"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={hovered ? { x: "-30%" } : { x: 0 }}
        transition={{
          duration: 3,
          ease: "linear",
          repeat: 0,
        }}
      >
        {!symbol.includes("PT-") && (
          <div
            title="Sonic Activity Points"
            className="rounded-[4px] border border-[#48c05c] bg-[#192c1e] h-6 flex items-center justify-center"
          >
            <div className="flex items-center gap-1 px-2">
              <img
                src="/sonic.png"
                alt="sonic"
                className="w-4 h-4 rounded-full"
              />
              <span className="text-[12px]">x{points.sonic}</span>
            </div>
          </div>
        )}

        {SILO_POINTS[address as keyof typeof SILO_POINTS] && (
          <div
            title="Silo Points per $ / day"
            className="rounded-[4px] border border-[#FFA500] bg-[#36280f] h-6 flex items-center justify-center"
          >
            <div className="flex items-center gap-1 px-2">
              <img
                src="https://raw.githubusercontent.com/stabilitydao/.github/main/assets/silo.png"
                alt="silo"
                className="w-4 h-4 rounded-full"
              />
              <span className="text-[12px]">
                {SILO_POINTS[address as keyof typeof SILO_POINTS]}
              </span>
            </div>
          </div>
        )}

        {!!points.rings && (
          <div
            title="Rings Points"
            className="rounded-[4px] border border-[#5E6AD2] bg-[#1C1E31] h-6 flex items-center justify-center"
          >
            <div className="flex items-center gap-1 px-2">
              <img
                src="/rings.png"
                alt="rings"
                className="w-4 h-4 rounded-full"
              />
              <span className="text-[12px]">x{points.rings}</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export { Rewards };
