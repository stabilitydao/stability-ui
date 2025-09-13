import { useState } from "react";

import { useStore } from "@nanostores/react";

import { currentChainID } from "@store";
import { cn } from "@utils";

import { writeContract } from "@wagmi/core";

import { wagmiConfig, FactoryABI, factories } from "@web3";

import type { TAddress } from "@types";

interface EditFarm {
  status: bigint;
  pool: TAddress;
  strategyLogicId: string;
  rewardAssets: TAddress[];
  addresses: TAddress[];
  nums: bigint[];
  ticks: number[];
}

const VaultManager = (): JSX.Element => {
  const $currentChainID = useStore(currentChainID);

  const [activeSection, setActiveSection] = useState("farm");

  const vaultTypes = {
    Aave: { vaultType: "Compounding", strategyId: "Aave" },
    Silo: { vaultType: "Compounding", strategyId: "Silo" },
  };

  const [currentType, setCurrentType] = useState("Silo");

  const [vaultInitAddressesInput, setVaultInitAddressesInput] = useState("");
  const [vaultInitNumsInput, setVaultInitNumsInput] = useState("");
  const [strategyInitAddressesInput, setStrategyInitAddressesInput] =
    useState("");
  const [strategyInitNumsInput, setStrategyInitNumsInput] = useState("");
  const [strategyInitTicksInput, setStrategyInitTicksInput] = useState("");

  const vaultInitAddresses = vaultInitAddressesInput
    .split(",")
    .map((addr) => addr.trim())
    .filter((addr) => addr);

  const vaultInitNums = vaultInitNumsInput
    .split(",")
    .map((n) => BigInt(n.trim()))
    .filter((n) => !isNaN(Number(n)));

  const strategyInitAddresses = strategyInitAddressesInput
    .split(",")
    .map((addr) => addr.trim())
    .filter((addr) => addr);

  const strategyInitNums = strategyInitNumsInput
    .split(",")
    .map((n) => BigInt(n.trim()))
    .filter((n) => !isNaN(Number(n)));

  const strategyInitTicks = strategyInitTicksInput
    .split(",")
    .map((n) => parseInt(n.trim()))
    .filter((n) => !isNaN(n));

  const [editFarm, setEditFarm] = useState<EditFarm>({
    status: 0n,
    pool: "",
    strategyLogicId: "",
    rewardAssets: [],
    addresses: [],
    nums: [],
    ticks: [],
  });

  const handleFarmInputChange = <K extends keyof EditFarm>(
    key: K,
    value: EditFarm[K]
  ) => {
    setEditFarm((prev) => ({ ...prev, [key]: value }));
  };

  const deployVault = async () => {
    try {
      const args = [
        vaultTypes[currentType].vaultType,
        vaultTypes[currentType].strategyId,
        vaultInitAddresses,
        vaultInitNums,
        strategyInitAddresses,
        strategyInitNums,
        strategyInitTicks,
      ];

      console.log(args);

      const deployVaultAndStrategy = await writeContract(wagmiConfig, {
        address: factories[$currentChainID],
        abi: FactoryABI,
        functionName: "deployVaultAndStrategy",
        args: args,
      });

      console.log(deployVaultAndStrategy);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const addFarm = async () => {
    try {
      const hash = await writeContract(wagmiConfig, {
        address: factories[$currentChainID],
        abi: FactoryABI,
        functionName: "addFarms",
        args: [[editFarm]],
      });
      console.log(hash);
    } catch (err) {
      console.error("Transaction error", err);
    }
  };

  return (
    <div className="flex flex-col max-w-[1200px] w-full">
      <div className="bg-[#18191C] border border-[#232429] rounded-lg p-4 flex flex-col gap-4 w-[800px]">
        <div className="bg-[#18191C] rounded-lg text-[14px] leading-5 font-medium flex items-center border border-[#232429] w-full mb-6">
          <span
            className={cn(
              "h-10 text-center rounded-lg flex items-center justify-center w-1/2",
              activeSection != "farm"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => setActiveSection("farm")}
          >
            Add Farm
          </span>
          <span
            className={cn(
              "h-10 text-center rounded-lg flex items-center justify-center w-1/2",
              activeSection != "deploy"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => setActiveSection("deploy")}
          >
            Deploy Vault
          </span>
        </div>

        {activeSection === "deploy" ? (
          <div className="flex items-center gap-2">
            {Object.keys(vaultTypes).map((type) => (
              <p
                key={type}
                className={cn(
                  "whitespace-nowrap cursor-pointer z-20 text-center px-3 md:px-4 py-2 rounded-lg",
                  currentType === type
                    ? "text-white border !border-[#2C2E33] bg-[#22242A]"
                    : "text-[#97979A] border !border-[#23252A]"
                )}
                onClick={() => setCurrentType(type)}
              >
                {type}
              </p>
            ))}
          </div>
        ) : null}

        {activeSection === "farm" && (
          <div className="grid gap-3 mb-4">
            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Status
              <input
                value={editFarm.status.toString()}
                onChange={(e) =>
                  handleFarmInputChange("status", BigInt(e.target.value))
                }
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>
            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Pool Address
              <input
                value={editFarm.pool}
                onChange={(e) =>
                  handleFarmInputChange("pool", e.target.value as TAddress)
                }
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>
            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Strategy Logic ID
              <input
                value={editFarm.strategyLogicId}
                onChange={(e) =>
                  handleFarmInputChange("strategyLogicId", e.target.value)
                }
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>

            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Reward Assets (comma-separated)
              <input
                value={editFarm.rewardAssets.join(",")}
                onChange={(e) =>
                  handleFarmInputChange(
                    "rewardAssets",
                    e.target.value.split(",").map((s) => s.trim()) as TAddress[]
                  )
                }
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>

            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Addresses (comma-separated)
              <input
                value={editFarm.addresses.join(",")}
                onChange={(e) =>
                  handleFarmInputChange(
                    "addresses",
                    e.target.value.split(",").map((s) => s.trim()) as TAddress[]
                  )
                }
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>
            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Nums (comma-separated)
              <input
                value={editFarm.nums.map((n) => n.toString()).join(",")}
                onChange={(e) =>
                  handleFarmInputChange(
                    "nums",
                    e.target.value.split(",").map((n) => BigInt(n.trim()))
                  )
                }
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>
            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Ticks (comma-separated)
              <input
                value={editFarm.ticks.join(",")}
                onChange={(e) =>
                  handleFarmInputChange(
                    "ticks",
                    e.target.value
                      .split(",")
                      .map((n) => parseInt(n.trim()))
                      .filter((n) => !isNaN(n))
                  )
                }
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>
          </div>
        )}

        {activeSection === "deploy" && (
          <div className="flex flex-col gap-2">
            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Vault Init Addresses (comma-separated)
              <input
                type="text"
                placeholder="0x,0x,0x"
                value={vaultInitAddressesInput}
                onChange={(e) => setVaultInitAddressesInput(e.target.value)}
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>
            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Vault Init Nums (comma-separated)
              <input
                type="text"
                placeholder="0,0,0"
                value={vaultInitNumsInput}
                onChange={(e) => setVaultInitNumsInput(e.target.value)}
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>

            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Strategy Init Addresses (comma-separated)
              <input
                type="text"
                placeholder="0x,0x,0x"
                value={strategyInitAddressesInput}
                onChange={(e) => setStrategyInitAddressesInput(e.target.value)}
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>

            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Strategy Init Nums (comma-separated)
              <input
                type="text"
                placeholder="0,0,0"
                value={strategyInitNumsInput}
                onChange={(e) => setStrategyInitNumsInput(e.target.value)}
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>

            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Strategy Init Ticks (comma-separated)
              <input
                type="text"
                placeholder="0,0,0"
                value={strategyInitTicksInput}
                onChange={(e) => setStrategyInitTicksInput(e.target.value)}
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>
          </div>
        )}

        {activeSection === "farm" ? (
          <button
            className={cn(
              "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold py-5"
            )}
            type="button"
            onClick={addFarm}
          >
            Add Farm
          </button>
        ) : (
          <button
            className={cn(
              "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold py-5"
            )}
            type="button"
            onClick={deployVault}
          >
            Deploy Vault
          </button>
        )}
      </div>
    </div>
  );
};

export { VaultManager };
