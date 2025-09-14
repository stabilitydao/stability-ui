import { useState } from "react";

import { useStore } from "@nanostores/react";

import { metaVaults, platformsData, vaults, account } from "@store";
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
import {
  getAddress,
  parseUnits,
  createPublicClient,
  http,
  zeroAddress,
  Hash,
  TransactionReceipt,
} from "viem";
import { sonic } from "viem/chains";

import { strategies } from "@stabilitydao/stability";
import { BaseStrategy } from "@stabilitydao/stability/out/strategies";
import {
  TokenSelectorModal,
  Token,
  TxStatusModal,
  TxStatus,
} from "@components/TokenSelectorModal";

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
  const $account = useStore(account);

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
    pool: zeroAddress,
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
      resetTxState();
      setShowTxModal(true);
      setTxStatus("wallet");

      // Simulation
      try {
        await _publicClient.simulateContract({
          address: FARMS_FACTORY_ADDRESS,
          abi: FactoryABI,
          functionName: "addFarms",
          args: [[editFarm]],
          account: $account as TAddress,
        });
      } catch (simErr) {
        console.error("Simulation failed", simErr);
        setTxStatus("error");
        setTxError(
          simErr instanceof Error
            ? simErr.message
            : "Simulation failed: possible revert or bad parameters."
        );
        return;
      }

      // Actual transaction (only runs if simulation succeeded)
      const hash = await writeContract(wagmiConfig, {
        address: factories[$currentChainID],
        abi: FactoryABI,
        functionName: "addFarms",
        args: [[editFarm]],
      });
      console.log(hash);

      setTxHash(hash);
      setTxStatus("pending");

      const receipt: TransactionReceipt =
        await _publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status === "success") {
        setTxStatus("success");
      } else {
        setTxStatus("error");
        setTxError("Transaction reverted");
      }
    } catch (err) {
      console.error("Transaction error", err);
      setTxStatus("error");
      setTxError(
        err instanceof Error ? err.message : "Unexpected error. Check console."
      );
    }
  };

  const getData = async () => {
    try {
      const _metaVaultsWithProportions = $metaVaults[146].map((mv) => {
        const proportions = mv.vaultsData.map((data) => {
          const symbol =
            $vaults[146][data.address]?.symbol ??
            $metaVaults[146].find((_mv) => _mv.address === data.address)
              ?.symbol;

          const newObj = {
            currentProportions: (
              Number(data.proportions.current) * 100
            ).toFixed(2),
            targetProportions: (Number(data.proportions.target) * 100).toFixed(
              2
            ),
          };

          return { address: data.address, symbol, ...newObj };
        });

        return { ...mv, proportions };
      });
      setActiveMetaVaults(_metaVaultsWithProportions);
      setCurrentMetaVault(_metaVaultsWithProportions[0]);
    } catch (error) {
      console.log("Get data error:", error);
    }
  };

  // Add farm: improvements
  const statusOptions = [
    { value: 0, label: "ok" },
    { value: 1, label: "no rewards" },
    { value: 2, label: "deprecated" },
    { value: 5, label: "unbacked underlying" },
  ];

  const [isLPStrategy, setIsLPStrategy] = useState(false);

  const liveFarmingStrategies = Object.values(strategies).filter(
    (strategy) =>
      strategy.state === "LIVE" &&
      strategy.baseStrategies.some((b) => b === "Farming")
  );

  function getStrategyById(id: string) {
    return liveFarmingStrategies.find((strategy) => strategy.id === id);
  }

  const [showTokenModal, setShowTokenModal] = useState(false);
  const [rewardAssets, setRewardAssets] = useState<Token[]>([]);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);

  const resetTxState = () => {
    setTxStatus("idle");
    setTxHash(null);
    setTxError(null);
    setShowTxModal(false);
  };

  const addToken = (token: Token) => {
    if (!rewardAssets.find((t: Token) => t.address === token.address)) {
      const newAssets = [...rewardAssets, token];
      setRewardAssets(newAssets);

      handleFarmInputChange(
        "rewardAssets",
        newAssets.map((t) => t.address) as TAddress[]
      );
    }
  };

  const removeToken = (tokenAddress: string) => {
    const newAssets = rewardAssets.filter(
      (t: Token) => t.address !== tokenAddress
    );
    setRewardAssets(newAssets);

    handleFarmInputChange(
      "rewardAssets",
      newAssets.map((t) => t.address) as TAddress[]
    );
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
      <TokenSelectorModal
        open={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onSelect={(token) => {
          addToken(token);
        }}
      />
      <TxStatusModal
        open={showTxModal}
        status={txStatus}
        hash={txHash}
        error={txError}
        onClose={resetTxState}
      />
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
              <select
                value={editFarm.status.toString()}
                onChange={(e) =>
                  handleFarmInputChange("status", BigInt(e.target.value))
                }
                className="bg-[#1B1D21] text-xl font-semibold outline-none transition-all w-full"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            {isLPStrategy && (
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
            )}
            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A]">
              Strategy Logic ID
              <select
                value={editFarm.strategyLogicId}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFarmInputChange("strategyLogicId", value);
                  setIsLPStrategy(
                    getStrategyById(value)?.baseStrategies.includes(
                      BaseStrategy.LP
                    ) ?? false
                  );
                }}
                className="bg-[#1B1D21] text-xl font-semibold outline-none transition-all w-full"
              >
                {liveFarmingStrategies.map((option) => (
                  <option key={option.shortId} value={option.id}>
                    {option.id}
                  </option>
                ))}
              </select>
            </label>

            <div className="bg-[#1B1D21] p-4 rounded-lg border border-[#23252A]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white">Reward Assets</span>
                <button
                  onClick={() => setShowTokenModal(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-[#2A2C31] text-white rounded-md hover:bg-[#35373C] transition-colors border border-[#3A3C41]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm">Add Asset</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {rewardAssets.map((token: Token) => (
                  <div
                    key={token.address}
                    className="flex items-center bg-[#2A2C31] border border-[#3A3C41] rounded-full px-3 py-1 gap-2 text-white"
                  >
                    <img
                      src={token.logoURI}
                      alt={token.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sm font-medium">{token.symbol}</span>
                    <button
                      onClick={() => removeToken(token.address)}
                      className="text-gray-400 hover:text-red-400 transition-colors duration-150"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

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
