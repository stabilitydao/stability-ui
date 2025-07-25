import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import { metaVaults, platformsData, vaults } from "@store";
import { cn } from "@utils";

import { writeContract } from "@wagmi/core";

import {
  IMetaVaultABI,
  PlatformABI,
  VaultABI,
  wagmiConfig,
  platforms,
  FactoryABI,
} from "@web3";

import { VAULTS_WITH_NAME } from "@constants";
import { getAddress, parseUnits, createPublicClient, http } from "viem";
import { sonic } from "viem/chains";

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
  const $metaVaults = useStore(metaVaults);
  const $vaults = useStore(vaults);
  const $platformsData = useStore(platformsData);

  const _publicClient = createPublicClient({
    chain: sonic,
    transport: http(
      import.meta.env.PUBLIC_SONIC_RPC || "https://sonic.drpc.org"
    ),
  });

  const [activeMetaVaults, setActiveMetaVaults] = useState([]);

  const [currentMetaVault, setCurrentMetaVault] = useState({});

  const [values, setValues] = useState({});
  const [vaultInput, setVaultInput] = useState("");
  const [newProportionInput, setNewProportionInput] = useState("");

  const [activeSection, setActiveSection] = useState("vaults");

  const vaultTypes = {
    Aave: { vaultType: "Compounding", strategyId: "Aave" },
    Silo: { vaultType: "Compounding", strategyId: "Silo" },
  };

  const [currentType, setCurrentType] = useState("Silo");

  const factoryAddress = $platformsData[146]?.factory;
  const FARMS_FACTORY_ADDRESS: TAddress =
    "0xc184a3ECcA684F2621c903A7943D85fA42F56671";

  const [vaultInitAddressesInput, setVaultInitAddressesInput] = useState("");
  const [vaultInitNumsInput, setVaultInitNumsInput] = useState("");
  const [strategyInitAddressesInput, setStrategyInitAddressesInput] =
    useState("");
  const [strategyInitNumsInput, setStrategyInitNumsInput] = useState("");
  const [strategyInitTicksInput, setStrategyInitTicksInput] = useState("");

  const [addVaultData, setAddVaultData] = useState({
    isActive: false,
    isDoHardWorkOnDeposit: true,
    isVaultLastBlockDefenseDisabled: false,
    customVaultFee: 0,
  });

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

  const handleInputChange = (address, event) => {
    setValues((prev) => ({
      ...prev,
      [address]: event.target.value,
    }));
  };

  const setProportion = async () => {
    try {
      const bitIntValues = Object.values(values).map((v) => parseUnits(v, 16));

      const _action = await writeContract(wagmiConfig, {
        address: currentMetaVault.address,
        abi: IMetaVaultABI,
        functionName: "setTargetProportions",
        args: [bitIntValues],
      });

      console.log(_action);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const addVault = async () => {
    try {
      const vaultAddress = getAddress(vaultInput);

      const vaultHardWorkOnDeposit = await _publicClient?.readContract({
        address: vaultAddress,
        abi: VaultABI,
        functionName: "doHardWorkOnDeposit",
      });

      const vaultLastBlockDefenseDisabled = await _publicClient?.readContract({
        address: vaultAddress,
        abi: VaultABI,
        functionName: "lastBlockDefenseDisabled",
      });

      const vaultCustomFee = await _publicClient?.readContract({
        address: platforms[146],
        abi: PlatformABI,
        functionName: "getCustomVaultFee",
        args: [vaultAddress],
      });

      setAddVaultData({
        isActive: true,
        isDoHardWorkOnDeposit: vaultHardWorkOnDeposit,
        isVaultLastBlockDefenseDisabled: vaultLastBlockDefenseDisabled,
        customVaultFee: Number(vaultCustomFee),
      });

      if (vaultHardWorkOnDeposit) {
        const setDoHardWorkOnDeposit = await writeContract(wagmiConfig, {
          address: vaultAddress,
          abi: VaultABI,
          functionName: "setDoHardWorkOnDeposit",
          args: [false],
        });

        console.log(setDoHardWorkOnDeposit);
      }

      if (!vaultLastBlockDefenseDisabled) {
        const setLastBlockDefenseDisabled = await writeContract(wagmiConfig, {
          address: vaultAddress,
          abi: VaultABI,
          functionName: "setLastBlockDefenseDisabled",
          args: [true],
        });

        console.log(setLastBlockDefenseDisabled);
      }

      if (vaultCustomFee != BigInt(20000)) {
        const setCustomVaultFee = await writeContract(wagmiConfig, {
          address: platforms[146],
          abi: PlatformABI,
          functionName: "setCustomVaultFee",
          args: [vaultAddress, BigInt(20000)],
        });

        console.log(setCustomVaultFee);
      }

      const _newValues = [...Object.values(values), newProportionInput];

      const bitIntValues = Object.values(_newValues).map((v) =>
        parseUnits(v, 16)
      );

      const _addVault = await writeContract(wagmiConfig, {
        address: currentMetaVault.address,
        abi: IMetaVaultABI,
        functionName: "addVault",
        args: [vaultAddress, bitIntValues],
      });

      console.log(_addVault);
    } catch (error) {
      console.log("Error:", error);
    }
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
        address: factoryAddress,
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
        address: FARMS_FACTORY_ADDRESS,
        abi: FactoryABI,
        functionName: "addFarms",
        args: [[editFarm]],
      });
      console.log(hash);
    } catch (err) {
      console.error("Transaction error", err);
    }
  };

  const getData = async () => {
    try {
      const _metaVaultsWithProportions = $metaVaults[146].map((mv) => {
        const proportions = Object.entries(mv.vaultProportions).map(
          ([address, obj]) => {
            const symbol =
              $vaults[146][address]?.symbol ??
              $metaVaults[146].find((_mv) => _mv.address === address)?.symbol;

            const newObj = {
              currentProportions: (
                Number(obj.currentProportions) * 100
              ).toFixed(2),
              targetProportions: (Number(obj.targetProportions) * 100).toFixed(
                2
              ),
            };

            return { address, symbol, ...newObj };
          }
        );

        return { ...mv, proportions };
      });

      setActiveMetaVaults(_metaVaultsWithProportions);
      setCurrentMetaVault(_metaVaultsWithProportions[0]);
    } catch (error) {
      console.log("Get data error:", error);
    }
  };

  useEffect(() => {
    setValues({});
    setNewProportionInput("");
    setVaultInput("");
    setAddVaultData({ ...addVaultData, isActive: false });
  }, [activeSection, currentMetaVault]);

  useEffect(() => {
    if ($metaVaults[146] && $vaults[146]) {
      getData();
    }
  }, [$metaVaults]);

  return (
    <div className="flex flex-col max-w-[1200px] w-full">
      <div className="bg-[#18191C] border border-[#232429] rounded-lg p-4 flex flex-col gap-4 w-[800px]">
        <div className="bg-[#18191C] rounded-lg text-[14px] leading-5 font-medium flex items-center border border-[#232429] w-full mb-6">
          <span
            className={cn(
              "h-10 text-center rounded-lg flex items-center justify-center w-1/4",
              activeSection != "vaults"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => setActiveSection("vaults")}
          >
            Add Vault to MetaVault
          </span>
          <span
            className={cn(
              "h-10 text-center rounded-lg flex items-center justify-center w-1/4",
              activeSection != "proportions"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => setActiveSection("proportions")}
          >
            Change Proportions
          </span>
          <span
            className={cn(
              "h-10 text-center rounded-lg flex items-center justify-center w-1/4",
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
              "h-10 text-center rounded-lg flex items-center justify-center w-1/4",
              activeSection != "deploy"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => setActiveSection("deploy")}
          >
            Deploy Vault
          </span>
        </div>

        {!["deploy", "farm"].includes(activeSection) ? (
          <div className="flex items-center gap-2">
            {activeMetaVaults.map((metaVault) => (
              <p
                key={metaVault.address}
                className={cn(
                  "whitespace-nowrap cursor-pointer z-20 text-center px-3 md:px-4 py-2 rounded-lg",
                  currentMetaVault?.address === metaVault?.address
                    ? "text-white border !border-[#2C2E33] bg-[#22242A]"
                    : "text-[#97979A] border !border-[#23252A]"
                )}
                onClick={() => setCurrentMetaVault(metaVault)}
              >
                {metaVault.symbol}
              </p>
            ))}
          </div>
        ) : activeSection === "deploy" ? (
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

        {activeSection === "vaults" && (
          <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
            Vault Address
            <input
              type="text"
              placeholder="0"
              value={vaultInput}
              onChange={(e) => setVaultInput(e.target.value)}
              className="bg-transparent text-2xl font-semibold outline-none w-full"
            />
          </label>
        )}

        {!["deploy", "farm"].includes(activeSection) && (
          <div>
            {currentMetaVault?.proportions?.map((proportion) => (
              <div
                key={proportion.address}
                className="flex flex-col gap-2 mb-4"
              >
                <div className="flex items-center justify-between">
                  <span>
                    {VAULTS_WITH_NAME[proportion.address] ?? proportion.symbol}
                  </span>
                  <span>
                    {proportion.currentProportions}% /{" "}
                    {proportion.targetProportions}%
                  </span>
                </div>

                <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
                  <input
                    type="text"
                    placeholder="0"
                    value={values[proportion.address] || ""}
                    onChange={(e) => handleInputChange(proportion.address, e)}
                    className="bg-transparent text-2xl font-semibold outline-none w-full"
                  />
                </label>
              </div>
            ))}
          </div>
        )}

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

        {activeSection === "vaults" && (
          <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
            New Vault Proportion
            <input
              type="text"
              placeholder="0"
              value={newProportionInput}
              onChange={(e) => setNewProportionInput(e.target.value)}
              className="bg-transparent text-2xl font-semibold outline-none w-full"
            />
          </label>
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

        {activeSection === "proportions" ? (
          <button
            className={cn(
              "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold py-5"
            )}
            type="button"
            onClick={setProportion}
          >
            Set proportions
          </button>
        ) : activeSection === "vaults" ? (
          <button
            className={cn(
              "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold py-5"
            )}
            type="button"
            onClick={addVault}
          >
            Add Vault
          </button>
        ) : activeSection === "farm" ? (
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

        {addVaultData.isActive && (
          <div className="flex flex-col items-center gap-5">
            <span>Add Vault Data</span>
            <div className="flex flex-col items-center gap-2">
              <span>
                Is Vault Hard Work On Deposit:{" "}
                {addVaultData.isDoHardWorkOnDeposit
                  ? "yes(need tx)"
                  : "no(already executed)"}
              </span>
              <span>
                Is Vault Last Block Defense Disabled:{" "}
                {addVaultData.isVaultLastBlockDefenseDisabled
                  ? "no(already executed)"
                  : "yes(need tx)"}
              </span>
              <span>
                Is Correct Current Custom Fee:{" "}
                {addVaultData.customVaultFee != 20000
                  ? `no(need tx, current fee: ${addVaultData.customVaultFee})`
                  : `yes (already executed), current fee: ${addVaultData.customVaultFee}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { VaultManager };
