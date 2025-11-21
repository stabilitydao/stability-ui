import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import { writeContract } from "@wagmi/core";

import { cn, getTransactionReceipt } from "@utils";

import { CHAINS } from "@constants";

import { factories, FactoryABI, wagmiConfig } from "@web3";

import { currentChainID } from "@store";

import { getChainStrategies, Strategy } from "@stabilitydao/stability";

import { TAddress } from "@types";

const Factory = (): JSX.Element => {
  const $currentChainID = useStore(currentChainID);

  const [activeSection, setActiveSection] = useState("strategy");

  const [implementationInput, setImplementationInput] = useState("");
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState("");
  const [lastTx, setLastTx] = useState("");

  const setStrategyImplementation = async () => {
    const factoryAddress = factories?.[$currentChainID ?? "146"];

    try {
      const hash = await writeContract(wagmiConfig, {
        address: factoryAddress,
        abi: FactoryABI,
        functionName: "setStrategyImplementation",
        args: [selectedStrategy, implementationInput as TAddress],
      });

      await getTransactionReceipt(hash);

      console.log("Tx hash:", hash);

      setLastTx(hash);
    } catch (error) {
      console.error("setStrategyImplementation error:", error);
    }
  };

  const setVaultImplementation = async () => {
    const factoryAddress = factories?.[$currentChainID ?? "146"];

    try {
      const hash = await writeContract(wagmiConfig, {
        address: factoryAddress,
        abi: FactoryABI,
        functionName: "setVaultImplementation",
        args: ["Compounding", implementationInput as TAddress],
      });

      await getTransactionReceipt(hash);

      console.log("Tx hash:", hash);

      setLastTx(hash);
    } catch (error) {
      console.error("setVaultImplementation error:", error);
    }
  };

  const handleFunctions = async () => {
    switch (activeSection) {
      case "vault":
        setVaultImplementation();
        break;
      case "strategy":
        setStrategyImplementation();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if ($currentChainID) {
      const chain = CHAINS.find(({ id }) => id == $currentChainID);

      const _strategies = getChainStrategies(chain?.name).filter(
        (strategy) => strategy.state !== "CANCELLED"
      );

      setStrategies(_strategies);
      setSelectedStrategy(_strategies[0]?.id);
    }
  }, [$currentChainID]);

  useEffect(() => {
    setImplementationInput("");
    setLastTx("");
  }, [activeSection]);

  const explorer = CHAINS.find(({ id }) => id == $currentChainID)?.explorer;

  return (
    <div className="flex flex-col max-w-[1200px] w-full">
      <h3 className="mb-4">Set Implementations</h3>
      <div className="bg-[#18191C] border border-[#232429] rounded-lg p-4 flex flex-col gap-4 w-[800px]">
        <div className="bg-[#18191C] rounded-lg text-[14px] leading-5 font-medium flex items-center border border-[#232429] w-full mb-6">
          <span
            className={cn(
              "h-10 text-center rounded-lg flex items-center justify-center w-1/2",
              activeSection != "strategy"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => setActiveSection("strategy")}
          >
            Strategy
          </span>
          <span
            className={cn(
              "h-10 text-center rounded-lg flex items-center justify-center w-1/2",
              activeSection != "vault"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => setActiveSection("vault")}
          >
            Vault
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {activeSection === "strategy" ? (
            <label className="w-full rounded-lg bg-[#181D21] text-neutral-50 outline-none transition-all block">
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="text-xl font-semibold outline-none transition-all w-full px-3 py-2 bg-[#181D21]"
              >
                {strategies.map((option) => (
                  <option key={option.shortId} value={option.id}>
                    {option.id}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="flex gap-2">
            <div className="flex flex-col items-start justify-between w-[30%]">
              Implementation Address
            </div>

            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-[70%]">
              <input
                type="text"
                placeholder="0"
                value={implementationInput}
                onChange={(e) => setImplementationInput(e.target.value)}
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>
          </div>
        </div>

        {lastTx ? (
          <a href={`${explorer}/tx/${lastTx}`} target="_blank">
            Check tx
          </a>
        ) : null}

        <button
          className="bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold py-5"
          type="button"
          onClick={handleFunctions}
        >
          Set
        </button>
      </div>
    </div>
  );
};
export { Factory };
