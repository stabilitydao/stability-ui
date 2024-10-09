import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";

import { formatUnits, parseUnits, zeroAddress, maxUint256 } from "viem";

import { usePublicClient, useAccount, useSwitchChain } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";

import { SettingsModal } from "./SettingsModal";
import { TabSwitcher } from "./TabSwitcher";
import { InvestError } from "./InvestError";

import { Loader, ShareSkeleton, AssetsSkeleton, AssetsProportion } from "@ui";

import {
  vaultData,
  assetsPrices,
  assetsBalances,
  account,
  platformsData,
  tokens,
  lastTx,
  connected,
  transactionSettings,
} from "@store";

import {
  VaultABI,
  ERC20DQMFABI,
  ERC20ABI,
  ZapABI,
  ERC20MetadataUpgradeableABI,
  wagmiConfig,
  ICHIABI,
} from "@web3";

import {
  getTokenData,
  get1InchRoutes,
  debounce,
  decodeHex,
  setLocalStoreHash,
  getProtocolLogo,
} from "@utils";

import {
  getAssetAllowance,
  getPlatformBalance,
  getAssetsBalances,
  handleInputKeyDown,
} from "../../functions";

import { DEFAULT_ERROR, ZERO_BigInt } from "@constants";

import type {
  TAddress,
  TVaultAllowance,
  TVaultInput,
  TVaultBalance,
  TTokenData,
  TPlatformData,
  TVault,
  TBalances,
  TAsset,
  TError,
  TUnderlyingToken,
  TZAPData,
  TLocalStorageToken,
} from "@types";

import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

interface IProps {
  network: string;
  vault: TVault;
}

type TOptionInfo = {
  address: string | string[];
  symbol: string | string[];
  logoURI: string | string[];
};

