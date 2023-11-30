import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits, parseUnits } from "viem";
import { readContract } from "viem/actions";
import { writeContract } from "@wagmi/core";
import axios from "axios";

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
  platformData,
} from "@store";

import { VaultABI, StrategyABI, ERC20ABI, ZapABI } from "@web3";
import {
  getTokenData,
  formatNumber,
  formatFromBigInt,
  calculateAPY,
  getTimeDifference,
  getStrategyInfo,
} from "@utils";

import type {
  TToken,
  TAddress,
  TVaultsAddress,
  TVaultAllowance,
  TVaultInput,
  TVaultBalance,
  TTokenData,
  TPlatformData,
} from "@types";

import { TOKENS_ASSETS } from "@constants";

import tokensJson from "../../stability.tokenlist.json";

interface IProps {
  vault?: TAddress | undefined;
}

function Vault({ vault }: IProps) {
  const $vaultData = useStore(vaultData);
  const $assets: any = useStore(assets);
  const $account = useStore(account);
  const $vaults = useStore(vaults);
  const $assetsPrices: any = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);
  const $vaultAssets: any = useStore(vaultAssets);
  const $platformData: TPlatformData | any = useStore(platformData);

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
  const [strategyAddress, setStrategyAddress] = useState<
    TAddress | undefined
  >();
  const [strategyDescription, setStrategyDescription] = useState<
    string | undefined
  >();
  const [assetsAPR, setAssetsAPR] = useState<any>();
  const [withdrawAmount, setWithdrawAmount] = useState<string[] | any>(false);
  const [zapButton, setZapButton] = useState<string>("none");

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
      return;
    }
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
  };

  /////         ZAP
  const zapInputHandler = async (amount: string, asset: string) => {
    setInputs(
      (prevInputs: any) =>
        ({
          ...prevInputs,
          [asset]: {
            amount: amount,
          },
        } as TVaultInput)
    );
    if (!Number(amount)) {
      setZapButton("none");
      return;
    }

    if (Number(amount) > Number(balances[asset]?.assetBalance)) {
      setZapButton("insuficcientBalance");
      return;
    }
    try {
      const decimals = Number(getTokenData(option[0])?.decimals);

      const allowanceData = (await readContract(_publicClient, {
        address: option[0] as TAddress,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [$account as TAddress, $platformData.zap as TAddress],
      })) as bigint;

      if (Number(formatUnits(allowanceData, decimals)) < Number(amount)) {
        setZapButton("needApprove");
      } else {
        getZapDepositSwapAmounts();
      }
    } catch (error) {
      console.log("ZAP ERROR:", error);
    }
  };
  const zapApprove = async () => {
    const amount = inputs[option[0]]?.amount;
    const decimals = getTokenData(option[0])?.decimals;

    if (amount && decimals) {
      try {
        const assetApprove = await writeContract({
          address: option[0],
          abi: ERC20ABI,
          functionName: "approve",
          args: [$platformData.zap as TAddress, parseUnits(amount, decimals)],
        });
      } catch (error) {
        console.log("APPROVE ERROR:", error);
      }
    }
  };
  const get1InchTokensSwap = async () => {
    const url = "https://api.1inch.dev/swap/v5.2/137/swap";

    const config = {
      headers: {
        Authorization: process.env.INCH_APY_KEY,
      },
      params: {
        src: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        dst: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        amount: "100000",
        from: "0xF2Bc8850E4a0e35bc039C0a06fe3cD941a75dB56",
        slippage: "1",
        disableEstimate: "true",
      },
    };

    try {
      const response = await axios.get(url, config);
    } catch (error) {
      console.log(error);
    }
  };
  const getZapDepositSwapAmounts = async () => {
    const amount = inputs[option[0]]?.amount;
    const decimals = Number(getTokenData(option[0])?.decimals);

    const zapAmounts = await readContract(_publicClient, {
      address: $platformData.zap,
      abi: ZapABI,
      functionName: "getDepositSwapAmounts",
      args: [vault as TAddress, option[0], parseUnits(amount, decimals)],
    });
    await get1InchTokensSwap();
  };

  /////

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
        previewDeposit();
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
    const value = parseUnits(inputs[option[0]]?.amount, 18);
    if (value) {
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
        setStrategyAddress(strategy);
        const assetsData: string[] = (await readContract(_publicClient, {
          address: strategy,
          abi: StrategyABI,
          functionName: "assets",
        })) as string[];

        const description = await readContract(_publicClient, {
          address: strategy,
          abi: StrategyABI,
          functionName: "description",
        });
        if (description) {
          setStrategyDescription(description);
        }

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
    } else if (
      $assetsBalances &&
      $assetsBalances[option[0]] &&
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
    setBalances(balance);
  };

  const previewWithdraw = async (value: string) => {
    const balance = Number(
      formatUnits($vaultData[vault as TAddress].vaultUserBalance, 18)
    );

    if (Number(value) > balance || !Number(value)) {
      setWithdrawAmount(false);
      return;
    }

    let preview: any = await readContract(_publicClient, {
      address: localVault.address as TAddress,
      abi: VaultABI,
      functionName: "previewWithdraw",
      args: [parseUnits(value, 18)],
    });
    preview = preview.map((amount: any, index: number) => {
      const tokenData: TTokenData | any = getTokenData($assets[index]);
      return {
        symbol: tokenData?.symbol,
        amount: formatUnits(amount, tokenData?.decimals),
      };
    });
    setWithdrawAmount(preview);
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
    //if (!Number(lastKeyPress.key2)) return;
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
          address: $vaults[0][index],
          name: $vaults[1][index],
          symbol: $vaults[2][index],
          assetsWithApr: $vaultAssets[index][3],
          assetsAprs: $vaultAssets[index][4],
          lastHardWork: $vaultAssets[index][5],
          tvl: String($vaults[6][index]),
          apr: String($vaults[7][index]),
          strategyApr: $vaults[8][index],
          strategySpecific: $vaults[9][index],
          apy: APY,
          balance: vaultUserBalances[index],
          daily: Number(tempAPR) / 365,
          assets: assets,
          strategyInfo: getStrategyInfo($vaults[2][index]),
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

      setAssetsAPR(
        localVault.assetsAprs.map((apr: string) =>
          formatFromBigInt(apr, 16).toFixed(2)
        )
      );
    }
  }, [localVault]);

  useEffect(() => {
    setZapButton("none");
  }, [option]);

  return vault && $vaultData[vault] ? (
    <main className="w-full mx-auto">
      <div className="flex justify-between items-center p-4 bg-button rounded-md">
        {localVault && (
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-4 w-full justify-between flex-wrap">
              <div className="flex  items-center">
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

                <span className="inline-flex ml-2 text-[18px] font-bold whitespace-nowrap">
                  {localVault.symbol}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-[18px] lg:text-[20px]">
                  {localVault.name}
                </span>
              </div>

              <p className="bg-[#485069] text-[#B4BFDF] px-2 py-1 rounded-md text-[15px]">
                CHAIN: {_publicClient.chain.name}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-start gap-5 mt-6">
        <div className="w-2/3">
          {localVault && (
            <div className="flex justify-between items-center bg-button p-5 rounded-md h-[80px]">
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

          {localVault?.strategyInfo && (
            <div className="rounded-md mt-5 bg-button">
              <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px]">
                <h2 className=" text-[24px] text-start ml-3">Strategy</h2>
                <div className="flex items-center gap-5 mr-3 ">
                  <button className="rounded-md bg-button flex justify-center items-center w-[140px]">
                    <a
                      className="flex items-center text-[15px] py-2 px-1"
                      href={`https://polygonscan.com/token/${strategyAddress}`}
                    >
                      Strategy address
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-external-link ms-1"
                        width="16"
                        height="16"
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
                  </button>
                  <button className="rounded-md bg-button flex justify-center items-center  w-[140px]">
                    <a
                      className="flex items-center text-[15px] py-2 px-1"
                      href={`https://polygonscan.com/token/${localVault.address}`}
                    >
                      Vault address
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-external-link ms-1"
                        width="16"
                        height="16"
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
                  </button>
                  <button className="rounded-md bg-button justify-center items-center w-[140px] hidden">
                    <a
                      className="flex items-center text-[15px] py-2 px-1"
                      href={localVault.strategyInfo.sourceCode}
                    >
                      Github
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-external-link ms-1"
                        width="16"
                        height="16"
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
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 p-3">
                <div>
                  <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                    NAME
                  </p>
                  <p>{localVault.strategyInfo.name}</p>
                </div>
                <div>
                  <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                    SPECIFIC
                  </p>
                  <p>{localVault.strategySpecific}</p>
                </div>
                {strategyDescription && (
                  <div>
                    <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                      DESCRIPTION
                    </p>
                    <p>{strategyDescription}</p>
                  </div>
                )}
                <div>
                  <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                    Total APR
                  </p>
                  <p>
                    {localVault.apr}% {localVault.apy}% APY
                  </p>
                </div>
                <div>
                  <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                    Strategy APR
                  </p>
                  <p>
                    {formatFromBigInt(localVault.strategyApr, 16).toFixed(2)}%
                  </p>
                </div>

                <div>
                  {assetsAPR && (
                    <div className="flex items-center gap-3 flex-wrap mt-2">
                      {assetsAPR.map((apr: string, index: number) => {
                        return (
                          <p
                            key={apr}
                            className="text-[14px] px-2 py-1 rounded-lg border-[2px] bg-[#486556] text-[#B0DDB8] border-[#488B57]"
                          >
                            {localVault.assetsWithApr[index]} APR {apr}%
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                    BASE STRATEGIES
                  </p>
                  <div className="flex items-center gap-3 flex-wrap mt-3">
                    {localVault.strategyInfo.baseStrategies.map(
                      (strategy: string) => (
                        <p
                          className="text-[14px] px-2  rounded-lg border-[2px] bg-[#486556] border-[#488B57]"
                          key={strategy}
                        >
                          {strategy}
                        </p>
                      )
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                    AMM ADAPTER
                  </p>
                  <p>{localVault.strategyInfo.ammAdapter}</p>
                </div>
              </div>
            </div>
          )}

          <article className="rounded-md p-3 mt-5 bg-button">
            <h2 className="mb-2 text-[24px] text-start">Assets</h2>
            {$assets &&
              $assets.map((asset: TAddress) => {
                const assetData: TToken | any = getTokenData(asset);

                const tokenAssets = TOKENS_ASSETS.find((tokenAsset) => {
                  return tokenAsset.addresses.includes(assetData?.address);
                });

                if (assetData && $assetsPrices) {
                  return (
                    <article
                      className="rounded-md p-3 mb-4 flex bg-[#32343f]"
                      key={asset}
                    >
                      <div className="flex w-full flex-col gap-3">
                        <div className="flex w-full justify-between items-center ">
                          <div className="inline-flex items-center">
                            <img
                              className="rounded-full w-[30px] m-auto mr-2"
                              src={assetData.logoURI}
                            />
                            <span className="mr-5 font-bold text-[18px]">
                              {assetData.symbol}
                            </span>
                            <span className="text-[18px]">
                              {assetData.name}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            {tokenAssets?.website && (
                              <div className="rounded-md bg-[#404353] flex justify-center p-1 h-8 text-[16px]">
                                <a
                                  className="flex items-center"
                                  href={tokenAssets?.website}
                                >
                                  Website
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-external-link ms-1"
                                    width="20"
                                    height="20"
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
                            )}
                            <div className="rounded-md bg-[#404353] flex justify-center p-1 h-8 text-[16px]">
                              <a
                                className="flex items-center"
                                href={`https://polygonscan.com/token/${asset}`}
                              >
                                Contract
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="icon icon-tabler icon-tabler-external-link ms-1"
                                  width="20"
                                  height="20"
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
                            {tokenAssets?.docs && (
                              <div className="rounded-md bg-[#404353] flex justify-center p-1 h-8 text-[16px]">
                                <a
                                  className="flex items-center"
                                  href={tokenAssets?.docs}
                                >
                                  Docs
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="icon icon-tabler icon-tabler-external-link ms-1"
                                    width="20"
                                    height="20"
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
                            )}
                          </div>
                        </div>

                        <div className="flex justify-start items-center text-[15px]">
                          <p>
                            Price: $
                            {formatUnits($assetsPrices[asset].tokenPrice, 18)}
                          </p>
                        </div>

                        <p className="text-[18px]">
                          {tokenAssets?.description}
                        </p>
                        {assetData?.tags && (
                          <div className="flex items-center gap-3 flex-wrap">
                            {assetData.tags.map((tag: string) => (
                              <p
                                className="text-[14px] px-2  rounded-lg border-[2px] bg-[#486556] border-[#488B57] uppercase"
                                key={tag}
                              >
                                {tag}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                }
              })}
          </article>
        </div>
        <div className="w-1/3">
          {localVault && (
            <div className="flex justify-between items-center bg-button p-5 rounded-md h-[80px]">
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
                {timeDifference && (
                  <div className="flex flex-col gap-2">
                    <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                      Last Hard Work
                    </p>
                    {timeDifference?.days ? (
                      <>
                        {timeDifference?.days < 1000 ? (
                          <div className="text-[14px] bg-[#6F5648] text-[#F2C4A0] px-2 py-1 rounded-lg border-[2px] border-[#AE642E] text-center">
                            {timeDifference.days}
                            {timeDifference.days > 1 ? "days" : "day"}{" "}
                            {timeDifference.hours}h ago
                          </div>
                        ) : (
                          <div className="text-[14px] bg-[#6F5648] text-[#F2C4A0] px-2 py-1 rounded-lg border-[2px] border-[#AE642E] text-center">
                            None
                          </div>
                        )}
                      </>
                    ) : (
                      <div
                        className={`text-[14px] px-2 py-1 rounded-lg border-[2px] text-center  ${
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

          <div className="mt-5 bg-button rounded-md">
            <div className="flex">
              <button
                className={`h-[55px] cursor-pointer text-[16px] w-full rounded-tl-md  bg-[#1c1c23] ${
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
                className={`h-[55px] cursor-pointer text-[16px] w-full rounded-tr-md  bg-[#1c1c23]  ${
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
            <form autoComplete="off" className="max-w-[400px] px-4 mb-10 pb-5">
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
                          {$assetsPrices[asset] &&
                            inputs[asset]?.amount > 0 && (
                              <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                                <p>
                                  $
                                  {(
                                    Number(
                                      formatUnits(
                                        $assetsPrices[asset].tokenPrice,
                                        18
                                      )
                                    ) * inputs[asset].amount
                                  ).toFixed(2)}
                                </p>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col mt-[15px] text-[15px] w-full">
                        {balances[option[0]] && (
                          <div className="text-left text-[gray] ml-2">
                            Balance:{" "}
                            {parseFloat(
                              balances[option[0]].assetBalance
                            ).toFixed(3)}
                          </div>
                        )}

                        <div className="rounded-xl  relative max-h-[150px] border-[2px] border-[#6376AF] max-w-[350px]">
                          <div className="absolute top-[30%] left-[5%]">
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
                                      zapInputHandler(
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
                              value={inputs[option[0]]?.amount}
                              name="amount"
                              type="text"
                              placeholder="0"
                              onChange={(e) =>
                                zapInputHandler(e.target.value, e.target.id)
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
                        {$assetsPrices[option[0]] &&
                          inputs[option[0]].amount > 0 && (
                            <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                              <p>
                                $
                                {(
                                  Number(
                                    formatUnits(
                                      $assetsPrices[option[0]].tokenPrice,
                                      18
                                    )
                                  ) * inputs[option[0]].amount
                                ).toFixed(2)}{" "}
                              </p>
                            </div>
                          )}
                      </div>
                      {zapButton === "insuficcientBalance" ? (
                        <button
                          disabled
                          className="mt-2 w-full flex items-center justify-center bg-[#6F5648] text-[#F2C4A0] border-[#AE642E] py-3 rounded-md"
                        >
                          INSUFICCIENT BALANCE
                        </button>
                      ) : zapButton === "needApprove" ? (
                        <button
                          className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
                          type="button"
                          onClick={zapApprove}
                        >
                          Approve {getTokenData(option[0])?.symbol}
                        </button>
                      ) : (
                        <></>
                      )}
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
                      {option.map(
                        (asset: any) =>
                          allowance &&
                          formatUnits(
                            allowance[asset].allowance[0],
                            Number(getTokenData(asset)?.decimals)
                          ) < inputs[asset].amount && (
                            <button
                              className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
                              key={asset}
                              type="button"
                              onClick={() => approve(asset as TAddress)}
                            >
                              Approve {getTokenData(asset)?.symbol}
                            </button>
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
                        value={inputs[option[0]]?.amount}
                        name="amount"
                        placeholder="0"
                        onChange={(e) => {
                          handleInputChange(e.target.value, e.target.id);
                          previewWithdraw(e.target.value);
                        }}
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

                    {$assetsPrices[option[0]] &&
                      inputs[option[0]].amount > 0 && (
                        <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                          <p>
                            $
                            {(
                              Number(
                                formatUnits(
                                  $assetsPrices[option[0]].tokenPrice,
                                  18
                                )
                              ) * inputs[option[0]].amount
                            ).toFixed(2)}
                          </p>
                        </div>
                      )}
                  </div>
                  {withdrawAmount ? (
                    <div>
                      <div className="my-2 ml-2 flex flex-col gap-2">
                        {withdrawAmount?.map(
                          ({
                            symbol,
                            amount,
                          }: {
                            symbol: string;
                            amount: string;
                          }) => (
                            <div key={symbol}>
                              <p className="uppercase text-[14px] leading-3 text-[#8D8E96]">
                                {symbol}
                              </p>
                              <p>{amount}</p>
                            </div>
                          )
                        )}
                      </div>
                      <button
                        type="button"
                        className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
                        onClick={() => withdraw()}
                      >
                        WITHDRAW
                      </button>
                    </div>
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
