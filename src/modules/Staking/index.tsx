import { useState } from "react";

import WagmiLayout from "@layouts/WagmiLayout";

import { chains } from "@stabilitydao/stability";

import {
  ConvertForm,
  ExitForms,
  VestedExit,
  InstantExit,
  Stake,
  Dashboard,
} from "./components";

import { cn } from "@utils";

import { stakeNetwork } from "@store";

const TEMP_CHAINS = [
  {
    name: chains["146"].name,
    id: "146",
    logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["146"].img}`,
    explorer: "https://sonicscan.org",
    nativeCurrency: "S",
    color: "#000000",
    active: true,
  },
  {
    name: chains["9745"].name,
    id: "9745",
    logoURI: `https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${chains["9745"].img}`,
    explorer: "https://plasmascan.to",
    nativeCurrency: "XPL",
    color: "#15322A",
    active: true,
  },
];

const Staking = (): JSX.Element => {
  const [activeForm, setActiveForm] = useState("stake"); // stake, convert, vest, exit

  const [activeNetwork, setActiveNetwork] = useState(TEMP_CHAINS[0]);

  const networksHandler = (chainId: string) => {
    const network =
      TEMP_CHAINS.find(({ id }) => id === chainId) ?? TEMP_CHAINS[0];

    stakeNetwork.set(network);
    setActiveNetwork(network);
  };

  return (
    <WagmiLayout>
      <div className="min-w-full lg:min-w-[1000px] xl:min-w-[1200px] max-w-[1400px] font-manrope flex flex-col gap-5 pb-5 lg:pb-20">
        <div>
          <h2 className="page-title__font text-start mb-2 md:mb-5">Staking</h2>
          <h3 className="text-[#97979a] page-description__font">
            Convert STBL to xSTBL and stake to earn Stability revenue.
          </h3>
        </div>
        <Dashboard />
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

        <div className="flex items-center gap-2 select-none">
          {TEMP_CHAINS.map((chain) => (
            <div
              className={`flex items-center justify-center cursor-pointer px-3 py-2 border h-[48px] rounded-lg ${
                chain.id === activeNetwork.id
                  ? "bg-[#22242A] border-[#35363B]"
                  : "border-[#23252A]"
              }`}
              key={chain.name + chain.id}
              title={chain.name}
              onClick={() => networksHandler(chain.id)}
            >
              <div className="flex items-center gap-2">
                <img
                  className="h-5 w-5 rounded-full"
                  src={chain.logoURI}
                  alt={chain.name}
                />
                <span className="text-[14px] leading-5 font-medium">
                  {chain.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <Stake />
        </div>

        <div className="hidden lg:block">
          <ConvertForm />
        </div>

        <ExitForms />

        <div className="block lg:hidden">
          <div className={cn(activeForm === "convert" ? "block" : "hidden")}>
            <ConvertForm />
          </div>
          <div className={cn(activeForm === "vest" ? "block" : "hidden")}>
            <VestedExit />
          </div>
          <div className={cn(activeForm === "exit" ? "block" : "hidden")}>
            <InstantExit />
          </div>
          <div className={cn(activeForm === "stake" ? "block" : "hidden")}>
            <Stake />
          </div>
        </div>
      </div>
    </WagmiLayout>
  );
};

export { Staking };