const InvestForm: React.FC<IProps> = ({ network, vault }) => {
  const _publicClient = usePublicClient({
    chainId: Number(network),
    config: wagmiConfig,
  });

  const { open } = useWeb3Modal();

  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const $vaultData = useStore(vaultData);
  const $account = useStore(account);
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);

  const $transactionSettings = useStore(transactionSettings);
  const $platformsData: TPlatformData = useStore(platformsData);
  const $tokens = useStore(tokens);
  const $connected = useStore(connected);

  const [tab, setTab] = useState("Deposit");
  const [option, setOption] = useState<string[]>([]);

  const [defaultOption, setDefaultOption] = useState<{
    symbols: string;
    assets: string;
    assetsArray: string[];
    logos: string[];
  }>({
    symbols: "",
    assets: "",
    assetsArray: [],
    logos: [],
  });

  const [allowance, setAllowance] = useState<TVaultAllowance>({});
  const [balances, setBalances] = useState<TVaultBalance>({});

  const [inputs, setInputs] = useState<TVaultInput>({});

  const [sharesOut, setSharesOut] = useState<bigint | boolean>(false);

  const [withdrawAmount, setWithdrawAmount] = useState<
    {
      symbol: string;
      logo: string;
      amount: string;
      amountInUSD?: string;
    }[]
  >([]);

  const [zapPreviewWithdraw, setZapPreviewWithdraw] = useState<TZAPData[]>([]);
  const [underlyingToken, setUnderlyingToken] = useState<TUnderlyingToken>({
    address: "0x0",
    symbol: "",
    decimals: 0,
    balance: 0,
    allowance: 0,
    logoURI: "",
  });

  const [underlyingShares, setUnderlyingShares] = useState<string | boolean>();
  const [zapShares, setZapShares] = useState<string | boolean>();
  const [button, setButton] = useState<string>("none");
  const [optionTokens, setOptionTokens] = useState<TOptionInfo[]>([]);
  const [approveIndex, setApproveIndex] = useState<number | boolean>(false);
  const [ichiAllow, setIchiAllow] = useState<boolean[]>([true, true]);

  const [tokenSelector, setTokenSelector] = useState<boolean>(false);
  const [activeOptionToken, setActiveOptionToken] = useState<TOptionInfo>({
    symbol: "",
    address: "",
    logoURI: [],
  });

  const [settingsModal, setSettingsModal] = useState(false);

  const [settings, setSettings] = useState($transactionSettings);

  const [zapTokens, setZapTokens] = useState<TZAPData[]>([]);
  const [zapError, setZapError] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [isRefresh, setIsRefresh] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);
  const [loader, setLoader] = useState<boolean>(false);

  const [error, setError] = useState<TError>(DEFAULT_ERROR);

  const tokenSelectorRef = useRef<HTMLDivElement>(null);

  let isAnyCCFOptionVisible = false;

  const { shortId } = vault.strategyInfo;

  const checkButtonApproveDeposit = (apprDepo: string[]) => {
    if (shortId === "IQMF" || shortId === "IRMF") {
      if (apprDepo.includes("deposit")) return true;
    }

    if (apprDepo.length < 2) {
      return true;
    }

    return apprDepo.every((element) => element === apprDepo[0]);
  };

  const checkInputsAllowance = (input: bigint[]) => {
    const apprDepo: string[] = [];
    let change = false;

    const assetsBalances = $assetsBalances[network];
    const assetsArray = defaultOption?.assetsArray;

    const isIRMF = shortId === "IRMF";
    const isIQMFOrIRMF = shortId === "IQMF" || isIRMF;

    for (let i = 0; i < input.length; i++) {
      if (assetsBalances && input[i] > assetsBalances?.[assetsArray[i]]) {
        setButton("insufficientBalance");
        change = true;
        break;
      }
    }

    if (!change) {
      for (let i = 0; i < input.length; i++) {
        const asset = isIRMF ? assetsArray[0] : assetsArray[i];
        const balance = assetsBalances[asset];
        const allowanceForAsset = allowance[asset];

        if (input[i] <= balance && allowanceForAsset >= input[i]) {
          apprDepo.push("deposit");
        } else {
          apprDepo.push("needApprove");
        }
      }

      const button = checkButtonApproveDeposit(apprDepo);

      if (button) {
        if (isIQMFOrIRMF) {
          const index = input.findIndex((amount) => amount) || 0;
          setButton(apprDepo[index]);
        } else {
          setButton(apprDepo[apprDepo.length - 1]);
        }
      } else {
        setButton("needApprove");
      }
    }
  };

  const errorHandler = (err: Error) => {
    lastTx.set("No transaction hash...");
    if (err instanceof Error) {
      const errName = err.name;
      const errorMessageLength =
        err.message.indexOf("Contract Call:") !== -1
          ? err.message.indexOf("Contract Call:")
          : 150;

      const errorMessage = err.message.substring(0, errorMessageLength) + "...";

      setError({ state: true, type: errName, description: errorMessage });
    }
    setLoader(false);
    setNeedConfirm(false);
    console.error("ERROR:", err);
  };

  ///// INPUTS & OPTIONS
  const optionHandler = (
    option: string[],
    symbol: string,
    address: string,
    logoURI: string | string[]
  ) => {
    setTokenSelector((prevState) => !prevState);
    option = option.map((address: string) => address.toLowerCase());
    ///// Option change
    resetInputs(option);
    setOption(option);
    ///// Active option
    setActiveOptionToken({
      symbol: symbol,
      address: address,
      logoURI: logoURI,
    });
  };

  const handleInputChange = async (amount: string, asset: string) => {
    if (!amount) {
      setSharesOut(false);
      resetInputs();
      return;
    }
    if (tab === "Deposit") {
      setInputs(
        (prevInputs: any) =>
          ({
            ...prevInputs,
            [asset]: amount,
          }) as TVaultInput
      );
      if (
        option.length > 1 ||
        (defaultOption?.assets === option[0] && option.length < 2)
      ) {
        previewDeposit(asset, amount);
      }
    } else {
      const preview: TVaultInput | any = {};
      for (let i = 0; i < option.length; i++) {
        preview[option[i]] = amount as string;
      }

      setInputs(preview);
    }
  };

  const resetOptions = () => {
    if (defaultOption?.assetsArray) {
      setOption(defaultOption?.assetsArray);
      setActiveOptionToken({
        symbol: defaultOption?.symbols,
        address: defaultOption?.assets,
        logoURI: defaultOption?.logos,
      });
    }
  };

  const resetInputs = (options: string[] = option) => {
    const reset: TVaultInput | any = {};

    for (let i = 0; i < options.length; i++) {
      reset[options[i]] = "";
    }
    setInputs(reset);
    setButton("none");
  };

  const resetFormAfterTx = () => {
    setButton("none");
    setZapTokens([]);
    setZapPreviewWithdraw([]);
    setUnderlyingShares(false);
    setWithdrawAmount([]);
    setSharesOut(false);
    setZapShares(false);
    resetInputs();
  };

  const defaultAssetsOption = (assets: string[]) => {
    const symbols: string[] = [];
    const logoURIs: string[] = [];

    for (let i = 0; i < assets.length; i++) {
      const token = getTokenData(assets[i].toLowerCase());

      if (token) {
        symbols.push(token.symbol);
        logoURIs.push(token.logoURI);
      }
    }

    setDefaultOption({
      symbols: symbols.join(" + "),
      assets: assets.join(", "),
      assetsArray: assets, // temp
      logos: logoURIs,
    });

    setActiveOptionToken({
      symbol: symbols.join(" + "),
      address: symbols,
      logoURI: logoURIs,
    });
  };
  /////
  /////   SELECT TOKENS
  const selectTokensHandler = async () => {
    if (!$tokens[network]) return;
    let filtredTokens = tokenlist.tokens
      .filter((token: TTokenData) =>
        $tokens[network].includes(token.address.toLowerCase() as TAddress)
      )
      .map(({ address, symbol, logoURI }: TTokenData) => ({
        address,
        symbol,
        logoURI,
      }));

    filtredTokens = filtredTokens.filter(
      (token: TTokenData) => token.address != defaultOption?.assets
    );
    if (defaultOption?.assetsArray?.length < 2) {
      filtredTokens = filtredTokens.filter(
        (token: TTokenData) => token.address != defaultOption?.assetsArray[0]
      );
    }
    ///// GET UNDERLYING TOKEN
    try {
      if (vault.underlying != zeroAddress) {
        const logo = getProtocolLogo(shortId);
        if ($connected) {
          let underlyingSymbol = "";

          if (shortId === "DQMF") {
            underlyingSymbol = (await _publicClient?.readContract({
              address: vault.underlying,
              abi: ERC20DQMFABI,
              functionName: "symbol",
            })) as string;

            underlyingSymbol = decodeHex(underlyingSymbol);
          } else {
            underlyingSymbol = (await _publicClient?.readContract({
              address: vault.underlying,
              abi: ERC20MetadataUpgradeableABI,
              functionName: "symbol",
            })) as string;
          }

          const underlyingDecimals = (await _publicClient?.readContract({
            address: vault.underlying,
            abi: ERC20MetadataUpgradeableABI,
            functionName: "decimals",
          })) as number;
          const underlyingAllowance = (await _publicClient?.readContract({
            address: vault.underlying,
            abi: ERC20MetadataUpgradeableABI,
            functionName: "allowance",
            args: [$account as TAddress, vault.address],
          })) as bigint;
          const underlyingBalance = (await _publicClient?.readContract({
            address: vault.underlying,
            abi: ERC20MetadataUpgradeableABI,
            functionName: "balanceOf",
            args: [$account as TAddress],
          })) as bigint;

          setUnderlyingToken({
            address: vault.underlying,
            symbol: underlyingSymbol,
            decimals: Number(underlyingDecimals),
            balance: Number(formatUnits(underlyingBalance, underlyingDecimals)),
            allowance: Number(
              formatUnits(underlyingAllowance, underlyingDecimals)
            ),
            logoURI: logo,
          });
        } else {
          const defaultTokens = defaultOption?.symbols?.split(" + ");
          setUnderlyingToken({
            address: vault.underlying,
            symbol: `aw${defaultTokens[0]}-${defaultTokens[1]}`,
            decimals: 18,
            balance: 0,
            allowance: 0,
            logoURI: logo,
          });
        }
      }
    } catch (err) {
      console.error("UNDERLYING TOKEN ERROR:", err);
    } finally {
      setOptionTokens(filtredTokens);
    }
  };
  /////
  /////         ZAP

  const debouncedZap = useCallback(
    debounce(async (amount: string, asset: string) => {
      if (!Number(amount)) {
        setButton("none");
        setZapTokens([]);
        setLoader(false);
        return;
      }

      if (tab === "Deposit" && Number(amount) > Number(balances[asset])) {
        setButton("insufficientBalance");
      }

      if (
        tab === "Withdraw" &&
        Number(amount) >
          parseFloat(
            formatUnits(
              $vaultData[network][vault.address]?.vaultUserBalance,
              18
            )
          )
      ) {
        setButton("insufficientBalance");

        setZapTokens([]);
        setLoader(false);
        return;
      }

      if (asset === underlyingToken?.address) {
        try {
          const previewDepositAssets = await _publicClient?.readContract({
            address: vault.address,
            abi: VaultABI,
            functionName: "previewDepositAssets",
            args: [[asset as TAddress], [parseUnits(amount, 18)]],
          });

          if (previewDepositAssets) {
            setUnderlyingShares(
              formatUnits(previewDepositAssets[1] as bigint, 18)
            );
          }

          const allowanceData = (await _publicClient?.readContract({
            address: option[0] as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account as TAddress, vault.address],
          })) as bigint;
          if (
            Number(formatUnits(allowanceData, 18)) < Number(amount) &&
            Number(amount) <= Number(balances[asset])
          ) {
            setButton("needApprove");
          }

          if (
            Number(amount) <= Number(balances[asset]) &&
            Number(formatUnits(allowanceData, 18)) >= Number(amount)
          ) {
            setButton(tab.toLowerCase());
          }

          if (previewDepositAssets) {
            checkInputsAllowance(previewDepositAssets[0] as bigint[]);
            setSharesOut(
              ((previewDepositAssets[1] as bigint) * BigInt(1)) / BigInt(100)
            );
          }

          setLoader(false);
        } catch (err) {
          console.error("UNDERLYING SHARES ERROR:", err);
        }
      } else {
        ///// DEPOSIT / WITHDRAW
        try {
          const decimals = Number(getTokenData(asset)?.decimals);

          if (!$connected) {
            getZapDepositSwapAmounts(amount);
            return;
          }

          const allowanceData = await getAssetAllowance(
            _publicClient,
            asset as TAddress,
            tab,
            vault?.address,
            underlyingToken?.address,
            $platformsData?.[network]?.zap
          );

          const formattedAllowance = Number(
            formatUnits(allowanceData, decimals)
          );

          if (tab === "Withdraw") {
            if (formattedAllowance < Number(amount)) {
              setButton("needApprove");
            }
            previewWithdraw(amount);
          }
          if (tab === "Deposit") {
            if (
              formattedAllowance < Number(amount) &&
              Number(amount) <= Number(balances[asset])
            ) {
              setButton("needApprove");
            }
            getZapDepositSwapAmounts(amount);
          }
        } catch (err) {
          console.error("ZAP ERROR:", err);
        }
      }
    }, 1000),
    [option, balances, tab]
  );
  const zapInputHandler = (amount: string, asset: string) => {
    setInputs(
      (prevInputs: any) =>
        ({
          ...prevInputs,
          [asset]: amount,
        }) as TVaultInput
    );

    setButton("none");
    setZapTokens([]);
    setZapPreviewWithdraw([]);
    setLoader(true);

    // @ts-ignore
    debouncedZap(amount, asset);
  };

  const zapApprove = async () => {
    ///// ZAP TOKENS & UNDERLYING TOKENS
    setError(DEFAULT_ERROR);
    setTransactionInProgress(true);
    const amount = inputs[option[0]];

    const decimals = getTokenData(option[0])?.decimals || 18;

    const approveSum =
      settings.approves === "unlimited"
        ? maxUint256
        : parseUnits(amount, decimals);

    try {
      const address =
        option[0] === underlyingToken?.address
          ? underlyingToken?.address
          : option[0];

      const argsAddress =
        option[0] === underlyingToken?.address
          ? vault.address
          : $platformsData[network]?.zap;

      const gas = await _publicClient?.estimateContractGas({
        address: address as TAddress,
        abi: ERC20ABI,
        functionName: "approve",
        args: [argsAddress, approveSum],
        account: $account as TAddress,
      });
      const gasLimit = BigInt(
        Math.trunc(Number(gas) * Number(settings.gasLimit))
      );

      setNeedConfirm(true);
      const assetApprove = await writeContract(wagmiConfig, {
        address: address as TAddress,
        abi: ERC20ABI,
        functionName: "approve",
        args: [argsAddress, approveSum],
        gas: gasLimit,
      });
      setNeedConfirm(false);
      setLoader(true);

      const transaction = await waitForTransactionReceipt(wagmiConfig, {
        confirmations: 3,
        hash: assetApprove,
      });

      if (transaction.status === "success") {
        lastTx.set(transaction?.transactionHash);
        const allowance = formatUnits(
          await getAssetAllowance(
            _publicClient,
            option[0] as TAddress,
            tab,
            vault?.address,
            underlyingToken?.address,
            $platformsData?.[network]?.zap
          ),
          18
        );

        if (Number(allowance) >= Number(amount)) {
          getZapDepositSwapAmounts(amount);
          setButton(tab.toLowerCase());
        }
        setLoader(false);
      }
    } catch (err) {
      if (err instanceof Error) {
        errorHandler(err);
      }
    }

    setTransactionInProgress(false);
  };

  const zapDeposit = async () => {
    // break point for curve
    if (shortId === "CCF" && defaultOption?.assets.includes(option[0])) {
      deposit();
      return;
    }

    ///// UNDERLYING
    setError(DEFAULT_ERROR);
    setTransactionInProgress(true);
    setLoader(true);

    let transaction, depositAssets: any, zapDeposit: any, gas, gasLimit;
    const amount = inputs[option[0]];
    if (underlyingToken?.address === option[0]) {
      try {
        let _strShares =
          typeof underlyingShares === "string" ? underlyingShares : "0";

        const shares = parseUnits(_strShares, 18);
        const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));

        const out = shares - (shares * decimalPercent) / BigInt(100);

        const txToken: any = {
          [underlyingToken?.address]: {
            amount: amount,
            symbol: underlyingToken?.symbol,
            logo: underlyingToken?.logoURI,
          },
        };

        const gas = await _publicClient?.estimateContractGas({
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [
            option as TAddress[],
            [parseUnits(amount, 18)],
            out,
            $account as TAddress,
          ],
          account: $account as TAddress,
        });
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );
        setNeedConfirm(true);
        depositAssets = await writeContract(wagmiConfig, {
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [
            option as TAddress[],
            [parseUnits(amount, 18)],
            out,
            $account as TAddress,
          ],
          gas: gasLimit,
        });
        setNeedConfirm(false);
        setLoader(true);

        transaction = await waitForTransactionReceipt(wagmiConfig, {
          confirmations: 3,
          hash: depositAssets,
        });
        setLocalStoreHash({
          timestamp: new Date().getTime(),
          hash: depositAssets,
          status: transaction?.status || "reverted",
          type: "deposit",
          vault: vault.address,
          tokens: txToken,
        });
        if (transaction.status === "success") {
          resetFormAfterTx();
        }
        lastTx.set(transaction?.transactionHash);
        setLoader(false);
      } catch (err) {
        if (err instanceof Error) {
          errorHandler(err);
        }
      }
    } else {
      try {
        const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));

        let _strShares = typeof zapShares === "string" ? zapShares : "0";

        const shares = parseUnits(_strShares, 18);

        const out = shares - (shares * decimalPercent) / BigInt(100);

        const amountIn = parseUnits(
          amount,
          getTokenData(option[0])?.decimals || 18
        );

        const router = zapTokens[0]?.router || zapTokens[1]?.router;

        let txData = zapTokens?.map((tokens: any) => tokens.txData);

        if (shortId === "IQMF" || shortId === "IRMF") txData.push("");

        if (shortId === "IRMF") {
          txData.reverse();
        }
        if (shortId === "CCF") txData[1] = "";

        gas = await _publicClient?.estimateContractGas({
          address: $platformsData[network]?.zap,
          abi: ZapABI,
          functionName: "deposit",
          args: [
            vault.address,
            option[0] as TAddress,
            amountIn,
            router as TAddress,
            txData,
            out,
            $account as TAddress,
          ],
          account: $account as TAddress,
        });
        gasLimit = BigInt(Math.trunc(Number(gas) * Number(settings.gasLimit)));
        setNeedConfirm(true);

        zapDeposit = await writeContract(wagmiConfig, {
          address: $platformsData[network]?.zap,
          abi: ZapABI,
          functionName: "deposit",
          args: [
            vault.address,
            option[0] as TAddress,
            amountIn,
            router as TAddress,
            txData,
            out,
            $account as TAddress,
          ],
          gas: gasLimit,
        });
        setNeedConfirm(false);
        setLoader(true);
        transaction = await waitForTransactionReceipt(wagmiConfig, {
          confirmations: 3,
          hash: zapDeposit,
        });

        setLocalStoreHash({
          timestamp: new Date().getTime(),
          hash: zapDeposit,
          status: transaction?.status || "reverted",
          type: "deposit",
          vault: vault.address,
          tokens: inputs,
        });
        if (transaction.status === "success") {
          resetFormAfterTx();
        }
        lastTx.set(transaction?.transactionHash);
        setLoader(false);
      } catch (err) {
        if (err instanceof Error) {
          errorHandler(err);
        }
      }
    }
    setTransactionInProgress(false);
  };
  // Temp function for CCF strategyes before 1inch curve update
  const depositCCF = async (amount: string) => {
    const decimals = getTokenData(option[0])?.decimals || 18;
    if (option) {
      let amounts: bigint[] = [ZERO_BigInt, parseUnits(amount, decimals)];

      try {
        let previewDepositAssets: any;
        previewDepositAssets = await _publicClient?.readContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "previewDepositAssets",
          args: [defaultOption?.assetsArray as TAddress[], amounts],
        });
        setZapShares(formatUnits(previewDepositAssets[1], 18));
        checkInputsAllowance(amounts);
      } catch (err) {
        console.error("Error: the asset balance is too low to convert.", err);
      }
    }

    setLoader(false);
  };

  const getZapDepositSwapAmounts = async (amount: string) => {
    setLoader(true);
    if (shortId === "CCF" && defaultOption?.assets.includes(option[0])) {
      depositCCF(amount);
      return;
    }
    try {
      const decimals = Number(getTokenData(option[0])?.decimals);

      const zapAmounts = (await _publicClient?.readContract({
        address: $platformsData[network]?.zap,
        abi: ZapABI,
        functionName: "getDepositSwapAmounts",
        args: [
          vault.address,
          option[0] as TAddress,
          parseUnits(amount, decimals),
        ],
      })) as [TAddress[], bigint[]];

      let promises;
      let outData: TZAPData[] = [];
      if (shortId === "CCF") {
        promises = (await get1InchRoutes(
          network,
          option[0] as TAddress,
          zapAmounts[0][1] as TAddress,
          decimals,
          String(zapAmounts[1][0] + zapAmounts[1][1]),
          setZapError,
          "deposit"
        )) as TZAPData;
        outData = [promises, promises];
      } else {
        promises = zapAmounts[0].map(
          async (toAddress, index) =>
            vault.assetsProportions[index] &&
            (await get1InchRoutes(
              network,
              option[0] as TAddress,
              toAddress,
              decimals,
              String(zapAmounts[1][index]),
              setZapError,
              "deposit"
            ))
        );
        outData = (await Promise.all(promises)) as TZAPData[];
      }

      if (shortId === "IQMF" || shortId === "IRMF") {
        outData = outData.filter(
          (obj: any) => Number(obj?.amountIn) > 0 || Number(obj?.amountOut) > 0
        );
      }

      setZapTokens(outData);
      let amounts;

      if (shortId === "IQMF" || shortId === "IRMF") {
        amounts = vault.assetsProportions.map((proportion) =>
          proportion
            ? parseUnits(
                outData[0]?.amountOut as string,
                getTokenData(outData[0]?.address as TAddress)
                  ?.decimals as number
              )
            : ZERO_BigInt
        );
      } else {
        amounts = outData.map((tokenOut) =>
          parseUnits(
            tokenOut?.amountOut as string,
            getTokenData(tokenOut?.address as TAddress)?.decimals as number
          )
        );
      }
      ///// index ^ 1 --> XOR
      amounts = amounts.map((thisAmount, index) => {
        return !thisAmount
          ? parseUnits(amount, decimals) - zapAmounts[1][index ^ 1]
          : thisAmount;
      });

      const previewDepositAssets = await _publicClient?.readContract({
        address: vault.address,
        abi: VaultABI,
        functionName: "previewDepositAssets",
        args: [defaultOption?.assetsArray as TAddress[], amounts],
      });

      let _previewDepositAssets: bigint = ZERO_BigInt;

      if (
        Array.isArray(previewDepositAssets) &&
        previewDepositAssets.length > 1
      ) {
        _previewDepositAssets = previewDepositAssets[1];
      }

      setZapShares(formatUnits(_previewDepositAssets, 18));
      if ($connected) {
        const allowanceData = await getAssetAllowance(
          _publicClient,
          option[0] as TAddress,
          tab,
          vault?.address,
          underlyingToken?.address,
          $platformsData?.[network]?.zap
        );
        if (
          Number(formatUnits(allowanceData, decimals)) < Number(amount) &&
          Number(amount) <= Number(balances[option[0]])
        ) {
          setButton("needApprove");
        }
        if (
          Number(formatUnits(allowanceData, decimals)) >= Number(amount) &&
          Number(amount) <= Number(balances[option[0]])
        ) {
          setButton("deposit");
        }
      }
    } catch {
      console.error("zap deposit failed");
    } finally {
      setLoader(false);
    }
  };

  const withdrawZapApprove = async () => {
    setError(DEFAULT_ERROR);
    setTransactionInProgress(true);

    const amount = inputs[option[0]];

    const approveSum =
      settings.approves === "unlimited" ? maxUint256 : parseUnits(amount, 18);

    try {
      const gas = await _publicClient?.estimateContractGas({
        address: vault.address,
        abi: ERC20ABI,
        functionName: "approve",
        args: [$platformsData[network]?.zap, approveSum],
        account: $account as TAddress,
      });

      const gasLimit = BigInt(
        Math.trunc(Number(gas) * Number(settings.gasLimit))
      );
      setNeedConfirm(true);
      const assetApprove = await writeContract(wagmiConfig, {
        address: vault.address,
        abi: ERC20ABI,
        functionName: "approve",
        args: [$platformsData[network]?.zap, approveSum],
        gas: gasLimit,
      });
      setNeedConfirm(false);
      setLoader(true);
      const transaction = await waitForTransactionReceipt(wagmiConfig, {
        confirmations: 3,
        hash: assetApprove,
      });

      if (transaction.status === "success") {
        lastTx.set(transaction?.transactionHash);
        const newAllowance = await _publicClient?.readContract({
          address: option[0] as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [
            $account as TAddress,
            $platformsData[network]?.zap as TAddress,
          ],
        });

        let _newAllowance =
          typeof newAllowance === "bigint" ? newAllowance : ZERO_BigInt;

        if (
          Number(formatUnits(_newAllowance, 18)) >= Number(inputs[option[0]])
        ) {
          setButton("withdraw");
        }
        setLoader(false);
      }
    } catch (err) {
      if (err instanceof Error) {
        errorHandler(err);
      }
    }
    setTransactionInProgress(false);
  };

  ///// 1INCH DATA REFRESH
  const refreshData = async () => {
    if (!isRefresh || loader) return;
    const currentBalances: TBalances = await getPlatformBalance(
      _publicClient,
      network,
      $account as TAddress
    );

    setRotation(rotation + 360);
    setLoader(true);
    getAssetsBalances(currentBalances, setBalances, option, underlyingToken);
    zapInputHandler(inputs[option[0]], option[0]);
  };
  /////

  const approve = async (asset: TAddress, index: number) => {
    setApproveIndex(index);
    const amount = inputs[asset];
    const decimals = getTokenData(asset)?.decimals || 18;

    const approveSum =
      settings.approves === "unlimited"
        ? maxUint256
        : parseUnits(amount, decimals);

    setError(DEFAULT_ERROR);

    const needApprove = option.filter(
      (asset) =>
        formatUnits(allowance[asset], Number(getTokenData(asset)?.decimals)) <
        inputs[asset]
    );

    if (vault.address) {
      try {
        const gas = await _publicClient?.estimateContractGas({
          address: asset,
          abi: ERC20ABI,
          functionName: "approve",
          args: [vault.address, approveSum],
          account: $account as TAddress,
        });
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );
        setNeedConfirm(true);
        const assetApprove = await writeContract(wagmiConfig, {
          address: asset,
          abi: ERC20ABI,
          functionName: "approve",
          args: [vault.address, approveSum],
          gas: gasLimit,
        });
        setNeedConfirm(false);
        setLoader(true);
        const transaction = await waitForTransactionReceipt(wagmiConfig, {
          confirmations: 3,
          hash: assetApprove,
        });

        if (transaction.status === "success") {
          lastTx.set(transaction?.transactionHash);
          const newAllowance = (await _publicClient?.readContract({
            address: asset,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account as TAddress, vault.address],
          })) as bigint;

          setAllowance((prevAllowance: any) => ({
            ...prevAllowance,
            [asset]: newAllowance,
          }));

          // this is a temp condition before rewrite
          if (
            needApprove.length == 1 &&
            formatUnits(newAllowance, Number(getTokenData(asset)?.decimals)) >=
              inputs[asset]
          ) {
            setButton("deposit");
          }
          setLoader(false);
        }
      } catch (err) {
        const newAllowance = (await _publicClient?.readContract({
          address: asset,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, vault.address],
        })) as bigint;

        setAllowance((prevAllowance: any) => ({
          ...prevAllowance,
          [asset]: newAllowance,
        }));
        // this is a temp condition before rewrite
        if (
          needApprove.length == 1 &&
          formatUnits(newAllowance, Number(getTokenData(asset)?.decimals)) >=
            inputs[asset]
        ) {
          setButton("deposit");
        }
        if (err instanceof Error) {
          errorHandler(err);
        }
      }
    }
    setApproveIndex(false);
  };

  const deposit = async () => {
    setError(DEFAULT_ERROR);
    setTransactionInProgress(true);
    let assets: string[] = [];
    let input: any = [];

    const lastAsset = option[0];
    // only for CCF strategy

    let _strShares = typeof zapShares === "string" ? zapShares : "0";

    const shares = sharesOut
      ? sharesOut
      : (parseUnits(_strShares, 18) * BigInt(1)) / BigInt(100);

    if (shortId === "CCF" && option.length < 2) {
      input.push(ZERO_BigInt);
    }

    for (let i = 0; i < option.length; i++) {
      assets.push(option[i]);

      const token: any = getTokenData(option[i]);

      input.push(parseUnits(inputs[option[i]], token.decimals));
    }
    const changedInput = assets?.indexOf(lastAsset);
    const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));

    const out =
      BigInt(shares) - (BigInt(shares) * decimalPercent) / BigInt(100);

    let transaction,
      depositAssets: any,
      gas,
      gasLimit,
      amounts: any = [];

    for (let i = 0; i < option.length; i++) {
      if (i === changedInput) {
        amounts.push(
          parseUnits(
            inputs[lastAsset as string],
            Number(getTokenData(lastAsset as string)?.decimals)
          )
        );
      } else {
        const token = tokenlist.tokens.find(
          (token: TTokenData) => token.address === option[changedInput ? 0 : 1]
        );

        const decimals = token ? token.decimals + 18 : 24;

        amounts.push(parseUnits("1", decimals));
      }
    }
    try {
      if (shortId !== "IQMF" && shortId !== "IRMF") {
        gas = await _publicClient?.estimateContractGas({
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [assets as TAddress[], input, out, $account as TAddress],
          account: $account as TAddress,
        });
        gasLimit = BigInt(Math.trunc(Number(gas) * Number(settings.gasLimit)));
        setNeedConfirm(true);
        depositAssets = await writeContract(wagmiConfig, {
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [assets as TAddress[], input, out, $account as TAddress],
          gas: gasLimit,
        });
        setNeedConfirm(false);
      } else {
        // IQMF strategy only
        let assets: TAddress[] = vault.assets.map((asset) => asset.address);
        let IQMFAmounts: bigint[] = vault.assetsProportions.map((proportion) =>
          proportion ? amounts[0] : ZERO_BigInt
        );
        gas = await _publicClient?.estimateContractGas({
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [assets, IQMFAmounts, out, $account as TAddress],
          account: $account as TAddress,
        });
        gasLimit = BigInt(Math.trunc(Number(gas) * Number(settings.gasLimit)));
        setNeedConfirm(true);
        depositAssets = await writeContract(wagmiConfig, {
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [assets, IQMFAmounts, out, $account as TAddress],
          gas: gasLimit,
        });
        setNeedConfirm(false);
      }
      setLoader(true);
      transaction = await waitForTransactionReceipt(wagmiConfig, {
        confirmations: 3,
        hash: depositAssets,
      });
      if (transaction.status === "success") {
        resetFormAfterTx();
      }
      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: depositAssets,
        status: transaction?.status || "reverted",
        type: "deposit",
        vault: vault.address,
        tokens: inputs,
      });
      lastTx.set(transaction?.transactionHash);
      setLoader(false);
    } catch (err) {
      if (err instanceof Error) {
        errorHandler(err);
      }
    }
    setTransactionInProgress(false);
  };

  const withdraw = async () => {
    setError(DEFAULT_ERROR);
    setTransactionInProgress(true);
    const sharesToBurn = parseUnits(inputs[option[0]], 18);

    if (!sharesToBurn) return;

    ///// 2ASSETS -> UNDERLYING -> ZAP
    //before rewrite
    let withdrawAssets: any, transaction, zapWithdraw: any;
    let localAssets = defaultOption?.assetsArray;
    if (shortId === "IQMF" || shortId === "IRMF") {
      localAssets = vault.assets.map((asset) => asset.address);
    }
    if (underlyingToken?.address === option[0]) {
      const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));

      const txTokens = withdrawAmount?.reduce(
        (result, token) => {
          result[underlyingToken.address as TAddress] = {
            amount: token.amount,
            symbol: token.symbol,
            logo: token.logo,
          };
          return result;
        },
        {} as Record<TAddress, TLocalStorageToken>
      );

      const withdrawAmounts = withdrawAmount?.map((obj: any) => {
        const amount = parseUnits(obj.amount, 18);
        return amount - (amount * decimalPercent) / BigInt(100);
      });
      try {
        const gas = await _publicClient?.estimateContractGas({
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [option as TAddress[], sharesToBurn, withdrawAmounts],
          account: $account as TAddress,
        });
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );
        setNeedConfirm(true);
        withdrawAssets = await writeContract(wagmiConfig, {
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [option as TAddress[], sharesToBurn, withdrawAmounts],
          gas: gasLimit,
        });
        setNeedConfirm(false);
        setLoader(true);
        transaction = await waitForTransactionReceipt(wagmiConfig, {
          confirmations: 3,
          hash: withdrawAssets,
        });
        setLocalStoreHash({
          timestamp: new Date().getTime(),
          hash: withdrawAssets,
          status: transaction?.status || "reverted",
          type: "withdraw",
          vault: vault.address,
          tokens: txTokens,
        });
        if (transaction.status === "success") {
          resetFormAfterTx();
        }
        lastTx.set(transaction?.transactionHash);
        setLoader(false);
      } catch (err) {
        if (err instanceof Error) {
          errorHandler(err);
        }
      }
    } else if (
      (defaultOption?.assets === option[0] && option.length < 2) ||
      option.length > 1
    ) {
      const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));
      const txTokens = withdrawAmount?.reduce(
        (result, token) => {
          const JSONToken = tokenlist.tokens.find(
            (t: TTokenData) => t.symbol === token.symbol
          );

          result[JSONToken?.address as TAddress] = {
            amount: token.amount,
          };

          return result;
        },
        {} as Record<TAddress, TLocalStorageToken>
      );

      const withdrawAmounts = withdrawAmount?.map((obj: any) => {
        const decimals = tokenlist.tokens.find(
          (token: TTokenData) => token.symbol === obj.symbol
        )?.decimals;

        const amount = parseUnits(obj.amount, decimals ? decimals : 18);
        return amount - (amount * decimalPercent) / BigInt(100);
      });
      try {
        const gas = await _publicClient?.estimateContractGas({
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [localAssets as TAddress[], sharesToBurn, withdrawAmounts],
          account: $account as TAddress,
        });
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );
        setNeedConfirm(true);
        withdrawAssets = await writeContract(wagmiConfig, {
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [localAssets as TAddress[], sharesToBurn, withdrawAmounts],
          gas: gasLimit,
        });
        setNeedConfirm(false);
        setLoader(true);
        transaction = await waitForTransactionReceipt(wagmiConfig, {
          confirmations: 3,
          hash: withdrawAssets,
        });
        setLocalStoreHash({
          timestamp: new Date().getTime(),
          hash: withdrawAssets,
          status: transaction?.status || "reverted",
          type: "withdraw",
          vault: vault.address,
          tokens: txTokens,
        });
        if (transaction.status === "success") {
          resetFormAfterTx();
        }
        lastTx.set(transaction?.transactionHash);
        setLoader(false);
      } catch (err) {
        if (err instanceof Error) {
          errorHandler(err);
        }
      }
    } else {
      const optionAmount = zapPreviewWithdraw.reduce(
        (acc, obj) => (acc += Number(obj.amountOut)),
        0
      );

      const calculatedValue =
        optionAmount -
        (optionAmount * Math.floor(Number(settings.slippage))) / 100;

      const minAmountOut = parseUnits(
        String(calculatedValue),
        getTokenData(option[0])?.decimals as number
      );

      const router =
        zapPreviewWithdraw[0]?.router || zapPreviewWithdraw[1]?.router;

      const txData = zapPreviewWithdraw.map((preview: any) => preview.txData);

      try {
        const gas = await _publicClient?.estimateContractGas({
          address: $platformsData[network]?.zap,
          abi: ZapABI,
          functionName: "withdraw",
          args: [
            vault.address,
            option[0] as TAddress,
            router as TAddress,
            txData,
            sharesToBurn,
            minAmountOut,
          ],
          account: $account as TAddress,
        });
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );
        setNeedConfirm(true);
        zapWithdraw = await writeContract(wagmiConfig, {
          address: $platformsData[network]?.zap,
          abi: ZapABI,
          functionName: "withdraw",
          args: [
            vault.address,
            option[0] as TAddress,
            router as TAddress,
            txData,
            sharesToBurn,
            minAmountOut,
          ],
          gas: gasLimit,
        });
        setNeedConfirm(false);
        setLoader(true);
        transaction = await waitForTransactionReceipt(wagmiConfig, {
          confirmations: 3,
          hash: zapWithdraw,
        });
        setLocalStoreHash({
          timestamp: new Date().getTime(),
          hash: zapWithdraw,
          status: transaction?.status || "reverted",
          type: "withdraw",
          vault: vault.address,
          tokens: inputs,
        });
        if (transaction.status === "success") {
          resetFormAfterTx();
        }
        lastTx.set(transaction?.transactionHash);
        setLoader(false);
      } catch (err) {
        if (err instanceof Error) {
          errorHandler(err);
        }
      }
    }
    setTransactionInProgress(false);
  };

  const debouncedPreviewWithdraw = useCallback(
    debounce(async (value: string) => {
      const balance = Number(
        formatUnits($vaultData[network][vault.address].vaultUserBalance, 18)
      );
      if (!Number(value)) {
        setWithdrawAmount([]);
        setZapPreviewWithdraw([]);
        return;
      }

      if (Number(value) > balance) {
        setButton("insufficientBalance");
        return;
      }

      ///// UNDERLYING TOKEN
      const currentValue = parseUnits(value, 18);

      if (underlyingToken?.address === option[0]) {
        const { result } = await _publicClient?.simulateContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [option as TAddress[], currentValue, [ZERO_BigInt]],
          account: $account as TAddress,
        });
        setWithdrawAmount([
          {
            symbol: underlyingToken?.symbol,
            logo: underlyingToken?.logoURI,
            amount: formatUnits(result[0], 18),
          },
        ]);
        setButton("withdraw");
      } else {
        let assetsLength = defaultOption?.assetsArray.map(
          (_: string) => ZERO_BigInt
        );
        let localAssets = defaultOption?.assetsArray;
        if (shortId === "IQMF" || shortId === "IRMF") {
          assetsLength = [ZERO_BigInt, ZERO_BigInt];
          localAssets = vault.assets.map((asset) => asset.address);
        }

        const { result } = await _publicClient?.simulateContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [localAssets as TAddress[], currentValue, assetsLength],
          account: $account as TAddress,
        });
        if (
          (defaultOption?.assets === option[0] && option.length < 2) ||
          option.length > 1
        ) {
          const preview = result.map((amount: any, index: number) => {
            const tokenData: TTokenData | any = getTokenData(
              localAssets[index]
            );
            const amountInTokens = Number(
              formatUnits(amount, tokenData?.decimals)
            );
            const amountInUSD =
              amountInTokens *
              Number($assetsPrices[network][localAssets[index]].price);
            return {
              symbol: tokenData?.symbol,
              logo: tokenData?.logoURI,
              amount: amountInTokens.toFixed(5),
              amountInUSD: amountInUSD.toFixed(2),
            };
          });
          setWithdrawAmount(preview);
          setButton("withdraw");
          setLoader(false);
        } else {
          try {
            setLoader(true);
            const allowanceData: any = formatUnits(
              await getAssetAllowance(
                _publicClient,
                option[0] as TAddress,
                tab,
                vault?.address,
                underlyingToken?.address,
                $platformsData?.[network]?.zap
              ),
              18
            );

            const promises = result.map(
              async (amount: bigint, index: number) =>
                await get1InchRoutes(
                  network,
                  localAssets[index] as TAddress,
                  option[0] as TAddress,
                  Number(getTokenData(localAssets[index])?.decimals),
                  amount,
                  setZapError,
                  "withdraw"
                )
            );

            const outData = await Promise.all(promises);

            setZapPreviewWithdraw(outData);

            if (Number(allowanceData) < Number(value)) {
              setButton("needApprove");
            } else {
              setButton("withdraw");
            }
          } catch (err) {
            console.error("WITHDRAW ERROR:", err);
          } finally {
            setLoader(false);
          }
        }
      }
    }, 1000),
    [option, balances]
  );

  const previewWithdraw = async (value: string) => {
    //@ts-ignore
    debouncedPreviewWithdraw(value);
  };

  const checkAllowance = async () => {
    if (!$connected) return;

    const allowanceResult: TVaultAllowance | any = allowance;

    for (let i = 0; i < option.length; i++) {
      const allowanceData = await _publicClient?.readContract({
        address: option[i] as TAddress,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [$account as TAddress, vault.address],
      });

      if (!allowanceResult[option[i]]) {
        allowanceResult[option[i]] = ZERO_BigInt;
      }
      allowanceResult[option[i]] = allowanceData;
    }

    setAllowance(allowanceResult);
  };

  const getIchiAllow = async () => {
    try {
      const allowToken0 = (await _publicClient?.readContract({
        address: vault.underlying,
        abi: ICHIABI,
        functionName: "allowToken0",
      })) as boolean;
      const allowToken1 = (await _publicClient?.readContract({
        address: vault.underlying,
        abi: ICHIABI,
        functionName: "allowToken1",
      })) as boolean;
      setIchiAllow([allowToken0, allowToken1]);
    } catch (err) {
      console.error("get ichi allow error:", err);
    }
  };

  const previewDeposit = async (asset: string, amount: string) => {
    if (!Number(amount)) return;

    setLoader(true);
    if (defaultOption?.assetsArray) {
      const changedInput = defaultOption?.assetsArray?.indexOf(asset);
      const preview: TVaultInput | any = {};
      if (option) {
        let amounts: bigint[] = [];
        for (let i = 0; i < option.length; i++) {
          if (i === changedInput) {
            amounts.push(
              parseUnits(amount, Number(getTokenData(asset)?.decimals))
            );
          } else {
            if (shortId === "CCF") {
              let value;
              let decimals = 18;
              for (const key in inputs) {
                if (key !== asset) {
                  value = inputs[key];
                  decimals = getTokenData(key)?.decimals || 18;

                  break;
                }
              }
              if (value) {
                amounts.push(parseUnits(value, decimals));
              } else {
                amounts.push(parseUnits("0", decimals));
              }
            } else {
              const token = tokenlist.tokens.find(
                (token: TTokenData) =>
                  token.address === option[changedInput ? 0 : 1]
              );

              const decimals = token ? token.decimals + 18 : 24;

              amounts.push(parseUnits("1", decimals));
            }
          }
        }
        try {
          let previewDepositAssets: any;
          if (shortId === "IQMF" || shortId === "IRMF") {
            // IQMF & IRMF strategy only
            let assets: TAddress[] = vault.assets.map((asset) => asset.address);
            let IQMFAmounts: bigint[] = vault.assetsProportions.map(
              (proportion) => (proportion ? amounts[0] : ZERO_BigInt)
            );

            previewDepositAssets = await _publicClient?.readContract({
              address: vault.address,
              abi: VaultABI,
              functionName: "previewDepositAssets",
              args: [assets, IQMFAmounts],
            });
          } else {
            previewDepositAssets = await _publicClient?.readContract({
              address: vault.address,
              abi: VaultABI,
              functionName: "previewDepositAssets",
              args: [defaultOption?.assetsArray as TAddress[], amounts],
            });
          }
          checkInputsAllowance(previewDepositAssets[0] as bigint[]);
          setSharesOut(
            ((previewDepositAssets[1] as bigint) * BigInt(1)) / BigInt(100)
          );

          const previewDepositAssetsArray: bigint[] = [
            ...previewDepositAssets[0],
          ];
          for (let i = 0; i < defaultOption?.assetsArray?.length; i++) {
            const decimals = getTokenData(
              defaultOption?.assetsArray[i]
            )?.decimals;
            if (i !== changedInput && decimals) {
              preview[defaultOption?.assetsArray[i]] = formatUnits(
                previewDepositAssetsArray[i],
                decimals
              );
            }
          }
          setInputs((prevInputs: any) => ({
            ...prevInputs,
            ...preview,
          }));
        } catch (err) {
          console.error("Error: the asset balance is too low to convert.", err);
          setButton("none");
        }
      }
    }
    setLoader(false);
  };

  const isSingleTokenStrategy = useMemo(() => {
    return (
      shortId === "CF" ||
      (shortId === "Y" && vault.assets[0].address === option[0])
    );
  }, [vault]);

  const isNotUnderlying = useMemo(
    () => !underlyingToken || option[0] !== underlyingToken?.address,
    [underlyingToken]
  );

  useEffect(() => {
    localStorage.setItem("transactionSettings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    checkAllowance();
    getAssetsBalances(
      $assetsBalances[network],
      setBalances,
      option,
      underlyingToken
    );
  }, [option, $assetsBalances]);

  useEffect(() => {
    setButton("none");
    setSharesOut(false);
    setWithdrawAmount([]);
    setUnderlyingShares(false);
    setZapShares(false);
    setZapTokens([]);
    setZapError(false);
    setZapPreviewWithdraw([]);
    setLoader(false);
  }, [option, $connected]);

  useEffect(() => {
    resetInputs();
  }, [$connected]);

  useEffect(() => {
    if (vault) {
      selectTokensHandler();
    }
  }, [vault, $tokens, defaultOption, defaultOption]);

  useEffect(() => {
    if (vault?.alm?.protocol === "Ichi") {
      getIchiAllow();
    }
  }, []);

  useEffect(() => {
    setZapTokens([]);
  }, [inputs]);

  ///// interval refresh data
  useEffect(() => {
    if (!$connected) return;
    if (zapTokens || withdrawAmount || zapPreviewWithdraw) {
      const reload = async () => {
        if (transactionInProgress) return;
        if (inputs[option[0]]) {
          if (tab === "Deposit") {
            await getZapDepositSwapAmounts(inputs[option[0]]);
          }
          if (tab === "Withdraw") {
            await previewWithdraw(inputs[option[0]]);
          }
        }
      };

      let intervalId: ReturnType<typeof setInterval> | undefined;

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          intervalId = setInterval(reload, 10000);
        } else {
          clearInterval(intervalId);
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      if (document.visibilityState === "visible") {
        intervalId = setInterval(reload, 10000);
      }

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        clearInterval(intervalId);
      };
    }
  }, [
    zapTokens,
    withdrawAmount,
    zapPreviewWithdraw,
    button,
    transactionInProgress,
  ]);

  useEffect(() => {
    setUnderlyingShares(false);
    setZapShares(false);
    if (option[0] === underlyingToken?.address) {
      setIsRefresh(false);
      return;
    }
    setIsRefresh(true);
  }, [option, inputs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tokenSelectorRef.current &&
        event.target &&
        !tokenSelectorRef.current.contains(event.target as Node)
      ) {
        setTokenSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tokenSelectorRef]);

  useEffect(() => {
    if (vault) {
      const assetsData = vault.assets
        .map((asset: TAsset) => asset.address.toLowerCase())
        .filter((_, index) => vault.assetsProportions[index]);
      if (assetsData?.length) {
        setOption(assetsData);
        defaultAssetsOption(assetsData);
      }
    }
  }, []);

  return (
    <div className="bg-accent-950 rounded-2xl min-w-[320px] md:w-[420px] font-manrope">
      <TabSwitcher
        activeTab={tab}
        setActiveTab={setTab}
        resetInputs={resetInputs}
        resetOptions={resetOptions}
      />

      <form autoComplete="off" className="w-full p-6 flex flex-col gap-[10px]">
        <div className="flex items-center gap-4 relative pb-[12px]">
          {optionTokens && (
            <div
              className="relative select-none min-w-[235px] w-[290px] text-neutral-50 text-[14px] "
              ref={tokenSelectorRef}
            >
              <div className="flex uppercase text-[12px] leading-3 text-neutral-500 mb-0 md:mb-0">
                Select token
              </div>
              <div
                onClick={() => {
                  setTokenSelector((prevState) => !prevState);
                }}
                className="flex items-center justify-between gap-2 rounded-2xl px-4 h-[36px] my-[2px] bg-accent-900 text-[16px] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.isArray(activeOptionToken?.logoURI) &&
                      activeOptionToken?.logoURI?.map((logo: string) => (
                        <img
                          key={Math.random()}
                          className="w-6 h-6 rounded-full"
                          src={logo}
                          alt="logo"
                        />
                      ))}
                  </div>
                  <p className="whitespace-nowrap">
                    {activeOptionToken?.symbol}
                  </p>
                </div>
                <img
                  className={`transition delay-[50ms] ${
                    tokenSelector ? "rotate-[180deg]" : "rotate-[0deg]"
                  }`}
                  src="/icons/arrow-down.svg"
                  alt="arrowDown"
                />
              </div>

              <div
                className={`bg-accent-900 mt-2 rounded-2xl w-full z-30 ${
                  tokenSelector ? "absolute transition delay-[50ms]" : "hidden"
                } `}
              >
                <div
                  onClick={() => {
                    optionHandler(
                      defaultOption?.assets.split(", "),
                      defaultOption?.symbols,
                      defaultOption?.assets,
                      defaultOption?.logos
                    );
                  }}
                  className="text-center cursor-pointer opacity-60 hover:opacity-100 flex items-center justify-start px-4 py-[10px] gap-2"
                >
                  <div
                    className={`flex items-center ${
                      defaultOption?.logos?.length < 2 && "ml-3"
                    }`}
                  >
                    {defaultOption?.logos?.map((logo: string) => (
                      <img
                        key={Math.random()}
                        className="max-w-6 max-h-6 rounded-full"
                        src={logo}
                        alt="logo"
                      />
                    ))}
                  </div>

                  <p
                    className={`${
                      defaultOption?.logos?.length < 2 ? "ml-2" : "ml-[-4px]"
                    }`}
                  >
                    {defaultOption?.symbols}
                  </p>
                </div>
                {!!underlyingToken.symbol && (
                  <div
                    className="text-center cursor-pointer opacity-60 hover:opacity-100 flex items-center justify-start px-4 py-[10px] gap-2 ml-3"
                    onClick={() => {
                      optionHandler(
                        [underlyingToken?.address],
                        underlyingToken?.symbol,
                        underlyingToken?.address,
                        [getProtocolLogo(shortId)]
                      );
                    }}
                  >
                    {underlyingToken?.logoURI && (
                      <img
                        className="w-6 h-6 rounded-full"
                        src={underlyingToken.logoURI}
                        alt="logo"
                      />
                    )}
                    <p className="ml-2">{underlyingToken.symbol}</p>
                  </div>
                )}
                {/* CRV Strategy don't have zap withdraw */}
                {!(shortId === "CCF" && tab === "Withdraw") &&
                  optionTokens.map(({ address, symbol, logoURI }) => {
                    return (
                      <div
                        className="text-center cursor-pointer opacity-60 hover:opacity-100 flex items-center justify-start px-4 py-[10px] gap-2 ml-3"
                        key={address as string}
                        onClick={() => {
                          optionHandler(
                            [address as string],
                            symbol as string,
                            address as string,
                            [logoURI as string]
                          );
                        }}
                      >
                        {logoURI && (
                          <img
                            className="w-6 h-6 rounded-full"
                            src={logoURI as string}
                            alt="logo"
                          />
                        )}
                        <p className="ml-2">{symbol}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {$connected && (
            <div className="flex items-center gap-5 pt-[12px]">
              <img
                className={`${
                  isRefresh ? "cursor-pointer" : "cursor-default"
                } transition-transform duration-500`}
                style={{ transform: `rotate(${rotation}deg)` }}
                onClick={refreshData}
                src="/refresh.svg"
                alt="refresh"
                title="refresh"
              />

              <img
                className={`settingsModal cursor-pointer transition-transform transform ${
                  settingsModal ? "rotate-180" : "rotate-0"
                }`}
                onClick={() => setSettingsModal((prev) => !prev)}
                src="/settings.svg"
                alt="settings"
                title="settings"
              />
            </div>
          )}

          {settingsModal && (
            <SettingsModal
              settingsState={settings}
              setSettingsState={setSettings}
              setModalState={setSettingsModal}
            />
          )}
        </div>

        {tab === "Deposit" ? (
          <>
            {option?.length > 1 ||
            (defaultOption?.assets === option[0] && option.length < 2) ? (
              <>
                <div className="flex flex-col items-center justify-center gap-[10px] min-w-[312px] w-[372px]">
                  {option.map((asset: string, index: number) => {
                    const currentAsset = getTokenData(asset) as TTokenData;
                    return (
                      <div className="min-w-full gap-[10px]" key={asset}>
                        {ichiAllow[index] && (
                          <div className="min-w-full h-[64px]">
                            {!!balances[asset] && (
                              <div className="h-3 text-[12px] leading-3 text-neutral-500  flex items-center gap-1">
                                <span>Balance: </span>
                                <span>{balances[asset]}</span>
                              </div>
                            )}

                            <label className="relative block h-[40px] w-[345px]">
                              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <img
                                  src={currentAsset.logoURI}
                                  alt={currentAsset.name}
                                  title={currentAsset.name}
                                  className="w-4 h-4 text-neutral-500 rounded-full"
                                />
                              </span>
                              <input
                                list="amount"
                                id={asset}
                                name="amount"
                                placeholder="0"
                                value={inputs[asset]}
                                onChange={(e) =>
                                  handleInputChange(e.target.value, e.target.id)
                                }
                                onKeyDown={(evt) =>
                                  handleInputKeyDown(evt, inputs[asset])
                                }
                                type="text"
                                className="min-w-full bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 h-[36px] my-[2px] pl-10 text-[14px]"
                              />
                              {!!$connected && !!balances[option[0]] && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    balances[asset] &&
                                    handleInputChange(balances[asset], asset)
                                  }
                                  className="absolute inset-y-0 right-1 flex items-center px-3 py-1 text-accent-400 text-[12px] font-semibold"
                                >
                                  Max
                                </button>
                              )}
                            </label>

                            <p className="h-3 text-[12px] leading-3 text-neutral-500 flex items-center gap-1">
                              $
                              {$assetsPrices[network] &&
                              Number(inputs[asset]) > 0 &&
                              underlyingToken?.address != option[0]
                                ? (
                                    Number(
                                      $assetsPrices[network][asset].price
                                    ) * Number(inputs[asset])
                                  ).toFixed(2)
                                : 0}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="h-[64px]">
                  {loader && !transactionInProgress ? (
                    <ShareSkeleton />
                  ) : (
                    <div
                      className={`h-[64px] text-[18px] ${ichiAllow.every((ichi) => ichi === true) ? "" : "mt-[-10px]"}`}
                    >
                      {!!sharesOut && (
                        <div>
                          <p className="uppercase text-[12px] leading-3 text-neutral-500">
                            You Receive
                          </p>
                          <div className="h-[40px] flex items-center text-neutral-50 text-[14px]">
                            <div className="mr-4">
                              <AssetsProportion
                                proportions={vault.assetsProportions}
                                assets={vault?.assets}
                                vaultLogo={`https://api.stabilitydao.org/vault/${vault.network}/${vault.address}/logo.svg`}
                              />
                            </div>
                            {Number(
                              formatUnits(BigInt(sharesOut) * BigInt(100), 18)
                            ).toFixed(12)}{" "}
                            ($
                            {(
                              Number(
                                formatUnits(BigInt(sharesOut) * BigInt(100), 18)
                              ) * Number(vault.shareprice)
                            ).toFixed(2)}
                            )
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col text-[15px] w-full">
                {!!balances[option[0]] && (
                  <div className="h-[12p] text-[12px] leading-3 text-neutral-500 flex items-center gap-1">
                    <span>Balance: </span>
                    <span>{balances[option[0]]}</span>
                  </div>
                )}

                <label className="relative block h-[40px] w-[345px]">
                  <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <img
                      src={activeOptionToken.logoURI[0]}
                      alt={activeOptionToken.symbol as string}
                      title={activeOptionToken.symbol as string}
                      className="w-4 h-4 text-neutral-500 rounded-full"
                    />
                  </span>
                  <input
                    list="amount"
                    id={option[0]}
                    value={inputs[option[0]]}
                    name="amount"
                    type="text"
                    placeholder="0"
                    onChange={(e) =>
                      zapInputHandler(e.target.value, e.target.id)
                    }
                    onKeyDown={(evt) =>
                      handleInputKeyDown(evt, inputs[option[0]])
                    }
                    className="min-w-full bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 h-[36px] my-[2px] pl-10 text-[14px]"
                  />
                  {!!$connected && !!balances[option[0]] && (
                    <button
                      type="button"
                      onClick={() =>
                        zapInputHandler(balances[option[0]], option[0])
                      }
                      className="absolute inset-y-0 right-1 flex items-center px-3 py-1 text-accent-400 text-[12px] font-semibold"
                    >
                      Max
                    </button>
                  )}
                </label>

                <p className="h-3 text-[12px] leading-3 text-neutral-500 flex items-center gap-1">
                  $
                  {$assetsPrices[network] &&
                  Number(inputs[option[0]]) > 0 &&
                  underlyingToken?.address !== option[0]
                    ? (
                        Number($assetsPrices[network][option[0]].price) *
                        Number(inputs[option[0]])
                      ).toFixed(2)
                    : 0}
                </p>

                <div className="mt-[10px] flex flex-col">
                  {isNotUnderlying && (
                    <>
                      <p className="h-3 text-[12px] leading-3 text-neutral-500 uppercase mb-0">
                        Swaps
                      </p>

                      {loader && !transactionInProgress ? (
                        <div className="flex items-start justify-start">
                          <AssetsSkeleton />
                        </div>
                      ) : (
                        <div className="flex h-[52px] mb-[10px]">
                          {!!zapTokens.length && (
                            <>
                              {shortId !== "CCF" ? (
                                <div className="h-[40px] flex items-center">
                                  <img
                                    src="/oneInch.svg"
                                    alt="1inch logo"
                                    title="1inch"
                                    className="w-[26px] h-[26px]"
                                  />
                                  <div className="flex whitespace-nowrap gap-3 items-center">
                                    {zapTokens?.map((token: any) => (
                                      <div
                                        className="text-[14px] flex items-center gap-3"
                                        key={token.address}
                                      >
                                        {token.address.toLowerCase() !==
                                          option[0].toLowerCase() && (
                                          <div className="flex items-center gap-1 mt-2">
                                            {zapError ? (
                                              <img
                                                src="/error.svg"
                                                alt="error img"
                                                title="error"
                                              />
                                            ) : (
                                              <>
                                                <div className="flex items-center gap-1">
                                                  {/* <p>
                                                  {Number(
                                                    token.amountIn
                                                  ).toFixed(6)}
                                                </p>*/}
                                                  <img
                                                    src={
                                                      getTokenData(option[0])
                                                        ?.logoURI
                                                    }
                                                    title={
                                                      getTokenData(option[0])
                                                        ?.symbol
                                                    }
                                                    alt={
                                                      getTokenData(option[0])
                                                        ?.symbol
                                                    }
                                                    className="w-6 h-6 rounded-full"
                                                  />
                                                </div>
                                                -&gt;
                                                <div className="flex items-center gap-1">
                                                  {/*<p>
                                                  {Number(
                                                    token.amountOut
                                                  ).toFixed(6)}
                                                </p>*/}
                                                  <img
                                                    src={token.img}
                                                    title={token.symbol}
                                                    alt={token.symbol}
                                                    className="w-6 h-6 rounded-full"
                                                  />
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-[14px]  flex items-center gap-1 ml-2">
                                  <div className="flex items-center gap-1 mt-2">
                                    <img
                                      src="/oneInch.svg"
                                      alt="1inch logo"
                                      title="1inch"
                                    />
                                    {zapError ? (
                                      <img
                                        src="/error.svg"
                                        alt="error img"
                                        title="error"
                                      />
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-1">
                                          <p>
                                            {Number(
                                              zapTokens[0].amountIn
                                            ).toFixed(6)}
                                          </p>
                                          <img
                                            src={
                                              getTokenData(option[0])?.logoURI
                                            }
                                            title={
                                              getTokenData(option[0])?.symbol
                                            }
                                            alt={
                                              getTokenData(option[0])?.symbol
                                            }
                                            className="w-6 h-6 rounded-full"
                                          />
                                        </div>
                                        -&gt;
                                        <div className="flex items-center gap-1">
                                          <p>
                                            {Number(
                                              zapTokens[0].amountOut
                                            ).toFixed(6)}
                                          </p>
                                          <img
                                            src={zapTokens[0].img}
                                            title={zapTokens[0].symbol}
                                            alt={zapTokens[0].symbol}
                                            className="w-6 h-6 rounded-full"
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex mt-[-3px]">
                    <div className="h-[66px]">
                      <p className="text-[12px] text-neutral-500 uppercase">
                        You Receive
                      </p>
                      <div className="h-[63px]">
                        <div className="text-left text-neutral-50 text-[14px]">
                          <div className="flex items-center">
                            <div className="mr-4">
                              <AssetsProportion
                                proportions={vault.assetsProportions}
                                assets={vault?.assets}
                                vaultLogo={`https://api.stabilitydao.org/vault/${vault.network}/${vault.address}/logo.svg`}
                              />
                            </div>

                            {loader && !transactionInProgress ? (
                              <ShareSkeleton height={24} width={300} />
                            ) : (
                              <div>
                                {(underlyingShares &&
                                  Number(inputs[option[0]]) > 0) ||
                                (zapShares && Number(inputs[option[0]]) > 0) ? (
                                  <p className="h-6">
                                    {underlyingShares &&
                                    Number(inputs[option[0]]) > 0
                                      ? `${underlyingShares} ($${(
                                          Number(underlyingShares) *
                                          Number(vault.shareprice)
                                        ).toFixed(2)})`
                                      : zapShares &&
                                        Number(inputs[option[0]]) > 0 &&
                                        `${zapShares} ($${(
                                          Number(zapShares) *
                                          Number(vault.shareprice)
                                        ).toFixed(2)})`}
                                  </p>
                                ) : (
                                  <p className="h-6">0 ($0.0)</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid text-[15px] w-full">
              {!!balances[option[0]] && (
                <div className="h-[12p] text-[12px] leading-3 text-neutral-500 flex items-center gap-1">
                  <span>Balance:</span>
                  <span>
                    {parseFloat(
                      formatUnits(
                        $vaultData[network][vault.address].vaultUserBalance,
                        18
                      )
                    )}
                  </span>
                </div>
              )}

              <label className="relative block w-[345px]">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <img
                    src={activeOptionToken.logoURI[0]}
                    alt={activeOptionToken.symbol as string}
                    title={activeOptionToken.symbol as string}
                    className="w-4 h-4 text-neutral-500 rounded-full"
                  />
                </span>
                <input
                  list="amount"
                  id={option.join(", ")}
                  value={inputs[option[0]]}
                  name="amount"
                  placeholder="0"
                  onChange={(e) => {
                    zapInputHandler(e.target.value, e.target.id);
                    previewWithdraw(e.target.value);
                    handleInputChange(e.target.value, e.target.id);
                  }}
                  onKeyDown={(evt) =>
                    handleInputKeyDown(evt, inputs[option[0]])
                  }
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  inputMode="decimal"
                  className="min-w-full bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 h-[36px] my-[2px] pl-10 text-[14px]"
                />
                {!!balances[option[0]] && (
                  <button
                    type="button"
                    onClick={() => {
                      zapInputHandler(
                        formatUnits(
                          $vaultData[network][vault.address]?.vaultUserBalance,
                          18
                        ),
                        option[0]
                      );
                      previewWithdraw(
                        formatUnits(
                          $vaultData[network][vault.address]?.vaultUserBalance,
                          18
                        )
                      );
                    }}
                    className="absolute inset-y-0 right-1 flex items-center px-3 py-1 text-accent-400 text-[12px] font-semibold"
                  >
                    Max
                  </button>
                )}
              </label>

              <p className="text-[12px] h-3 text-neutral-500 flex items-center gap-1">
                $
                {$assetsPrices[network] && Number(inputs[option[0]]) > 0
                  ? (
                      Number(vault.shareprice) * Number(inputs[option[0]])
                    ).toFixed(2)
                  : 0}
              </p>
            </div>
            <div className="flex flex-col items-start justify-end gap-2">
              {(option.length > 1 ||
                isSingleTokenStrategy ||
                !isNotUnderlying) && (
                <p className="text-[12px] flex justify-end items-end leading-3 text-neutral-500 uppercase mt-[75px]">
                  You Receive
                </p>
              )}

              <div className="flex flex-col justify-start items-start">
                {(option.length > 1 ||
                  isSingleTokenStrategy ||
                  !isNotUnderlying) &&
                  option.map((address, index) => (
                    <div className="flex items-center gap-1" key={address}>
                      {isNotUnderlying ? (
                        <img
                          src={getTokenData(address)?.logoURI}
                          alt={getTokenData(address)?.symbol}
                          title={getTokenData(address)?.symbol}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <img
                          src={underlyingToken?.logoURI}
                          alt={underlyingToken?.symbol}
                          title={underlyingToken?.symbol}
                          className="w-6 h-6 rounded-full"
                        />
                      )}

                      {loader && !transactionInProgress ? (
                        <ShareSkeleton height={24} width={300} />
                      ) : (
                        <p className="text-[14px] text-neutral-50 h-6">
                          {!!withdrawAmount.length
                            ? withdrawAmount[index]?.amountInUSD
                              ? `${withdrawAmount[index]?.amount} ($${withdrawAmount[index].amountInUSD})`
                              : `${withdrawAmount[index]?.amount}`
                            : "0 ($0)"}
                        </p>
                      )}
                    </div>
                  ))}

                {!isSingleTokenStrategy && isNotUnderlying && (
                  <div>
                    {option.length < 2 && (
                      <p className="text-[12px] text-neutral-500 uppercase mt-[-3px]">
                        Swaps
                      </p>
                    )}
                    {loader && option.length < 2 && !transactionInProgress ? (
                      <AssetsSkeleton height={40} />
                    ) : (
                      <div
                        className={`${option.length < 2 && "h-10 mb-[10px]"}`}
                      >
                        {!!zapPreviewWithdraw.length &&
                          zapPreviewWithdraw?.map(
                            ({ address, amountIn, amountOut }) => (
                              <div key={amountIn}>
                                {address.toLowerCase() !==
                                  option[0].toLowerCase() && (
                                  <div className="flex items-center h-5">
                                    <img
                                      src="/oneInch.svg"
                                      alt="1inch logo"
                                      title="1inch"
                                      className="w-[20px] h-[20px]"
                                    />
                                    {!!amountOut ? (
                                      <>
                                        <div className="flex text-[14px] items-center gap-1">
                                          <img
                                            src={getTokenData(address)?.logoURI}
                                            title={
                                              getTokenData(address)?.symbol
                                            }
                                            alt={getTokenData(address)?.symbol}
                                            className="w-[18px] h-[18px] rounded-full"
                                          />
                                        </div>
                                        -&gt;
                                        <div className="flex text-[14px] items-center gap-1">
                                          <img
                                            src={
                                              getTokenData(option[0])?.logoURI
                                            }
                                            title={
                                              getTokenData(option[0])?.symbol
                                            }
                                            alt={
                                              getTokenData(option[0])?.symbol
                                            }
                                            className="w-[18px] h-[18px] rounded-full"
                                          />
                                        </div>
                                      </>
                                    ) : (
                                      <img
                                        src="/error.svg"
                                        alt="error img"
                                        title="error"
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {option.length < 2 &&
                isNotUnderlying &&
                !isSingleTokenStrategy && (
                  <div>
                    <p className="text-[12px] text-neutral-500 uppercase mt-[-3px]">
                      You Receive
                    </p>
                    <div className="h-[63px]">
                      <div className="flex items-center gap-1">
                        <img
                          src={getTokenData(option[0])?.logoURI}
                          alt={getTokenData(option[0])?.symbol}
                          title={getTokenData(option[0])?.symbol}
                          className="w-6 h-6 rounded-full"
                        />
                        {loader && !transactionInProgress ? (
                          <ShareSkeleton height={24} width={300} />
                        ) : (
                          <div className="text-[14px] text-neutral-50">
                            {!!zapPreviewWithdraw.length ? (
                              <div className="flex items-center gap-1">
                                <p>
                                  {(
                                    Number(
                                      Number(zapPreviewWithdraw[0]?.amountOut)
                                        ? zapPreviewWithdraw[0]?.amountOut
                                        : zapPreviewWithdraw[0]?.amountIn
                                    ) +
                                    (zapPreviewWithdraw[1]
                                      ? Number(
                                          Number(
                                            zapPreviewWithdraw[1]?.amountOut
                                          )
                                            ? zapPreviewWithdraw[1]?.amountOut
                                            : zapPreviewWithdraw[1]?.amountIn
                                        )
                                      : 0)
                                  ).toFixed(5)}
                                </p>
                                <p>{`($${(
                                  (Number(
                                    Number(zapPreviewWithdraw[0]?.amountOut)
                                      ? zapPreviewWithdraw[0]?.amountOut
                                      : zapPreviewWithdraw[0]?.amountIn
                                  ) +
                                    (zapPreviewWithdraw[1]
                                      ? Number(
                                          Number(
                                            zapPreviewWithdraw[1]?.amountOut
                                          )
                                            ? zapPreviewWithdraw[1]?.amountOut
                                            : zapPreviewWithdraw[1]?.amountIn
                                        )
                                      : 0)) *
                                  Number(
                                    $assetsPrices[network][option[0]].price
                                  )
                                ).toFixed(2)})`}</p>
                              </div>
                            ) : (
                              <p>0 ($0)</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </>
        )}

        <div className="flex mb-[6px] w-full flex-col">
          {$connected ? (
            <>
              {chain?.id === Number(network) ? (
                <>
                  {zapError ? (
                    <button
                      disabled
                      className="mt-2 w-full flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                    >
                      Failed to get routes from aggregator
                    </button>
                  ) : (
                    <>
                      {tab === "Deposit" ? (
                        <>
                          {option?.length > 1 ||
                          (defaultOption?.assets === option[0] &&
                            option.length < 2) ? (
                            <>
                              {button === "deposit" ? (
                                <button
                                  disabled={transactionInProgress}
                                  className={`mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                                    transactionInProgress
                                      ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                                      : ""
                                  }`}
                                  type="button"
                                  onClick={deposit}
                                >
                                  <p>
                                    {needConfirm
                                      ? "Confirm in wallet"
                                      : "Deposit"}
                                  </p>

                                  {transactionInProgress && (
                                    <Loader color={"#a6a0b2"} />
                                  )}
                                </button>
                              ) : button === "needApprove" ? (
                                <div className="flex gap-3 ">
                                  {option.map(
                                    (asset: any, index: number) =>
                                      allowance &&
                                      formatUnits(
                                        allowance[asset],
                                        Number(getTokenData(asset)?.decimals)
                                      ) < inputs[asset] && (
                                        <button
                                          disabled={approveIndex !== false}
                                          className={`mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                                            approveIndex === index
                                              ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                                              : ""
                                          }`}
                                          key={asset}
                                          type="button"
                                          onClick={() =>
                                            approve(asset as TAddress, index)
                                          }
                                        >
                                          <p>
                                            {needConfirm
                                              ? "Confirm in wallet"
                                              : `Approve ${
                                                  getTokenData(asset)?.symbol
                                                }`}
                                          </p>
                                          {approveIndex === index && (
                                            <Loader color={"#a6a0b2"} />
                                          )}
                                        </button>
                                      )
                                  )}
                                </div>
                              ) : button === "insufficientBalance" ? (
                                <button
                                  disabled
                                  className="mt-2 w-full flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                                >
                                  Insufficient Balance
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="mt-2 w-full flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                                >
                                  {loader ? "Loading..." : "Enter Amount"}
                                </button>
                              )}
                            </>
                          ) : (
                            <div>
                              {shortId === "CCF" &&
                              defaultOption?.assets?.includes(option[0]) ? (
                                <>
                                  {button === "deposit" ? (
                                    <button
                                      disabled={transactionInProgress}
                                      className={`mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                                        transactionInProgress
                                          ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                                          : ""
                                      }`}
                                      type="button"
                                      onClick={deposit}
                                    >
                                      <p>
                                        {needConfirm
                                          ? "Confirm in wallet"
                                          : "Deposit"}
                                      </p>

                                      {transactionInProgress && (
                                        <Loader color={"#a6a0b2"} />
                                      )}
                                    </button>
                                  ) : button === "needApprove" ? (
                                    <div className="flex gap-3">
                                      {option.map(
                                        (asset: any, index: number) => {
                                          if (
                                            allowance &&
                                            formatUnits(
                                              allowance[asset],
                                              Number(
                                                getTokenData(asset)?.decimals
                                              )
                                            ) < inputs[asset]
                                          ) {
                                            isAnyCCFOptionVisible = true;
                                            return (
                                              <button
                                                disabled={
                                                  approveIndex !== false
                                                }
                                                className={`mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                                                  approveIndex === index
                                                    ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                                                    : ""
                                                }`}
                                                key={asset}
                                                type="button"
                                                onClick={() =>
                                                  approve(
                                                    asset as TAddress,
                                                    index
                                                  )
                                                }
                                              >
                                                <p>
                                                  {needConfirm
                                                    ? "Confirm in wallet"
                                                    : `Approve ${
                                                        getTokenData(asset)
                                                          ?.symbol
                                                      }`}
                                                </p>
                                                {approveIndex === index && (
                                                  <Loader color={"#a6a0b2"} />
                                                )}
                                              </button>
                                            );
                                          } else {
                                            return null;
                                          }
                                        }
                                      )}
                                      {!isAnyCCFOptionVisible && (
                                        <button
                                          disabled={transactionInProgress}
                                          className={`mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                                            transactionInProgress
                                              ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                                              : ""
                                          }`}
                                          type="button"
                                          onClick={deposit}
                                        >
                                          <p>
                                            {needConfirm
                                              ? "Confirm in wallet"
                                              : "Deposit"}
                                          </p>

                                          {transactionInProgress && (
                                            <Loader color={"#a6a0b2"} />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  ) : button === "insufficientBalance" ? (
                                    <button
                                      disabled
                                      className="mt-2 w-full flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                                    >
                                      Insufficient Balance
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className="mt-2 w-full flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                                    >
                                      {loader ? "Loading..." : "Enter Amount"}
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  {button === "insufficientBalance" ? (
                                    <button
                                      disabled
                                      className="mt-2 w-full flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                                    >
                                      Insufficient Balance
                                    </button>
                                  ) : button === "needApprove" ? (
                                    <button
                                      disabled={transactionInProgress}
                                      className={`mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                                        transactionInProgress
                                          ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                                          : ""
                                      }`}
                                      type="button"
                                      onClick={zapApprove}
                                    >
                                      <p>
                                        {needConfirm
                                          ? "Confirm in wallet"
                                          : `Approve ${
                                              underlyingToken?.address ===
                                              option[0]
                                                ? underlyingToken.symbol
                                                : getTokenData(option[0])
                                                    ?.symbol
                                            }`}
                                      </p>
                                      {transactionInProgress && (
                                        <Loader color={"#a6a0b2"} />
                                      )}
                                    </button>
                                  ) : button === "deposit" ? (
                                    <button
                                      disabled={transactionInProgress}
                                      className={`mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                                        transactionInProgress
                                          ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                                          : ""
                                      }`}
                                      type="button"
                                      onClick={zapDeposit}
                                    >
                                      <p>
                                        {needConfirm
                                          ? "Confirm in wallet"
                                          : "Deposit"}
                                      </p>
                                      {transactionInProgress && (
                                        <Loader color={"#a6a0b2"} />
                                      )}
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className="mt-2 w-full flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                                    >
                                      {loader ? "Loading..." : "Enter Amount"}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {button === "insufficientBalance" ? (
                            <button
                              disabled
                              className="mt-2 w-full flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                            >
                              Insufficient Balance
                            </button>
                          ) : button === "needApprove" ? (
                            <button
                              disabled={transactionInProgress}
                              className={`mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                                transactionInProgress
                                  ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                                  : ""
                              }`}
                              type="button"
                              onClick={withdrawZapApprove}
                            >
                              <p>
                                {needConfirm ? "Confirm in wallet" : "Approve"}
                              </p>
                              {transactionInProgress && (
                                <Loader color={"#a6a0b2"} />
                              )}
                            </button>
                          ) : button === "withdraw" ? (
                            <button
                              disabled={transactionInProgress}
                              type="button"
                              className={`mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl ${
                                transactionInProgress
                                  ? "text-neutral-500 bg-neutral-900 flex items-center justify-center gap-2"
                                  : ""
                              }`}
                              onClick={withdraw}
                            >
                              <p>
                                {needConfirm ? "Confirm in wallet" : "Withdraw"}
                              </p>
                              {transactionInProgress && (
                                <Loader color={"#a6a0b2"} />
                              )}
                            </button>
                          ) : (
                            <button
                              disabled
                              className="mt-2 w-full flex items-center justify-center text-[16px] font-semibold text-neutral-500 bg-neutral-900 py-3 rounded-2xl"
                            >
                              {loader ? "Loading..." : "Enter Amount"}
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={() => switchChain({ chainId: Number(network) })}
                  className="mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl"
                  type="button"
                >
                  Switch Network
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              className="mt-2 w-full flex items-center text-[16px] bg-accent-500 text-neutral-50 font-semibold justify-center py-3 rounded-2xl"
              onClick={() => open()}
            >
              Connect Wallet
            </button>
          )}
        </div>

        {error?.state && <InvestError error={error} setError={setError} />}
      </form>
    </div>
  );
};

export { InvestForm };
