import { useState } from "react";
import { useStore } from "@nanostores/react";

import { writeContract, waitForTransactionReceipt } from "@wagmi/core";

import { Loader } from "@ui";

import { FactoryABI, wagmiConfig } from "@web3";

import { platformsData, lastTx, currentChainID } from "@store";

import type { TInitParams, TAddress } from "@types";

interface IProps {
  vaultType: string;
  strategyId: string;
  strategyDesc: string;
  initParams: TInitParams;
}

const BuildForm = ({
  vaultType,
  strategyId,
  strategyDesc,
  initParams,
}: IProps): JSX.Element => {
  const $platformsData = useStore(platformsData);
  const $currentChainID = useStore(currentChainID);

  const [buildResult, setBuildResult] = useState<boolean | undefined>();

  const [loader, setLoader] = useState<boolean>(false);

  const deploy = async () => {
    if ($platformsData[$currentChainID]) {
      try {
        const deployVaultAndStrategy = await writeContract(wagmiConfig, {
          address: $platformsData[$currentChainID]?.factory,
          abi: FactoryABI,
          functionName: "deployVaultAndStrategy",
          args: [
            vaultType,
            strategyId,
            initParams.initVaultAddresses as TAddress[],
            initParams.initVaultNums,
            initParams.initStrategyAddresses as TAddress[],
            initParams.initStrategyNums,
            initParams.initStrategyTicks,
          ],
        });
        setLoader(true);
        const transaction = await waitForTransactionReceipt(wagmiConfig, {
          hash: deployVaultAndStrategy,
        });

        if (transaction.status === "success") {
          lastTx.set(transaction?.transactionHash);
          setBuildResult(true);
          setLoader(false);
        }
      } catch (error) {
        lastTx.set("No deployVaultAndStrategy hash...");
        setBuildResult(false);
        setLoader(false);
        console.error("deployVaultAndStrategy ERROR:", error);
      }
    }
  };

  return (
    <div className="flex flex-col">
      {!buildResult && (
        <div className="flex flex-col gap-2 pb-5">
          <div className="flex w-full justify-between">
            <span className="w-[30%] text-[16px] sm:text-[22px]">
              Vault type
            </span>
            <span className="text-[14px] sm:text-[16px]">{vaultType}</span>
          </div>
          <div className="flex w-full justify-between">
            <span className="w-[30%] text-[16px] sm:text-[22px]">
              Strategy logic
            </span>
            <span className="text-[14px] sm:text-[16px]">{strategyId}</span>
          </div>
          <div className="flex w-full justify-between">
            <p className="w-[30%] text-[16px] sm:text-[22px]">
              Strategy description
            </p>
            <p className="text-end text-[12px] sm:text-[16px]">
              {strategyDesc}
            </p>
          </div>
        </div>
      )}

      {!loader ? (
        <>
          {buildResult === undefined && vaultType === "Compounding" && (
            <div className="mt-10 flex justify-center">
              <button
                className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] px-6 py-1 rounded-md"
                onClick={deploy}
              >
                Deploy
              </button>
            </div>
          )}
        </>
      ) : (
        <Loader />
      )}

      {buildResult && (
        <div className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] rounded-md flex justify-center py-4 mt-4">
          The vault has been deployed
        </div>
      )}
    </div>
  );
};
export { BuildForm };
