import { useState } from "react";

import WagmiLayout from "@layouts/WagmiLayout";

import {
  ConvertForm,
  ExitForms,
  VestedExit,
  InstantExit,
  Stake,
} from "./components";

import { cn } from "@utils";

const XSTBL = (): JSX.Element => {
  const [activeForm, setActiveForm] = useState("stake"); // stake, convert, vest, exit

  return (
    <WagmiLayout>
      <div className="min-w-full lg:min-w-[1000px] xl:min-w-[1200px] max-w-[1400px] font-manrope flex flex-col gap-5 pb-5 lg:pb-20">
        <div>
          <h2 className="page-title__font text-start mb-2 md:mb-5">Staking</h2>
          <h3 className="text-[#97979a] page-description__font">
            Staking allows users to lock their assets and earn passive rewards
            <br className="hidden lg:block" /> over time. Participate in network
            security or protocol incentives while{" "}
            <br className="hidden lg:block" /> maximizing returns through
            flexible or fixed-term staking options
          </h3>
        </div>
        <div className="bg-[#1C1D1F] p-[6px] rounded-lg border border-[#383B42] lg:hidden flex flex-col gap-1 text-[14px] leading-5 font-medium">
          <div
            onClick={() => setActiveForm("stake")}
            className={cn(
              "cursor-pointer rounded-lg p-[6px]",
              activeForm === "stake" && "bg-[#27292E]"
            )}
          >
            Stake
          </div>
          <div
            onClick={() => setActiveForm("convert")}
            className={cn(
              "cursor-pointer rounded-lg p-[6px]",
              activeForm === "convert" && "bg-[#27292E]"
            )}
          >
            Convert STBL to xSTBL
          </div>
          <div
            onClick={() => setActiveForm("vest")}
            className={cn(
              "cursor-pointer rounded-lg p-[6px]",
              activeForm === "vest" && "bg-[#27292E]"
            )}
          >
            Vest xSTBL
          </div>
          <div
            onClick={() => setActiveForm("exit")}
            className={cn(
              "cursor-pointer rounded-lg p-[6px]",
              activeForm === "exit" && "bg-[#27292E]"
            )}
          >
            Instant Exit
          </div>
        </div>
        <div className="hidden lg:block">
          <Stake />
        </div>

        <div className="hidden lg:block">
          <ConvertForm />
        </div>

        <ExitForms />

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
