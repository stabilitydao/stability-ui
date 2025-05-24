import { useState, useEffect, useRef } from "react";

import { formatUnits, parseUnits } from "viem";

import { writeContract } from "@wagmi/core";

import { useStore } from "@nanostores/react";

import { ActionButton, VestingTimeline, Timer } from "../../ui";

import { getTransactionReceipt } from "@utils";

import { sonicClient, ERC20ABI, wagmiConfig, IXSTBLABI } from "@web3";

import { formatNumber } from "@utils";

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
    <div className="bg-accent-950 p-5 rounded-2xl flex flex-col gap-3 justify-between lg:w-[70%]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center font-semibold relative text-[26px]">
          <p
            className={`w-1/2 md:w-auto whitespace-nowrap z-20 text-center px-4 pb-4 border-b-[1.5px] border-transparent ${vestType === "vestedExit" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"} ${!!vestData.length ? "cursor-pointer" : ""}`}
            onClick={() => vestedTypeHandler("vestedExit")}
          >
            Vested Exit
          </p>
          {!!vestData.length && (
            <p
              className={`w-1/2 md:w-auto whitespace-nowrap cursor-pointer z-20 text-center px-4 pb-4 border-b-[1.5px]  border-transparent ${vestType === "exitVest" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
              onClick={() => vestedTypeHandler("exitVest")}
            >
              Exit Vest
            </p>
          )}
        </div>

        <span className="text-[18px]">
          Redeem xSTBL over a vesting period. Choose a minimum vest of 15 days
          (1:0.5 ratio) to maximum vest of 6 months (1:1 ratio). You can cancel
          the vest in the first 14 days.
        </span>
      </div>
      <div>
        {vestType === "vestedExit" && (
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
              <span>{!!balance ? balance : "0"} xSTBL</span>
            </div>
          </div>
        )}

        <VestingTimeline
          type={vestType}
          value={timelineValue}
          activeVest={activeVest}
        />

        {vestType === "exitVest" && (
          <div className="my-8 flex flex-col relative">
            <div
              onClick={() => setDropDownSelector((prevState) => !prevState)}
              className="flex items-center justify-between py-3 px-4 bg-accent-900 rounded-t-2xl border border-accent-500 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="STBL" className="w-5 h-5" />
                <span>xSTBL Vest #{activeVest.id}</span>
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
              className={`bg-accent-900 mt-2 rounded-2xl w-full z-20 top-[55px] select-none ${
                dropDownSelector ? "absolute transition delay-[50ms]" : "hidden"
              } `}
            >
              <div className="flex flex-col items-start">
                {vestData.map((vest, index: number) => (
                  <div
                    key={vest.id}
                    onClick={() => handleActiveVest(index)}
                    className={`${!index ? "rounded-t-2xl" : ""} ${index === vestData.length - 1 ? "rounded-b-2xl" : ""} py-[10px] px-4 cursor-pointer w-full flex items-center justify-between gap-2 ${
                      vest.id === activeVest.id ? "bg-accent-800" : ""
                    }`}
                    title={`xSTBL Vest #${vest.id}`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[16px] overflow-hidden text-ellipsis whitespace-nowrap">
                        xSTBL Vest #{vest.id}
                      </span>
                      <span className="text-[14px]">
                        {vest.isFullyExited
                          ? "User Exited"
                          : `Lock amount: ${vest.amount} xSTBL`}
                      </span>
                    </div>
                    <span className="text-[16px]">{`Expires: ${new Date(vest.end * 1000).toLocaleDateString()}`}</span>
                  </div>
                ))}
              </div>
            </div>
            {activeVest.isFullyExited ? (
              <div className="text-center bg-transparent py-3 px-4 border border-t-0 rounded-b-2xl border-accent-500">
                Fully Exited
              </div>
            ) : (
              <div className="flex flex-col gap-1 bg-transparent py-3 px-4 border border-t-0 rounded-b-2xl border-accent-500">
                <div className="flex items-center justify-between">
                  <span className="opacity-70 text-light text-[18px]">
                    Amount:
                  </span>
                  <span>{formatNumber(activeVest.amount, "format")} xSTBL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70 text-light text-[18px]">
                    Vest end:
                  </span>
                  <span>
                    {new Date(activeVest.end * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70 text-light text-[18px]">
                    Time left to exit:
                  </span>
                  <Timer end={activeVest.end} />
                </div>
              </div>
            )}
          </div>
        )}

        <ActionButton
          type={button}
          transactionInProgress={transactionInProgress}
          needConfirm={needConfirm}
          actionFunction={vestFunctionHandler}
        />
      </div>
    </div>
  );
};

export { VestedExit };
