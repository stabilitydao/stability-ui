import { useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";

import { WagmiLayout } from "@layouts";

import { BuildForm } from "./BuildForm";

import { VaultManager } from "./VaultManager";

import { ArrowRightIcon } from "@ui";

import { frontendContracts, IFrontendABI } from "@web3";

import {
  platformsData,
  publicClient,
  lastTx,
  account,
  connected,
  currentChainID,
} from "@store";

import { CHAINS } from "@constants";

import type { TInitParams, TBuildVariant } from "@types";

const Factory = (): JSX.Element => {
  const $publicClient = useStore(publicClient);
  const $platformsData = useStore(platformsData);
  const $account = useStore(account);
  const $connected = useStore(connected);
  const $currentChainID = useStore(currentChainID);

  const { open } = useWeb3Modal();

  const [buildVariants, setBuildVariants] = useState<TBuildVariant[]>([]);
  const [buildIndex, setBuildIndex] = useState<number | undefined>();

  const getData = async () => {
    if ($publicClient && $platformsData[$currentChainID] && isCorrectNetwork) {
      const variants: TBuildVariant[] = [];

      const STEP = 10;

      let whatToBuild: any[] = [];
      let wtbLength = 0;
      let from = 0;

      do {
        const _whatToBuild = await $publicClient.readContract({
          address: frontendContracts[$currentChainID],
          functionName: "whatToBuild",
          abi: IFrontendABI,
          args: [BigInt(from), BigInt(STEP)],
        });

        from += STEP;

        if (!wtbLength) {
          wtbLength = Number(_whatToBuild[0]);
          whatToBuild[0] = _whatToBuild[0];

          for (let i = 1; i < _whatToBuild.length; i++) {
            whatToBuild[i] = [];
          }
        }

        for (let i = 1; i < _whatToBuild.length; i++) {
          whatToBuild[i].push(..._whatToBuild[i]);
        }
      } while (from < wtbLength);

      if (whatToBuild?.length) {
        for (let i = 0; i < whatToBuild[2].length; i++) {
          const initParams: TInitParams = {
            initVaultAddresses: [],
            initVaultNums: [],
            initStrategyAddresses: [],
            initStrategyNums: [],
            initStrategyTicks: [],
          };
          let paramsLength = whatToBuild[4][i][1] - whatToBuild[4][i][0];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initVaultAddresses[j] =
              whatToBuild[5][Number(whatToBuild[4][i][0]) + j];
          }
          paramsLength = whatToBuild[4][i][3] - whatToBuild[4][i][2];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initVaultNums[j] =
              whatToBuild[6][Number(whatToBuild[4][i][2]) + j];
          }
          paramsLength = whatToBuild[4][i][5] - whatToBuild[4][i][4];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initStrategyAddresses[j] =
              whatToBuild[7][Number(whatToBuild[4][i][4]) + j];
          }
          paramsLength = whatToBuild[4][i][7] - whatToBuild[4][i][6];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initStrategyNums[j] = BigInt(
              whatToBuild[8][Number(whatToBuild[4][i][6]) + j]
            );
          }
          paramsLength = whatToBuild[4][i][9] - whatToBuild[4][i][8];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initStrategyTicks[j] =
              whatToBuild[9][Number(whatToBuild[4][i][8]) + j];
          }

          variants.push({
            vaultType: whatToBuild[2][i],
            strategyId: whatToBuild[3][i],
            strategyDesc: whatToBuild[1][i],
            canBuild: true,
            initParams,
          });
        }

        setBuildVariants(variants);
      }
    }
  };

  useEffect(() => {
    getData();
  }, [$publicClient, $platformsData?.[$currentChainID]?.factory, lastTx.get()]);

  const compoundingVaultsForBuilding = buildVariants.filter(
    (variant) => variant.vaultType === "Compounding"
  ).length;

  const isCorrectNetwork = useMemo(
    () => CHAINS.some((item) => item.id == $currentChainID) && $connected,
    [$connected, $account]
  );

  return (
    <WagmiLayout>
      <VaultManager />
      <a
        className="text-[#5E6AD2] text-[16px] leading-6 font-semibold flex items-center justify-end gap-2 my-5"
        href="/metavaults-management"
      >
        Metavaults Management
        <ArrowRightIcon color={"#5E6AD2"} />
      </a>
      {isCorrectNetwork ? (
        <div className="flex flex-col items-center">
          <h2 className="text-[22px] mb-3">Compounding vault</h2>
          {compoundingVaultsForBuilding ? (
            <table className="font-manrope">
              <thead className="bg-accent-950 text-neutral-600 h-[36px]">
                <tr className="text-[12px] uppercase">
                  <td className="px-4 py-2">Strategy logic</td>
                  <td className="px-4 py-2">Strategy description</td>
                  <td className="px-4 py-2"></td>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {buildVariants.map((variant, i) => {
                  if (variant.vaultType !== "Compounding") {
                    return;
                  }

                  return (
                    <tr
                      className="h-[48px] hover:bg-accent-950"
                      key={variant.strategyDesc + i}
                    >
                      <td className="px-4 py-3">{variant.strategyId}</td>
                      <td className="px-4 py-3">{variant.strategyDesc}</td>
                      <td className="px-4 py-3">
                        {variant.canBuild && (
                          <button
                            className="bg-[#485069] text-[#B4BFDF] border border-[#6376AF] my-[10px] px-3 py-1 rounded-md opacity-70 hover:opacity-100"
                            onClick={() => {
                              setBuildIndex(i);
                            }}
                          >
                            Assemble
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="bg-[#486556] border-[2px] border-[#488B57] max-w-[500px] flex items-center justify-center flex-col mx-auto py-3 px-5 text-center gap-2 rounded-md">
              <p>All compounding vaults have already been created. </p>
              <p>New vaults can be created after developing new strategies.</p>
            </div>
          )}

          {$platformsData?.[$currentChainID] && buildIndex !== undefined && (
            <div
              className="overlay"
              onClick={() => {
                setBuildIndex(undefined);
              }}
            >
              <div
                className="flex flex-col min-w-[300px] min-h-[100px] h-auto z-[120] py-[10px] px-[10px] sm:px-[30px] rounded-md bg-modal mr-0 md:mr-5 "
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="font-bold text-[1.2rem] sm:text-[1.5rem] flex justify-center">
                  Assembling
                </div>

                <BuildForm
                  vaultType={buildVariants[buildIndex]?.vaultType}
                  strategyId={buildVariants[buildIndex]?.strategyId}
                  strategyDesc={buildVariants[buildIndex]?.strategyDesc}
                  initParams={buildVariants[buildIndex]?.initParams}
                />
              </div>
            </div>
          )}
        </div>
      ) : $connected ? (
        <button
          type="button"
          className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
          onClick={() => open({ view: "Networks" })}
        >
          SWITCH NETWORK
        </button>
      ) : (
        <button
          type="button"
          className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
          onClick={() => open()}
        >
          CONNECT WALLET
        </button>
      )}
    </WagmiLayout>
  );
};
export { Factory };
