import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits, parseUnits } from "viem";
import { readContract } from "viem/actions";
import { writeContract } from "@wagmi/core";

import {
  // useAccount,
  usePublicClient,
  // useNetwork,
  // useWalletClient,
  // useFeeData,
} from "wagmi";

import {
  vaultData,
  assets,
  assetsPrices,
  assetsBalances,
  account,
  vaults,
} from "@store";

import { VaultABI, StrategyABI, ERC20ABI } from "@web3";
import { getTokenData } from "@utils";

import tokensJson from "../../stability.tokenlist.json";

import type {
  TToken,
  TAddress,
  TVaultsAddress,
  TVaultAllowance,
  TVaultInput,
  TVaultBalance,
} from "@types";

interface IProps {
  vault?: TAddress | undefined;
}

function Vault({ vault }: IProps) {
  const $vault = useStore(vaultData);
  const $assets = useStore(assets);
  const $account = useStore(account);
  const $vaults = useStore(vaults);
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);

  const _publicClient = usePublicClient();

  const [tab, setTab] = useState("Deposit");
  const [option, setOption] = useState<string[] | any>([]);
  const [defaultOptionSymbols, setDefaultOptionSymbols] = useState("");
  const [defaultOptionAssets, setDefaultOptionAssets] = useState("");
  const [allowance, setAllowance] = useState<TVaultAllowance | undefined | any>(
    {}
  );
  const [isApprove, setIsApprove] = useState<number | undefined>();
  const [symbols, setSymbols] = useState<TVaultsAddress>({});
  const [balances, setBalances] = useState<TVaultBalance | any>({});

  const [inputs, setInputs] = useState<TVaultInput | any>({});

  const [lastKeyPress, setLastKeyPress] = useState<{
    key1: string | undefined;
    key2: string | undefined;
  }>({ key1: undefined, key2: undefined });

  const [sharesOut, setSharesOut] = useState<bigint | any>();

  const loadSymbols = () => {
    if ($vaults) {
      const vaultData: TVaultsAddress = {};
      for (let i = 0; i < $vaults[0].length; i++) {
        vaultData[$vaults[0][i]] = {
          symbol: String($vaults[2][i]),
        };
        setSymbols(vaultData);
      }
    }
  };

  const checkButtonApproveDeposit = (apprDepo: number[]) => {
    if (apprDepo.length < 2) {
      return true;
    }
    return apprDepo.every((element) => element === apprDepo[0]);
  };

  const checkInputsAllowance = (input: bigint[]) => {
    const apprDepo = [];
    let change = false;

    for (let i = 0; i < input.length; i++) {
      if (
        $assets &&
        $assetsBalances &&
        input[i] > $assetsBalances[$assets[i]].assetBalance &&
        lastKeyPress.key2 !== ""
      ) {
        setIsApprove(0);
        change = true;
      }
    }
    if (!change) {
      for (let i = 0; i < input.length; i++) {
        if (
          allowance &&
          $assets &&
          $assetsBalances &&
          input[i] <= $assetsBalances[$assets[i]].assetBalance &&
          allowance[$assets[i]]?.allowance[0] >= input[i]
        ) {
          apprDepo.push(1);
        } else if (lastKeyPress.key2) {
          apprDepo.push(2);
        }
      }
      const button = checkButtonApproveDeposit(apprDepo);

      if (button) {
        setIsApprove(apprDepo[1]);
      } else {
        setIsApprove(2);
      }
    }
  };

  const resetInputs = (options: string[]) => {
    const reset: TVaultInput | any = {};

    for (let i = 0; i < options.length; i++) {
      reset[options[i]] = {
        amount: "",
      };
    }
    setInputs(reset);
    setIsApprove(undefined);
  };

  const defaultAssetsOption = (assets: string[]) => {
    const defaultOptionAssets: string[] = [];
    for (let i = 0; i < assets.length; i++) {
      const token = getTokenData(assets[i]);
      if (token) {
        defaultOptionAssets[i] = token.symbol;
      } else {
        defaultOptionAssets[i] = "Token not found.";
      }
    }
    setDefaultOptionSymbols(defaultOptionAssets.join(" + "));
    setDefaultOptionAssets(assets.join(", "));
  };

  const changeOption = (option: string[]) => {
    resetInputs(option);
    setOption(option);
  };

  const handleInputChange = (amount: string, asset: string) => {
    if (!amount) {
      resetInputs(option);
    } else {
      if (tab === "Deposit") {
        setInputs(
          (prevInputs: any) =>
            ({
              ...prevInputs,
              [asset]: {
                amount: amount,
              },
            } as TVaultInput)
        );

        if (option.length > 1) {
          setLastKeyPress({ key1: asset, key2: amount });
        }
      } else {
        const preview: TVaultInput | any = {};
        for (let i = 0; i < option.length; i++) {
          preview[option[i]] = {
            amount: amount as string,
          };
        }
        setInputs(preview);
      }
    }
  };

  const approve = async (asset: TAddress) => {
    if (vault) {
      //const allowanceResult: TVaultAllowance = {};
      const maxUnits = parseUnits(
        inputs[asset].amount,
        getTokenData(asset)?.decimals as number
      );

      const assetApprove = await writeContract({
        address: asset,
        abi: ERC20ABI,
        functionName: "approve",
        args: [vault, maxUnits],
      });

      const transaction = await _publicClient.waitForTransactionReceipt(
        assetApprove
      );

      if (transaction.status === "success") {
        const newAllowance = (await readContract(_publicClient, {
          address: asset,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, vault],
        })) as bigint;

        setAllowance((prevAllowance: any) => ({
          ...prevAllowance,
          [asset]: {
            allowance: [newAllowance],
          },
        }));
      }
    }
  };

  const deposit = async () => {
    let assets: string[] = [];
    let input: bigint[] = [];

    for (let i = 0; i < option.length; i++) {
      assets.push(option[i]);
      input.push(
        parseUnits(inputs[option[i]].amount, tokensJson.tokens[i].decimals)
      );
    }

    const depositAssets = await writeContract({
      address: vault as TAddress,
      abi: VaultABI,
      functionName: "depositAssets",
      args: [$assets as TAddress[], input, sharesOut],
    });
  };

  const withdraw = async () => {
    if (vault) {
      const value = $vault[vault].vaultUserBalance;

      const withdrawAssets = await writeContract({
        address: vault as TAddress,
        abi: VaultABI,
        functionName: "withdrawAssets",
        args: [$assets as TAddress[], value, [0n, 0n]],
      });
    }
  };

  const resetOptions = () => {
    if ($assets) {
      setOption($assets);
      let select = document.getElementById("selectOption") as HTMLSelectElement;
      // todo fix this with ref ^
      if (select) {
        select.value = select.options[0].value;
      }
    }
  };
  const getStrategy = async () => {
    if (vault) {
      const strategy: TAddress | undefined = (await readContract(
        _publicClient,
        {
          address: vault,
          abi: VaultABI,
          functionName: "strategy",
        }
      )) as TAddress | undefined;

      if (typeof strategy === "string") {
        const assetsData: string[] = (await readContract(_publicClient, {
          address: strategy,
          abi: StrategyABI,
          functionName: "assets",
        })) as string[];

        if (Array.isArray(assetsData)) {
          assets.set(assetsData);
          setOption(assetsData);
          defaultAssetsOption(assetsData);
        }
      }
    }
  };

  const loadAssetsBalances = () => {
    const balance: TVaultBalance | any = {};

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
  };

  const checkAllowance = async () => {
    const allowanceResult: TVaultAllowance | any = {};

    for (let i = 0; i < option.length; i++) {
      const allowanceData = (await readContract(_publicClient, {
        address: option[i] as TAddress,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [$account as TAddress, vault as TAddress],
      })) as bigint;

      if (!allowanceResult[option[i]]) {
        allowanceResult[option[i]] = { allowance: [] };
      }
      allowanceResult[option[i]].allowance.push(allowanceData);
    }
    setAllowance(allowanceResult);
  };

  const previewDeposit = async () => {
    if ($assets && lastKeyPress.key1 && tab === "Deposit") {
      const changedInput = $assets?.indexOf(lastKeyPress.key1);
      const preview: TVaultInput | any = {};

      if (option) {
        let amounts: bigint[] = [];
        for (let i = 0; i < option.length; i++) {
          if (i === changedInput) {
            amounts.push(
              parseUnits(
                inputs[lastKeyPress.key1].amount,
                Number(getTokenData(lastKeyPress.key1)?.decimals)
              )
            );
          } else {
            amounts.push(parseUnits("1", 36));
          }
        }

        if (typeof vault === "string") {
          try {
            const previewDepositAssets: (bigint | bigint[] | any)[] =
              (await readContract(_publicClient, {
                address: vault as TAddress,
                abi: VaultABI,
                functionName: "previewDepositAssets",
                args: [$assets as TAddress[], amounts],
              })) as any;

            checkInputsAllowance(previewDepositAssets[0] as bigint[]);
            setSharesOut(
              ((previewDepositAssets[1] as bigint) * BigInt(1)) / BigInt(100)
            );

            const previewDepositAssetsArray: bigint[] = [
              ...previewDepositAssets[0],
            ];

            for (let i = 0; i < $assets.length; i++) {
              const decimals = getTokenData($assets[i])?.decimals;
              if (i !== changedInput && decimals) {
                preview[$assets[i]] = {
                  amount: formatUnits(previewDepositAssetsArray[i], decimals),
                };
              }
            }
            if (lastKeyPress.key2 !== "") {
              setInputs((prevInputs: any) => ({
                ...prevInputs,
                ...preview,
              }));
            }
          } catch (error) {
            console.error(
              "Error: the asset balance is too low to convert.",
              error
            );
            setIsApprove(undefined);
          }
        }
      }
    }
  };

  useEffect(() => {
    getStrategy();
  }, [vault]);

  useEffect(() => {
    checkAllowance();
    loadAssetsBalances();
  }, [option, $assetsBalances]);

  useEffect(() => {
    previewDeposit();
  }, [lastKeyPress]);

  return vault && $vault[vault] ? (
    <main className="w-full p-0 m-0 mx-auto">
      <table className="m-auto w-full my-4 ring-purple-950 hover:ring-1 shadow-sm rounded-xl">
        <tbody>
          <tr className="rounded-xl p-3 grid border-purple-950 border text-2xl ">
            <td>Vault: {vault}</td>
            <td>TVL: {formatUnits($vault[vault].vaultSharePrice, 18)}</td>
            <td>
              User Balance: {formatUnits($vault[vault].vaultUserBalance, 18)}
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
            }}
          >
            Deposit
          </button>
          <button
            className={`rounded-t-xl h-[65px] cursor-pointer border-l-2 border-t-2 border-r-2  text-3xl w-full hover:bg-purple-950  ${
              tab === "Withdraw"
                ? "bg-purple-950 border-purple-600"
                : "bg-black-400 text-gray-500 border-gray-600 "
            }`}
            onClick={() => {
              setTab("Withdraw");
              resetOptions();
              resetInputs(option);
              loadSymbols();
            }}
          >
            Withdraw
          </button>
        </div>
        <form className="w-[400px] m-auto grid mb-10">
          <div className="my-4 m-auto grid">
            <label className="text-gray-600 text-2xl py-2">Select token</label>
            <select
              className="w-[280px] rounded-xl bg-gradient-to-r from-purple-700 to-purple-950 text-2xl h-[50px] focus:outline-0 cursor-pointer"
              id="selectOption"
              onChange={(e) => changeOption(e.target.value.split(", "))}
            >
              <option
                className="bg-gray-600 text-center"
                value={defaultOptionAssets}
              >
                {defaultOptionSymbols}
              </option>
              {tokensJson.tokens &&
                tokensJson.tokens.slice(0, -2).map((token) => {
                  return (
                    <option
                      className="bg-gray-600 text-center"
                      key={token.address}
                      value={token.address}
                    >
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
                  {option.map((asset: any) => (
                    <div
                      className="rounded-xl grid relative h-[150px] border border-gray-600 mb-3 ps-2"
                      key={asset}
                    >
                      <div className="absolute end-5 bottom-4">
                        <div className="flex items-center">
                          <div className="text-gray-500 me-2">
                            Balance:{" "}
                            {balances &&
                              balances[asset] &&
                              parseFloat(balances[asset].assetBalance).toFixed(
                                3
                              )}
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
                            }
                          >
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
                        value={inputs && inputs[asset] && inputs[asset].amount}
                        onChange={(e) =>
                          handleInputChange(e.target.value, e.target.id)
                        }
                        type="text"
                        onKeyDown={(evt) =>
                          ["e", "E", "+", "-", " ", ","].includes(evt.key) &&
                          evt.preventDefault()
                        }
                      />
                      <div className="absolute end-5 top-8 bg-[#4e46e521] rounded-xl p-2">
                        {tokensJson.tokens.map((token) => {
                          if (token.address === asset) {
                            return (
                              <div className="flex" key={token.address}>
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
                <div className="flex mt-[15px] text-[15px] w-full">
                  <div className="rounded-xl grid relative h-[150px] border-[1px] border-[gray] my-[7px] pl-[10px]">
                    {balances && balances[option[0]] && (
                      <div className="my-[5px]">
                        <div className="absolute right-0 bottom-0 pt-[15px] pl-[15px] pr-3 pb-3">
                          <div className="flex items-center">
                            <div className="text-left text-[gray]">
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
                              className="rounded-md w-12 text-[gray] border-[1px] ml-[5px] border-[gray]"
                              type="button"
                            >
                              max
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {option && (
                      <input
                        list="amount"
                        id={option[0]}
                        value={
                          inputs &&
                          inputs[option[0]] &&
                          inputs[option[0]].amount
                        }
                        name="amount"
                        type="text"
                        placeholder="0"
                        onChange={(e) =>
                          handleInputChange(e.target.value, e.target.id)
                        }
                        onKeyDown={(evt) =>
                          ["e", "E", "+", "-", " ", ","].includes(evt.key) &&
                          evt.preventDefault()
                        }
                        className="w-[60%] h-10 text-[30px] text-[#fff] mb-[15px] pl-[15px]"
                      />
                    )}
                    <div className="absolute top-[32%] right-[13px]">
                      {tokensJson.tokens.map((token) => {
                        if (token.address === option[0]) {
                          return (
                            <div
                              className="flex items-center"
                              key={token.address}
                            >
                              <p>{token.symbol}</p>
                              <img
                                className="w-10 h-10 rounded-[50%] ml-2"
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
              {isApprove === 1 ? (
                <button
                  className="rounded-xl w-full flex text-gray-400 border-gray-400 border h-[60px] text-3xl items-center justify-center"
                  type="button"
                  onClick={() => deposit()}
                >
                  Deposit
                </button>
              ) : isApprove === 2 ? (
                <>
                  {option.map((asset: any) =>
                    allowance &&
                    formatUnits(
                      allowance[asset].allowance[0],
                      Number(getTokenData(asset)?.decimals)
                    ) < inputs[asset].amount ? (
                      <button
                        className="rounded-xl w-full flex text-gray-400 border-gray-400 border h-[60px] text-3xl items-center justify-center"
                        key={asset}
                        type="button"
                        onClick={() => approve(asset as TAddress)}
                      >
                        Approve {getTokenData(asset)?.symbol}
                      </button>
                    ) : (
                      <></>
                    )
                  )}
                </>
              ) : (
                !isApprove && (
                  <button
                    disabled
                    className="rounded-xl w-full flex text-gray-600 border-gray-600 border h-[60px] text-3xl items-center justify-center"
                  >
                    INSUFICCIENT BALANCE
                  </button>
                )
              )}
            </>
          )}

          {tab === "Withdraw" && (
            <>
              <div className="grid mt-[15px] text-[15px] w-full">
                <div className="rounded-xl grid relative h-[150px] border-[1px] border-[gray] my-[7px] pl-[10px]">
                  {balances && balances[option[0]] && (
                    <div className="my-[5px]">
                      <div className="absolute right-0 bottom-0 pt-[15px] pl-[15px] pb-3 pr-3">
                        <div className="flex items-center">
                          <div className="text-left text-[gray]">
                            Balance:{" "}
                            {parseFloat(
                              formatUnits($vault[vault].vaultUserBalance, 18)
                            ).toFixed(3)}
                          </div>
                          <button
                            onClick={() =>
                              handleInputChange(
                                formatUnits(
                                  $vault[vault]?.vaultUserBalance,
                                  18
                                ),
                                option[0]
                              )
                            }
                            type="button"
                            className="text-[gray] border-[1px] ml-[5px] border-[gray] rounded-md w-12"
                          >
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
                      inputs && inputs[option[0]] && inputs[option[0]].amount
                    }
                    name="amount"
                    placeholder="0"
                    onChange={(e) =>
                      handleInputChange(e.target.value, e.target.id)
                    }
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", " ", ","].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    inputMode="decimal"
                    className="w-[60%] h-10 text-[30px] mb-[15px] pl-[15px]"
                  />

                  <div className="absolute top-[32%] right-[13px]">
                    {option.length === 1 ? (
                      <>
                        {tokensJson.tokens.map((token) => {
                          if (token.address === option[0]) {
                            return (
                              <div
                                className="flex items-center"
                                key={token.address}
                              >
                                <p>{token.symbol}</p>
                                <img
                                  className="w-10 h-10 rounded-[50%] ml-2"
                                  src={token.logoURI}
                                  alt={token.name}
                                />
                              </div>
                            );
                          }
                        })}
                      </>
                    ) : (
                      <div className="flex h-[45px]">
                        <div className="items-center mr-[5px]">
                          <p>
                            {symbols &&
                              vault &&
                              symbols[vault] &&
                              symbols[vault]?.symbol}
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
              inputs[option[0]].amount !== "" &&
              $vault[vault]?.vaultUserBalance !== undefined &&
              Number(inputs[option[0]].amount) <=
                Number(formatUnits($vault[vault]?.vaultUserBalance, 18)) ? (
                <button
                  type="button"
                  className="text-[35px] w-full h-[60px] cursor-pointer border-[1px] rounded-xl"
                  onClick={() => withdraw()}
                >
                  WITHDRAW
                </button>
              ) : Number(inputs[option[0]]?.amount) >
                Number(formatUnits($vault[vault]?.vaultUserBalance, 18)) ? (
                <div className="rounded-xl flex text-[gray] border-[1px] w-[367px] items-center justify-center h-[60px] text-[25px]">
                  INSUFICCIENT BALANCE
                </div>
              ) : null}
            </>
          )}
        </form>

        <section className="p-7 border-t border-gray-600 text-2xl text-gray-500">
          <div className="flex items-center">
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
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M12.802 2.165l5.575 2.389c.48 .206 .863 .589 1.07 1.07l2.388 5.574c.22 .512 .22 1.092 0 1.604l-2.389 5.575c-.206 .48 -.589 .863 -1.07 1.07l-5.574 2.388c-.512 .22 -1.092 .22 -1.604 0l-5.575 -2.389a2.036 2.036 0 0 1 -1.07 -1.07l-2.388 -5.574a2.036 2.036 0 0 1 0 -1.604l2.389 -5.575c.206 -.48 .589 -.863 1.07 -1.07l5.574 -2.388a2.036 2.036 0 0 1 1.604 0z"></path>
              <path d="M12 16v.01"></path>
              <path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"></path>
            </svg>
          </div>

          <div className="flex items-center">
            <p>WITHDRAWAL FEE</p>

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
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
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
          $assets.map((asset) => {
            const assetData: TToken | undefined = getTokenData(asset);

            if (assetData && $assetsPrices) {
              return (
                <article
                  className="rounded-xl p-5 border border-[#620c9f85] mb-4 flex"
                  key={asset}
                >
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
                      href={`https://polygonscan.com/token/${asset}`}
                    >
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
                        strokeLinejoin="round"
                      >
                        <path
                          stroke="none"
                          d="M0 0h24v24H0z"
                          fill="none"
                        ></path>
                        <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                        <path d="M11 13l9 -9"></path>
                        <path d="M15 4h5v5"></path>
                      </svg>
                    </a>
                  </div>
                </article>
              );
            }
          })}
      </article>
    </main>
  ) : (
    <h1>Loading Vault..</h1>
  );
}
export { Vault };
