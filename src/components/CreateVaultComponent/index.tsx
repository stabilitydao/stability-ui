import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";

import { platform, PlatformABI, FactoryABI, IERC721Enumerable } from "@web3";
import { platformData, publicClient, lastTx, balances, account } from "@store";

import { BuildForm } from "../BuildForm";

import type {
  TInitParams,
  TAllowedBBTokenVaults,
  TBuildVariant,
  TAddress,
} from "@types";
import { getTokenData } from "@utils";

const CreateVaultComponent = () => {
  const $publicClient = useStore(publicClient);
  const $platformData = useStore(platformData);
  const $balances = useStore(balances);
  const $account = useStore(account);

  const [buildVariants, setBuildVariants] = useState<TBuildVariant[]>([]);
  const [buildIndex, setBuildIndex] = useState<number | undefined>();
  const [allowedBBTokenVaults, setAllowedBBTokenVaults] = useState<
    TAllowedBBTokenVaults | undefined
  >();
  const [minInitialBoostPerDay, setMinInitialBoostPerDay] = useState<
    bigint | undefined
  >();
  const [minInitialBoostDuration, setMinInitialBoostDuration] = useState<
    bigint | undefined
  >();
  const [defaultBoostTokens, setDefaultBoostTokens] = useState<string[]>([]);
  const [freeVaults, setFreeVaults]: any = useState();

  const getData = async () => {
    if ($publicClient && $platformData) {
      const variants: TBuildVariant[] = [];
      const whatToBuild = await $publicClient.readContract({
        address: $platformData.factory,
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
        address: platform,
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
        setAllowedBBTokenVaults(allowedBBTokenVaults_);
      }

      const minInitialBoostPerDayValue = await $publicClient.readContract({
        address: platform,
        functionName: "minInitialBoostPerDay",
        abi: PlatformABI,
      });
      if (typeof minInitialBoostPerDayValue === "bigint") {
        setMinInitialBoostPerDay(minInitialBoostPerDayValue);
      }

      const minInitialBoostDurationValue = await $publicClient.readContract({
        address: platform,
        functionName: "minInitialBoostDuration",
        abi: PlatformABI,
      });
      if (typeof minInitialBoostDurationValue === "bigint") {
        setMinInitialBoostDuration(minInitialBoostDurationValue);
      }
      const defaultBoostTokensValue = await $publicClient.readContract({
        address: platform,
        functionName: "defaultBoostRewardTokens",
        abi: PlatformABI,
      });
      if (Array.isArray(defaultBoostTokensValue)) {
        setDefaultBoostTokens(defaultBoostTokensValue);
      }
    }
  };
  const freeVaultsHandler = async () => {
    if ($publicClient && $balances && $balances[7][0]) {
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

      if (tokensOfOwner && $platformData) {
        const vaultsBuiltByPermitTokenIdPromises: Promise<any>[] =
          tokensOfOwner.map(async (tokenID: bigint) => {
            const vaultsBuiltByPermitTokenId = await $publicClient.readContract(
              {
                address: $platformData.factory,
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
    getData();
  }, [$publicClient, $platformData?.factory, lastTx.get()]);
  useEffect(() => {
    freeVaultsHandler();
  }, [$balances]);

  const compoundingVaultsForBuilding = buildVariants.filter(
    (variant) => variant.vaultType === "Compounding"
  ).length;
  return (
    <div>
      <h2 className="text-[22px] mb-3">Compounding vault</h2>
      {compoundingVaultsForBuilding ? (
        <table className="bg-[#2c2f38] rounded-lg mx-auto">
          <thead className="h-[50px]">
            <tr className="text-[18px]">
              <td>Strategy logic</td>
              <td>Strategy description</td>
              <td></td>
            </tr>
          </thead>
          <tbody className="text-[16px]">
            {buildVariants.map((variant, i) => {
              if (variant.vaultType !== "Compounding") {
                return;
              }
              return (
                <tr
                  className="border-t border-[#4f5158] py-[10px] transition delay-[10ms] hover:bg-[#3d404b]"
                  key={
                    variant.strategyDesc +
                    variant.vaultType +
                    variant.strategyId
                  }
                >
                  <td>{variant.strategyId}</td>
                  <td>{variant.strategyDesc}</td>
                  <td>
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
      <h2 className="text-[22px] my-5">Rewarding vault</h2>
      <div className="bg-[#2c2f38] rounded-md mb-5 max-w-[800px] mx-auto">
        <div className="px-5 py-3">
          {allowedBBTokenVaults && (
            <div>
              <p className="text-center text-[18px] mb-2">
                For allowed buy-back tokens, the following number of rewarding
                vaults can be created:
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
            <div className="text-[18px] my-2 flex items-center">
              <p>Minimal initial boost value per day: </p>
              <div className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] rounded-md ml-2 px-1 py-1">
                ${formatUnits(minInitialBoostPerDay, 18)}
              </div>
            </div>
          )}
          <div className="text-[18px] mb-2 flex items-center">
            <p>Buy-back rewards vesting duration: </p>
            <div className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] rounded-md ml-2 px-1 py-1">
              7 days
            </div>
          </div>
          <div className="text-[18px] flex items-center">
            <p> Boost rewards vesting duration: </p>
            <div className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] rounded-md ml-2 px-1 py-1">
              30 days
            </div>
          </div>
        </div>
      </div>

      <table className="bg-[#2c2f38] rounded-lg mx-auto">
        <thead className="h-[70px]">
          <tr className="text-[18px] whitespace-nowrap">
            <td>Vault type</td>
            <td>Buy-back token</td>
            <td>Strategy logic</td>
            <td>Strategy description</td>
            <td></td>
          </tr>
        </thead>
        <tbody className="text-[16px]">
          {buildVariants.map((variant, i) => {
            if (variant.vaultType !== "Rewarding") {
              return;
            }
            return (
              <tr
                key={
                  variant.strategyDesc + variant.vaultType + variant.strategyId
                }
                className="border-t border-[#4f5158] py-[10px] transition delay-[10ms] hover:bg-[#3d404b]"
              >
                <td>{variant.vaultType}</td>
                <td>
                  {
                    getTokenData(
                      buildVariants[i].initParams.initVaultAddresses[0]
                    )?.symbol
                  }
                </td>
                <td>{variant.strategyId}</td>
                <td>{variant.strategyDesc}</td>
                <td>
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

      <h2 className="text-[22px] mt-5">Rewarding managed vault</h2>
      <div className="text-[22px] text-center">Coming soon</div>

      {$platformData && buildIndex !== undefined && (
        <div
          className="overlay"
          onClick={() => {
            setBuildIndex(undefined);
          }}
        >
          <div
            className="flex flex-col min-w-[300px] min-h-[100px] h-auto z-[120] py-[10px] px-[30px] rounded-md bg-modal mr-5 "
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="font-bold text-[1.5rem] flex justify-center">
              Assembling
            </div>
            <BuildForm
              vaultType={buildVariants[buildIndex].vaultType}
              strategyId={buildVariants[buildIndex].strategyId}
              strategyDesc={buildVariants[buildIndex].strategyDesc}
              initParams={buildVariants[buildIndex].initParams}
              buildingPrice={
                $platformData.buildingPrices[
                  buildVariants[buildIndex].vaultType
                ]
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
  );
};
export { CreateVaultComponent };
