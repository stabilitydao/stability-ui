import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits, parseUnits } from "viem";
import { readContract } from "viem/actions";
import { writeContract } from "@wagmi/core";

import {
  useAccount,
  usePublicClient,
  useNetwork,
  useWalletClient,
  useFeeData,
} from "wagmi";

import {
  vaultData,
  assets,
  assetsPrices,
  assetsBalances,
  account,
  platformData,
} from "@store";

import { VaultABI, StrategyABI, ERC20ABI } from "@web3";
import tokensJson from "../../stability.tokenlist.json";
import type { TToken, TAssetPrices } from "@types";
import { getTokenData } from "@utils";

type Props = {
  vault?: `0x${string}` | undefined;
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

type inputPreview = {
  [assetAdress: string]: InputAmmountPreview;
};

type InputAmmountPreview = {
  ammount: bigint;
};

type Allowance = {
  [asset: string]: AssetAllowance;
};

type AssetAllowance = {
  allowance: bigint[];
};

export function addAssetsPrice(data: any) {
  const tokenAdress = data[0];
  const tokenPrice = data[1];
  const assetPrice: TAssetPrices = {};
  if (tokenAdress.length === tokenPrice.length) {
    for (let i = 0; i < tokenAdress.length; i++) {
      assetPrice[tokenAdress[i]] = {
        tokenPrice: tokenPrice[i],
      };
    }
    assetsPrices.set(assetPrice);
  } else {
    console.error("There is an error, arrays lenght are different.");
  }
}

function Vault(props: Props) {
  const vaultt: `0x${string}` | undefined = props.vault;
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);
  const $vault = useStore(vaultData);
  const $assets = useStore(assets);
  const $account = useStore(account);
  const _publicClient = usePublicClient();
  const p = useStore(platformData);

  const [option, setOption] = useState<string[]>([]);
  const [defaultOptionSymbols, setDefaultOptionSymbols] = useState("");
  const [defaultOptionAssets, setDefaultOptionAssets] = useState("");
  const [tab, setTab] = useState("Deposit");
  const [balances, setBalances] = useState<Balance>({});
  const [inputs, setInputs] = useState<input>({});
  // const [inputsPreviewDeposit, setinputsPreviewDeposit] =
  //   useState<inputPreview>({});
  const [lastKeyPress, setLastKeyPress] = useState<{
    key1: string | undefined;
    key2: string | undefined;
  }>({ key1: undefined, key2: undefined });
  const [allowance, setAllowance] = useState<Allowance | undefined>({});
  const [approve, setApprove] = useState<number | undefined>();
  const [sharesOut, setSharesOut] = useState<bigint>();

  useEffect(() => {
    async function getStrategy() {
      if (vaultt) {
        let s: `0x${string}` | undefined = (await readContract(_publicClient, {
          address: vaultt,
          abi: VaultABI,
          functionName: "strategy",
        })) as `0x${string}` | undefined;

        if (typeof s === "string") {
          let ss: string[] = (await readContract(_publicClient, {
            address: s,
            abi: StrategyABI,
            functionName: "assets",
          })) as string[];

          if (Array.isArray(ss)) {
            assets.set(ss);
            setOption(ss);
            defaultAssetsOption(ss);
          } else {
            console.error("ss is not an array");
          }
        }
      }
    }
    getStrategy();
  }, [props]);

  useEffect(() => {
    function loadAssetsBalances() {
      const balance: Balance = {};

      if ($assetsBalances && option && option.length > 1) {
        for (let i = 0; i < option.length; i++) {
          const decimals = getTokenData(option[i])?.decimals;
          if (decimals !== undefined) {
            balance[option[i]] = {
              assetBalance: formatUnits(
                $assetsBalances[option[i]].assetBalance,
                decimals
              ),
            };
          }
        }
      } else {
        if (
          $assetsBalances &&
          $assetsBalances[option[0]] &&
          option &&
          option.length === 1
        ) {
          const decimals = getTokenData(option[0])?.decimals;
          if (decimals !== undefined) {
            balance[option[0]] = {
              assetBalance: formatUnits(
                $assetsBalances[option[0]].assetBalance,
                decimals
              ),
            };
          }
        }
      }
      setBalances(balance);
    }

    async function checkAllowance() {
      const allowanceResult: Allowance = {};

      for (let i = 0; i < option.length; i++) {
        const alw = (await readContract(_publicClient, {
          address: option[i] as `0x${string}`,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account, vaultt],
        })) as bigint;

        if (!allowanceResult[option[i]]) {
          allowanceResult[option[i]] = { allowance: [] };
        }
        allowanceResult[option[i]].allowance.push(alw);
      }
      setAllowance(allowanceResult);
    }
    checkAllowance();
    loadAssetsBalances();
  }, [option, $assetsBalances]);

  // interface PreviewBigInt {
  //   [key: string]: {
  //     ammount: bigint;
  //   };
  // }

  useEffect(() => {
    async function previewDeposit() {
      if ($assets && lastKeyPress.key1) {
        const changedInput = $assets?.indexOf(lastKeyPress.key1);
        const preview: input = {};
        // const previewBigInt: PreviewBigInt = {};

        if ($assets && $assets.length > 0) {
          let amounts: bigint[] = [];
          for (let i = 0; i < $assets.length; i++) {
            if (i === changedInput) {
              amounts.push(
                parseUnits(
                  inputs[lastKeyPress.key1].ammount,
                  Number(getTokenData(lastKeyPress.key1)?.decimals)
                )
              );
            } else {
              amounts.push(parseUnits("1", 36));
            }
          }
          console.log(amounts);

          if (typeof vaultt === "string") {
            try {
              let t: (bigint | bigint[])[] = (await readContract(
                _publicClient,
                {
                  address: vaultt,
                  abi: VaultABI,
                  functionName: "previewDepositAssets",
                  args: [$assets, amounts],
                }
              )) as (bigint | bigint[])[];

              checkInputsAllowance(t[0] as bigint[]);
              setSharesOut(((t[1] as bigint) * BigInt(1)) / BigInt(100));

              const qq: bigint[] = Array.isArray(t[0]) ? t[0] : [t[0]];

              for (let i = 0; i < $assets.length; i++) {
                const decimals = getTokenData($assets[i])?.decimals;
                if (i !== changedInput && decimals) {
                  preview[$assets[i]] = {
                    ammount: formatUnits(qq[i], decimals),
                  };
                }
              }

              // const rr: bigint[] = Array.isArray(t[0]) ? t[0] : [t[0]];

              // for (let i = 0; i < $assets.length; i++) {
              //   previewBigInt[$assets[i]] = {
              //     ammount: rr[i],
              //   };
              // }
              // setinputsPreviewDeposit(previewBigInt);

              if (lastKeyPress.key2 !== "") {
                setInputs(prevInputs => ({
                  ...prevInputs,
                  ...preview,
                }));
              }
            } catch (error) {
              console.error(
                "Error: the asset balance is too low to convert.",
                error
              );

              // resetInputs(option);
              setApprove(undefined);
            }
          }
        }
      }
    }
    previewDeposit();
  }, [lastKeyPress]);

  function checkInputsAllowance(input: bigint[]) {
    const apprDepo = [];
    let change = false;

    for (let i = 0; i < input.length; i++) {
      if (
        $assets &&
        $assetsBalances &&
        input[i] > $assetsBalances[$assets[i]].assetBalance &&
        lastKeyPress.key2 !== ""
      ) {
        setApprove(0);
        change = true;
      }
    }
    console.log(allowance);
    console.log(input);

    if (change !== true) {
      for (let i = 0; i < input.length; i++) {
        if (
          allowance &&
          $assets &&
          $assetsBalances &&
          input[i] <= $assetsBalances[$assets[i]].assetBalance &&
          allowance[$assets[i]].allowance[0] >= input[i] &&
          lastKeyPress.key2 !== ""
        ) {
          apprDepo.push(1);
        } else {
          if (lastKeyPress.key2 !== "") {
            apprDepo.push(2);
          }
        }
      }
      const button = checkButtonApproveDeposit(apprDepo);

      if (button === true) {
        setApprove(apprDepo[1]);
      } else {
        setApprove(2);
      }
    }
  }

  function checkButtonApproveDeposit(apprDepo: number[]) {
    if (apprDepo.length < 2) {
      return true;
    }
    const firstElement = apprDepo[0];
    return apprDepo.every(element => element === firstElement);
  }

  function resetInputs(e: string[]) {
    type input = {
      [assetAdress: string]: InputAmmount;
    };

    type InputAmmount = {
      ammount: string;
    };
    const reset: input = {};

    for (let i = 0; i < e.length; i++) {
      reset[e[i]] = {
        ammount: "",
      };
    }
    setInputs(reset);
    setApprove(undefined);
  }

  function defaultAssetsOption(ss: string[]) {
    const defaultOptionAssets: string[] = [];
    for (let i = 0; i < ss.length; i++) {
      const token = getTokenData(ss[i]);
      if (token) {
        defaultOptionAssets[i] = token.symbol;
      } else {
        defaultOptionAssets[i] = "Token not found.";
      }
    }
    const defaultOptionSymbolsToString = defaultOptionAssets.join(" + ");
    setDefaultOptionSymbols(defaultOptionSymbolsToString);
    setDefaultOptionAssets(ss.join(", "));
  }

  function changeOption(e: string[]) {
    resetInputs(e);
    setOption(e);
  }

  function handleInputChange(amount: string, asset: string) {
    const decimals = getTokenData(asset)?.decimals;

    if (decimals) {
      const _amount = parseUnits(amount, decimals);
      if (amount === "") {
        resetInputs(option);
      } else {
        setInputs(prevInputs => ({
          ...prevInputs,
          [asset]: {
            ammount: amount,
          },
        }));

        // setinputsPreviewDeposit(prevInputs => ({
        //   ...prevInputs,
        //   [asset]: {
        //     ammount: _amount,
        //   },
        // }));
      }

      if (option.length > 1) {
        setLastKeyPress({ key1: asset, key2: amount });
      }
    }
  }

  async function approvee(asset: `0x${string}`) {
    if (vaultt) {
      const allowanceResult: Allowance = {};
      const maxUni = parseUnits(
        inputs[asset].ammount,
        getTokenData(asset)?.decimals as number
      );
      // const maxUnits = parseUnits("1", 36);

      const r = await writeContract({
        address: asset,
        abi: ERC20ABI,
        functionName: "approve",
        args: [vaultt, maxUni],
      });
      console.log(r);

      const transaction = await _publicClient.waitForTransactionReceipt(r);

      if (transaction.status === "success") {
        const newAllowance = (await readContract(_publicClient, {
          address: asset,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account, vaultt],
        })) as bigint;

        setAllowance(prevAllowance => ({
          ...prevAllowance,
          [asset]: {
            allowance: [newAllowance],
          },
        }));
      }
    }
  }

  async function deposit() {
    let assets: string[] = [];
    let input: bigint[] = [];

    for (let i = 0; i < option.length; i++) {
      assets.push(option[i]);
      input.push(
        parseUnits(inputs[option[i]].ammount, tokensJson.tokens[i].decimals)
      );
    }

    const d = await writeContract({
      address: vaultt as `0x${string}`,
      abi: VaultABI,
      functionName: "depositAssets",
      args: [$assets, input, sharesOut],
    });
    console.log(d);
  }

  if (props.vault && $vault[props.vault]) {
    return (
      <>
        <table style={{ display: "flex", justifyContent: "center" }}>
          <tbody style={{ display: "flex" }}>
            <tr
              className="rounded-xl"
              style={{
                display: "grid",
                border: "1px",
                borderStyle: "solid",
                padding: "10px",
                borderColor: "grey",
              }}>
              <td>Vault: {props.vault}</td>
              <td>
                TVL: {formatUnits($vault[props.vault].vaultSharePrice, 18)}
              </td>
              <td>
                User Balance:{" "}
                {formatUnits($vault[props.vault].vaultUserBalance, 18)}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          className="rounded-xl"
          style={{
            width: "100%",
            display: "grid",
            margin: "auto",
            marginBottom: "50px",
            borderStyle: "solid",
            borderWidth: "1px",
            height: "auto",
            marginTop: "20px",
          }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              padding: "0",
            }}>
            <button
              className="border-b-2 border-r-2"
              style={{
                width: "100%",
                height: "65px",
                fontSize: "30px",
                cursor: "pointer",
                padding: "0",
                margin: "0",
              }}
              onClick={() => setTab("Deposit")}>
              Deposit
            </button>
            <button
              className="border-b-2 border-l-2"
              style={{
                width: "100%",
                height: "65px",
                fontSize: "30px",
                cursor: "pointer",
                padding: "0",
                margin: "0",
              }}
              onClick={() => setTab("Withdraw")}>
              Withdraw
            </button>
          </div>
          <form
            style={{
              width: "100%",
              display: "grid",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "18px",
              height: "auto",
            }}>
            <div
              style={{
                display: "grid",
                width: "auto",
                margin: "auto",
                marginTop: "10px",
              }}>
              <label style={{ color: "grey", width: "120px" }}>
                Select token
              </label>
              <select
                className="rounded-xl bg-gray-600"
                onChange={e => changeOption(e.target.value.split(", "))}
                style={{
                  height: "50px",
                  width: "280px",
                  fontSize: "30px",
                }}>
                <option
                  value={defaultOptionAssets}
                  style={{ textAlign: "center" }}>
                  {defaultOptionSymbols}
                </option>
                {tokensJson.tokens &&
                  tokensJson.tokens.slice(0, -2).map(token => {
                    return (
                      <option
                        key={token.address}
                        value={token.address}
                        style={{ textAlign: "center" }}>
                        {token.symbol}
                      </option>
                    );
                  })}
              </select>
            </div>
            {option && option.length > 1 ? (
              <div
                style={{
                  display: "grid",
                  margin: "auto",
                  marginTop: "15px",
                  fontSize: "15px",
                  width: "100%",
                }}>
                {option.map(asset => (
                  <div
                    className="rounded-xl"
                    key={asset}
                    style={{
                      display: "grid",
                      margin: "auto",
                      position: "relative",
                      height: "150px",
                      borderStyle: "solid",
                      borderWidth: "1px",
                      borderColor: "grey",
                      marginTop: "7px",
                      marginBottom: "7px",
                      paddingLeft: "10px",
                    }}>
                    <div style={{ marginTop: "5px", marginBottom: "5px" }}>
                      <div
                        style={{
                          position: "absolute",
                          right: "0",
                          bottom: "0",
                          padding: "15px",
                          paddingRight: "12px",
                          paddingBottom: "12px",
                        }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}>
                          <div
                            style={{
                              textAlign: "left",
                              color: "grey",
                            }}>
                            Balance:{" "}
                            {balances &&
                              balances[asset] &&
                              balances[asset].assetBalance}
                          </div>
                          <button
                            className="rounded-md w-12"
                            type="button"
                            onClick={() =>
                              balances &&
                              balances[asset] &&
                              handleInputChange(
                                balances[asset].assetBalance,
                                asset
                              )
                            }
                            style={{
                              color: "grey",
                              border: "solid",
                              background: "none",
                              borderWidth: "1px",
                              marginLeft: "5px",
                              borderColor: "grey",
                            }}>
                            max
                          </button>
                        </div>
                      </div>
                    </div>

                    <input
                      list="amount"
                      id={asset}
                      name="amount"
                      placeholder="0"
                      value={inputs && inputs[asset] && inputs[asset].ammount}
                      onChange={e =>
                        handleInputChange(e.target.value, e.target.id)
                      }
                      type="text"
                      onKeyDown={evt =>
                        ["e", "E", "+", "-", " "].includes(evt.key) &&
                        evt.preventDefault()
                      }
                      style={{
                        width: "60%",
                        height: "40px",
                        fontSize: "30px",
                        background: "none",
                        borderStyle: "none",
                        color: "white",
                        marginBottom: "15px",
                        paddingLeft: "15px",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "27%",
                        right: "13px",
                      }}>
                      {tokensJson.tokens.map(token => {
                        if (token.address === asset) {
                          return (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                              key={token.address}>
                              <p>{token.symbol}</p>
                              <img
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  marginLeft: "8px",
                                }}
                                src={token.logoURI}
                                alt={token.name}
                              />
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  margin: "auto",
                  marginTop: "15px",
                  fontSize: "15px",
                  width: "100%",
                }}>
                <div
                  className="rounded-xl"
                  style={{
                    display: "grid",
                    margin: "auto",
                    position: "relative",
                    height: "150px",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    borderColor: "grey",
                    marginTop: "7px",
                    marginBottom: "7px",
                    paddingLeft: "10px",
                  }}>
                  {balances && balances[option[0]] && (
                    <div
                      style={{
                        marginTop: "5px",
                        marginBottom: "5px",
                      }}>
                      <div
                        style={{
                          position: "absolute",
                          right: "0",
                          bottom: "0",
                          padding: "15px",
                          paddingRight: "12px",
                          paddingBottom: "12px",
                        }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}>
                          <div
                            style={{
                              textAlign: "left",
                              color: "grey",
                            }}>
                            Balance: {balances[option[0]].assetBalance}
                          </div>
                          <button
                            onClick={() =>
                              handleInputChange(
                                balances[option[0]].assetBalance,
                                option[0]
                              )
                            }
                            className="rounded-md w-12"
                            type="button"
                            style={{
                              color: "grey",
                              border: "solid",
                              background: "none",
                              borderWidth: "1px",
                              marginLeft: "5px",
                              borderColor: "grey",
                            }}>
                            max
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {option && option.length === 1 && (
                    <input
                      list="amount"
                      id={option[0]}
                      value={
                        inputs && inputs[option[0]] && inputs[option[0]].ammount
                      }
                      name="amount"
                      type="text"
                      placeholder="0"
                      onChange={e =>
                        handleInputChange(e.target.value, e.target.id)
                      }
                      onKeyDown={evt =>
                        ["e", "E", "+", "-", " "].includes(evt.key) &&
                        evt.preventDefault()
                      }
                      style={{
                        width: "60%",
                        height: "40px",
                        fontSize: "30px",
                        background: "none",
                        borderStyle: "none",
                        color: "white",
                        marginBottom: "15px",
                        paddingLeft: "15px",
                      }}
                    />
                  )}
                  <div
                    style={{ position: "absolute", top: "27%", right: "13px" }}>
                    {tokensJson.tokens.map(token => {
                      if (token.address === option[0]) {
                        return (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                            key={token.address}>
                            <p>{token.symbol}</p>
                            <img
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                marginLeft: "8px",
                              }}
                              src={token.logoURI}
                              alt={token.name}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            )}
            {tab === "Deposit" ? (
              approve === 1 ? (
                <button
                  className="rounded-xl"
                  type="button"
                  onClick={() => deposit()}
                  style={{
                    margin: "auto",
                    fontSize: "35px",
                    width: "100%",
                    height: "60px",
                    cursor: "pointer",
                    borderStyle: "solid",
                    borderWidth: "1px",
                  }}>
                  Deposit
                </button>
              ) : approve === 2 ? (
                <>
                  {option.map(asset =>
                    allowance &&
                    formatUnits(
                      allowance[asset].allowance[0],
                      Number(getTokenData(asset)?.decimals)
                    ) < inputs[asset].ammount ? (
                      <button
                        className="rounded-xl"
                        key={asset}
                        type="button"
                        onClick={() => approvee(asset as `0x${string}`)}
                        style={{
                          margin: "auto",
                          fontSize: "35px",
                          width: "100%",
                          height: "60px",
                          cursor: "pointer",
                          borderStyle: "solid",
                          borderWidth: "1px",
                          marginTop: "5px",
                          marginBottom: "5px",
                        }}>
                        Approve {getTokenData(asset)?.symbol}
                      </button>
                    ) : (
                      ""
                    )
                  )}
                </>
              ) : approve === 0 ? (
                <div
                  style={{
                    display: "flex",
                    margin: "auto",
                    color: "grey",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    width: "367px",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "60px",
                    fontSize: "25px",
                  }}>
                  INSUFICCIENT BALANCE
                </div>
              ) : (
                <div></div>
              )
            ) : (
              <button
                className="rounded-xl"
                type="button"
                style={{
                  margin: "auto",
                  fontSize: "35px",
                  width: "100%",
                  height: "60px",
                  cursor: "pointer",
                  borderStyle: "solid",
                  borderWidth: "1px",
                }}>
                Withdraw
              </button>
            )}
          </form>

          <section
            className="border-t-2"
            style={{
              padding: "25px",

              opacity: "50%",
            }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p
                style={{
                  padding: "0px",
                  margin: "0px",
                }}>
                DEPOSIT FEE
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-help-octagon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path
                  stroke="none"
                  d="M0 0h24v24H0z"
                  fill="none"></path>
                <path d="M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0z"></path>
                <path d="M12 16v.01"></path>
                <path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"></path>
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}>
              <p
                style={{
                  padding: "0px",
                  margin: "0px",
                }}>
                WITHDRAWAL FEE
              </p>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon icon-tabler icon-tabler-help-octagon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path
                  stroke="none"
                  d="M0 0h24v24H0z"
                  fill="none"></path>
                <path d="M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0z"></path>
                <path d="M12 16v.01"></path>
                <path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"></path>
              </svg>
            </div>
            <p>
              The displayed APY accounts for performance fee that is deducted
              from the generated yield only
            </p>
          </section>
        </div>

        <article
          className="Strategy rounded-xl p-7"
          style={{
            borderStyle: "solid",
            paddingLeft: "25px",
            paddingRight: "25px",
            marginTop: "50px",
            borderWidth: "1px",
            margin: "auto",
          }}>
          <h2
            className="pb-5 text-2xl"
            style={{
              justifyContent: "start",
              display: "flex",
            }}>
            Strategy assets
          </h2>
          {$assets &&
            $assets.map(asset => {
              const assetData: TToken | undefined = getTokenData(asset);

              if (assetData && $assetsPrices) {
                return (
                  <article
                    className="rounded-xl"
                    key={asset}
                    style={{
                      padding: "15px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      borderStyle: "solid",
                      borderWidth: "1px",
                      borderColor: "grey",
                      marginBottom: "10px",
                    }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "40px",
                      }}>
                      <h4 className="pb-3">{assetData.name}</h4>
                      <div
                        className="rounded-md"
                        style={{
                          backgroundColor: "#4B0082",
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft: "auto",
                          width: "150px",
                          padding: "1px",
                        }}>
                        <a
                          href={`https://polygonscan.com/token/${asset}`}
                          style={{
                            textDecoration: "none",
                            color: "white",
                            display: "felx",
                            marginRight: "5px",
                            alignItems: "center",
                          }}>
                          Contract
                        </a>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-external-link"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path
                            stroke="none"
                            d="M0 0h24v24H0z"
                            fill="none"></path>
                          <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                          <path d="M11 13l9 -9"></path>
                          <path d="M15 4h5v5"></path>
                        </svg>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}>
                      <img
                        src={assetData.logoURI}
                        style={{
                          borderRadius: "50%",
                          height: "70px",
                          marginLeft: "10px",
                          marginRight: "10px",
                        }}
                      />
                      <div style={{ display: "inline-block" }}>
                        <h5 style={{ marginLeft: "18px" }}>
                          {assetData.symbol}
                        </h5>
                        <p style={{ marginLeft: "18px" }}>
                          Price: $
                          {formatUnits($assetsPrices[asset].tokenPrice, 18)}
                        </p>
                      </div>
                      <section
                        style={{ paddingLeft: "100px", paddingRight: "50px" }}>
                        <p style={{ color: "grey" }}></p>
                      </section>
                    </div>
                    <div>
                      <p></p>
                    </div>
                  </article>
                );
              }

              return null;
            })}
        </article>
      </>
    );
  } else {
    return <h1>Loading Vault..</h1>;
  }
}
export { Vault };
