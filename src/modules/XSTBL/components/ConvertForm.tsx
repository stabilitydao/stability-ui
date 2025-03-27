import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { useStore } from "@nanostores/react";

import { writeContract } from "@wagmi/core";

import { ActionButton } from "../ui";

import { getTransactionReceipt } from "../functions";

import { sonicClient, ERC20ABI, IXSTBLABI, wagmiConfig } from "@web3";

import { connected, account, lastTx } from "@store";

import { STABILITY_TOKENS } from "@constants";

import type { TAddress } from "@types";

const ConvertForm = (): JSX.Element => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);

  const input = useRef<HTMLInputElement>(null);

  const [balance, setBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);

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
      } else if (Number(numericValue) > allowance) {
        setButton("Approve");
      } else if (Number(numericValue) <= Number(balance)) {
        setButton("Convert");
      }
    }
  };

  const getData = async () => {
    try {
      const STBLBalance = await sonicClient.readContract({
        address: STABILITY_TOKENS[146].stbl.address as TAddress,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [$account as TAddress],
      });

      const STBLAllowance = await sonicClient.readContract({
        address: STABILITY_TOKENS[146].stbl.address as TAddress,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [
          $account as TAddress,
          STABILITY_TOKENS[146].xstbl.address as TAddress,
        ],
      });

      let parsedBalance = Number(
        formatUnits(STBLBalance, STABILITY_TOKENS[146].stbl.decimals)
      );

      let parsedAllowance = Number(
        formatUnits(STBLAllowance, STABILITY_TOKENS[146].xstbl.decimals)
      );

      if (parsedBalance) {
        setBalance(parsedBalance);
      }
      if (parsedAllowance) {
        setAllowance(parsedAllowance);
      }
    } catch (error) {
      console.error("Get STBL balance error:", error);
    }
  };

  const convertHandler = async () => {
    if (button === "Approve") {
      await approve();
    }

    if (button === "Convert") {
      await convert();
    }
  };

  const approve = async () => {
    setTransactionInProgress(true);

    const STBL = STABILITY_TOKENS[146].stbl.address as TAddress;
    const xSTBL = STABILITY_TOKENS[146].xstbl.address as TAddress;

    const decimals = STABILITY_TOKENS[146].stbl.decimals;

    const amount = Number(input?.current?.value);

    if (STBL && $account && amount) {
      try {
        const approveSum = parseUnits(String(amount), decimals);

        setNeedConfirm(true);
        const STBLApprove = await writeContract(wagmiConfig, {
          address: STBL,
          abi: ERC20ABI,
          functionName: "approve",
          args: [xSTBL, approveSum],
        });
        setNeedConfirm(false);

        const transaction = await getTransactionReceipt(STBLApprove);

        if (transaction?.status === "success") {
          lastTx.set(transaction?.transactionHash);

          const newAllowance = await sonicClient.readContract({
            address: STABILITY_TOKENS[146].stbl.address as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [
              $account as TAddress,
              STABILITY_TOKENS[146].xstbl.address as TAddress,
            ],
          });

          let parsedAllowance = Number(
            formatUnits(newAllowance, STABILITY_TOKENS[146].xstbl.decimals)
          );

          setAllowance(parsedAllowance);

          if (Number(parsedAllowance) >= Number(amount)) {
            setButton("Convert");
          }
        }
      } catch (error) {
        setNeedConfirm(false);
        const newAllowance = await sonicClient.readContract({
          address: STABILITY_TOKENS[146].stbl.address as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [
            $account as TAddress,
            STABILITY_TOKENS[146].xstbl.address as TAddress,
          ],
        });

        let parsedAllowance = Number(
          formatUnits(newAllowance, STABILITY_TOKENS[146].xstbl.decimals)
        );

        setAllowance(parsedAllowance);

        if (Number(parsedAllowance) >= Number(amount)) {
          setButton("Convert");
        }
        console.error("Approve error:", error);
      }
    }
    setTransactionInProgress(false);
  };

  const convert = async () => {
    setTransactionInProgress(true);
    const decimals = STABILITY_TOKENS[146].stbl.decimals;

    const amount = Number(input?.current?.value);

    const value = parseUnits(String(amount), decimals);

    try {
      setNeedConfirm(true);
      const convertSTBL = await writeContract(wagmiConfig, {
        address: STABILITY_TOKENS[146].xstbl.address as TAddress,
        abi: IXSTBLABI,
        functionName: "enter",
        args: [value],
      });
      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(convertSTBL);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        input.current.value = "";
        setButton("");
      }
    } catch (error) {
      setNeedConfirm(false);
      console.error("Convert STBL to xSTBL error:", error);
    }
    setTransactionInProgress(false);
  };

  useEffect(() => {
    if ($account) {
      getData();
    }
  }, [$account, $lastTx]);

  return (
    <div className="bg-accent-950 p-5 rounded-2xl flex justify-between flex-col md:flex-row">
      <div className="flex flex-col">
        <span className="text-[26px]">Convert STBL to xSTBL</span>
        <span className="text-[18px]">
          Convert STBL to xSTBL at any time. The process is instant, and the
          ratio is 1:1.
        </span>
      </div>
      <div className="lg:w-1/3 mt-5 md:mt-0">
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
              $connected ? "" : "opacity-0"
            }`}
          >
            <span>Balance: </span>
            <span>{!!balance ? balance : "0"} STBL</span>
          </div>
        </div>
        <ActionButton
          type={button}
          transactionInProgress={transactionInProgress}
          needConfirm={needConfirm}
          actionFunction={convertHandler}
        />
      </div>
    </div>
  );
};

export { ConvertForm };
