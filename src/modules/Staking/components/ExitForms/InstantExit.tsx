import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { useStore } from "@nanostores/react";

import { ActionButton } from "@ui";

import { getTransactionReceipt, cn } from "@utils";

import { connected, account, lastTx } from "@store";

import { sonicClient, ERC20ABI, IXSTBLABI, wagmiConfig } from "@web3";

import { STABILITY_TOKENS } from "@constants";

import { daos } from "@stabilitydao/stability";

import type { TAddress } from "@types";

const InstantExit: React.FC = () => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);

  const stabilityDAO = daos?.find(({ name }) => name === "Stability");

  const input = useRef<HTMLInputElement>(null);

  const [balance, setBalance] = useState("0");

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

      let parsedBalance = formatUnits(
        XSTBLBalance,
        STABILITY_TOKENS[146].xstbl.decimals
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
    <div className="bg-[#101012] border border-[#23252A] p-6 rounded-lg flex justify-between flex-col lg:w-1/3">
      <div className="flex flex-col gap-2 mb-2 md:mb-0">
        <span className="text-[24px] leading-8 font-semibold">
          Instant Exit
        </span>
        <span className="text-[16px] leafing-6 font-medium text-[#97979A]">
          Instantly exit to STBL, incurring a {stabilityDAO?.params?.pvpFee}%
          penalty. This process cannot be reverted, all forfeited STBL is
          streamed back to stakers.
        </span>
      </div>
      <div className="flex flex-col justify-between gap-4">
        <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
          <div className="flex items-center justify-between">
            <input
              ref={input}
              name="amount"
              placeholder="0"
              onChange={() => handleInputChange()}
              type="text"
              pattern="^[0-9]*[.,]?[0-9]*$"
              inputMode="decimal"
              autoComplete="off"
              className="bg-transparent text-2xl font-semibold outline-none w-full"
            />
            <div
              className={cn(
                "bg-[#151618] border border-[#23252A] rounded-lg px-3 py-1 text-[14px]",
                $connected && "cursor-pointer"
              )}
              onClick={() => handleInputChange("max")}
            >
              MAX
            </div>
          </div>

          <div className="text-[#97979A] font-semibold text-[16px] leading-6 mt-1">
            <span>Balance: </span>
            <span>{!!balance ? balance : "0"} xSTBL</span>
          </div>
        </label>

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
