import { useEffect, useState, useRef } from "react";
import { useStore } from "@nanostores/react";

import { formatUnits, parseUnits, maxUint256 } from "viem";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "@wagmi/core";

import { Loader } from "@ui";

import { FactoryABI, ERC20ABI, wagmiConfig } from "@web3";

import { getTokenData } from "@utils";

import {
  account,
  platformsData,
  userBalance,
  lastTx,
  assetsBalances,
  assetsPrices,
  currentChainID,
} from "@store";

import type { TInitParams, TAddress, TInputItem } from "@types";

import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

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

type TTokenData = {
  address: string;
  allowance: string;
  balance: string;
  decimals: number;
  price: string | undefined;
  sum: number;
  symbol: string | undefined;
};

const BuildForm = ({
  vaultType,
  strategyId,
  strategyDesc,
  initParams,
  buildingPrice,
  defaultBoostTokens,
  minInitialBoostPerDay,
  nftData,
}: IProps): JSX.Element => {
  const $account = useStore(account);
  const $platformsData = useStore(platformsData);
  const $balance = useStore(userBalance);
  const $assetsBalances = useStore(assetsBalances);
  const $assetsPrices = useStore(assetsPrices);
  const $currentChainID = useStore(currentChainID);
  // todo implement using
  const canUsePermitToken = false;

  const needCheckAllowance = !canUsePermitToken;

  const BRT = [
    ...new Set([initParams.initVaultAddresses[0], ...defaultBoostTokens]),
  ].map((addr) => ({
    symbol: tokenlist.tokens.find((token) => token.address === addr)?.symbol,
    address: addr,
    balance: formatUnits(
      $assetsBalances?.[addr] || 0n,
      tokenlist.tokens.find((token) => token.address === addr)?.decimals ?? 18
    ),
    price: $assetsPrices[$currentChainID][addr]?.price,
    sum: "",
    allowance: "",
    decimals:
      tokenlist.tokens.find((token) => token.address === addr)?.decimals ?? 18,
  }));

  const [boostRewardsTokens, setBoostRewardsTokens] = useState(BRT);
  const [allowance, setAllowance] = useState<bigint | undefined>();
  const [buildResult, setBuildResult] = useState<boolean | undefined>();
  const [inputValues, setInputValues] = useState<Array<TInputItem>>(
    Array(defaultBoostTokens.length).fill({ inputValue: "", valuePerDay: "" })
  );
  const [rewardingVaultApprove, setRewardingVaultApprove] = useState<
    TTokenData[]
  >([]);

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
    const tokensData: TTokenData[] = [];

    inputValues.forEach((value, index) => {
      if (!value.inputValue) return;
      if (
        Number(boostRewardsTokens[index].balance) >= Number(value.inputValue) &&
        Number(value.valuePerDay) >= Number(minInitialBoostPerDay)
      ) {
        tokensData.push({
          ...boostRewardsTokens[index],
          sum: Number(value.inputValue),
        });
      }
    });

    if (tokensData?.length) {
      getTokensAllowance(tokensData);
    } else {
      setRewardingVaultDeploy(false);
      setRewardingVaultApprove([]);
    }
  };

  const getTokensAllowance = async (tokens: TTokenData[]) => {
    if ($platformsData[$currentChainID]) {
      const allowances: bigint[] = await Promise.all(
        tokens.map(async (token: TTokenData) => {
          const response = await readContract(wagmiConfig, {
            address: token.address as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [
              $account as TAddress,
              $platformsData[$currentChainID]?.factory,
            ],
          });

          return response;
        })
      );
      tokens = tokens.map((token: TTokenData, index: number) => ({
        ...token,
        allowance: formatUnits(allowances[index], token.decimals),
      }));

      // todo for multiple tokens
      if (Number(tokens[0].allowance) >= tokens[0].sum) {
        setRewardingVaultDeploy(true);
        setRewardingVaultApprove([]);
      } else {
        setRewardingVaultDeploy(false);
        setRewardingVaultApprove(tokens);
      }
    }
  };
  const approveRewardingVaultTokens = async () => {
    if ($platformsData[$currentChainID] && rewardingVaultApprove?.length) {
      try {
        rewardingVaultApprove.map(async (token: TTokenData) => {
          const approve = await writeContract(wagmiConfig, {
            address: token.address as TAddress,
            abi: ERC20ABI,
            functionName: "approve",
            args: [$platformsData[$currentChainID]?.factory, maxUint256],
          });
          setLoader(true);
          const transaction = await waitForTransactionReceipt(wagmiConfig, {
            hash: approve,
          });
          if (transaction.status === "success") {
            lastTx.set(transaction?.transactionHash);
            setLoader(false);
            // it will be work only with one approve
            // todo fix approve state
            setRewardingVaultApprove([]);
            setRewardingVaultDeploy(true);
          }
        });
      } catch (error) {
        lastTx.set("No approve hash...");
        setLoader(false);
        console.error("APPROVE ERROR:", error);
      }
    }
  };
  const deployRewardingVault = async () => {
    const tokensToDeploy = boostRewardsTokens.map((item) =>
      parseUnits(item.sum, item.decimals)
    );

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
            tokensToDeploy,
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

  //// compounding vault
  const checkAllowance = async () => {
    if (needCheckAllowance && $platformsData[$currentChainID]) {
      const allowance = await readContract(wagmiConfig, {
        address: $platformsData[$currentChainID]?.buildingPayPerVaultToken,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [$account as TAddress, $platformsData[$currentChainID]?.factory],
      });
      setAllowance(allowance as bigint);
    }
  };
  const deploy = async () => {
    //todo combine deploy and deployRewardingVault
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

  const approve = async () => {
    if ($platformsData[$currentChainID]) {
      try {
        const approve = await writeContract(wagmiConfig, {
          address: $platformsData[$currentChainID]?.buildingPayPerVaultToken,
          abi: ERC20ABI,
          functionName: "approve",
          args: [$platformsData[$currentChainID]?.factory, maxUint256],
        });
        setLoader(true);
        const transaction = await waitForTransactionReceipt(wagmiConfig, {
          hash: approve,
        });
        if (transaction.status === "success") {
          lastTx.set(transaction?.transactionHash);
          setAllowance(
            (await readContract(wagmiConfig, {
              address:
                $platformsData[$currentChainID]?.buildingPayPerVaultToken,
              abi: ERC20ABI,
              functionName: "allowance",
              args: [
                $account as TAddress,
                $platformsData[$currentChainID]?.factory,
              ],
            })) as bigint
          );
          setLoader(false);
        }
      } catch (error) {
        lastTx.set("No approve hash...");
        setLoader(false);
        console.error("APPROVE ERROR:", error);
      }
    }
  };

  const payPerVaultToken =
    $platformsData[$currentChainID]?.buildingPayPerVaultToken &&
    getTokenData($platformsData[$currentChainID].buildingPayPerVaultToken);

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
          {nftData && (
            <div className="flex w-full justify-between">
              <span className="w-[40%] text-[18px]">
                Free vaults by PM used until <br />
                {nftData.nextUpdate}
              </span>
              <span className="text-[14px] sm:text-[16px]">
                {nftData.freeVaults} of 1
              </span>
            </div>
          )}
          <div className="flex w-full justify-between">
            <span className="w-[30%] text-[16px] sm:text-[22px]">
              Build price
            </span>
            <span className="text-[14px] sm:text-[16px]">
              {buildingPrice && payPerVaultToken
                ? `${formatUnits(buildingPrice, payPerVaultToken.decimals)} ${
                    payPerVaultToken.symbol
                  }`
                : "-"}
            </span>
          </div>
          <div className="flex w-full justify-between">
            <span className="w-[30%] text-[16px] sm:text-[22px]">
              Your balance
            </span>
            <span className="text-[14px] sm:text-[16px]">
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
                <span className="w-[30%] text-[16px] sm:text-[22px]">
                  Buy-back token
                </span>
                <span className="text-[14px] sm:text-[16px]">
                  {getTokenData(initParams.initVaultAddresses[0])?.symbol}
                </span>
              </div>

              <p className="text-center text-[16px] sm:text-[22px]">
                Initial boost rewards
              </p>
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
      {!loader && (
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
            (rewardingVaultApprove?.length || rewardingVaultDeploy) && (
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
