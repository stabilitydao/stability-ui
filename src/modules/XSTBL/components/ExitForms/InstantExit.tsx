import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { useStore } from "@nanostores/react";

import { ActionButton } from "../../ui";

import { getTransactionReceipt } from "../../functions";

import { connected, account, lastTx } from "@store";

import { sonicClient, ERC20ABI, IXSTBLABI, wagmiConfig } from "@web3";

import { STABILITY_TOKENS } from "@constants";

import type { TAddress } from "@types";

const InstantExit: React.FC = () => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);

  const input = useRef<HTMLInputElement>(null);

  const [balance, setBalance] = useState(0);

  const [button, setButton] = useState("");

  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);

  const handleInputChange = (type = "") => {
    let numericValue = input?.current?.value.replace(/[^0-9.]/g, "");

    numericValue = numericValue?.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (numericValue?.startsWith(".")) {
      numericValue = "0" + numericValue;
    }

    if (type === "max") {
      numericValue = balance.toString();
    }

    if (input?.current) {
      input.current.value = numericValue;

      if (!Number(numericValue)) {
        setButton("");
      } else if (Number(numericValue) > Number(balance)) {
        setButton("insufficientBalance");
      } else if (Number(numericValue) <= Number(balance)) {
        setButton("Exit");
      }
    }
  };

  const getData = async () => {
    try {
      const XSTBLBalance = await sonicClient.readContract({
        address: STABILITY_TOKENS[146].xstbl.address as TAddress,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [$account as TAddress],
      });

      let parsedBalance = Number(
        formatUnits(XSTBLBalance, STABILITY_TOKENS[146].xstbl.decimals)
      );

      if (parsedBalance) {
        setBalance(parsedBalance);
      }
    } catch (error) {
      console.error("Get STBL balance error:", error);
    }
  };

  const exit = async () => {
    setTransactionInProgress(true);
    const decimals = STABILITY_TOKENS[146].xstbl.decimals;

    const amount = Number(input?.current?.value);

    const value = parseUnits(String(amount), decimals);

    try {
      setNeedConfirm(true);
      const exitSTBL = await writeContract(wagmiConfig, {
        address: STABILITY_TOKENS[146].xstbl.address as TAddress,
        abi: IXSTBLABI,
        functionName: "exit",
        args: [value],
      });
      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(exitSTBL);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        input.current.value = "";
        setButton("");
      }
    } catch (error) {
      setNeedConfirm(false);
      console.error("Instant exit error:", error);
    }
    setTransactionInProgress(false);
  };

  useEffect(() => {
    if ($account) {
      getData();
    }
  }, [$account, $lastTx]);

  return (
    <div className="bg-accent-950 p-5 rounded-2xl flex flex-col gap-3 justify-between lg:w-1/3">
      <div className="flex flex-col">
        <span className="text-[26px]">Instant Exit</span>
        <span className="text-[18px]">
          Instantly exit to STBL, incurring a 50% penalty. This process cannot
          be reverted, all forfeited STBL is streamed back to stakers.
        </span>
      </div>
      <div>
        <div>
          <label className="relative block h-[60px] w-full">
            <img
              src="/STBL_plain.png"
              alt="STBL"
              title="STBL"
              className="absolute top-[27%] left-4 w-8 h-8 text-neutral-500 rounded-full pointer-events-none"
            />

            <input
              ref={input}
              name="amount"
              placeholder="0"
              onChange={() => handleInputChange()}
              type="text"
              pattern="^[0-9]*[.,]?[0-9]*$"
              inputMode="decimal"
              autoComplete="off"
              className="min-w-full bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 h-[60px] my-[2px] pl-[60px] pr-3"
            />

            {!!$connected && !!balance && (
              <button
                type="button"
                onClick={() => handleInputChange("max")}
                className="absolute top-[27%] right-1 flex items-center px-3 py-1 text-accent-400 text-[16px] font-semibold"
              >
                Max
              </button>
            )}
          </label>
          <div
            className={`text-[16px] leading-3 text-neutral-500 flex items-center gap-1 my-3 ${
              !!balance ? "" : "opacity-0"
            }`}
          >
            <span>Balance: </span>
            <span>{!!balance ? balance : "0"} xSTBL</span>
          </div>
        </div>
        <ActionButton
          type={button}
          transactionInProgress={transactionInProgress}
          needConfirm={needConfirm}
          actionFunction={exit}
        />
      </div>
    </div>
  );
};

export { InstantExit };
