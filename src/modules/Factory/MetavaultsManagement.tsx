import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import { metaVaults, vaults } from "@store";
import { cn } from "@utils";

import { writeContract } from "@wagmi/core";

import {
  IMetaVaultABI,
  PlatformABI,
  VaultABI,
  wagmiConfig,
  platforms,
} from "@web3";

import { VAULTS_WITH_NAME } from "@constants";

import { TimeDifferenceIndicator } from "@ui";

import { getAddress, parseUnits, createPublicClient, http } from "viem";

import { sonic } from "viem/chains";

const MetavaultsManagement = (): JSX.Element => {
  const $metaVaults = useStore(metaVaults);
  const $vaults = useStore(vaults);

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
      console.log("Error:", error);
    }
  };

  const getData = async () => {
    try {
      const _metaVaultsWithProportions = $metaVaults[146].map((mv) => {
        const proportions = mv.vaultsData.map((data) => {
          const vault = $vaults[146][data.address];

          const symbol = vault
            ? vault?.symbol
            : $metaVaults[146].find((_mv) => _mv.address === data.address)
                ?.symbol;

          const newObj = {
            currentProportions: (
              Number(data.proportions.current) * 100
            ).toFixed(2),
            targetProportions: (Number(data.proportions.target) * 100).toFixed(
              2
            ),
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
      });

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
                  className="bg-transparent text-2xl font-semibold outline-none w-full"
                />
              </label>
            </div>
          ))}
        </div>

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
