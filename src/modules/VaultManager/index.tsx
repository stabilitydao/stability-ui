import { useEffect, useState } from "react";

import { useStore } from "@nanostores/react";

import { metaVaults, vaults } from "@store";
import { cn } from "@utils";

import { writeContract } from "@wagmi/core";

import { IMetaVaultABI, wagmiConfig } from "@web3";

const VaultManager = (): JSX.Element => {
  const $metaVaults = useStore(metaVaults);
  const $vaults = useStore(vaults);

  const [activeMetaVaults, setActiveMetaVaults] = useState([]);

  const [currentMetaVault, setCurrentMetaVault] = useState({});

  const [values, setValues] = useState({});

  const handleInputChange = (address, event) => {
    setValues((prev) => ({
      ...prev,
      [address]: event.target.value,
    }));
  };

  const setProportion = async () => {
    try {
      const bitIntValues = Object.values(values).map((v) => BigInt(v));

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

  useEffect(() => {
    if ($metaVaults[146] && $vaults[146]) {
      const _metaVaultsWithProportions = $metaVaults[146].map((mv) => {
        const proportions = Object.entries(mv.vaultProportions).map(
          ([address, obj]) => {
            const symbol = $vaults[146][address]?.symbol;

            return { address, symbol, ...obj };
          }
        );

        return { ...mv, proportions };
      });

      setActiveMetaVaults(_metaVaultsWithProportions);
      setCurrentMetaVault(_metaVaultsWithProportions[0]);
    }
  }, [$metaVaults]);
  return (
    <div className="flex flex-col max-w-[1200px] w-full">
      <div className="bg-[#18191C] border border-[#232429] rounded-lg p-4 flex flex-col gap-4 w-[800px]">
        <div className="flex items-center gap-4">
          {activeMetaVaults.map((metaVault) => (
            <p
              key={metaVault.address}
              className={cn(
                "text-[16px] leading-4 text-[#A3A4A6] cursor-pointer",
                currentMetaVault?.address === metaVault?.address && "text-white"
              )}
              onClick={() => setCurrentMetaVault(metaVault)}
            >
              {metaVault.symbol}
            </p>
          ))}
        </div>

        <div>
          {currentMetaVault?.proportions?.map((proportion) => (
            <div
              key={proportion.address}
              className="flex flex-col gap-2 border-b border-[#23252A] pb-4 mb-4"
            >
              <div className="flex items-center justify-between">
                <span>{proportion.symbol}</span>
                <span>
                  {proportion.currentProportions} /{" "}
                  {proportion.targetProportions}
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
        <button
          className={cn(
            "bg-[#5E6AD2] rounded-lg w-full text-[16px] leading-5 font-bold py-5"
          )}
          type="button"
          onClick={setProportion}
        >
          Set proportions
        </button>
      </div>
    </div>
  );
};

export { VaultManager };
