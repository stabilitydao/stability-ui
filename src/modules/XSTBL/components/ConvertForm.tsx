import { useState, useEffect, useRef } from "react";

import { useStore } from "@nanostores/react";

import { ActionButton } from "../ui";

import { connected } from "@store";

const ConvertForm = (): JSX.Element => {
  const $connected = useStore(connected);

  const input = useRef<HTMLInputElement>(null);

  const [balance, setBalance] = useState(0);

  const [inputValue, setInputValue] = useState("");
  const [button, setButton] = useState("Convert"); // ""

  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);

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

  const convert = async () => {
    console.log("convert");
  };

  useEffect(() => {}, []);

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
                className="absolute inset-y-0 right-1 flex items-center px-3 py-1 text-accent-400 text-[12px] font-semibold"
              >
                Max
              </button>
            )}
          </label>
          <div
            className={`text-[12px] leading-3 text-neutral-500 flex items-center gap-1 mt-1 ${
              !!balance ? "" : "opacity-0"
            }`}
          >
            <span>Balance: </span>
            <span>{!!balance ? balance : "0"}</span>
          </div>
        </div>
        <ActionButton
          type={button}
          transactionInProgress={transactionInProgress}
          needConfirm={needConfirm}
          actionFunction={convert}
        />
      </div>
    </div>
  );
};

export { ConvertForm };
