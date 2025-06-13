import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { useStore } from "@nanostores/react";

import { writeContract } from "@wagmi/core";

import { ActionButton } from "@ui";

import { getTransactionReceipt, cn } from "@utils";

import { sonicClient, ERC20ABI, IXSTBLABI, wagmiConfig } from "@web3";

import { connected, account, lastTx } from "@store";

import { STABILITY_TOKENS } from "@constants";

import type { TAddress } from "@types";

const ConvertForm = (): JSX.Element => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);

  const input = useRef<HTMLInputElement>(null);

  const [balance, setBalance] = useState("0");
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

      let parsedBalance = formatUnits(
        STBLBalance,
        STABILITY_TOKENS[146].stbl.decimals
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
    <div className="bg-[#101012] border border-[#23252A] p-6 rounded-lg flex justify-between flex-col md:flex-row">
      <div className="flex flex-col gap-2 mb-2 md:mb-0">
        <span className="text-[24px] leading-8 font-semibold">
          Convert STBL to xSTBL
        </span>
        <span className="text-[16px] leafing-6 font-medium text-[#97979A]">
          Convert STBL to xSTBL at any time. The process is instant, and the
          ratio is 1:1.
        </span>
      </div>
      <div className="lg:w-1/3 flex flex-col justify-between gap-4">
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
            <span>{!!balance ? balance : "0"} STBL</span>
          </div>
        </label>
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
