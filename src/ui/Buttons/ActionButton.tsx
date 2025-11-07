import { useWeb3Modal } from "@web3modal/wagmi/react";

import { useStore } from "@nanostores/react";

import { Loader } from "@ui";

import { SwitchNetworkButton } from "./SwitchNetworkButton";
import { BaseButton } from "./BaseButton";

import { cn } from "@utils";

import { connected, currentChainID } from "@store";

interface IProps {
  type: string;
  network?: string;
  transactionInProgress: boolean;
  needConfirm: boolean;
  actionFunction: () => Promise<void>;
}

const ActionButton: React.FC<IProps> = ({
  type,
  network = "146",
  transactionInProgress,
  needConfirm,
  actionFunction,
}) => {
  const $connected = useStore(connected);
  const $currentChainID = useStore(currentChainID);

  const { open } = useWeb3Modal();

  const actionTypes = [
    "Deposit",
    "Withdraw",
    "Convert",
    "Exit",
    "Vest",
    "Cancel Vest",
    "Stake",
    "Unstake",
    "Approve",
    "Wrap",
    "Unwrap",
    "Supply",
    "Borrow",
    "Repay",
    "Delegate",
  ];

  if (!$connected) {
    return (
      <button
        type="button"
        className="bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold"
        onClick={() => open()}
      >
        <p className="px-6 py-4">Connect Wallet</p>
      </button>
    );
  }

  if ($currentChainID != network) {
    return <SwitchNetworkButton network={network} />;
  }

  if (type === "insufficientBalance") {
    return <BaseButton text="Insufficient Balance" />;
  }

  if (type === "disabledCancelVest") {
    return <BaseButton text="Cancel Vest" />;
  }

  if (type === "enterAddress") {
    return <BaseButton text="Enter Address" />;
  }

  if (actionTypes.includes(type) || type.includes("Claim")) {
    return (
      <button
        disabled={transactionInProgress}
        className={cn(
          "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold",
          transactionInProgress && "text-[#6A6B6F] bg-[#35363B]"
        )}
        type="button"
        onClick={actionFunction}
      >
        <div className="flex items-center justify-center gap-2 px-6 py-4">
          {needConfirm ? "Confirm in wallet" : type}{" "}
          {transactionInProgress && <Loader color={"#a6a0b2"} />}
        </div>
      </button>
    );
  }

  return <BaseButton text="Enter Amount" />;
};

export { ActionButton };
