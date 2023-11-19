import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";

import { usePublicClient } from "wagmi";
import { writeContract } from "@wagmi/core";
import { formatUnits } from "viem";
import { readContract } from "viem/actions";

import { FactoryABI, ERC20ABI } from "@web3";
import { account, platformData, userBalance, lastTx } from "@store";

import type { TInitParams } from "@types";
import { getTokenData } from "@utils";

type Props = {
  buildingPrice: bigint;
  vaultType: string;
  strategyId: string;
  strategyDesc: string;
  initParams: TInitParams;
  defaultBoostTokens: string[];
};

function BuildForm(props: Props) {
  const _account = useStore(account);
  const p = useStore(platformData);
  const balance = useStore(userBalance);
  const _publicClient = usePublicClient();

  // todo implement using
  const canUsePermitToken = false;

  const needCheckAllowance = !canUsePermitToken;

  const [allowance, setAllowance] = useState<bigint | undefined>();
  const [buildResult, setBuildResult] = useState<boolean | undefined>();
  const [boostAmounts, setBoostAmounts] = useState<{ [token: string]: bigint }>(
    {}
  );

  useEffect(() => {
    async function check() {
      if (needCheckAllowance && p) {
        const r = await readContract(_publicClient, {
          address: p.buildingPayPerVaultToken,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [_account, p?.factory],
        });
        setAllowance(r as bigint);
        // console.log('allowance', r)
      }
    }
    check();
  }, [needCheckAllowance]);

  async function deploy() {
    if (p) {
      const r = await writeContract({
        address: p.factory,
        abi: FactoryABI,
        functionName: "deployVaultAndStrategy",
        args: [
          props.vaultType,
          props.strategyId,
          props.initParams.initVaultAddresses,
          props.initParams.initVaultNums,
          props.initParams.initStrategyAddresses,
          props.initParams.initStrategyNums,
          props.initParams.initStrategyTicks,
        ],
      });
      const transaction = await _publicClient.waitForTransactionReceipt(r);
      if (transaction.status === "success") {
        lastTx.set(transaction.transactionHash);
        setBuildResult(true);
      } else {
        setBuildResult(false);
      }
    }
  }

  async function approve() {
    if (p) {
      const r = await writeContract({
        address: p.buildingPayPerVaultToken,
        abi: ERC20ABI,
        functionName: "approve",
        args: [p.factory, props.buildingPrice],
      });
      const transaction = await _publicClient.waitForTransactionReceipt(r);
      if (transaction.status === "success") {
        setAllowance(
          (await readContract(_publicClient, {
            address: p.buildingPayPerVaultToken,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [_account, p?.factory],
          })) as bigint
        );
      } else {
        // todo show error
      }
    }
  }

  const payPerVaultToken = p?.buildingPayPerVaultToken
    ? getTokenData(p.buildingPayPerVaultToken)
    : undefined;

  return (
    <div className="build-form">
      {buildResult !== true && (
        <>
          <div className="group">
            <span className="group-label">Vault type</span>
            <span>{props.vaultType}</span>
          </div>
          <div className="group">
            <span className="group-label">Strategy logic</span>
            <span>{props.strategyId}</span>
          </div>
          <div className="group">
            <span className="group-label">Strategy description</span>
            <span>{props.strategyDesc}</span>
          </div>
          <div className="group">
            <span className="group-label">Build price</span>
            <span>
              {props.buildingPrice && payPerVaultToken
                ? `${formatUnits(
                    props.buildingPrice,
                    payPerVaultToken.decimals
                  )} ${payPerVaultToken.symbol}`
                : "-"}
            </span>
          </div>
          <div className="group">
            <span className="group-label">Your balance</span>
            <span>
              {balance?.buildingPayPerVaultTokenBalance && payPerVaultToken
                ? `${formatUnits(
                    balance.buildingPayPerVaultTokenBalance,
                    payPerVaultToken.decimals
                  )} ${payPerVaultToken.symbol}`
                : "-"}
            </span>
          </div>

          {props.vaultType === "Rewarding" && (
            <>
              <div className="group">
                <span className="group-label">Buy-back token</span>
                <span>
                  {getTokenData(props.initParams.initVaultAddresses[0])?.symbol}
                </span>
              </div>

              <div>Initial boost rewards</div>
              <div>
                {[
                  ...new Set([
                    props.initParams.initVaultAddresses[0],
                    ...props.defaultBoostTokens,
                  ]),
                ].map((addresss) => {
                  return <span>{getTokenData(addresss)?.symbol}</span>;
                })}
              </div>
            </>
          )}
        </>
      )}

      {buildResult === undefined && (
        <div className="action">
          {needCheckAllowance &&
          allowance !== undefined &&
          allowance < props.buildingPrice ? (
            <button className="btn btn-primary" onClick={approve}>
              Approve factory to spend {payPerVaultToken?.symbol}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={deploy}>
              Deploy
            </button>
          )}
        </div>
      )}

      {buildResult === true && (
        <div className="success">The vault has beed deployed</div>
      )}
    </div>
  );
}
export { BuildForm };
