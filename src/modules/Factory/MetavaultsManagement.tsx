import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import { currentChainID, metaVaults, publicClient, vaults } from "@store";
import { cn } from "@utils";

import { simulateContract, writeContract } from "@wagmi/core";

import {
  IMetaVaultABI,
  PlatformABI,
  VaultABI,
  wagmiConfig,
  platforms,
  IMetaVaultFactoryABI,
} from "@web3";

import { VAULTS_WITH_NAME } from "@constants";

import { TimeDifferenceIndicator } from "@ui";

import { getAddress, parseUnits } from "viem";

import { deployments } from "@stabilitydao/stability";

import { VaultTypes } from "@types";

const MetavaultsManagement = (): JSX.Element => {
  const $metaVaults = useStore(metaVaults);
  const $vaults = useStore(vaults);
  const $publicClient = useStore(publicClient);
  const $currentChainID = useStore(currentChainID);

  const [activeMetaVaults, setActiveMetaVaults] = useState([]);

  const [currentMetaVault, setCurrentMetaVault] = useState({});

  const [values, setValues] = useState({});
  const [vaultInput, setVaultInput] = useState("");
  const [newProportionInput, setNewProportionInput] = useState("");

  /// deploy Meta Vaults

  const [saltInput, setSaltInput] = useState("");
  const [pegAssetInput, setPegAssetInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [symbolInput, setSymbolInput] = useState("");

  const [metaVaultType, setMetaVaultType] = useState(VaultTypes.MetaVault);

  const [vaultsList, setVaultsList] = useState<string[]>([""]);
  const [proportionsList, setProportionsList] = useState<string[]>([""]);

  const handleVaultChange = (index: number, value: string) => {
    const updated = [...vaultsList];
    updated[index] = value;
    setVaultsList(updated);
  };

  const handleProportionChange = (index: number, value: string) => {
    const updated = [...proportionsList];
    updated[index] = value;
    setProportionsList(updated);
  };

  const addRow = () => {
    setVaultsList([...vaultsList, ""]);
    setProportionsList([...proportionsList, ""]);
  };

  ///

  const [newMetaVaultAddress, setNewMetaVaultAddress] = useState("");

  const [activeSection, setActiveSection] = useState("deploy");

  const [addVaultData, setAddVaultData] = useState({
    isActive: false,
    isDoHardWorkOnDeposit: true,
    isVaultLastBlockDefenseDisabled: false,
    customVaultFee: 0,
  });

  const handleInputChange = (address, event) => {
    setValues((prev) => ({
      ...prev,
      [address]: event.target.value,
    }));
  };

  const setProportion = async () => {
    try {
      const bigIntValues = Object.values(values).map((v) =>
        parseUnits(String(v), 16)
      );

      const _action = await writeContract(wagmiConfig, {
        address: currentMetaVault.address,
        abi: IMetaVaultABI,
        functionName: "setTargetProportions",
        args: [bigIntValues],
      });

      console.log(_action);
    } catch (error) {
      console.log("Set proportion error:", error);
    }
  };

  const addVault = async () => {
    try {
      const vaultAddress = getAddress(vaultInput);

      const vaultHardWorkOnDeposit = await $publicClient?.readContract({
        address: vaultAddress,
        abi: VaultABI,
        functionName: "doHardWorkOnDeposit",
      });

      const vaultLastBlockDefenseDisabled = await $publicClient?.readContract({
        address: vaultAddress,
        abi: VaultABI,
        functionName: "lastBlockDefenseDisabled",
      });

      const vaultCustomFee = await $publicClient?.readContract({
        address: platforms[$currentChainID],
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
          address: platforms[$currentChainID],
          abi: PlatformABI,
          functionName: "setCustomVaultFee",
          args: [vaultAddress, BigInt(20000)],
        });

        console.log(setCustomVaultFee);
      }

      const _newValues = [...Object.values(values), newProportionInput];

      const bitIntValues = Object.values(_newValues).map((v) =>
        parseUnits(String(v), 16)
      );

      const _addVault = await writeContract(wagmiConfig, {
        address: currentMetaVault.address,
        abi: IMetaVaultABI,
        functionName: "addVault",
        args: [vaultAddress, bitIntValues],
      });

      console.log(_addVault);
    } catch (error) {
      console.log("Add Vault error:", error);
    }
  };

  const simulateDeployMetaVault = async () => {
    try {
      const factoryAddress =
        deployments[$currentChainID]?.core?.metaVaultFactory;

      const saltAddress = getAddress(saltInput);
      const pegAsset = getAddress(pegAssetInput);
      const name = nameInput;
      const symbol = symbolInput;
      const _vaults = vaultsList.map((vault) => getAddress(vault));
      const _proportions = proportionsList.map((proportion) =>
        parseUnits(proportion, 16)
      );

      console.log(
        saltAddress,
        metaVaultType,
        pegAsset,
        nameInput,
        symbolInput,
        _vaults,
        _proportions
      );

      const { result } = await simulateContract(wagmiConfig, {
        address: factoryAddress,
        abi: IMetaVaultFactoryABI,
        functionName: "deployMetaVault",
        args: [
          saltAddress,
          metaVaultType,
          pegAsset,
          name,
          symbol,
          _vaults,
          _proportions,
        ],
      });

      setNewMetaVaultAddress(result);
    } catch (error) {
      console.log("Deplpoy Meta Vault error:", error);
    }
  };

  const deployMetaVault = async () => {
    try {
      const factoryAddress =
        deployments[$currentChainID]?.core?.metaVaultFactory;

      const saltAddress = getAddress(saltInput);
      const pegAsset = getAddress(pegAssetInput);
      const name = nameInput;
      const symbol = symbolInput;
      const _vaults = vaultsList.map((vault) => getAddress(vault));
      const _proportions = proportionsList.map((proportion) =>
        parseUnits(proportion, 16)
      );

      console.log(
        saltAddress,
        metaVaultType,
        pegAsset,
        nameInput,
        symbolInput,
        _vaults,
        _proportions
      );

      const _deployVault = await writeContract(wagmiConfig, {
        address: factoryAddress,
        abi: IMetaVaultFactoryABI,
        functionName: "deployMetaVault",
        args: [
          saltAddress,
          metaVaultType,
          pegAsset,
          name,
          symbol,
          _vaults,
          _proportions,
        ],
      });

      console.log(_deployVault);
    } catch (error) {
      console.log("Deplpoy Meta Vault error:", error);
    }
  };

  const getData = async () => {
    try {
      const _metaVaultsWithProportions = $metaVaults[$currentChainID].map(
        (mv) => {
          const proportions = mv.vaultsData.map((data) => {
            const vault = $vaults[$currentChainID][data.address];

            const symbol = vault
              ? vault?.symbol
              : $metaVaults[$currentChainID].find(
                  (_mv) => _mv.address === data.address
                )?.symbol;

            const newObj = {
              currentProportions: (
                Number(data.proportions.current) * 100
              ).toFixed(2),
              targetProportions: (
                Number(data.proportions.target) * 100
              ).toFixed(2),
            };
            const allData = { address: data.address, symbol, ...newObj };

            if (vault) {
              const lastHardWork = vault.lastHardWork;
              const strategy = vault.strategyInfo.shortId;
              const APR = vault.sortAPR;

              return { ...allData, lastHardWork, strategy, APR };
            }

            return allData;
          });

          return { ...mv, proportions };
        }
      );

      setActiveMetaVaults(_metaVaultsWithProportions);
      setCurrentMetaVault(_metaVaultsWithProportions[0]);
    } catch (error) {
      console.log("Get data error:", error);
    }
  };

  useEffect(() => {
    if (currentMetaVault?.vaultsData) {
      const zeroValues = currentMetaVault.vaultsData.reduce(
        (acc, { address, proportions }) => {
          acc[address] = proportions.target * 100 || "0";
          return acc;
        },
        {}
      );

      setValues(zeroValues);
    }

    setNewProportionInput("");
    setVaultInput("");
    setAddVaultData({ ...addVaultData, isActive: false });
  }, [activeSection, currentMetaVault]);

  useEffect(() => {
    if ($metaVaults[$currentChainID] && $vaults[$currentChainID]) {
      getData();
    }
  }, [$metaVaults]);

  return (
    <div className="flex flex-col max-w-[1200px] w-full">
      <div className="bg-[#18191C] border border-[#232429] rounded-lg p-4 flex flex-col gap-4 w-[800px]">
        <div className="bg-[#18191C] rounded-lg text-[14px] leading-5 font-medium flex items-center border border-[#232429] w-full mb-6">
          <span
            className={cn(
              "h-10 text-center rounded-lg flex items-center justify-center w-1/2",
              activeSection != "deploy"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => setActiveSection("deploy")}
          >
            Deploy Meta Vault
          </span>
          <span
            className={cn(
              "h-10 text-center rounded-lg flex items-center justify-center w-1/2",
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
              "h-10 text-center rounded-lg flex items-center justify-center w-1/2",
              activeSection != "proportions"
                ? "text-[#6A6B6F] cursor-pointer"
                : "bg-[#232429] border border-[#2C2E33]"
            )}
            onClick={() => setActiveSection("proportions")}
          >
            Change Proportions
          </span>
        </div>

        {activeSection !== "deploy" && (
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
        )}

        {activeSection === "deploy" && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex flex-col items-start justify-between w-[30%]">
                Salt
              </div>

              <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-[70%]">
                <input
                  type="text"
                  placeholder="0"
                  value={saltInput}
                  onChange={(e) => setSaltInput(e.target.value)}
                  className="bg-transparent text-2xl font-semibold outline-none w-full"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col items-start justify-between w-[85%]">
                Type
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "whitespace-nowrap cursor-pointer z-20 text-center px-3 md:px-4 py-2 rounded-lg",
                    metaVaultType === VaultTypes.MetaVault
                      ? "text-white border !border-[#2C2E33] bg-[#22242A]"
                      : "text-[#97979A] border !border-[#23252A]"
                  )}
                  onClick={() => setMetaVaultType(VaultTypes.MetaVault)}
                >
                  {VaultTypes.MetaVault}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap cursor-pointer z-20 text-center px-3 md:px-4 py-2 rounded-lg",
                    metaVaultType === VaultTypes.MultiVault
                      ? "text-white border !border-[#2C2E33] bg-[#22242A]"
                      : "text-[#97979A] border !border-[#23252A]"
                  )}
                  onClick={() => setMetaVaultType(VaultTypes.MultiVault)}
                >
                  {VaultTypes.MultiVault}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col items-start justify-between w-[30%]">
                pegAsset
              </div>

              <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-[70%]">
                <input
                  type="text"
                  placeholder="0"
                  value={pegAssetInput}
                  onChange={(e) => setPegAssetInput(e.target.value)}
                  className="bg-transparent text-2xl font-semibold outline-none w-full"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col items-start justify-between w-[30%]">
                Name
              </div>

              <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-[70%]">
                <input
                  type="text"
                  placeholder="0"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-transparent text-2xl font-semibold outline-none w-full"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col items-start justify-between w-[30%]">
                Symbol
              </div>

              <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-[70%]">
                <input
                  type="text"
                  placeholder="0"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
                  className="bg-transparent text-2xl font-semibold outline-none w-full"
                />
              </label>
            </div>
            <div className="flex flex-col gap-4">
              {vaultsList.map((vault, index) => (
                <div key={index} className="flex gap-2">
                  <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-1/2">
                    <input
                      type="text"
                      placeholder="Vault"
                      value={vault}
                      onChange={(e) => handleVaultChange(index, e.target.value)}
                      className="bg-transparent text-2xl font-semibold outline-none w-full"
                    />
                  </label>

                  <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-1/2">
                    <input
                      type="text"
                      placeholder="Proportion"
                      value={proportionsList[index]}
                      onChange={(e) =>
                        handleProportionChange(index, e.target.value)
                      }
                      className="bg-transparent text-2xl font-semibold outline-none w-full"
                    />
                  </label>
                </div>
              ))}

              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1 text-[#816FEA] font-medium"
              >
                Add Vault
              </button>
            </div>
          </div>
        )}

        {activeSection === "vaults" && (
          <div className="flex gap-2">
            <div className="flex flex-col items-start justify-between w-[85%]">
              Vault Address
            </div>

            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-[15%]">
              <input
                type="text"
                placeholder="0"
                value={vaultInput}
                onChange={(e) => setVaultInput(e.target.value)}
                className="bg-transparent text-2xl font-semibold outline-none w-full"
              />
            </label>
          </div>
        )}

        {activeSection !== "deploy" && (
          <div className="flex flex-col gap-2">
            {currentMetaVault?.proportions?.map((proportion) => (
              <div key={proportion.address} className="flex gap-2">
                <div className="flex items-start justify-between w-[85%]">
                  <div className="flex flex-col">
                    <p className="flex items-center gap-1">
                      <span>
                        {VAULTS_WITH_NAME[proportion.address] ??
                          proportion.symbol}
                      </span>
                      {proportion.strategy ? (
                        <span>- {proportion.strategy}</span>
                      ) : null}
                    </p>
                    <span>
                      {proportion.currentProportions}% /{" "}
                      {proportion.targetProportions}% / $
                      {(
                        (Number(currentMetaVault.tvl) / 100) *
                        proportion.currentProportions
                      ).toFixed(2)}
                    </span>
                  </div>

                  {proportion?.APR ? (
                    <div className="flex flex-col items-end gap-1">
                      <span>{proportion.APR}%</span>{" "}
                      <TimeDifferenceIndicator unix={proportion.lastHardWork} />
                    </div>
                  ) : null}
                </div>
                <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-[15%]">
                  <input
                    type="text"
                    placeholder="0"
                    value={values[proportion.address] || ""}
                    onChange={(e) => handleInputChange(proportion.address, e)}
                    className={cn(
                      "bg-transparent text-2xl font-semibold outline-none w-full",
                      !Number(values[proportion.address]) && "text-[#97979A]"
                    )}
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        {activeSection === "vaults" && (
          <div className="flex gap-2">
            <div className="flex flex-col items-start justify-between w-[85%]">
              New Vault Proportion
            </div>

            <label className="bg-[#1B1D21] p-4 rounded-lg block border border-[#23252A] w-[15%]">
              <input
                type="text"
                placeholder="0"
                value={newProportionInput}
                onChange={(e) => setNewProportionInput(e.target.value)}
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
        ) : activeSection === "deploy" ? (
          <div className="flex flex-col gap-3">
            <button
              className={cn(
                "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold py-5"
              )}
              type="button"
              onClick={simulateDeployMetaVault}
            >
              Simulate
            </button>
            {newMetaVaultAddress ? (
              <p>Simulation result: {newMetaVaultAddress}</p>
            ) : null}
            <button
              className={cn(
                "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold py-5"
              )}
              type="button"
              onClick={deployMetaVault}
            >
              Deploy Meta Vault
            </button>
          </div>
        ) : null}

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

export { MetavaultsManagement };
