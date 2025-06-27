import type React from "react";

import { cn } from "@utils";

import { TransactionTypes } from "@types";

interface IProps {
  actionType: TransactionTypes;
  setActionType: React.Dispatch<React.SetStateAction<TransactionTypes>>;
}

const TabSwitcher: React.FC<IProps> = ({ actionType, setActionType }) => {
  return (
    <div className="bg-[#18191C] rounded-lg text-[14px] leading-5 font-medium flex items-center border border-[#232429] w-full mb-6">
      <span
        className={cn(
          "h-10 text-center rounded-lg flex items-center justify-center w-1/4",
          actionType != TransactionTypes.Deposit
            ? "text-[#6A6B6F] cursor-pointer"
            : "bg-[#232429] border border-[#2C2E33]"
        )}
        onClick={() => setActionType(TransactionTypes.Deposit)}
      >
        Deposit
      </span>
      <span
        className={cn(
          "h-10 text-center rounded-lg flex items-center justify-center w-1/4",
          actionType != TransactionTypes.Withdraw
            ? "text-[#6A6B6F] cursor-pointer"
            : "bg-[#232429] border border-[#2C2E33]"
        )}
        onClick={() => setActionType(TransactionTypes.Withdraw)}
      >
        Withdraw
      </span>
      <span
        className={cn(
          "h-10 text-center rounded-lg flex items-center justify-center w-1/4",
          actionType != TransactionTypes.Wrap
            ? "text-[#6A6B6F] cursor-pointer"
            : "bg-[#232429] border border-[#2C2E33]"
        )}
        onClick={() => setActionType(TransactionTypes.Wrap)}
      >
        Wrap
      </span>
      <span
        className={cn(
          "h-10 text-center rounded-lg flex items-center justify-center w-1/4",
          actionType != TransactionTypes.Unwrap
            ? "text-[#6A6B6F] cursor-pointer"
            : "bg-[#232429] border border-[#2C2E33]"
        )}
        onClick={() => setActionType(TransactionTypes.Unwrap)}
      >
        Unwrap
      </span>
    </div>
  );
};

export { TabSwitcher };
