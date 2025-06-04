import { useWeb3Modal } from "@web3modal/wagmi/react";

import { useSwitchChain } from "wagmi";

import { useStore } from "@nanostores/react";

import { Loader } from "@ui";

import { cn } from "@utils";

import { connected, currentChainID } from "@store";

interface IProps {
  type: string;
  transactionInProgress: boolean;
  needConfirm: boolean;
  actionFunction: () => Promise<void>;
}

const ActionButton: React.FC<IProps> = ({
  type,
  transactionInProgress,
  needConfirm,
  actionFunction,
}) => {
  const $connected = useStore(connected);
  const $currentChainID = useStore(currentChainID);

  const { open } = useWeb3Modal();
  const { switchChain } = useSwitchChain();

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
  ];

  return (
    <div>
      {$connected ? (
        <>
          {$currentChainID === "146" ? (
            <>
              {actionTypes.includes(type) ? (
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
              ) : type === "insufficientBalance" ? (
                <button
                  disabled
                  className={cn(
                    "bg-[#35363B] rounded-lg w-full text-[16px] leading-5 font-bold"
                  )}
                >
                  <p className="px-6 py-4 text-[#6A6B6F]">
                    Insufficient Balance
                  </p>
                </button>
              ) : type === "disabledCancelVest" ? (
                <button
                  disabled
                  className={cn(
                    "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold"
                  )}
                >
                  <p className="px-6 py-4">Cancel Vest</p>
                </button>
              ) : type.includes("Claim") ? (
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
              ) : (
                <button
                  disabled
                  className={cn(
                    "bg-[#35363B] rounded-lg w-full text-[16px] leading-5 font-bold"
                  )}
                >
                  <p className="px-6 py-4 text-[#6A6B6F]">Enter Amount</p>
                </button>
              )}
            </>
          ) : (
            <button
              className={cn(
                "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold"
              )}
              onClick={() => switchChain({ chainId: 146 })}
            >
              <p className="px-6 py-4">Switch Network </p>
            </button>
          )}
        </>
      ) : (
        <button
          type="button"
          className={cn(
            "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold"
          )}
          onClick={() => open()}
        >
          <p className="px-6 py-4">Connect Wallet</p>
        </button>
      )}
    </div>
  );
};

export { ActionButton };
