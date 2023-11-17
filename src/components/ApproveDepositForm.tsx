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
import { formatUnits, parseUnits } from "viem";

type Props = {
  option: string[];
  vaultt: `0x${string}` | undefined;
  inputs: input;
  balances: Balance;
  defaultOptionSymbols: string;
};

type Balance = {
  [balance: string]: AssetBalancee;
};

type AssetBalancee = {
  assetBalance: string;
};

type input = {
  [assetAdress: string]: InputAmmount;
};

type InputAmmount = {
  ammount: string;
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
  const [approve, setApprove] = useState(true);
  const [buildResult, setBuildResult] = useState<boolean | undefined>();
  const [boostAmounts, setBoostAmounts] = useState<{ [token: string]: bigint }>(
    {}
  );

  useEffect(() => {
    async function check() {
      const allowanceResult: Allowance = {};
      const approveStatusArray: boolean[] = [];
      let alw: bigint;
      for (let i = 0; i < props.option.length; i++) {
        alw = (await readContract(_publicClient, {
          address: props.option[i] as `0x${string}`,
          abi: ERC20Abi,
          functionName: "allowance",
          args: [$account, props.vaultt],
        })) as bigint;
        console.log(alw);
      }

      for (let i = 0; i < props.option.length; i++) {
        if (!allowanceResult[props.option[i]]) {
          allowanceResult[props.option[i]] = { allowance: [] };
        }
        allowanceResult[props.option[i]].allowance.push(alw);
      }
      setAllowance(allowanceResult);

      for (let i = 0; i < props.option.length; i++) {
        const approveStatus =
          allowanceResult[props.option[i]]?.allowance[0] !== undefined &&
          allowanceResult[props.option[i]]?.allowance[0] <
            parseUnits(
              props.inputs[props.option[i]]?.ammount,
              getTokenData(props.option[i])?.decimals
            ) &&
          props.inputs[props.option[i]]?.ammount !== "";
        approveStatusArray.push(approveStatus);
      }
      const atLeastOneTrue = approveStatusArray.includes(true);

      const atLeastOneFalse = approveStatusArray.includes(false);
      console.log(atLeastOneFalse);
      console.log(atLeastOneTrue);
      if (atLeastOneTrue && atLeastOneFalse === false) {
        setApprove(false);
      } else {
        setApprove(true);
      }
      console.log(approveStatusArray);
      console.log(approve);
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
            <span className="group-label">Strategy</span>
            <span>
              {props.option.length > 1
                ? props.defaultOptionSymbols
                : getTokenData(props.option[0])?.symbol}
            </span>
          </div>
          {props.option &&
            props.option.map((token, i) => (
              <div
                className="group"
                key={i}>
                <span className="group-label">
                  {getTokenData(token)?.symbol}
                </span>
                <span className="group-label">
                  {props.inputs[token].ammount}
                </span>
              </div>
            ))}

          <div className="group">
            <span className="group-label">Deposit fee</span>
            <span>{props.option.length === 1 ? "1 SDIV" : "0 SDIV"}</span>
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
        </>
      )}

      {buildResult === undefined && (
        <div className="action">
          {allowance !== undefined && approve === true ? (
            <button
              className="btn btn-primary"
              onClick={approve}>
              Approve deposit to spend {payPerVaultToken?.symbol}
            </button>
          ) : (
            <button className="btn btn-primary">Deposit</button>
          )}
        </div>
      )}

      {buildResult === true && (
        <div className="success">Deposited succesfully.</div>
      )}
    </div>
  );
}
