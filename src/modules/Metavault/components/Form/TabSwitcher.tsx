import type React from "react";

import { cn } from "@utils";

import { TransactionTypes } from "@types";

interface IProps {
  actionType: TransactionTypes;
  setActionType: React.Dispatch<React.SetStateAction<TransactionTypes>>;
}

const TabSwitcher: React.FC<IProps> = ({ actionType, setActionType }) => {
  return (
    <div className="flex items-center gap-2 text-[14px] mb-6">
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
          actionType === "withdraw" && "bg-[#22242A] text-white cursor-default"
        )}
        onClick={() => setActionType(TransactionTypes.Withdraw)}
      >
        Withdraw
      </span>
    </div>
  );
};

export { TabSwitcher };
