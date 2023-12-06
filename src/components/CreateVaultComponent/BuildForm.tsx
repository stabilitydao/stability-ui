import { useEffect, useState, useRef } from "react";
import { useStore } from "@nanostores/react";

import { usePublicClient } from "wagmi";
import { writeContract } from "@wagmi/core";
import { formatUnits, parseUnits } from "viem";
import { readContract } from "viem/actions";

import { Loader } from "@components";

import { FactoryABI, ERC20ABI } from "@web3";
import {
  account,
  platformData,
  userBalance,
  lastTx,
  assetsBalances,
  assetsPrices,
} from "@store";

import type { TInitParams, TAddress, TInputItem } from "@types";
import { getTokenData } from "@utils";

import tokensJson from "../../stability.tokenlist.json";

interface IProps {
  vaultType: string;
  strategyId: string;
  strategyDesc: string;
  initParams: TInitParams;
  buildingPrice: bigint;
  defaultBoostTokens: string[];
  minInitialBoostPerDay: string | number;
  nftData: { freeVaults: number; nextUpdate: string } | undefined;
}

const BuildForm = ({
  vaultType,
  strategyId,
  strategyDesc,
  initParams,
  buildingPrice,
  defaultBoostTokens,
  minInitialBoostPerDay,
  nftData,
}: IProps) => {
  const $account = useStore(account);
  const $platformData = useStore(platformData);
  const $balance = useStore(userBalance);
  const $assetsBalances: any = useStore(assetsBalances);
  const $assetsPrices: any = useStore(assetsPrices);
  const _publicClient = usePublicClient();
  // todo implement using
  const canUsePermitToken = false;

  const needCheckAllowance = !canUsePermitToken;
  const BRT = [
    ...new Set([initParams.initVaultAddresses[0], ...defaultBoostTokens]),
  ].map((addr) => ({
    symbol: tokensJson.tokens.find((token) => token.address === addr)?.symbol,
    address: addr,
    balance: formatUnits(
      $assetsBalances[addr]?.assetBalance || "0",
      tokensJson.tokens.find((token) => token.address === addr)?.decimals ?? 18
    ),
    price: formatUnits($assetsPrices[addr]?.tokenPrice || "0", 18),
    sum: "",
    allowance: "",
    decimals:
      tokensJson.tokens.find((token) => token.address === addr)?.decimals ?? 18,
  }));

  const [boostRewardsTokens, setBoostRewardsTokens] = useState(BRT);
  const [allowance, setAllowance] = useState<bigint | undefined>();
  const [buildResult, setBuildResult] = useState<boolean | undefined>();
  const [boostAmounts, setBoostAmounts] = useState<{ [token: string]: bigint }>(
    {}
  );
  const [inputValues, setInputValues] = useState<Array<TInputItem>>(
    Array(defaultBoostTokens.length).fill({ inputValue: "", valuePerDay: "" })
  );
  const [rewardingVaultApprove, setRewardingVaultApprove]: any =
    useState(false);
  const [rewardingVaultDeploy, setRewardingVaultDeploy] = useState(false);
  const refArray = Array.from({ length: boostRewardsTokens.length }).map(() =>
    useRef<HTMLInputElement | null>(null)
  );

  const [loader, setLoader] = useState<boolean>(false);

  //// rewarding
  const handleInput = (
    tokenPrice: string,
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newInputValues = [...inputValues];
    const inputValue = event.target.value;

    const valuePerDay = !isNaN(Number(inputValue))
      ? ((parseFloat(inputValue) * parseFloat(tokenPrice)) / 30).toFixed(2)
      : "";

    newInputValues[index] = {
      ...newInputValues[index],
      inputValue,
      valuePerDay,
    };
    let newBoostTokens = [...boostRewardsTokens];
    newBoostTokens[index] = {
      ...newBoostTokens[index],
      sum: inputValue,
    };
    setBoostRewardsTokens(newBoostTokens);
    setInputValues(newInputValues);
  };
  const handleDeploy = () => {
    let tokensToAllowance: any = [];
    inputValues.forEach((value, index) => {
      if (!value.inputValue) return;
      if (
        Number(boostRewardsTokens[index].balance) >= Number(value.inputValue) &&
        Number(value.valuePerDay) >= Number(minInitialBoostPerDay)
      ) {
        tokensToAllowance.push({
          ...boostRewardsTokens[index],
          sum: value.inputValue,
        });
      }
    });

    if (tokensToAllowance?.length) {
      getTokensAllowance(tokensToAllowance);
    } else {
      setRewardingVaultDeploy(false);
      setRewardingVaultApprove(false);
    }
  };

  const getTokensAllowance = async (tokens: any) => {
    if ($platformData) {
      const allowances: any[] = await Promise.all(
        tokens.map(async (token: any) => {
          const response: any = await readContract(_publicClient, {
            address: token.address as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account as TAddress, $platformData?.factory],
          });
          return response;
        })
      );
      tokens = tokens.map((item: any, i: any) => ({
        ...item,
        allowance: formatUnits(allowances[i], item.decimals),
      }));

      // todo for multiple tokens
      if (tokens[0].allowance >= tokens[0].sum) {
        setRewardingVaultDeploy(true);
        setRewardingVaultApprove(false);
      } else {
        setRewardingVaultDeploy(false);
        setRewardingVaultApprove(tokens);
      }
    }
  };
  const approveRewardingVaultTokens = async () => {
    if ($platformData) {
      if (rewardingVaultApprove?.length) {
        rewardingVaultApprove.map(async (token: any) => {
          const approve = await writeContract({
            address: token.address,
            abi: ERC20ABI,
            functionName: "approve",
            args: [
              $platformData.factory,
              parseUnits(
                token.sum,
                tokensJson.tokens.find((tk) => tk.address === token.address)
                  ?.decimals ?? 18
              ),
            ],
          });
          const transaction = await _publicClient.waitForTransactionReceipt(
            approve
          );
          if (transaction.status === "success") {
            // it will be work only with one approve
            // todo fix approve state
            setRewardingVaultApprove(false);
            setRewardingVaultDeploy(true);
          }
        });
      }
    }
  };
  const deployRewardingVault = async () => {
    const tokensToDeploy = boostRewardsTokens.map((item) =>
      parseUnits(item.sum, item.decimals)
    );

    if ($platformData) {
      const deployVaultAndStrategy = await writeContract({
        address: $platformData.factory,
        abi: FactoryABI,
        functionName: "deployVaultAndStrategy",
        args: [
          vaultType,
          strategyId,
          initParams.initVaultAddresses as TAddress[],
          tokensToDeploy,
          initParams.initStrategyAddresses as TAddress[],
          initParams.initStrategyNums,
          initParams.initStrategyTicks,
        ],
      });

      const transaction = await _publicClient.waitForTransactionReceipt(
        deployVaultAndStrategy
      );

      if (transaction.status === "success") {
        lastTx.set(transaction.transactionHash);
        setBuildResult(true);
      } else {
        setBuildResult(false);
      }
    }
  };

  //// compounding vault
  const checkAllowance = async () => {
    if (needCheckAllowance && $platformData) {
      const allowance = await readContract(_publicClient, {
        address: $platformData.buildingPayPerVaultToken,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [$account as TAddress, $platformData?.factory],
      });
      setAllowance(allowance as bigint);
    }
  };
  const deploy = async () => {
    if ($platformData) {
      const deployVaultAndStrategy = await writeContract({
        address: $platformData.factory,
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

      const transaction = await _publicClient.waitForTransactionReceipt(
        deployVaultAndStrategy
      );

      if (transaction.status === "success") {
        lastTx.set(transaction.transactionHash);
        setBuildResult(true);
      } else {
        setBuildResult(false);
      }
    }
  };

  const approve = async () => {
    if ($platformData) {
      try {
        const approve = await writeContract({
          address: $platformData.buildingPayPerVaultToken,
          abi: ERC20ABI,
          functionName: "approve",
          args: [$platformData.factory, buildingPrice],
        });
        setLoader(true);
        const transaction = await _publicClient.waitForTransactionReceipt(
          approve
        );
        if (transaction.status === "success") {
          setAllowance(
            (await readContract(_publicClient, {
              address: $platformData.buildingPayPerVaultToken,
              abi: ERC20ABI,
              functionName: "allowance",
              args: [$account as TAddress, $platformData?.factory],
            })) as bigint
          );
          setLoader(false);
        }
      } catch (error) {
        setLoader(false);
      }
    }
  };

  const payPerVaultToken =
    $platformData?.buildingPayPerVaultToken &&
    getTokenData($platformData.buildingPayPerVaultToken);

  useEffect(() => {
    checkAllowance();
  }, [needCheckAllowance]);
  useEffect(() => {
    handleDeploy();
  }, [inputValues]);
  return (
    <div className="flex flex-col">
      {!buildResult && (
        <div className="flex flex-col gap-2 pb-5">
          <div className="flex w-full justify-between">
            <span className="w-[30%] text-[22px]">Vault type</span>
            <span>{vaultType}</span>
          </div>
          <div className="flex w-full justify-between">
            <span className="w-[30%] text-[22px]">Strategy logic</span>
            <span>{strategyId}</span>
          </div>
          <div className="flex w-full justify-between">
            <p className="w-[30%] text-[22px]">Strategy description</p>
            <p className="text-end text-[16px]">{strategyDesc}</p>
          </div>
          {nftData && (
            <div className="flex w-full justify-between">
              <span className="w-[40%] text-[18px]">
                Free vaults by PM used until <br />
                {nftData.nextUpdate}
              </span>
              <span>{nftData.freeVaults} of 1</span>
            </div>
          )}
          <div className="flex w-full justify-between">
            <span className="w-[30%] text-[22px]">Build price</span>
            <span>
              {buildingPrice && payPerVaultToken
                ? `${formatUnits(buildingPrice, payPerVaultToken.decimals)} ${
                    payPerVaultToken.symbol
                  }`
                : "-"}
            </span>
          </div>
          <div className="flex w-full justify-between">
            <span className="w-[30%] text-[22px]">Your balance</span>
            <span>
              {$balance?.buildingPayPerVaultTokenBalance && payPerVaultToken
                ? `${formatUnits(
                    $balance.buildingPayPerVaultTokenBalance,
                    payPerVaultToken.decimals
                  )} ${payPerVaultToken.symbol}`
                : "-"}
            </span>
          </div>

          {vaultType === "Rewarding" && (
            <>
              <div className="flex w-full justify-between">
                <span className="w-[30%] text-[22px]">Buy-back token</span>
                <span>
                  {getTokenData(initParams.initVaultAddresses[0])?.symbol}
                </span>
              </div>

              <p className="text-center text-[22px]">Initial boost rewards</p>
              <div className="flex flex-col gap-2">
                {boostRewardsTokens.map((token, index) => {
                  return (
                    <div className="flex flex-col gap-1" key={token.address}>
                      <span className="">
                        {getTokenData(token.address)?.symbol}
                      </span>
                      <span className="text-[16px] text-[#868686]">
                        Balance: {token.balance}
                      </span>
                      <input
                        type="text"
                        className="w-full bg-[#2c2f38] outline-none pl-3 py-1.5 rounded-[4px] border-[2px] border-[#3d404b] focus:border-[#9baab4] transition-all duration-300"
                        placeholder="Value"
                        ref={refArray[index]}
                        onChange={(event) =>
                          handleInput(token.price, index, event)
                        }
                        disabled={Number(token.balance) == 0}
                      />
                      {inputValues[index].valuePerDay &&
                        inputValues[index].inputValue && (
                          <p>${inputValues[index].valuePerDay} per day</p>
                        )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {!loader ? (
        <>
          {buildResult === undefined && vaultType === "Compounding" && (
            <div className="mt-10 flex justify-center">
              {needCheckAllowance &&
              allowance !== undefined &&
              allowance < buildingPrice &&
              (nftData === undefined || nftData?.freeVaults !== 0) ? (
                <button
                  className="bg-button px-5 py-1 rounded-md"
                  onClick={approve}
                >
                  Approve factory to spend {payPerVaultToken?.symbol}
                </button>
              ) : (
                <button
                  className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] px-6 py-1 rounded-md"
                  onClick={deploy}
                >
                  Deploy
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <Loader />
      )}
      {loader ? (
        <Loader />
      ) : (
        <>
          {buildResult === undefined &&
          vaultType === "Rewarding" &&
          needCheckAllowance &&
          allowance !== undefined &&
          allowance < buildingPrice &&
          (nftData === undefined || nftData?.freeVaults !== 0) ? (
            <button
              className="bg-button px-5 py-1 rounded-md"
              onClick={approve}
            >
              Approve factory to spend {payPerVaultToken?.symbol}
            </button>
          ) : (
            buildResult === undefined &&
            vaultType === "Rewarding" &&
            (rewardingVaultApprove || rewardingVaultDeploy) && (
              <div className="mt-10 flex justify-center">
                {rewardingVaultApprove && (
                  <button
                    className="bg-button px-5 py-1 rounded-md"
                    onClick={approveRewardingVaultTokens}
                  >
                    Approve factory to spend {rewardingVaultApprove[0].symbol}
                  </button>
                )}
                {rewardingVaultDeploy && (
                  <button
                    className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] px-6 py-1 rounded-md"
                    onClick={deployRewardingVault}
                  >
                    Deploy
                  </button>
                )}
              </div>
            )
          )}
        </>
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
