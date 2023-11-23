import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";

import { usePublicClient } from "wagmi";
import { writeContract } from "@wagmi/core";
import { formatUnits } from "viem";
import { readContract } from "viem/actions";

import { FactoryABI, ERC20ABI } from "@web3";
import { account, platformData, userBalance, lastTx } from "@store";

import type { TInitParams, TAddress } from "@types";
import { getTokenData } from "@utils";

interface IProps {
  vaultType: string;
  strategyId: string;
  strategyDesc: string;
  initParams: TInitParams;
  buildingPrice: bigint;
  defaultBoostTokens: string[];
}

const BuildForm = ({
  vaultType,
  strategyId,
  strategyDesc,
  initParams,
  buildingPrice,
  defaultBoostTokens,
}: IProps) => {
  const $account = useStore(account);
  const $platformData = useStore(platformData);
  const $balance = useStore(userBalance);
  const _publicClient = usePublicClient();

  // todo implement using
  const canUsePermitToken = false;

  const needCheckAllowance = !canUsePermitToken;

  const [allowance, setAllowance] = useState<bigint | undefined>();
  const [buildResult, setBuildResult] = useState<boolean | undefined>();
  const [boostAmounts, setBoostAmounts] = useState<{ [token: string]: bigint }>(
    {}
  );

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
      const approve = await writeContract({
        address: $platformData.buildingPayPerVaultToken,
        abi: ERC20ABI,
        functionName: "approve",
        args: [$platformData.factory, buildingPrice],
      });
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
      } else {
        // todo show error
      }
    }
  };

  const payPerVaultToken =
    $platformData?.buildingPayPerVaultToken &&
    getTokenData($platformData.buildingPayPerVaultToken);

  useEffect(() => {
    checkAllowance();
  }, [needCheckAllowance]);
  return (
    <div className="flex flex-col">
      {!buildResult && (
        <div className="flex flex-col gap-2">
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

              <div>Initial boost rewards</div>
              <div>
                {[
                  ...new Set([
                    initParams.initVaultAddresses[0],
                    ...defaultBoostTokens,
                  ]),
                ].map((address) => {
                  return (
                    <span key={address}>{getTokenData(address)?.symbol}</span>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {buildResult === undefined && (
        <div className="mt-10 flex justify-center">
          {needCheckAllowance && allowance && allowance < buildingPrice ? (
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

      {buildResult && (
        <div className="border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57] rounded-md flex justify-center py-4">
          The vault has beed deployed
        </div>
      )}
    </div>
  );
};
export { BuildForm };
