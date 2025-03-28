import { useState } from "react";

import WagmiLayout from "@layouts/WagmiLayout";

import {
  ConvertForm,
  ExitForms,
  VestedExit,
  InstantExit,
  Stake,
} from "./components";

const XSTBL = (): JSX.Element => {
  const [activeForm, setActiveForm] = useState("convert"); // convert, vest, exit, stake

  return (
    <WagmiLayout>
      <div className="min-w-full lg:min-w-[1000px] xl:min-w-[1200px] max-w-[1400px] font-manrope flex flex-col gap-5">
        <div className="bg-accent-950 p-5 rounded-2xl lg:hidden flex flex-col gap-3">
          <div
            onClick={() => setActiveForm("convert")}
            className={`cursor-pointer rounded-2xl px-5 py-3 ${activeForm === "convert" ? "bg-accent-500" : "bg-accent-900"}`}
          >
            Convert STBL to xSTBL
          </div>
          <div
            onClick={() => setActiveForm("vest")}
            className={`cursor-pointer rounded-2xl px-5 py-3 ${activeForm === "vest" ? "bg-accent-500" : "bg-accent-900"}`}
          >
            Vest xSTBL
          </div>
          <div
            onClick={() => setActiveForm("exit")}
            className={`cursor-pointer rounded-2xl px-5 py-3 ${activeForm === "exit" ? "bg-accent-500" : "bg-accent-900"}`}
          >
            Instant Exit
          </div>
          <div
            onClick={() => setActiveForm("stake")}
            className={`cursor-pointer rounded-2xl px-5 py-3 ${activeForm === "stake" ? "bg-accent-500" : "bg-accent-900"}`}
          >
            Stake
          </div>
        </div>

        <h3 className="text-[32px] font-bolt text-center mt-5 lg:block hidden">
          ENTER
        </h3>
        <div className="hidden lg:block">
          <ConvertForm />
        </div>

        <h3 className="text-[32px] font-bolt text-center mt-5 lg:block hidden">
          EXIT
        </h3>
        <ExitForms />
        <h3 className="text-[32px] font-bolt text-center mt-5 lg:block hidden">
          STAKING
        </h3>
        <div className="hidden lg:block">
          <Stake />
        </div>

        <div className="block lg:hidden">
          {activeForm === "convert" ? (
            <ConvertForm />
          ) : activeForm === "vest" ? (
            <VestedExit />
          ) : activeForm === "exit" ? (
            <InstantExit />
          ) : activeForm === "stake" ? (
            <Stake />
          ) : null}
        </div>
      </div>
    </WagmiLayout>
  );
};
export { XSTBL };
