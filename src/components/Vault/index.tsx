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
  vaultAssets,
} from "@store";

import { VaultABI, StrategyABI, ERC20ABI } from "@web3";
import {
  getTokenData,
  formatNumber,
  formatFromBigInt,
  calculateAPY,
  getTimeDifference,
} from "@utils";

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
  const $vaultData = useStore(vaultData);
  const $assets = useStore(assets);
  const $account = useStore(account);
  const $vaults = useStore(vaults);
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);
  const $vaultAssets: any = useStore(vaultAssets);

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

  const [localVault, setLocalVault] = useState<any>();
  const [timeDifference, setTimeDifference] = useState<any>();

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
    let input: any = [];

    for (let i = 0; i < option.length; i++) {
      assets.push(option[i]);

      const token: any = getTokenData(option[i]);

      input.push(parseUnits(inputs[option[i]].amount, token.decimals));
    }

    const depositAssets = await writeContract({
      address: vault as TAddress,
      abi: VaultABI,
      functionName: "depositAssets",
      args: [$assets as TAddress[], input, sharesOut, $account as TAddress],
    });
  };

  const withdraw = async () => {
    if (vault) {
      const value = $vaultData[vault].vaultUserBalance;

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

  useEffect(() => {
    if ($vaults?.length && $vaultData) {
      const vaultUserBalances = Object.values($vaultData).map(
        ({ vaultUserBalance }) => String(vaultUserBalance)
      );
      const vaults = $vaults[0].map((_: any, index: number) => {
        let assets;
        if ($vaultAssets.length) {
          const token1 = getTokenData($vaultAssets[index][1][0]);
          const token2 = getTokenData($vaultAssets[index][1][1]);

          assets = [
            {
              logo: token1?.logoURI,
              symbol: token1?.symbol,
              name: token1?.name,
            },
            {
              logo: token2?.logoURI,
              symbol: token2?.symbol,
              name: token2?.name,
            },
          ];
        }

        const tempAPR = formatFromBigInt(
          String($vaults[7][index]),
          16,
          "withDecimals"
        ).toFixed(2);
        const APY = calculateAPY(tempAPR).toFixed(2);

        return {
          name: $vaults[1][index],
          assets: assets,
          symbol: $vaults[2][index],
          address: $vaults[0][index],
          balance: vaultUserBalances[index],
          tvl: String($vaults[6][index]),
          lastHardWork: $vaultAssets[index][5],
          apr: String($vaults[7][index]),
          apy: APY,
          daily: Number(tempAPR) / 365,
        };
      });

      setLocalVault(
        vaults.filter((thisVault: any) => thisVault.address === vault)[0]
      );
    }
  }, [$vaults, $vaultData, $vaultAssets]);

  useEffect(() => {
    if (localVault) {
      const TD = getTimeDifference(localVault.lastHardWork);
      setTimeDifference(TD);
    }
  }, [localVault]);

  return vault && $vaultData[vault] ? (
    <main className="w-full mx-auto">
      <div className="flex justify-between items-center p-5 bg-button  rounded-md  border-[2px] border-[#6376AF]">
        {localVault && (
          <div className="flex items-center gap-4">
            <div className="flex">
              <img
                className="w-8 h-8 rounded-full"
                src={localVault?.assets[0].logo}
                alt={localVault?.assets[0].symbol}
                title={localVault?.assets[0].name}
              />
              <img
                className="w-8 h-8 rounded-full ml-[-8px]"
                src={localVault?.assets[1].logo}
                alt={localVault?.assets[1].symbol}
                title={localVault?.assets[1].name}
              />
            </div>

            <p className="flex flex-col items-start">
              <span className="text-[20px]">{localVault.name}</span>

              <span className="text-[16px]">{localVault.symbol}</span>
            </p>
          </div>
        )}

        <p className="bg-[#485069] text-[#B4BFDF] border-[#6376AF] p-2 rounded-md text-[16px] ">
          CHAIN: {_publicClient.chain.name}
        </p>
      </div>
      <div className="flex items-start gap-5 mt-6">
        <div className="w-2/3">
          {localVault && (
            <div className="flex justify-between items-center bg-button p-5 rounded-md border-[2px] border-[#6376AF] h-[80px]">
              <div>
                <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                  TVL
                </p>
                <p>
                  {" "}
                  {formatNumber(
                    formatFromBigInt(localVault.tvl, 18, "withFloor"),
                    "abbreviate"
                  )}
                </p>
              </div>
              <div>
                <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                  APY
                </p>
                <p>{localVault.apy}</p>
              </div>
              <div>
                <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                  Daily
                </p>
                <p>{localVault.daily}</p>
              </div>
            </div>
          )}

          <article className="rounded-md p-7 border-[2px] border-[#6376AF] mt-5 bg-button">
            <h2 className="mb-7 text-[24px] text-start">Strategy assets</h2>
            {$assets &&
              $assets.map((asset) => {
                const assetData: TToken | undefined = getTokenData(asset);

                if (assetData && $assetsPrices) {
                  return (
                    <article
                      className="rounded-md p-2 border-[2px] border-[#6376AF] mb-4 flex bg-[#13141f]"
                      key={asset}
                    >
                      <div className="flex items-center w-full gap-3">
                        <div className="grid w-[125px] text-center">
                          <h4 className="pb-3 text-[18px]">{assetData.name}</h4>
                          <img
                            className="rounded-full w-[35px] m-auto"
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

                      <div className="rounded-md bg-button flex justify-center ms-auto w-[140px] p-1 h-10">
                        <a
                          className="flex items-center"
                          href={`https://polygonscan.com/token/${asset}`}
                        >
                          Contract
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
        </div>
        <div className="w-1/3">
          {localVault && (
            <div className="flex justify-between items-center bg-button p-5 rounded-md border-[2px] border-[#6376AF] h-[80px]">
              <div className="flex flex-col gap-2">
                <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                  User Balance
                </p>
                <p className="text-[18px]">
                  $
                  {formatNumber(
                    formatFromBigInt(localVault.balance, 18),
                    "format"
                  )}
                </p>
              </div>
              <div>
                {" "}
                {timeDifference && (
                  <div className="flex flex-col gap-2">
                    <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                      Last Hard Work
                    </p>
                    {timeDifference?.days ? (
                      <div className="text-[14px] bg-[#6F5648] text-[#F2C4A0] px-2 py-1 rounded-lg border-[2px] border-[#AE642E]">
                        {timeDifference.days}
                        {timeDifference.days > 1 ? "days" : "day"}{" "}
                        {timeDifference.hours}h ago
                      </div>
                    ) : (
                      <div
                        className={`text-[14px] px-2 py-1 rounded-lg border-[2px]  ${
                          timeDifference.hours > 4
                            ? "bg-[#485069] text-[#B4BFDF] border-[#6376AF]"
                            : "bg-[#486556] text-[#B0DDB8] border-[#488B57]"
                        }`}
                      >
                        {timeDifference.hours}h ago
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-5 bg-button rounded-md border-[2px] border-[#6376AF]">
            <div className="flex">
              <button
                className={`h-[55px] cursor-pointer text-[16px] w-full rounded-tl-md  bg-[#13141f] ${
                  tab === "Deposit" && "border-b-[2px] border-[#6376AF]"
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
                className={`h-[55px] cursor-pointer text-[16px] w-full rounded-tr-md  bg-[#13141f]  ${
                  tab === "Withdraw" && "border-b-[2px] border-[#6376AF]"
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
            <form className="max-w-[400px] px-4 mb-10">
              <div className="flex flex-col items-start">
                <label className=" text-[18px] py-2">Select token</label>
                <select
                  className="rounded-sm px-3 py-2 bg-[#13141f]  text-[20px] cursor-pointer"
                  id="selectOption"
                  onChange={(e) => changeOption(e.target.value.split(", "))}
                >
                  <option
                    className="bg-button text-center"
                    value={defaultOptionAssets}
                  >
                    {defaultOptionSymbols}
                  </option>
                  {tokensJson.tokens &&
                    tokensJson.tokens.slice(0, -2).map((token) => {
                      return (
                        <option
                          className="bg-button text-center "
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
                    <div className="flex flex-col items-center justify-center gap-3 mt-2 max-w-[350px]">
                      {option.map((asset: any) => (
                        <div key={asset}>
                          <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                            <p>Balance:</p>
                            <p>
                              {balances &&
                                balances[asset] &&
                                parseFloat(
                                  balances[asset].assetBalance
                                ).toFixed(3)}
                            </p>
                          </div>
                          <div className="rounded-xl  relative max-h-[150px] border-[2px] border-[#6376AF] max-w-[350px]">
                            <div className="absolute end-5 bottom-4">
                              <div className="flex items-center">
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
                                  MAX
                                </button>
                              </div>
                            </div>

                            <input
                              className="w-[58%] pl-[50px] py-3 flex items-center h-full  text-[25px] bg-transparent"
                              list="amount"
                              id={asset}
                              name="amount"
                              placeholder="0"
                              value={
                                inputs && inputs[asset] && inputs[asset].amount
                              }
                              onChange={(e) =>
                                handleInputChange(e.target.value, e.target.id)
                              }
                              type="text"
                              onKeyDown={(evt) =>
                                ["e", "E", "+", "-", " ", ","].includes(
                                  evt.key
                                ) && evt.preventDefault()
                              }
                            />
                            <div className="absolute top-[25%] left-[5%]  bg-[#4e46e521] rounded-xl ">
                              {tokensJson.tokens.map((token) => {
                                if (token.address === asset) {
                                  return (
                                    <div
                                      className="flex items-center gap-2"
                                      key={token.address}
                                    >
                                      {/* <p className="my-auto">{token.symbol}</p> */}
                                      <img
                                        className="rounded-full w-[25px] h-[25px] "
                                        src={token.logoURI}
                                        alt={token.name}
                                      />
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col mt-[15px] text-[15px] w-full">
                      {balances && balances[option[0]] && (
                        <div className="text-left text-[gray] ml-2">
                          Balance:{" "}
                          {parseFloat(balances[option[0]].assetBalance).toFixed(
                            3
                          )}
                        </div>
                      )}

                      <div className="rounded-xl  relative max-h-[150px] border-[2px] border-[#6376AF] max-w-[350px]">
                        <div className="absolute top-[35%] left-[5%]">
                          {tokensJson.tokens.map((token) => {
                            if (token.address === option[0]) {
                              return (
                                <div
                                  className="flex items-center"
                                  key={token.address}
                                >
                                  {/* <p>{token.symbol}</p> */}
                                  <img
                                    className="w-[25px] h-[25px] rounded-full"
                                    src={token.logoURI}
                                    alt={token.name}
                                  />
                                </div>
                              );
                            }
                          })}
                        </div>
                        {balances && balances[option[0]] && (
                          <div>
                            <div className="absolute right-0 bottom-0 pt-[15px] pl-[15px] pr-3 pb-3">
                              <div className="flex items-center">
                                <button
                                  onClick={() =>
                                    handleInputChange(
                                      balances[option[0]].assetBalance,
                                      option[0]
                                    )
                                  }
                                  className="rounded-md w-14 border border-gray-500 ring-gray-500 hover:ring-1 text-gray-500 text-lg"
                                  type="button"
                                >
                                  MAX
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
                              ["e", "E", "+", "-", " ", ","].includes(
                                evt.key
                              ) && evt.preventDefault()
                            }
                            className="w-[58%] pl-[50px] py-3 flex items-center h-full  text-[25px] bg-transparent"
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {isApprove === 1 ? (
                    <button
                      className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
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
                            className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
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
                    isApprove === 0 && (
                      <button
                        disabled
                        className="mt-2 w-full flex items-center justify-center bg-[#6F5648] text-[#F2C4A0] border-[#AE642E] py-3 rounded-md"
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
                    {balances && balances[option[0]] && (
                      <div className="text-left text-[gray] ml-2">
                        Balance:{" "}
                        {parseFloat(
                          formatUnits($vaultData[vault].vaultUserBalance, 18)
                        ).toFixed(3)}
                      </div>
                    )}
                    <div className="rounded-xl  relative max-h-[150px] border-[2px] border-[#6376AF] max-w-[350px]">
                      {balances && balances[option[0]] && (
                        <div className="absolute right-0 bottom-0 pt-[15px] pl-[15px] pb-3 pr-3">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                handleInputChange(
                                  formatUnits(
                                    $vaultData[vault]?.vaultUserBalance,
                                    18
                                  ),
                                  option[0]
                                )
                              }
                              type="button"
                              className="rounded-md w-14 border border-gray-500 ring-gray-500 hover:ring-1 text-gray-500 text-lg"
                            >
                              MAX
                            </button>
                          </div>
                        </div>
                      )}

                      <input
                        list="amount"
                        id={option.join(", ")}
                        value={
                          inputs &&
                          inputs[option[0]] &&
                          inputs[option[0]].amount
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
                        className="w-[58%] pl-[50px] py-3 flex items-center h-full  text-[25px] bg-transparent"
                      />

                      <div className="absolute top-[30%] left-[5%]">
                        {option.length === 1 ? (
                          <>
                            {tokensJson.tokens.map((token) => {
                              if (token.address === option[0]) {
                                return (
                                  <div
                                    className="flex items-center"
                                    key={token.address}
                                  >
                                    {/* <p>{token.symbol}</p>  */}
                                    <img
                                      className="w-[25px] h-[25px] rounded-full"
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
                              {/* <p>
                                {symbols &&
                                  vault &&
                                  symbols[vault] &&
                                  symbols[vault]?.symbol}
                              </p> */}
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
                  $vaultData[vault]?.vaultUserBalance !== undefined &&
                  Number(inputs[option[0]].amount) <=
                    Number(
                      formatUnits($vaultData[vault]?.vaultUserBalance, 18)
                    ) ? (
                    <button
                      type="button"
                      className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
                      onClick={() => withdraw()}
                    >
                      WITHDRAW
                    </button>
                  ) : (
                    Number(inputs[option[0]]?.amount) >
                      Number(
                        formatUnits($vaultData[vault]?.vaultUserBalance, 18)
                      ) && (
                      <button
                        disabled
                        className="mt-2 w-full flex items-center justify-center bg-[#6F5648] text-[#F2C4A0] border-[#AE642E] py-3 rounded-md"
                      >
                        INSUFICCIENT BALANCE
                      </button>
                    )
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  ) : (
    <h1>Loading Vault..</h1>
  );
}
export { Vault };
