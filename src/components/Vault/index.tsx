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
  vaults,
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

type Vaults = {
  [vaultAddress: string]: VaultsData;
};

type VaultsData = {
  symbol: string;
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
  const vaultt: `0x${string}` = props.vault as `0x${string}`;
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);
  const $vault = useStore(vaultData);
  const $assets = useStore(assets);
  const $account = useStore(account);
  const $vaults = useStore(vaults);
  const _publicClient = usePublicClient();
  const p = useStore(platformData);

  const [option, setOption] = useState<string[]>([]);
  const [defaultOptionSymbols, setDefaultOptionSymbols] = useState("");
  const [defaultOptionAssets, setDefaultOptionAssets] = useState("");
  const [tab, setTab] = useState("Deposit");
  const [balances, setBalances] = useState<Balance>({});
  const [inputs, setInputs] = useState<input>({});
  const [lastKeyPress, setLastKeyPress] = useState<{
    key1: string | undefined;
    key2: string | undefined;
  }>({ key1: undefined, key2: undefined });
  const [allowance, setAllowance] = useState<Allowance | undefined>({});
  const [approve, setApprove] = useState<number | undefined>();
  const [sharesOut, setSharesOut] = useState<bigint>();
  const [symbols, setSymbols] = useState<Vaults>({});

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

  useEffect(() => {
    async function previewDeposit() {
      if ($assets && lastKeyPress.key1 && tab === "Deposit") {
        const changedInput = $assets?.indexOf(lastKeyPress.key1);
        const preview: input = {};

        if (option && option.length > 0) {
          let amounts: bigint[] = [];
          for (let i = 0; i < option.length; i++) {
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
              setApprove(undefined);
            }
          }
        }
      }
    }
    previewDeposit();
  }, [lastKeyPress]);

  function loadSymbols() {
    if ($vaults) {
      const vaultData: Vaults = {};
      for (let i = 0; i < $vaults[0].length; i++) {
        vaultData[$vaults[0][i]] = {
          symbol: $vaults[2][i],
        };
        setSymbols(vaultData);
        console.log($vaults);
      }
    }
  }

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
    if (amount === "") {
      resetInputs(option);
    } else {
      if (tab === "Deposit") {
        setInputs(prevInputs => ({
          ...prevInputs,
          [asset]: {
            ammount: amount,
          },
        }));

        if (option.length > 1) {
          setLastKeyPress({ key1: asset, key2: amount });
        }
      } else {
        const preview: input = {};
        for (let i = 0; i < option.length; i++) {
          preview[option[i]] = {
            ammount: amount as string,
          };
        }
        setInputs(preview);
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

  async function withdraw() {
    const value = $vault[vaultt].vaultUserBalance;

    const w = await writeContract({
      address: vaultt as `0x${string}`,
      abi: VaultABI,
      functionName: "withdrawAssets",
      args: [$assets, value, [0n, 0n]],
    });
  }

  function resetOptions() {
    if ($assets) {
      setOption($assets);
      let select = document.getElementById("selectOption") as HTMLSelectElement;

      if (select) {
        select.value = select.options[0].value;
      }
    }
  }

  if (props.vault && $vault[props.vault]) {
    return (
      <main className="w-full p-0 m-0 mx-auto">
        <table className="m-auto w-full my-4 ring-purple-950 hover:ring-1 shadow-sm rounded-xl">
          <tbody>
            <tr className="rounded-xl p-3 grid border-purple-950 border text-2xl ">
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
        <div className="rounded-xl mt-5 border-l border-r border-b border-gray-950 shadow-lg mb-12">
          <div className="border-0 flex">
            <button
              className={` h-[65px] rounded-t-xl cursor-pointer border-l-2 border-t-2 border-r-2 text-3xl w-full hover:bg-purple-950 ${
                tab === "Deposit"
                  ? "bg-purple-950 border-purple-600 "
                  : "bg-black-400 text-gray-500 border-gray-600"
              }`}
              onClick={() => {
                setTab("Deposit");
                resetInputs(option);
                resetOptions();
              }}>
              Deposit
            </button>
            <button
              className={`rounded-t-xl cursor-pointer border-l-2 border-t-2 border-r-2  text-3xl w-full hover:bg-purple-950  ${
                tab === "Withdraw"
                  ? "bg-purple-950 border-purple-600"
                  : "bg-black-400 text-gray-500 border-gray-600 "
              }`}
              style={{
                height: "65px",
              }}
              onClick={() => {
                setTab("Withdraw");
                resetOptions();
                resetInputs(option);
                loadSymbols();
              }}>
              Withdraw
            </button>
          </div>
          <form className="w-[400px] m-auto grid mb-10">
            <div className="my-4 m-auto grid">
              <label className="text-gray-600 text-2xl py-2">
                Select token
              </label>
              <select
                className="rounded-xl bg-gradient-to-r from-purple-700 to-purple-950 text-2xl h-[50px] focus:outline-0"
                id="selectOption"
                onChange={e => changeOption(e.target.value.split(", "))}
                style={{
                  width: "280px",
                }}>
                <option
                  className="bg-gray-600"
                  value={defaultOptionAssets}
                  style={{ textAlign: "center" }}>
                  {defaultOptionSymbols}
                </option>
                {tokensJson.tokens &&
                  tokensJson.tokens.slice(0, -2).map(token => {
                    return (
                      <option
                        className="bg-gray-600"
                        key={token.address}
                        value={token.address}
                        style={{ textAlign: "center" }}>
                        {token.symbol}
                      </option>
                    );
                  })}
              </select>
            </div>

            {tab === "Deposit" && (
              <>
                {option && option.length > 1 ? (
                  <div className="grid pt-2">
                    {option.map(asset => (
                      <div
                        className="rounded-xl grid relative h-[150px] border border-gray-600 mb-3 ps-2"
                        key={asset}>
                        <div className="absolute end-5 bottom-4">
                          <div className="flex items-center">
                            <div className="text-gray-500 me-2">
                              Balance:{" "}
                              {balances &&
                                balances[asset] &&
                                parseFloat(
                                  balances[asset].assetBalance
                                ).toFixed(3)}
                            </div>
                            <button
                              className="rounded-md w-14 border border-gray-500 ring-gray-500 hover:ring-1 text-gray-500 text-lg"
                              type="button"
                              onClick={() =>
                                balances &&
                                balances[asset] &&
                                handleInputChange(
                                  balances[asset].assetBalance,
                                  asset
                                )
                              }>
                              max
                            </button>
                          </div>
                        </div>

                        <input
                          className="w-[58%] ps-5 my-auto flex items-center h-full focus:outline-none text-4xl bg-transparent"
                          list="amount"
                          id={asset}
                          name="amount"
                          placeholder="0"
                          value={
                            inputs && inputs[asset] && inputs[asset].ammount
                          }
                          onChange={e =>
                            handleInputChange(e.target.value, e.target.id)
                          }
                          type="text"
                          onKeyDown={evt =>
                            ["e", "E", "+", "-", " ", ","].includes(evt.key) &&
                            evt.preventDefault()
                          }
                        />
                        <div className="absolute end-5 top-8 bg-[#4e46e521] rounded-xl p-2">
                          {tokensJson.tokens.map(token => {
                            if (token.address === asset) {
                              return (
                                <div
                                  className="flex"
                                  key={token.address}>
                                  <p className="my-auto">{token.symbol}</p>
                                  <img
                                    className="rounded-full w-[45px] h-[45px] ms-2"
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
                                Balance:{" "}
                                {parseFloat(
                                  balances[option[0]].assetBalance
                                ).toFixed(3)}
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
                            inputs &&
                            inputs[option[0]] &&
                            inputs[option[0]].ammount
                          }
                          name="amount"
                          type="text"
                          placeholder="0"
                          onChange={e =>
                            handleInputChange(e.target.value, e.target.id)
                          }
                          onKeyDown={evt =>
                            ["e", "E", "+", "-", " ", ","].includes(evt.key) &&
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
                        style={{
                          position: "absolute",
                          top: "32%",
                          right: "13px",
                        }}>
                        {tokensJson.tokens.map(token => {
                          if (token.address === option[0]) {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
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
                {approve === 1 ? (
                  <button
                    className="rounded-xl w-full flex text-gray-400 border-gray-400 border h-[60px] text-3xl items-center justify-center"
                    type="button"
                    onClick={() => deposit()}>
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
                          className="rounded-xl w-full flex text-gray-400 border-gray-400 border h-[60px] text-3xl items-center justify-center"
                          key={asset}
                          type="button"
                          onClick={() => approvee(asset as `0x${string}`)}>
                          Approve {getTokenData(asset)?.symbol}
                        </button>
                      ) : (
                        <></>
                      )
                    )}
                  </>
                ) : approve === 0 ? (
                  <button
                    disabled
                    className="rounded-xl w-full flex text-gray-600 border-gray-600 border h-[60px] text-3xl items-center justify-center">
                    INSUFICCIENT BALANCE
                  </button>
                ) : (
                  <></>
                )}
              </>
            )}

            {tab === "Withdraw" && (
              <>
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
                              Balance:{" "}
                              {parseFloat(
                                formatUnits($vault[vaultt].vaultUserBalance, 18)
                              ).toFixed(3)}
                            </div>
                            <button
                              onClick={() =>
                                handleInputChange(
                                  formatUnits(
                                    $vault[vaultt]?.vaultUserBalance,
                                    18
                                  ),
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

                    <input
                      list="amount"
                      id={option.join(", ")}
                      value={
                        inputs && inputs[option[0]] && inputs[option[0]].ammount
                      }
                      name="amount"
                      placeholder="0"
                      onChange={e =>
                        handleInputChange(e.target.value, e.target.id)
                      }
                      onKeyDown={evt =>
                        ["e", "E", "+", "-", " ", ","].includes(evt.key) &&
                        evt.preventDefault()
                      }
                      pattern="^[0-9]*[.,]?[0-9]*$"
                      inputMode="decimal"
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
                        top: "32%",
                        right: "13px",
                      }}>
                      {option.length === 1 ? (
                        <>
                          {tokensJson.tokens.map(token => {
                            if (token.address === option[0]) {
                              return (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
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
                          })}
                        </>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            height: "45px",
                          }}>
                          <div
                            style={{
                              alignItems: "center",
                              margin: "auto",
                              marginRight: "5px",
                            }}>
                            <p>
                              {symbols &&
                                vaultt &&
                                symbols[vaultt] &&
                                symbols[vaultt]?.symbol}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {$assets &&
                inputs &&
                inputs[option[0]] &&
                inputs[option[0]].ammount !== "" &&
                $vault[vaultt]?.vaultUserBalance !== undefined &&
                Number(inputs[option[0]].ammount) <=
                  Number(formatUnits($vault[vaultt]?.vaultUserBalance, 18)) ? (
                  <button
                    type="button"
                    className="rounded-xl"
                    style={{
                      margin: "auto",
                      fontSize: "35px",
                      width: "100%",
                      height: "60px",
                      cursor: "pointer",
                      borderStyle: "solid",
                      borderWidth: "1px",
                    }}
                    onClick={() => withdraw()}>
                    WITHDRAW
                  </button>
                ) : Number(inputs[option[0]]?.ammount) >
                  Number(formatUnits($vault[vaultt]?.vaultUserBalance, 18)) ? (
                  <div
                    className="rounded-xl"
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
                ) : null}
              </>
            )}
          </form>

          <section className="p-7 border-t border-gray-600 text-2xl text-gray-500">
            <div style={{ display: "flex", alignItems: "center" }}>
              <p>DEPOSIT FEE</p>
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
              from..
            </p>
          </section>
        </div>

        <article className="rounded-xl p-7 border border-gray-950 shadow-lg">
          <h2 className="mb-7 text-4xl text-gray-300 text-start">
            Strategy assets
          </h2>
          {$assets &&
            $assets.map(asset => {
              const assetData: TToken | undefined = getTokenData(asset);

              if (assetData && $assetsPrices) {
                return (
                  <article
                    className="rounded-xl p-5 border border-[#620c9f85] mb-4 flex"
                    key={asset}>
                    <div className="flex items-center w-full">
                      <div className="grid w-[125px] text-center">
                        <h4 className="pb-3 text-2xl ">{assetData.name}</h4>

                        <img
                          className="rounded-full w-[70px] m-auto"
                          src={assetData.logoURI}
                        />
                      </div>

                      <div className="grid mt-auto ps-2 text-gray-400 ">
                        <h5>{assetData.symbol}</h5>
                        <p>
                          Price: $
                          {formatUnits($assetsPrices[asset].tokenPrice, 18)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-md bg-purple-950 flex justify-center ms-auto w-[140px] p-1 h-10">
                      <a
                        className="flex items-center"
                        href={`https://polygonscan.com/token/${asset}`}>
                        Contract{" "}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon icon-tabler icon-tabler-external-link ms-1"
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
                      </a>
                    </div>
                  </article>
                );
              }
              return null;
            })}
        </article>
      </main>
    );
  } else {
    return <h1>Loading Vault..</h1>;
  }
}
export { Vault };
