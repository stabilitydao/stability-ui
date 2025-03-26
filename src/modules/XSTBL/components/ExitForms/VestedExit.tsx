import { useState, useEffect, useRef } from "react";

import { useStore } from "@nanostores/react";

import { ActionButton, VestingTimeline } from "../../ui";

import { connected } from "@store";

const VestedExit: React.FC = () => {
  const $connected = useStore(connected);

  const input = useRef<HTMLInputElement>(null);

  const [balance, setBalance] = useState(0);

  const [inputValue, setInputValue] = useState("");
  const [button, setButton] = useState("Vest"); // Cancel Vest || Vest

  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);

  const [vestType, setVestType] = useState("vestedExit"); //exitVest

  const handleInputChange = (type = "") => {
    let numericValue = input?.current?.value.replace(/[^0-9.]/g, "");

    numericValue = numericValue.replace(/^(\d*\.)(.*)\./, "$1$2");

    if (numericValue.startsWith(".")) {
      numericValue = "0" + numericValue;
    }

    if (type === "max") {
      numericValue = balance.toString();
    }

    // buyPreview(numericValue);

    // setInputValue(numericValue);
    input.current.value = numericValue;
  };

  const vestHandler = async () => {
    if (button === "Vest") {
      await vest();
    }
    if (button === "Cancel Vest") {
      await cancelVest();
    }
  };

  const vestedTypeHandler = (type: string) => {
    if (type === "exitVest") {
      setVestType("exitVest");
      setButton("Cancel Vest");
    } else if (type === "vestedExit") {
      setButton("");
      setVestType("vestedExit");
    }
  };

  const cancelVest = async () => {
    console.log("cancelVest");
  };

  const vest = async () => {
    console.log("vest");
  };

  useEffect(() => {}, []);

  return (
    <div className="bg-accent-950 p-5 rounded-2xl flex flex-col gap-3 justify-between lg:w-[70%]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center font-semibold relative text-[26px]">
          <p
            className={`w-1/2 md:w-auto whitespace-nowrap cursor-pointer z-20 text-center px-4 pb-4 border-b-[1.5px] border-transparent ${vestType === "vestedExit" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
            onClick={() => vestedTypeHandler("vestedExit")}
          >
            Vested Exit
          </p>
          <p
            className={`w-1/2 md:w-auto whitespace-nowrap cursor-pointer z-20 text-center px-4 pb-4 border-b-[1.5px]  border-transparent ${vestType === "exitVest" ? "text-neutral-50 !border-accent-500" : "text-neutral-500 hover:border-accent-800"}`}
            onClick={() => vestedTypeHandler("exitVest")}
          >
            Exit Vest
          </p>
        </div>

        <span className="text-[18px]">
          Redeem xSTBL over a vesting period. Choose a minimum vest of 15 days
          (1:0.5 ratio) to maximum vest of 6 months (1:1 ratio). You can cancel
          the vest in the first 14 days.
        </span>
      </div>
      <div>
        <div>
          {vestType === "vestedExit" && (
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
                  className="absolute inset-y-0 right-1 flex items-center px-3 py-1 text-accent-400 text-[12px] font-semibold"
                >
                  Max
                </button>
              )}
            </label>
          )}

          <div
            className={`text-[12px] leading-3 text-neutral-500 flex items-center gap-1 mt-1 ${
              !!balance ? "" : "opacity-0"
            }`}
          >
            <span>Balance: </span>
            <span>{!!balance ? balance : "0"}</span>
          </div>
        </div>

        <VestingTimeline type={vestType} />

        {vestType === "exitVest" && (
          <div className="my-8 flex flex-col">
            <div className="flex items-center gap-3 py-3 px-4 bg-accent-900 rounded-t-2xl border border-accent-500">
              <img src="/logo.svg" alt="STBL" className="w-5 h-5" />
              <span>xSTBL Vest #1</span>
            </div>
            <div className="flex flex-col gap-1 bg-transparent py-3 px-4 border border-t-0 rounded-b-2xl border-accent-500">
              <div className="flex items-center justify-between">
                <span className="opacity-70 text-light text-[18px]">
                  Amount:
                </span>
                <span>0.001 xSTBL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70 text-light text-[18px]">
                  Vest end:
                </span>
                <span>21/09/25</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-70 text-light text-[18px]">
                  Time left to exit:
                </span>
                <span>13:23:10:01</span>
              </div>
            </div>
          </div>
        )}

        <ActionButton
          type={button}
          transactionInProgress={transactionInProgress}
          needConfirm={needConfirm}
          actionFunction={vestHandler}
        />
      </div>
    </div>
  );
};

export { VestedExit };
