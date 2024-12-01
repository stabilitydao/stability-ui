import { useState, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { formatUnits } from "viem";
import { usePublicClient } from "wagmi";

import { WagmiLayout } from "@layouts";

import { BuildForm } from "./BuildForm";

import {
  platforms,
  PlatformABI,
  FactoryABI,
  IERC721Enumerable,
  wagmiConfig,
} from "@web3";

import {
  platformsData,
  publicClient,
  lastTx,
  balances,
  account,
  connected,
  currentChainID,
} from "@store";

// import { getTokenData } from "@utils";

import { CHAINS } from "@constants";

import type {
  TInitParams,
  TAllowedBBTokenVaults,
  TBuildVariant,
  TAddress,
  TPlatformGetData,
} from "@types";

type TFreeVaults =
  | {
      freeVaults: number;
      nextUpdate: string;
    }
  | undefined;

type TBuildingPrices = { [vaultType: string]: bigint };

const Factory = (): JSX.Element => {
  const $publicClient = useStore(publicClient);
  const $platformsData = useStore(platformsData);
  const $balances = useStore(balances);
  const $account = useStore(account);
  const $connected = useStore(connected);
  const $currentChainID = useStore(currentChainID);

  const _publicClient = usePublicClient({
    chainId: Number($currentChainID),
    config: wagmiConfig,
  });

  const { open } = useWeb3Modal();

  const [buildVariants, setBuildVariants] = useState<TBuildVariant[]>([]);
  const [buildIndex, setBuildIndex] = useState<number | undefined>();
  // const [allowedBBTokenVaults, setAllowedBBTokenVaults] = useState<
  //   TAllowedBBTokenVaults | undefined
  // >();
  const [minInitialBoostPerDay, setMinInitialBoostPerDay] = useState<
    bigint | undefined
  >();
  // const [minInitialBoostDuration, setMinInitialBoostDuration] = useState<
  //   bigint | undefined
  // >();

  const [defaultBoostTokens, setDefaultBoostTokens] = useState<string[]>([]);
  const [freeVaults, setFreeVaults] = useState<TFreeVaults>();

  const [buildingPrices, setBuildingPrices] = useState<TBuildingPrices>({});

  const getBuildingPrices = async () => {
    const contractData = (await _publicClient?.readContract({
      address: platforms[$currentChainID],
      abi: PlatformABI,
      functionName: "getData",
    })) as TPlatformGetData;

    if (contractData) {
      const buildingPrices: TBuildingPrices = {};

      const vaultTypes = contractData[3];
      const prices = contractData[5];

      if (vaultTypes.length === prices.length) {
        for (let i = 0; i < vaultTypes.length; i++) {
          if (vaultTypes[i] && prices[i] !== undefined) {
            buildingPrices[vaultTypes[i]] = prices[i];
          }
        }
        setBuildingPrices(buildingPrices);
      }
    }
  };

  const getData = async () => {
    if ($publicClient && $platformsData[$currentChainID] && isCorrectNetwork) {
      const variants: TBuildVariant[] = [];
      const whatToBuild = await $publicClient.readContract({
        address: $platformsData[$currentChainID].factory,
        functionName: "whatToBuild",
        abi: FactoryABI,
      });

      if (whatToBuild?.length) {
        for (let i = 0; i < whatToBuild[1].length; i++) {
          const initParams: TInitParams = {
            initVaultAddresses: [],
            initVaultNums: [],
            initStrategyAddresses: [],
            initStrategyNums: [],
            initStrategyTicks: [],
          };
          let paramsLength = whatToBuild[3][i][1] - whatToBuild[3][i][0];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initVaultAddresses[j] =
              whatToBuild[4][Number(whatToBuild[3][i][0]) + j];
          }
          paramsLength = whatToBuild[3][i][3] - whatToBuild[3][i][2];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initVaultNums[j] =
              whatToBuild[5][Number(whatToBuild[3][i][2]) + j];
          }
          paramsLength = whatToBuild[3][i][5] - whatToBuild[3][i][4];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initStrategyAddresses[j] =
              whatToBuild[6][Number(whatToBuild[3][i][4]) + j];
          }
          paramsLength = whatToBuild[3][i][7] - whatToBuild[3][i][6];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initStrategyNums[j] = BigInt(
              whatToBuild[7][Number(whatToBuild[3][i][6]) + j]
            );
          }
          paramsLength = whatToBuild[3][i][9] - whatToBuild[3][i][8];
          for (let j = 0; j < paramsLength; ++j) {
            initParams.initStrategyTicks[j] =
              whatToBuild[8][Number(whatToBuild[3][i][8]) + j];
          }

          variants.push({
            vaultType: whatToBuild[1][i],
            strategyId: whatToBuild[2][i],
            strategyDesc: whatToBuild[0][i],
            canBuild: true,
            initParams,
          });
        }
        setBuildVariants(variants);
      }

      const allowedBBTokenVaults = await $publicClient.readContract({
        address: platforms[$currentChainID as string],
        functionName: "allowedBBTokenVaults",
        abi: PlatformABI,
      });
      if (Array.isArray(allowedBBTokenVaults)) {
        const allowedBBTokenVaults_: TAllowedBBTokenVaults = {};
        for (let i = 0; i < allowedBBTokenVaults[0].length; ++i) {
          allowedBBTokenVaults_[allowedBBTokenVaults[0][i]] = Number(
            allowedBBTokenVaults[1][i]
          );
        }
        // setAllowedBBTokenVaults(allowedBBTokenVaults_);
      }

      const minInitialBoostPerDayValue = await $publicClient.readContract({
        address: platforms[$currentChainID as string],
        functionName: "minInitialBoostPerDay",
        abi: PlatformABI,
      });
      if (typeof minInitialBoostPerDayValue === "bigint") {
        setMinInitialBoostPerDay(minInitialBoostPerDayValue);
      }

      // const minInitialBoostDurationValue = await $publicClient.readContract({
      //   address: platforms[$currentChainID as string],
      //   functionName: "minInitialBoostDuration",
      //   abi: PlatformABI,
      // });
      // if (typeof minInitialBoostDurationValue === "bigint") {
      //   setMinInitialBoostDuration(minInitialBoostDurationValue);
      // }
      const defaultBoostTokensValue = await $publicClient.readContract({
        address: platforms[$currentChainID as string],
        functionName: "defaultBoostRewardTokens",
        abi: PlatformABI,
      });
      if (Array.isArray(defaultBoostTokensValue)) {
        setDefaultBoostTokens(defaultBoostTokensValue);
      }
    }
  };

  const freeVaultsHandler = async () => {
    if ($publicClient && $balances && $balances[7][0] && isCorrectNetwork) {
      const epoch = Math.floor(new Date().getTime() / 1000);
      const nextEpoch = epoch + 7 * 24 * 60 * 60;

      const week = Math.floor(epoch / (86400 * 7));
      const nextWeek = Math.floor(nextEpoch / (86400 * 7)) * 604800;

      const date = new Date(nextWeek * 1000);

      const [day, month, hours, minutes] = [
        date.getDate(),
        date.toLocaleString("en-US", { month: "long" }),
        date.getHours(),
        date.getMinutes(),
      ];

      const formattedDate = `${day} ${month} ${hours}:${
        minutes < 10 ? "0" : ""
      }${minutes}`;

      const tokensOfOwner: bigint[] = [];
      for (let i = 0; i < $balances[7][0]; i++) {
        const tokenOfOwnerByIndex = await $publicClient.readContract({
          address: $balances[6][0],
          functionName: "tokenOfOwnerByIndex",
          abi: IERC721Enumerable,
          args: [$account as TAddress, BigInt(i)],
        });
        tokensOfOwner.push(tokenOfOwnerByIndex);
      }

      if (tokensOfOwner && $platformsData[$currentChainID]) {
        const vaultsBuiltByPermitTokenIdPromises: Promise<bigint[]>[] =
          tokensOfOwner.map(async (tokenID: bigint) => {
            const vaultsBuiltByPermitTokenId = await $publicClient.readContract(
              {
                address: $platformsData[$currentChainID].factory,
                functionName: "vaultsBuiltByPermitTokenId",
                abi: FactoryABI,
                args: [BigInt(week), tokenID],
              }
            );

            return vaultsBuiltByPermitTokenId;
          });

        try {
          const vaultsPermitTokenId = await Promise.all(
            vaultsBuiltByPermitTokenIdPromises
          );
          // todo for multiple nft
          setFreeVaults({
            freeVaults: Number(vaultsPermitTokenId[0]),
            nextUpdate: formattedDate,
          });
        } catch (error) {
          console.error("Error fetching NFT data:", error);
        }
      }
    }
  };

  useEffect(() => {
    getBuildingPrices();
    getData();
  }, [$publicClient, $platformsData?.[$currentChainID]?.factory, lastTx.get()]);

  useEffect(() => {
    freeVaultsHandler();
  }, [$balances]);

  const compoundingVaultsForBuilding = buildVariants.filter(
    (variant) => variant.vaultType === "Compounding"
  ).length;

  const isCorrectNetwork = useMemo(
    () => CHAINS.some((item) => item.id == $currentChainID) && $connected,
    [$connected, $account]
  );

  return (
    <WagmiLayout>
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
          {/* <h2 className="text-[22px] my-5">Rewarding vault</h2>
          <div className="bg-[#2c2f38] rounded-md mb-5 max-w-[800px] mx-auto">
            <div className="px-5 py-3">
              {allowedBBTokenVaults && (
                <div>
                  <p className="text-center text-[18px] mb-2">
                    For allowed buy-back tokens, the following number of
                    rewarding vaults can be created:
                  </p>
                  <div className="flex flex-col">
                    {Object.keys(allowedBBTokenVaults).map((token) => {
                      const tokenData = getTokenData(token);
                      return (
                        <div
                          key={token}
                          className="flex items-center justify-center gap-1 text-[16px] border-[2px] bg-[#485069] text-[#B4BFDF] border-[#6376AF] rounded-md"
                        >
                          <div className="flex items-center justify-center px-1 py-1">
                            {tokenData && (
                              <img
                                src={tokenData.logoURI}
                                alt={tokenData.name}
                                className="max-w-[22px] mr-1"
                              />
                            )}
                            {tokenData?.symbol || token}
                          </div>
                          <p>{allowedBBTokenVaults[token]}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {minInitialBoostPerDay !== undefined && (
                <div className="text-[18px] my-2 flex items-start sm:items-center justify-between sm:justify-center">
                  <p className="w-3/4 sm:w-auto">
                    Minimal initial boost value per day:{" "}
                  </p>
                  <div className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] rounded-md ml-2 px-1 py-1">
                    ${formatUnits(minInitialBoostPerDay, 18)}
                  </div>
                </div>
              )}
              <div className="text-[18px] mb-2 flex items-start sm:items-center justify-between sm:justify-center">
                <p className="w-3/4 sm:w-auto">
                  Buy-back rewards vesting duration:{" "}
                </p>
                <div className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] rounded-md ml-2 px-1 py-1">
                  7 days
                </div>
              </div>
              <div className="text-[18px] flex items-start sm:items-center justify-between sm:justify-center">
                <p className="w-3/4 sm:w-auto">
                  Boost rewards vesting duration:{" "}
                </p>
                <div className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] rounded-md ml-0 sm:ml-2 px-1 py-1">
                  30 days
                </div>
              </div>
            </div>
          </div>

          <table className="hidden md:table font-manrope">
            <thead className="bg-accent-950 text-neutral-600 h-[36px]">
              <tr className="text-[12px] uppercase">
                <td className="px-4 py-2">Vault type</td>
                <td className="px-4 py-2 whitespace-nowrap">Buy-back token</td>
                <td className="px-4 py-2">Strategy logic</td>
                <td className="px-4 py-2">Strategy description</td>
                <td className="px-4 py-2"></td>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {buildVariants.map((variant, i) => {
                if (variant.vaultType !== "Rewarding") {
                  return;
                }
                return (
                  <tr
                    key={
                      variant.strategyDesc +
                      variant.vaultType +
                      variant.strategyId
                    }
                    className="h-[48px] hover:bg-accent-950"
                  >
                    <td className="px-4 py-3">{variant.vaultType}</td>
                    <td className="px-4 py-3">
                      {
                        getTokenData(
                          buildVariants[i].initParams.initVaultAddresses[0]
                        )?.symbol
                      }
                    </td>
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
          <div className="md:hidden flex flex-col justify-center items-center gap-3">
            {buildVariants.map((variant, i) => {
              if (variant.vaultType !== "Rewarding") {
                return;
              }
              return (
                <div
                  key={
                    variant.strategyDesc +
                    variant.vaultType +
                    variant.strategyId
                  }
                  className="flex flex-col items-center justify-center py-[10px] transition delay-[10ms] bg-[#2C2F38] w-full px-5 rounded-md"
                >
                  <div className="flex justify-between border-b w-full border-[#4f5158] text-[16px] text-[#8f8f8f]">
                    <p className="w-1/2 border-r border-[#4f5158]">
                      Vault type
                    </p>
                    <p className="w-1/2 text-end">{variant.vaultType}</p>
                  </div>
                  <div className="flex justify-between border-b w-full border-[#4f5158] text-[16px] text-[#8f8f8f]">
                    <p className="w-1/2 border-r border-[#4f5158]">
                      Buy-back token
                    </p>
                    <p className="w-1/2 text-end">
                      {
                        getTokenData(
                          buildVariants[i].initParams.initVaultAddresses[0]
                        )?.symbol
                      }
                    </p>
                  </div>
                  <div className="flex justify-between border-b w-full border-[#4f5158] text-[16px] text-[#8f8f8f]">
                    <p className="w-1/2 border-r border-[#4f5158]">
                      Strategy logic
                    </p>
                    <p className="w-1/2 text-end">{variant.strategyId}</p>
                  </div>
                  <div className="flex justify-between border-b w-full border-[#4f5158] text-[16px] text-[#8f8f8f]">
                    <p className="w-1/2 border-r border-[#4f5158]">
                      Strategy description
                    </p>
                    <p className="w-1/2 text-end">{variant.strategyDesc}</p>
                  </div>

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
                </div>
              );
            })}
          </div>

          <h2 className="text-[22px] mt-5">Rewarding managed vault</h2>
          <div className="text-[22px] text-center">Coming soon</div> */}

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
                  vaultType={buildVariants[buildIndex].vaultType}
                  strategyId={buildVariants[buildIndex].strategyId}
                  strategyDesc={buildVariants[buildIndex].strategyDesc}
                  initParams={buildVariants[buildIndex].initParams}
                  buildingPrice={
                    buildingPrices[buildVariants[buildIndex].vaultType]
                  }
                  defaultBoostTokens={defaultBoostTokens}
                  minInitialBoostPerDay={formatUnits(
                    minInitialBoostPerDay as bigint,
                    18
                  )}
                  nftData={freeVaults}
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
