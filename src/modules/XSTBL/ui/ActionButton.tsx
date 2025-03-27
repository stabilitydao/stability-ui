import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useSwitchChain } from "wagmi";

import { useStore } from "@nanostores/react";

import { Loader } from "@ui";

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
    "Convert",
    "Exit",
    "Vest",
    "Cancel Vest",
    "Stake",
    "Unstake",
    "Approve",
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
                  className={`w-full flex items-center text-[20px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl h-[50px] ${
                    transactionInProgress
                      ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                      : ""
                  }`}
                  type="button"
                  onClick={actionFunction}
                >
                  <p>{needConfirm ? "Confirm in wallet" : type}</p>

                  {transactionInProgress && <Loader color={"#a6a0b2"} />}
                </button>
              ) : type === "insufficientBalance" ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center text-[20px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl h-[50px]"
                >
                  Insufficient Balance
                </button>
              ) : type === "disabledCancelVest" ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center text-[20px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl h-[50px]"
                >
                  Cancel Vest
                </button>
              ) : (
                <button
                  disabled
                  className="w-full flex items-center justify-center text-[20px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl h-[50px]"
                >
                  Enter Amount
                </button>
              )}
            </>
          ) : (
            <button
              className="w-full flex items-center text-[20px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl h-[50px]"
              onClick={() => switchChain({ chainId: 146 })}
            >
              Switch Network
            </button>
          )}
        </>
      ) : (
        <button
          type="button"
          className="w-full flex items-center text-[20px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl h-[50px]"
          onClick={() => open()}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export { ActionButton };
