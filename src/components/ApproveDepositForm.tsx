import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { readContract } from "viem/actions";
import type { InitParams } from "../types";
import FactoryAbi from "../abi/FactoryAbi";
import ERC20Abi from "../abi/ERC20Abi";
import { usePublicClient } from "wagmi";
import { writeContract } from "@wagmi/core";
import {
  account,
  platformData,
  userBalance,
  lastTx,
} from "../state/StabilityStore";
import { getTokenData } from "../utils";
import { formatUnits } from "viem";

type Props = {
  option: string[];
  vaultt: `0x${string}` | undefined;
};

type Allowance = {
  [asset: string]: AssetAllowance;
};

type AssetAllowance = {
  allowance: bigint[];
};

export function ApproveDepositForm(props: Props) {
  const $account = useStore(account);
  const p = useStore(platformData);
  const balance = useStore(userBalance);
  const _publicClient = usePublicClient();

  // todo implement using

  const [allowance, setAllowance] = useState<Allowance | undefined>();
  const [buildResult, setBuildResult] = useState<boolean | undefined>();
  const [boostAmounts, setBoostAmounts] = useState<{ [token: string]: bigint }>(
    {}
  );

  useEffect(() => {
    async function check() {
      const allowanceResult: Allowance = {};
      for (let i = 0; i < props.option.length; i++) {
        let alw: bigint = (await readContract(_publicClient, {
          address: props.option[i] as `0x${string}`,
          abi: ERC20Abi,
          functionName: "allowance",
          args: [$account, props.vaultt],
        })) as bigint;

        if (!allowanceResult[props.option[i]]) {
          allowanceResult[props.option[i]] = { allowance: [] };
        }
        allowanceResult[props.option[i]].allowance.push(alw);
      }
      setAllowance(allowanceResult);
      console.log(allowanceResult);
    }
    check();
  }, [props.option]);

  const payPerVaultToken = p?.buildingPayPerVaultToken
    ? getTokenData(p.buildingPayPerVaultToken)
    : undefined;

  return (
    <div className="build-form">
      {buildResult !== true && (
        <>
          <div className="group">
            <span className="group-label">Assets</span>
            <span>{props.vaultType}</span>
          </div>

          <div className="group">
            <span className="group-label">Assets description</span>
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
                ].map(addresss => {
                  return <span>{getTokenData(addresss)?.symbol}</span>;
                })}
              </div>
            </>
          )}
        </>
      )}

      {buildResult === undefined && (
        <div className="action">
          {allowance !== undefined && allowance < props.buildingPrice ? (
            <button
              className="btn btn-primary"
              onClick={approve}>
              Approve deposit to spend {payPerVaultToken?.symbol}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={deploy}>
              Deposit
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
