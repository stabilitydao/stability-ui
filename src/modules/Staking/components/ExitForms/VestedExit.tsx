import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { useStore } from "@nanostores/react";

import { ActionButton, ArrowIcon } from "@ui";

import { VestingTimeline, Timer } from "../../ui";

import { getTransactionReceipt, formatNumber, cn } from "@utils";

import { sonicClient, ERC20ABI, wagmiConfig, IXSTBLABI } from "@web3";

import { account, connected, lastTx } from "@store";

import { STABILITY_TOKENS } from "@constants";

import type { TAddress, TVestPeriod } from "@types";

const VestedExit: React.FC = () => {
  const $connected = useStore(connected);
  const $account = useStore(account);
  const $lastTx = useStore(lastTx);

  const input = useRef<HTMLInputElement>(null);
  const dropDownRef = useRef<HTMLDivElement>(null);

  const [timelineValue, setTimelineValue] = useState(0);
  const [activeTimeline, setActiveTimeline] = useState<boolean>(false);

  const [balance, setBalance] = useState("0");

  const [button, setButton] = useState("");

  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);

  const [dropDownSelector, setDropDownSelector] = useState<boolean>(false);

  const [vestType, setVestType] = useState("vestedExit");

  const [vestData, setVestData] = useState<TVestPeriod[]>([]);

  const [activeVest, setActiveVest] = useState<TVestPeriod>({
    id: 0,
    amount: 0,
    start: 0,
    end: 0,
    isFullyExited: true,
  });

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
        setButton("Vest");
      }
      setTimelineValue(Number(input.current.value));
    }
  };

  const handleActiveVest = (id: number) => {
    const _activeVest = vestData[id];

    if (_activeVest.isFullyExited) {
      setButton("disabledCancelVest");
    } else {
      setButton("Cancel Vest");
    }

    setDropDownSelector(false);
    setActiveVest(_activeVest);
  };

  const vestFunctionHandler = async () => {
    if (button === "Vest") {
      await vest();
    }
    if (button === "Cancel Vest" && vestData.length) {
      await cancelVest();
    }
  };

  const vestedTypeHandler = (type: string) => {
    if (type === "exitVest") {
      setVestType("exitVest");
      if (activeVest.isFullyExited) {
        setButton("disabledCancelVest");
      } else {
        setButton("Cancel Vest");
      }
    } else if (type === "vestedExit") {
      setButton("");
      setTimelineValue(0);
      setVestType("vestedExit");
    }
  };

  const cancelVest = async () => {
    setTransactionInProgress(true);
    try {
      setNeedConfirm(true);

      const vestID = activeVest.id - 1;

      const convertSTBL = await writeContract(wagmiConfig, {
        address: STABILITY_TOKENS[146].xstbl.address as TAddress,
        abi: IXSTBLABI,
        functionName: "exitVest",
        args: [vestID],
      });
      setNeedConfirm(false);

      const transaction = await getTransactionReceipt(convertSTBL);

      if (transaction?.status === "success") {
        lastTx.set(transaction?.transactionHash);

        setButton("disabledCancelVest");
      }
    } catch (error) {
      setNeedConfirm(false);
      console.error("Exit vest error:", error);
    }
    setTransactionInProgress(false);
  };

  const vest = async () => {
    setTransactionInProgress(true);
    const decimals = STABILITY_TOKENS[146].stbl.decimals;

    const amount = Number(input?.current?.value);

    const value = parseUnits(String(amount), decimals);

    try {
      setNeedConfirm(true);
      const convertSTBL = await writeContract(wagmiConfig, {
        address: STABILITY_TOKENS[146].xstbl.address as TAddress,
        abi: IXSTBLABI,
        functionName: "createVest",
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
      console.error("Create vest error:", error);
    }
    setTransactionInProgress(false);
  };

  const getData = async () => {
    try {
      const XSTBLBalance = await sonicClient.readContract({
        address: STABILITY_TOKENS[146].xstbl.address as TAddress,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [$account as TAddress],
      });

      const userTotalVests = await sonicClient.readContract({
        address: STABILITY_TOKENS[146].xstbl.address as TAddress,
        abi: IXSTBLABI,
        functionName: "usersTotalVests",
        args: [$account as TAddress],
      });

      const userVests = [];

      for (let i = 0; i < Number(userTotalVests); i++) {
        const vestInfo = (await sonicClient.readContract({
          address: STABILITY_TOKENS[146].xstbl.address as TAddress,
          abi: IXSTBLABI,
          functionName: "vestInfo",
          args: [$account as TAddress, i],
        })) as [bigint, bigint, bigint];

        if (vestInfo?.length === 3) {
          let amount = Number(
            formatUnits(
              vestInfo?.[0] as bigint,
              STABILITY_TOKENS[146].xstbl.decimals
            )
          );

          let start = Number(vestInfo[1]);

          let end = Number(vestInfo[2]);

          let isFullyExited = !amount;

          userVests.push({ id: i + 1, amount, start, end, isFullyExited });
        }
      }

      let parsedBalance = formatUnits(
        XSTBLBalance,
        STABILITY_TOKENS[146].xstbl.decimals
      );

      setBalance(parsedBalance);
      setVestData(userVests);
      setActiveVest(userVests[userVests.length - 1]);
    } catch (error) {
      console.error("Get STBL balance error:", error);
    }
  };

  useEffect(() => {
    if ($account) {
      getData();
    }
  }, [$account, $lastTx]);

  return (
    <div className="bg-[#101012] border border-[#23252A] p-6 rounded-lg flex justify-between flex-col gap-6 lg:w-[70%]">
      <div className="flex flex-col gap-3">
        {!!vestData.length ? (
          <div className="flex items-center font-semibold relative text-[16px] leading-6 w-full bg-[#18191C] border border-[#232429] rounded-lg">
            <p
              className={cn(
                "w-1/2 whitespace-nowrap z-20 text-center px-4 py-3 rounded-lg",
                vestType === "vestedExit"
                  ? "bg-[#2C2E33] border border-[#2C2E33]"
                  : "text-[#6A6B6F]",
                !!vestData.length && "cursor-pointer"
              )}
              onClick={() => vestedTypeHandler("vestedExit")}
            >
              Vested Exit
            </p>
            {!!vestData.length && (
              <p
                className={cn(
                  "w-1/2 whitespace-nowrap cursor-pointer z-20 text-center px-4 py-3 rounded-lg",
                  vestType === "exitVest"
                    ? "bg-[#2C2E33] border border-[#2C2E33]"
                    : "text-[#6A6B6F]"
                )}
                onClick={() => vestedTypeHandler("exitVest")}
              >
                Exit Vest
              </p>
            )}
          </div>
        ) : (
          <span className="text-[24px] leading-8 font-semibold">
            Vested Exit
          </span>
        )}

        <span className="text-[16px] leafing-6 font-medium text-[#97979A]">
          Redeem xSTBL over a vesting period. Choose a minimum vest of 15 days
          (1:0.5 ratio) to maximum vest of 6 months (1:1 ratio). You can cancel
          the vest in the first 14 days.
        </span>
      </div>
      <div>
        {vestType === "exitVest" && (
          <VestingTimeline
            type={vestType}
            value={timelineValue}
            activeVest={activeVest}
          />
        )}

        {vestType === "vestedExit" && (
          <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] mb-4">
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
        )}

        {vestType === "exitVest" && (
          <div className="mt-8 mb-6 flex flex-col relative">
            <span className="text-[#909193] text-[12px] leading-4 font-medium mb-1">
              Select vest
            </span>
            <div
              onClick={() => setDropDownSelector((prevState) => !prevState)}
              className="flex items-center justify-between py-2 px-3 bg-[#1D1E23] border border-[#35363B] rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <img src="/rounded_logo.png" alt="STBL" className="w-5 h-5" />
                <span className="text-[16px] leading-6 font-medium">
                  xSTBL Vest #{activeVest.id}
                </span>
              </div>

              <img
                className={`transition delay-[50ms] select-none ${
                  dropDownSelector ? "rotate-[180deg]" : "rotate-[0deg]"
                }`}
                src="/arrow-down.svg"
                alt="arrowDown"
              />
            </div>
            <div
              ref={dropDownRef}
              className={`bg-[#1C1D1F] border border-[#383B42] mt-3 rounded-lg w-full z-20 top-[55px] select-none p-[6px] ${
                dropDownSelector ? "absolute transition delay-[50ms]" : "hidden"
              } `}
            >
              <div className="flex flex-col items-start">
                {vestData.map((vest, index: number) => (
                  <div
                    key={vest.id}
                    onClick={() =>
                      !vest.isFullyExited && handleActiveVest(index)
                    }
                    className={cn(
                      "rounded-lg p-[6px] w-full flex items-center justify-between gap-2",
                      vest.id === activeVest.id && "bg-[#27292E]",
                      !vest.isFullyExited && "cursor-pointer"
                    )}
                    title={`xSTBL Vest #${vest.id}`}
                  >
                    <div className="flex flex-col items-start font-medium">
                      <span className="text-[14px] leading-5 overflow-hidden text-ellipsis whitespace-nowrap">
                        xSTBL Vest #{vest.id}
                      </span>
                      {vest.isFullyExited ? (
                        <span className="text-[#97979A] text-[12px] leading-5">
                          User Exited
                        </span>
                      ) : (
                        <p className="text-[#97979A] text-[12px] leading-5 flex items-center gap-1">
                          <img src="/icons/lock.svg" alt="lock" />
                          <span>Lock amount: {vest.amount} xSTBL</span>
                        </p>
                      )}
                    </div>
                    <span className="text-[14px] leading-5 font-medium">{`Expires: ${new Date(vest.end * 1000).toLocaleDateString()}`}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-3">
              <div className="flex items-center justify-between text-[16px] leading-5">
                <span className="text-[#E3E4E7] font-medium">Amount</span>
                <span className="font-semibold">
                  {formatNumber(activeVest.amount, "format")} xSTBL
                </span>
              </div>
              <div className="flex items-center justify-between  text-[16px] leading-5">
                <span className="text-[#E3E4E7] font-medium">Vest end</span>
                <span className="font-semibold">
                  {new Date(activeVest.end * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#E3E4E7] text-[16px] leading-5 font-medium">
                  Time left to exit
                </span>
                <Timer end={activeVest.end} withText={false} />
              </div>
            </div>
          </div>
        )}

        <ActionButton
          type={button}
          transactionInProgress={transactionInProgress}
          needConfirm={needConfirm}
          actionFunction={vestFunctionHandler}
        />
        {vestType === "vestedExit" && (
          <div className="mt-6 flex flex-col">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setActiveTimeline((prev) => !prev)}
            >
              <span className="text-[#97979A] font-semibold text-[16px] leading-6">
                Timeline
              </span>
              <ArrowIcon isActive={false} rotate={activeTimeline ? 180 : 0} />
            </div>

            {activeTimeline && (
              <VestingTimeline
                type={vestType}
                value={timelineValue}
                activeVest={activeVest}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { VestedExit };
