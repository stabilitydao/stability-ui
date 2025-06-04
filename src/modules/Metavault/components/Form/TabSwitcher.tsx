import { useState } from "react";
import type React from "react";

import { motion } from "framer-motion";

import { cn } from "@utils";

import { TransactionTypes } from "@types";

interface IProps {
  actionType: TransactionTypes;
  setActionType: React.Dispatch<React.SetStateAction<TransactionTypes>>;
}

const TabSwitcher: React.FC<IProps> = ({ actionType, setActionType }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className=" overflow-x-auto hide-scrollbar">
      <motion.div
        className="flex items-center gap-2 text-[14px] mb-6"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={hovered ? { x: "-30%" } : { x: 0 }}
        transition={{
          duration: 3,
          ease: "linear",
          repeat: 0,
        }}
      >
        <span
          className={cn(
            "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
            actionType === "deposit" && "bg-[#22242A] text-white cursor-default"
          )}
          onClick={() => setActionType(TransactionTypes.Deposit)}
        >
          Deposit
        </span>
        <span
          className={cn(
            "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
            actionType === "withdraw" &&
              "bg-[#22242A] text-white cursor-default"
          )}
          onClick={() => setActionType(TransactionTypes.Withdraw)}
        >
          Withdraw
        </span>
        <span
          className={cn(
            "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
            actionType === "wrap" && "bg-[#22242A] text-white cursor-default"
          )}
          onClick={() => setActionType(TransactionTypes.Wrap)}
        >
          Wrap
        </span>
        <span
          className={cn(
            "py-2 px-4 rounded-lg border border-[#2C2E33] cursor-pointer text-[#97979A]",
            actionType === "unwrap" && "bg-[#22242A] text-white cursor-default"
          )}
          onClick={() => setActionType(TransactionTypes.Unwrap)}
        >
          Unwrap
        </span>
      </motion.div>
    </div>
  );
};

export { TabSwitcher };
