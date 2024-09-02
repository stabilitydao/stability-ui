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
} from "../../functions";

import { DEFAULT_ERROR } from "@constants";

import type {
  TAddress,
  TVaultAllowance,
  TVaultInput,
  TVaultBalance,
  TTokenData,
  TPlatformsData,
  TVault,
  TBalances,
  TAsset,
  TError,
  TUnderlyingToken,
} from "@types";

import tokenlist from "@stabilitydao/stability/out/stability.tokenlist.json";

interface IProps {
  network: string;
  vault: TVault;
}

type TOptionInfo = { address: TAddress; symol: string; logoURI: string };

const InvestForm: React.FC<IProps> = ({ network, vault }) => {
  const _publicClient = usePublicClient({
    chainId: Number(network),
    config: wagmiConfig,
  });

  const { open } = useWeb3Modal();

  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const $vaultData = useStore(vaultData);
  const $account: TAddress = useStore(account);
  const $assetsPrices = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);

  const $transactionSettings = useStore(transactionSettings);
  const $platformsData: TPlatformsData = useStore(platformsData);
  const $tokens: TAddress[] = useStore(tokens);
  const $connected = useStore(connected);

  const [tab, setTab] = useState("Deposit");
  const [option, setOption] = useState<string[]>([]);

  const [defaultOption, setDefaultOption] = useState({
    symbols: "",
    assets: "",
    assetsArray: [],
    logos: [],
  });

  const [allowance, setAllowance] = useState<TVaultAllowance>({});
  const [balances, setBalances] = useState<TVaultBalance>({});

  const [inputs, setInputs] = useState<TVaultInput>({});

  const [sharesOut, setSharesOut] = useState<bigint | boolean>(false);

  const [withdrawAmount, setWithdrawAmount] = useState<string[] | boolean>(
    false
  );

  const [zapPreviewWithdraw, setZapPreviewWithdraw] = useState();
  const [underlyingToken, setUnderlyingToken] = useState<TUnderlyingToken>({
    address: "0x0",
    symbol: "",
    decimals: 0,
    balance: 0,
    allowance: 0,
    logoURI: "",
  });

  const [underlyingShares, setUnderlyingShares] = useState();
  const [zapShares, setZapShares] = useState();
  const [button, setButton] = useState<string>("none");
  const [optionTokens, setOptionTokens] = useState<TOptionInfo[]>([]);
  const [approveIndex, setApproveIndex] = useState(false);

  const [tokenSelector, setTokenSelector] = useState<boolean>(false);
  const [activeOptionToken, setActiveOptionToken] = useState<{
    symbol: string;
    address: string;
    logoURI: string[];
  }>({
    symbol: "",
    address: "",
    logoURI: [],
  });

  const [settingsModal, setSettingsModal] = useState(false);

  const [settings, setSettings] = useState($transactionSettings);

  const [zapTokens, setZapTokens] = useState(false);
  const [zapError, setZapError] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [isRefresh, setIsRefresh] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [needConfirm, setNeedConfirm] = useState(false);
  const [loader, setLoader] = useState<boolean>(false);

  const [error, setError] = useState<TError>(DEFAULT_ERROR);

  const tokenSelectorRef = useRef<HTMLDivElement>(null);

  let isAnyCCFOptionVisible = false;

  const checkButtonApproveDeposit = (apprDepo: string[]) => {
    const { shortName } = vault.strategyInfo;

    if (shortName === "IQMF" || shortName === "IRMF") {
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
    const { shortName } = vault.strategyInfo;

    const isIRMF = shortName === "IRMF";
    const isIQMFOrIRMF = shortName === "IQMF" || isIRMF;

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
    setZapTokens(false);
    setZapPreviewWithdraw(false);
    setUnderlyingShares(false);
    setWithdrawAmount(false);
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
      .filter((token) => $tokens[network].includes(token.address.toLowerCase()))
      .map(({ address, symbol, logoURI }) => ({ address, symbol, logoURI }));

    filtredTokens = filtredTokens.filter(
      (token) => token.address != defaultOption?.assets
    );
    if (defaultOption?.assetsArray?.length < 2) {
      filtredTokens = filtredTokens.filter(
        (token) => token.address != defaultOption?.assetsArray[0]
      );
    }
    ///// GET UNDERLYING TOKEN
    try {
      if (vault.underlying != zeroAddress) {
        const logo = getProtocolLogo(vault.strategyInfo.shortName);
        if ($connected) {
          let underlyingSymbol = "";

          if (vault.strategyInfo.shortName === "DQMF") {
            underlyingSymbol = await _publicClient?.readContract({
              address: vault.underlying,
              abi: ERC20DQMFABI,
              functionName: "symbol",
            });

            underlyingSymbol = decodeHex(underlyingSymbol);
          } else {
            underlyingSymbol = await _publicClient?.readContract({
              address: vault.underlying,
              abi: ERC20MetadataUpgradeableABI,
              functionName: "symbol",
            });
          }

          const underlyingDecimals = await _publicClient?.readContract({
            address: vault.underlying,
            abi: ERC20MetadataUpgradeableABI,
            functionName: "decimals",
          });
          const underlyingAllowance = await _publicClient?.readContract({
            address: vault.underlying,
            abi: ERC20MetadataUpgradeableABI,
            functionName: "allowance",
            args: [$account as TAddress, vault.address],
          });
          const underlyingBalance = await _publicClient?.readContract({
            address: vault.underlying,
            abi: ERC20MetadataUpgradeableABI,
            functionName: "balanceOf",
            args: [$account as TAddress],
          });

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
        setZapTokens(false);
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
        setZapTokens(false);
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

          setUnderlyingShares(formatUnits(previewDepositAssets[1], 18));
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

          checkInputsAllowance(previewDepositAssets[0] as bigint[]);
          setSharesOut(
            ((previewDepositAssets[1] as bigint) * BigInt(1)) / BigInt(100)
          );
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
            asset,
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
    setZapTokens(false);
    setZapPreviewWithdraw(false);
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
            option[0],
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
      errorHandler(err);
    }

    setTransactionInProgress(false);
  };

  const zapDeposit = async () => {
    // break point for curve
    if (
      vault?.strategyInfo?.shortName === "CCF" &&
      defaultOption?.assets.includes(option[0])
    ) {
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
        const shares = parseUnits(underlyingShares, 18);
        const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));

        const out = shares - (shares * decimalPercent) / 100n;

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
        errorHandler(err);
      }
    } else {
      try {
        const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));

        const shares = parseUnits(zapShares, 18);

        const out = shares - (shares * decimalPercent) / 100n;

        const amountIn = parseUnits(
          amount,
          getTokenData(option[0])?.decimals || 18
        );

        const router = zapTokens[0].router || zapTokens[1].router;

        let txData = zapTokens.map((tokens: any) => tokens.txData);

        if (
          vault.strategyInfo.shortName === "IQMF" ||
          vault.strategyInfo.shortName === "IRMF"
        )
          txData.push("");

        if (vault.strategyInfo.shortName === "IRMF") {
          txData.reverse();
        }
        if (vault.strategyInfo.shortName === "CCF") txData[1] = "";

        gas = await _publicClient?.estimateContractGas({
          address: $platformsData[network]?.zap,
          abi: ZapABI,
          functionName: "deposit",
          args: [
            vault.address,
            option[0],
            amountIn,
            router,
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
            option[0],
            amountIn,
            router,
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
        errorHandler(err);
      }
    }
    setTransactionInProgress(false);
  };
  // Temp function for CCF strategyes before 1inch curve update
  const depositCCF = async (amount: string) => {
    const decimals = getTokenData(option[0])?.decimals || 18;
    if (option) {
      let amounts: bigint[] = [0n, parseUnits(amount, decimals)];
      try {
        let previewDepositAssets: any;
        previewDepositAssets = await _publicClient?.readContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "previewDepositAssets",
          args: [defaultOption?.assetsArray as TAddress[], amounts],
        });
        setZapShares(formatUnits(previewDepositAssets[1], 18));
        checkInputsAllowance(option[0]);
      } catch (err) {
        console.error("Error: the asset balance is too low to convert.", err);
      }
    }

    setLoader(false);
  };

  const getZapDepositSwapAmounts = async (amount: string) => {
    setLoader(true);
    if (
      vault?.strategyInfo?.shortName === "CCF" &&
      defaultOption?.assets.includes(option[0])
    ) {
      depositCCF(amount);
      return;
    }
    try {
      const decimals = Number(getTokenData(option[0])?.decimals);

      const zapAmounts = await _publicClient?.readContract({
        address: $platformsData[network]?.zap,
        abi: ZapABI,
        functionName: "getDepositSwapAmounts",
        args: [vault.address, option[0], parseUnits(amount, decimals)],
      });

      let promises;
      let outData;
      if (vault?.strategyInfo?.shortName === "CCF") {
        promises = await get1InchRoutes(
          network,
          option[0],
          zapAmounts[0][1],
          decimals,
          String(zapAmounts[1][0] + zapAmounts[1][1]),
          setZapError,
          "deposit"
        );
        outData = [promises, promises];
      } else {
        promises = zapAmounts[0].map(
          async (toAddress, index) =>
            vault.assetsProportions[index] &&
            (await get1InchRoutes(
              network,
              option[0],
              toAddress,
              decimals,
              String(zapAmounts[1][index]),
              setZapError,
              "deposit"
            ))
        );
        outData = await Promise.all(promises);
      }

      if (
        vault.strategyInfo.shortName === "IQMF" ||
        vault.strategyInfo.shortName === "IRMF"
      ) {
        outData = outData.filter(
          (obj: any) => Number(obj?.amountIn) > 0 || Number(obj?.amountOut) > 0
        );
      }
      setZapTokens(outData);
      let amounts;

      if (
        vault.strategyInfo.shortName === "IQMF" ||
        vault.strategyInfo.shortName === "IRMF"
      ) {
        amounts = vault.assetsProportions.map((proportion) =>
          proportion
            ? parseUnits(
                outData[0]?.amountOut as string,
                getTokenData(outData[0]?.address as TAddress)
                  ?.decimals as number
              )
            : 0n
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
      setZapShares(formatUnits(previewDepositAssets[1], 18));
      if ($connected) {
        const allowanceData = await getAssetAllowance(
          _publicClient,
          option[0],
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
    } catch (err) {
      console.error("ZAP DEPOSIT ERROR:", err);
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

        if (
          Number(formatUnits(newAllowance, 18)) >= Number(inputs[option[0]])
        ) {
          setButton("withdraw");
        }
        setLoader(false);
      }
    } catch (err) {
      errorHandler(err);
    }
    setTransactionInProgress(false);
  };

  ///// 1INCH DATA REFRESH
  const refreshData = async () => {
    if (!isRefresh || loader) return;
    const currentBalances: TBalances = await getPlatformBalance(
      _publicClient,
      network,
      $account
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
      (asset: TAddress) =>
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
        errorHandler(err);
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
    const shares = sharesOut
      ? sharesOut
      : (parseUnits(zapShares, 18) * BigInt(1)) / BigInt(100);

    if (vault?.strategyInfo?.shortName === "CCF" && option.length < 2) {
      input.push(0n);
    }

    for (let i = 0; i < option.length; i++) {
      assets.push(option[i]);

      const token: any = getTokenData(option[i]);

      input.push(parseUnits(inputs[option[i]], token.decimals));
    }
    const changedInput = assets?.indexOf(lastAsset);
    const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));
    const out = shares - (shares * decimalPercent) / 100n;

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
          (token) => token.address === option[changedInput ? 0 : 1]
        );

        const decimals = token ? token.decimals + 18 : 24;

        amounts.push(parseUnits("1", decimals));
      }
    }
    try {
      if (
        vault.strategyInfo.shortName !== "IQMF" &&
        vault.strategyInfo.shortName !== "IRMF"
      ) {
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
          proportion ? amounts[0] : 0n
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
      errorHandler(err);
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
    if (
      vault.strategyInfo.shortName === "IQMF" ||
      vault.strategyInfo.shortName === "IRMF"
    ) {
      localAssets = vault.assets.map((asset) => asset.address);
    }
    if (underlyingToken?.address === option[0]) {
      const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));

      const txTokens = withdrawAmount.reduce((result, token) => {
        result[underlyingToken.address] = {
          amount: token.amount,
          symbol: token.symbol,
          logo: token.logo,
        };
        return result;
      }, {});

      const withdrawAmounts = withdrawAmount.map((obj: any) => {
        const amount = parseUnits(obj.amount, 18);
        return amount - (amount * decimalPercent) / 100n;
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
        errorHandler(err);
      }
    } else if (
      (defaultOption?.assets === option[0] && option.length < 2) ||
      option.length > 1
    ) {
      const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));
      const txTokens = withdrawAmount.reduce((result, token) => {
        const JSONToken = tokenlist.tokens.find(
          (t) => t.symbol === token.symbol
        );
        result[JSONToken.address] = {
          amount: token.amount,
        };
        return result;
      }, {});

      const withdrawAmounts = withdrawAmount.map((obj: any) => {
        const decimals = tokenlist.tokens.find(
          (token) => token.symbol === obj.symbol
        )?.decimals;

        const amount = parseUnits(obj.amount, decimals ? decimals : 18);
        return amount - (amount * decimalPercent) / 100n;
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
        errorHandler(err);
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
            option[0],
            router,
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
            option[0],
            router,
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
        errorHandler(err);
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
        setWithdrawAmount(false);
        setZapPreviewWithdraw(false);
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
          args: [option as TAddress[], currentValue, [0n]],
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
        let assetsLength = defaultOption?.assetsArray.map((_: string) => 0n);
        let localAssets = defaultOption?.assetsArray;
        if (
          vault.strategyInfo.shortName === "IQMF" ||
          vault.strategyInfo.shortName === "IRMF"
        ) {
          assetsLength = [0n, 0n];
          localAssets = vault.assets.map((asset) => asset.address);
        }

        const { result } = await _publicClient?.simulateContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [localAssets, currentValue, assetsLength],
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
                option[0],
                tab,
                vault?.address,
                underlyingToken?.address,
                $platformsData?.[network]?.zap
              ),
              18
            );

            const promises = result.map(
              async (amount, index) =>
                await get1InchRoutes(
                  network,
                  localAssets[index],
                  option[0],
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
        allowanceResult[option[i]] = 0n;
      }
      allowanceResult[option[i]] = allowanceData;
    }

    setAllowance(allowanceResult);
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
            if (vault.strategyInfo.shortName === "CCF") {
              let value;
              let decimals = 18;
              for (const key in inputs) {
                if (key !== asset) {
                  value = inputs[key];
                  decimals = getTokenData(key)?.decimals || 18;

                  break;
                }
              }
              if (value?.amount) {
                amounts.push(parseUnits(value?.amount, decimals));
              } else {
                amounts.push(parseUnits("0", decimals));
              }
            } else {
              const token = tokenlist.tokens.find(
                (token) => token.address === option[changedInput ? 0 : 1]
              );

              const decimals = token ? token.decimals + 18 : 24;

              amounts.push(parseUnits("1", decimals));
            }
          }
        }
        try {
          let previewDepositAssets: any;
          if (
            vault.strategyInfo.shortName !== "IQMF" &&
            vault.strategyInfo.shortName !== "IRMF"
          ) {
            previewDepositAssets = await _publicClient?.readContract({
              address: vault.address,
              abi: VaultABI,
              functionName: "previewDepositAssets",
              args: [defaultOption?.assetsArray as TAddress[], amounts],
            });
          } else {
            // IQMF & IRMF strategy only
            let assets: TAddress[] = vault.assets.map((asset) => asset.address);
            let IQMFAmounts: bigint[] = vault.assetsProportions.map(
              (proportion) => (proportion ? amounts[0] : 0n)
            );
            previewDepositAssets = await _publicClient?.readContract({
              address: vault.address,
              abi: VaultABI,
              functionName: "previewDepositAssets",
              args: [assets, IQMFAmounts],
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
      vault.strategyInfo.shortName === "CF" ||
      (vault.strategyInfo.shortName === "Y" &&
        vault.assets[0].address === option[0])
    );
  }, [vault]);

  const isNotUnderlying = useMemo(
    () => !underlyingToken || option[0] !== underlyingToken?.address,
    [underlyingToken]
  );

  useEffect(() => {
    localStorage.setItem("transactionSettings", JSON.stringify(settings));
  }, [settings]);

  // useEffect(() => {
  //   if (
  //     vault.strategyInfo.shortName === "IQMF" ||
  //     vault.strategyInfo.shortName === "IRMF"
  //   ) {
  //     let assetsData = vault.assets.map((asset: TAsset) =>
  //       asset.address.toLowerCase()
  //     );
  //     switch (tab) {
  //       case "Deposit":
  //         assetsData = assetsData.filter(
  //           (_, index) => vault.assetsProportions[index]
  //         );
  //         if (assetsData?.length) {
  //           setAssets(assetsData);
  //           setOption(assetsData);
  //           defaultAssetsOption(assetsData);
  //         }
  //         break;
  //       case "Withdraw":
  //         if (assetsData?.length) {
  //           setAssets(assetsData);
  //           setOption(assetsData);
  //           defaultAssetsOption(assetsData);
  //         }
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  // }, [tab]);

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
    setWithdrawAmount(false);
    setUnderlyingShares(false);
    setZapShares(false);
    setZapTokens(false);
    setZapError(false);
    setZapPreviewWithdraw(false);
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
    setZapTokens(false);
  }, [inputs]);

  ///// interval refresh data
  useEffect(() => {
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

      const intervalId = setInterval(reload, 10000);

      return () => clearInterval(intervalId);
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
    <div className="bg-button rounded-md">
      <TabSwitcher
        activeTab={tab}
        setActiveTab={setTab}
        resetInputs={resetInputs}
        resetOptions={resetOptions}
      />

      <form autoComplete="off" className="w-full px-4 pb-5">
        <div className="flex items-center mt-4 gap-3 relative">
          {optionTokens && (
            <div className="relative select-none w-full" ref={tokenSelectorRef}>
              <div
                onClick={() => {
                  setTokenSelector((prevState) => !prevState);
                }}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2 bg-[#13141f] text-[20px] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {activeOptionToken?.logoURI?.map((logo: string) => (
                      <img
                        key={Math.random()}
                        className="max-w-6 max-h-6 rounded-full"
                        src={logo}
                        alt="logo"
                      />
                    ))}
                  </div>
                  <p className="text-[16px] md:text-[15px] lg:text-[20px]">
                    {activeOptionToken?.symbol}
                  </p>
                </div>
                <svg
                  width="15"
                  height="9"
                  viewBox="0 0 15 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition delay-[50ms] ${
                    tokenSelector ? "rotate-[180deg]" : "rotate-[0deg]"
                  }`}
                >
                  <path d="M1 1L7.5 7.5L14 1" stroke="white" />
                </svg>
              </div>

              <div
                className={`bg-[#13141f] mt-1 rounded-md w-full z-10 ${
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
                  className="text-center cursor-pointer opacity-60 hover:opacity-100 flex items-center justify-start px-3 gap-3"
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
                    }  text-[16px] md:text-[15px] lg:text-[20px] py-1 lg:py-0`}
                  >
                    {defaultOption?.symbols}
                  </p>
                </div>
                {underlyingToken && (
                  <div
                    className="text-center cursor-pointer opacity-60 hover:opacity-100 flex items-center justify-start px-3 gap-3 ml-3"
                    onClick={() => {
                      optionHandler(
                        [underlyingToken?.address],
                        underlyingToken?.symbol,
                        underlyingToken?.address,
                        [getProtocolLogo(vault.strategyInfo.shortName)]
                      );
                    }}
                  >
                    {underlyingToken?.logoURI && (
                      <img
                        className="max-w-6 max-h-6 rounded-full "
                        src={underlyingToken.logoURI}
                        alt="logo"
                      />
                    )}
                    <p className="ml-2 text-[16px] md:text-[15px] lg:text-[20px] py-1 lg:py-0">
                      {underlyingToken.symbol}
                    </p>
                  </div>
                )}
                {/* CRV Strategy don't have zap withdraw */}
                {!(
                  vault?.strategyInfo?.shortName === "CCF" && tab === "Withdraw"
                ) &&
                  optionTokens.map(({ address, symbol, logoURI }) => {
                    return (
                      <div
                        className="text-center cursor-pointer opacity-60 hover:opacity-100 flex items-center justify-start px-3 gap-3 ml-3"
                        key={address}
                        onClick={() => {
                          optionHandler([address], symbol, address, [logoURI]);
                        }}
                      >
                        {logoURI && (
                          <img
                            className="max-w-6 max-h-6 rounded-full"
                            src={logoURI}
                            alt="logo"
                          />
                        )}
                        <p className="ml-2 text-[16px] md:text-[15px] lg:text-[20px] py-1 lg:py-0">
                          {symbol}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {$connected && (
            <>
              <svg
                fill={isRefresh ? "#ffffff" : "#959595"}
                height="22"
                width="22"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 512 512"
                xmlSpace="preserve"
                className={`${
                  isRefresh ? "cursor-pointer" : "cursor-default"
                } transition-transform duration-500`}
                style={{ transform: `rotate(${rotation}deg)` }}
                onClick={refreshData}
              >
                <g>
                  <g>
                    <path
                      d="M511.957,185.214L512,15.045l-67.587,67.587l-7.574-7.574c-48.332-48.332-112.593-74.95-180.946-74.95
    C114.792,0.107,0,114.901,0,256s114.792,255.893,255.893,255.893S511.785,397.099,511.785,256h-49.528
    c0,113.79-92.575,206.365-206.365,206.365S49.528,369.79,49.528,256S142.103,49.635,255.893,49.635
    c55.124,0,106.947,21.467,145.925,60.445l7.574,7.574l-67.58,67.58L511.957,185.214z"
                    />
                  </g>
                </g>
              </svg>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`settingsModal cursor-pointer transition-transform transform ${
                  settingsModal ? "rotate-180" : "rotate-0"
                }`}
                onClick={() => setSettingsModal((prev) => !prev)}
              >
                <path
                  className="settingsModal"
                  d="M20.83 14.6C19.9 14.06 19.33 13.07 19.33 12C19.33 10.93 19.9 9.93999 20.83 9.39999C20.99 9.29999 21.05 9.1 20.95 8.94L19.28 6.06C19.22 5.95 19.11 5.89001 19 5.89001C18.94 5.89001 18.88 5.91 18.83 5.94C18.37 6.2 17.85 6.34 17.33 6.34C16.8 6.34 16.28 6.19999 15.81 5.92999C14.88 5.38999 14.31 4.41 14.31 3.34C14.31 3.15 14.16 3 13.98 3H10.02C9.83999 3 9.69 3.15 9.69 3.34C9.69 4.41 9.12 5.38999 8.19 5.92999C7.72 6.19999 7.20001 6.34 6.67001 6.34C6.15001 6.34 5.63001 6.2 5.17001 5.94C5.01001 5.84 4.81 5.9 4.72 6.06L3.04001 8.94C3.01001 8.99 3 9.05001 3 9.10001C3 9.22001 3.06001 9.32999 3.17001 9.39999C4.10001 9.93999 4.67001 10.92 4.67001 11.99C4.67001 13.07 4.09999 14.06 3.17999 14.6H3.17001C3.01001 14.7 2.94999 14.9 3.04999 15.06L4.72 17.94C4.78 18.05 4.89 18.11 5 18.11C5.06 18.11 5.12001 18.09 5.17001 18.06C6.11001 17.53 7.26 17.53 8.19 18.07C9.11 18.61 9.67999 19.59 9.67999 20.66C9.67999 20.85 9.82999 21 10.02 21H13.98C14.16 21 14.31 20.85 14.31 20.66C14.31 19.59 14.88 18.61 15.81 18.07C16.28 17.8 16.8 17.66 17.33 17.66C17.85 17.66 18.37 17.8 18.83 18.06C18.99 18.16 19.19 18.1 19.28 17.94L20.96 15.06C20.99 15.01 21 14.95 21 14.9C21 14.78 20.94 14.67 20.83 14.6ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15Z"
                  fill="currentColor"
                ></path>
              </svg>
            </>
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
                <div className="flex flex-col items-center justify-center gap-3 mt-2 w-full">
                  {option.map((asset: string) => (
                    <div className="w-full" key={asset}>
                      {!!balances[asset] && (
                        <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                          <p>Balance: </p>
                          <p>{balances[asset]}</p>
                        </div>
                      )}

                      <div className="rounded-xl relative max-h-[150px] border-[2px] border-[#6376AF]">
                        <div className="py-3 w-full flex items-center px-4">
                          <label
                            htmlFor={asset}
                            className="flex items-center justify-center bg-[#4e46e521] rounded-xl"
                          >
                            {tokenlist.tokens.map((token) => {
                              if (token.address.toLowerCase() === asset) {
                                return (
                                  <div
                                    className="flex items-center gap-2"
                                    key={token.address}
                                  >
                                    <img
                                      className="rounded-full w-[25px] h-[25px] "
                                      src={token.logoURI}
                                      alt={token.name}
                                    />
                                  </div>
                                );
                              }
                            })}
                          </label>
                          <input
                            className="w-[75%] flex items-center h-full text-[25px] bg-transparent ml-2"
                            list="amount"
                            id={asset}
                            name="amount"
                            placeholder="0"
                            value={inputs[asset]}
                            onChange={(e) =>
                              handleInputChange(e.target.value, e.target.id)
                            }
                            type="text"
                            onKeyDown={(evt) => {
                              const currentValue = inputs[asset];

                              if (
                                !/[\d.]/.test(evt.key) &&
                                evt.key !== "Backspace" &&
                                evt.key !== "ArrowLeft" &&
                                evt.key !== "ArrowRight"
                              ) {
                                evt.preventDefault();
                              }

                              if (
                                evt.key === "." &&
                                currentValue &&
                                currentValue.includes(".")
                              ) {
                                evt.preventDefault();
                              }
                            }}
                          />
                          <button
                            className="rounded-md w-14 border border-gray-500 ring-gray-500 hover:ring-1 text-gray-500 text-lg ml-2"
                            onClick={() =>
                              balances[asset] &&
                              handleInputChange(balances[asset], asset)
                            }
                            type="button"
                          >
                            MAX
                          </button>
                        </div>
                      </div>

                      <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                        <p>
                          $
                          {$assetsPrices[network] &&
                          inputs[asset] > 0 &&
                          underlyingToken?.address != option[0]
                            ? (
                                Number($assetsPrices[network][asset].price) *
                                inputs[asset]
                              ).toFixed(2)
                            : 0}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  {loader && !transactionInProgress ? (
                    <ShareSkeleton />
                  ) : (
                    <div className="h-[63px] text-[18px]">
                      {!!sharesOut && (
                        <div>
                          <p className="uppercase leading-3 text-[#8D8E96] text-[18px] my-3">
                            YOU RECEIVE
                          </p>
                          <div className="flex items-center">
                            <div className="mr-4">
                              <AssetsProportion
                                proportions={vault.assetsProportions}
                                assets={vault?.assets}
                                type="vault"
                              />
                            </div>
                            {Number(
                              formatUnits(sharesOut * BigInt(100), 18)
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
              <div>
                <div className="flex flex-col mt-[15px] text-[15px] w-full">
                  {!!balances[option[0]] && (
                    <div className="text-left text-[gray] ml-2">
                      Balance: {balances[option[0]]}
                    </div>
                  )}
                  <div className="rounded-xl relative max-h-[150px] border-[2px] border-[#6376AF]">
                    <div className="py-3 w-full flex items-center px-4">
                      <label
                        htmlFor={option[0]}
                        className="flex items-center justify-center bg-[#4e46e521] rounded-xl"
                      >
                        {tokenlist.tokens.map((token) => {
                          if (token.address === option[0]) {
                            return (
                              <div
                                className="flex items-center"
                                key={token.address}
                              >
                                <img
                                  className="w-[25px] h-[25px] rounded-full"
                                  src={token.logoURI}
                                  alt={token.name}
                                />
                              </div>
                            );
                          }
                        })}
                      </label>

                      {option && (
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
                          onKeyDown={(evt) => {
                            const currentValue = inputs[option[0]];

                            if (
                              !/[\d.]/.test(evt.key) &&
                              evt.key !== "Backspace" &&
                              evt.key !== "ArrowLeft" &&
                              evt.key !== "ArrowRight"
                            ) {
                              evt.preventDefault();
                            }

                            if (
                              evt.key === "." &&
                              currentValue &&
                              currentValue.includes(".")
                            ) {
                              evt.preventDefault();
                            }
                          }}
                          className={`ml-2 flex items-center h-full   bg-transparent ${
                            underlyingToken?.address === option[0]
                              ? "text-[16px] w-[70%]"
                              : "text-[25px] w-[58%]"
                          } `}
                        />
                      )}
                      {$connected && balances[option[0]] ? (
                        <button
                          onClick={() =>
                            zapInputHandler(balances[option[0]], option[0])
                          }
                          className="rounded-md w-14 border border-gray-500 ring-gray-500 hover:ring-1 text-gray-500 text-lg ml-auto"
                          type="button"
                        >
                          MAX
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                    <p>
                      $
                      {$assetsPrices[network] &&
                      inputs[option[0]] > 0 &&
                      underlyingToken?.address !== option[0]
                        ? (
                            Number($assetsPrices[network][option[0]].price) *
                            inputs[option[0]]
                          ).toFixed(2)
                        : 0}
                    </p>
                  </div>
                  <div className="my-2 ml-2 flex flex-col gap-2">
                    {isNotUnderlying && (
                      <>
                        <p className="uppercase text-[18px] leading-3 text-[#8D8E96] mb-3">
                          SWAPS
                        </p>
                        {loader && !transactionInProgress ? (
                          <AssetsSkeleton />
                        ) : (
                          <div className="h-[100px]">
                            {zapTokens && (
                              <>
                                {vault?.strategyInfo?.shortName !== "CCF" ? (
                                  <div>
                                    {zapTokens?.map((token: any) => (
                                      <div
                                        className="text-[18px]  flex items-center gap-1 ml-2"
                                        key={token.address}
                                      >
                                        {token.address.toLowerCase() !==
                                          option[0].toLowerCase() && (
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
                                                      token.amountIn
                                                    ).toFixed(6)}
                                                  </p>
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
                                                  <p>
                                                    {Number(
                                                      token.amountOut
                                                    ).toFixed(6)}
                                                  </p>
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
                                ) : (
                                  <div className="text-[18px]  flex items-center gap-1 ml-2">
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
                    <div className="mt-5">
                      <div className="h-[63px]">
                        <p className="uppercase text-left text-[18px] leading-3 text-[#8D8E96] mb-3">
                          YOU RECEIVE
                        </p>
                        <div className="h-[63px]">
                          <div className="text-left text-[18px]">
                            <div className="flex items-center">
                              <div className="mr-4">
                                <AssetsProportion
                                  proportions={vault.assetsProportions}
                                  assets={vault?.assets}
                                  type="vault"
                                />
                              </div>

                              {loader && !transactionInProgress ? (
                                <ShareSkeleton height={30} width={300} />
                              ) : (
                                <div>
                                  {(underlyingShares &&
                                    inputs[option[0]] > 0) ||
                                  (zapShares && inputs[option[0]] > 0) ? (
                                    <p>
                                      {underlyingShares && inputs[option[0]] > 0
                                        ? `${underlyingShares} ($${(
                                            underlyingShares *
                                            Number(vault.shareprice)
                                          ).toFixed(2)})`
                                        : zapShares &&
                                          inputs[option[0]] > 0 &&
                                          `${zapShares} ($${(
                                            zapShares * Number(vault.shareprice)
                                          ).toFixed(2)})`}
                                    </p>
                                  ) : (
                                    <p>0 ($0.0)</p>
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
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid mt-[15px] text-[15px] w-full">
              {!!balances[option[0]] && (
                <div className="text-left text-[gray] ml-2">
                  Balance:{" "}
                  {parseFloat(
                    formatUnits(
                      $vaultData[network][vault.address].vaultUserBalance,
                      18
                    )
                  )}
                </div>
              )}

              <div className="rounded-xl  relative max-h-[150px] border-[2px] border-[#6376AF] w-full">
                {!!balances[option[0]] && (
                  <div className="absolute right-0 pt-[15px] pl-[15px] pr-3 pb-3 bottom-[-9%]">
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          zapInputHandler(
                            formatUnits(
                              $vaultData[network][vault.address]
                                ?.vaultUserBalance,
                              18
                            ),
                            option[0]
                          );
                          previewWithdraw(
                            formatUnits(
                              $vaultData[network][vault.address]
                                ?.vaultUserBalance,
                              18
                            )
                          );
                        }}
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
                  value={inputs[option[0]]}
                  name="amount"
                  placeholder="0"
                  onChange={(e) => {
                    zapInputHandler(e.target.value, e.target.id);
                    previewWithdraw(e.target.value);
                    handleInputChange(e.target.value, e.target.id);
                  }}
                  onKeyDown={(evt) => {
                    const currentValue = inputs[option[0]];

                    if (
                      !/[\d.]/.test(evt.key) &&
                      evt.key !== "Backspace" &&
                      evt.key !== "ArrowLeft" &&
                      evt.key !== "ArrowRight"
                    ) {
                      evt.preventDefault();
                    }

                    if (
                      evt.key === "." &&
                      currentValue &&
                      currentValue.includes(".")
                    ) {
                      evt.preventDefault();
                    }
                  }}
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  inputMode="decimal"
                  className="py-3 flex items-center h-full  bg-transparent  text-[16px] w-[70%] pl-[10px]"
                />
              </div>

              <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                <p>
                  $
                  {$assetsPrices[network] && inputs[option[0]] > 0
                    ? (Number(vault.shareprice) * inputs[option[0]]).toFixed(2)
                    : 0}
                </p>
              </div>
            </div>
            <div className="my-2 ml-2 flex flex-col gap-2">
              {(option.length > 1 ||
                isSingleTokenStrategy ||
                !isNotUnderlying) && (
                <p className="uppercase text-[18px] leading-3 text-[#8D8E96] mb-2">
                  YOU RECEIVE
                </p>
              )}

              <div className="h-[100px]">
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
                        <ShareSkeleton height={32} />
                      ) : (
                        <p>
                          {withdrawAmount
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
                      <p className="uppercase text-[18px] leading-3 text-[#8D8E96] mb-3">
                        SWAPS
                      </p>
                    )}
                    {loader && option.length < 2 && !transactionInProgress ? (
                      <AssetsSkeleton />
                    ) : (
                      <div>
                        {zapPreviewWithdraw &&
                          zapPreviewWithdraw?.map(
                            ({
                              address,
                              amountIn,
                              amountOut,
                            }: {
                              address: TAddress;
                              amountIn: string;
                              amountOut: string;
                              symbol: string;
                            }) => (
                              <div key={amountIn}>
                                {address.toLowerCase() !==
                                  option[0].toLowerCase() && (
                                  <div className="flex">
                                    <img
                                      src="/oneInch.svg"
                                      alt="1inch logo"
                                      title="1inch"
                                    />
                                    {!!amountOut ? (
                                      <>
                                        <div className="flex items-center gap-1">
                                          <p>{Number(amountIn).toFixed(6)}</p>
                                          <img
                                            src={getTokenData(address)?.logoURI}
                                            title={
                                              getTokenData(address)?.symbol
                                            }
                                            alt={getTokenData(address)?.symbol}
                                            className="w-6 h-6 rounded-full"
                                          />
                                        </div>
                                        -&gt;
                                        <div className="flex items-center gap-1">
                                          <p>{Number(amountOut).toFixed(6)}</p>

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
                  <div className="mt-5">
                    <p className="uppercase text-[18px] leading-3 text-[#8D8E96] mb-3">
                      YOU RECEIVE
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
                          <ShareSkeleton height={32} />
                        ) : (
                          <div>
                            {zapPreviewWithdraw ? (
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

        {$connected ? (
          <>
            {chain?.id === Number(network) ? (
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
                            className={`mt-2 w-full flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                              transactionInProgress
                                ? "bg-transparent flex items-center justify-center gap-2"
                                : "bg-[#486556]"
                            }`}
                            type="button"
                            onClick={deposit}
                          >
                            <p>
                              {needConfirm ? "Confirm in wallet" : "Deposit"}
                            </p>

                            {transactionInProgress && (
                              <Loader color={"#486556"} />
                            )}
                          </button>
                        ) : button === "needApprove" ? (
                          <div className="flex gap-3">
                            {option.map(
                              (asset: any, index: number) =>
                                allowance &&
                                formatUnits(
                                  allowance[asset],
                                  Number(getTokenData(asset)?.decimals)
                                ) < inputs[asset] && (
                                  <button
                                    disabled={approveIndex !== false}
                                    className={`mt-2 w-full text-[14px] flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                                      approveIndex === index
                                        ? "bg-transparent flex items-center justify-center gap-1"
                                        : "bg-[#486556]"
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
                                      <Loader color={"#486556"} />
                                    )}
                                  </button>
                                )
                            )}
                          </div>
                        ) : button === "insufficientBalance" ? (
                          <button
                            disabled
                            className="mt-2 w-full flex items-center justify-center bg-[#6F5648] text-[#F2C4A0] border border-[#AE642E] py-3 rounded-md"
                          >
                            INSUFFICIENT BALANCE
                          </button>
                        ) : (
                          <button
                            disabled
                            className="mt-2 w-full flex items-center justify-center bg-transparent text-[#959595] border border-[#3f3f3f] py-3 rounded-md"
                          >
                            {loader ? "LOADING..." : "ENTER AMOUNT"}
                          </button>
                        )}
                      </>
                    ) : (
                      <div>
                        {vault?.strategyInfo?.shortName === "CCF" &&
                        defaultOption?.assets?.includes(option[0]) ? (
                          <>
                            {button === "deposit" ? (
                              <button
                                disabled={transactionInProgress}
                                className={`mt-2 w-full flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                                  transactionInProgress
                                    ? "bg-transparent flex items-center justify-center gap-2"
                                    : "bg-[#486556]"
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
                                  <Loader color={"#486556"} />
                                )}
                              </button>
                            ) : button === "needApprove" ? (
                              <div className="flex gap-3">
                                {option.map((asset: any, index: number) => {
                                  if (
                                    allowance &&
                                    formatUnits(
                                      allowance[asset],
                                      Number(getTokenData(asset)?.decimals)
                                    ) < inputs[asset]
                                  ) {
                                    isAnyCCFOptionVisible = true;
                                    return (
                                      <button
                                        disabled={approveIndex !== false}
                                        className={`mt-2 w-full text-[14px] flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                                          approveIndex === index
                                            ? "bg-transparent flex items-center justify-center gap-1"
                                            : "bg-[#486556]"
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
                                          <Loader color={"#486556"} />
                                        )}
                                      </button>
                                    );
                                  } else {
                                    return null;
                                  }
                                })}
                                {!isAnyCCFOptionVisible && (
                                  <button
                                    disabled={transactionInProgress}
                                    className={`mt-2 w-full flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                                      transactionInProgress
                                        ? "bg-transparent flex items-center justify-center gap-2"
                                        : "bg-[#486556]"
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
                                      <Loader color={"#486556"} />
                                    )}
                                  </button>
                                )}
                              </div>
                            ) : button === "insufficientBalance" ? (
                              <button
                                disabled
                                className="mt-2 w-full flex items-center justify-center bg-[#6F5648] text-[#F2C4A0] border border-[#AE642E] py-3 rounded-md"
                              >
                                INSUFFICIENT BALANCE
                              </button>
                            ) : (
                              <button
                                disabled
                                className="mt-2 w-full flex items-center justify-center bg-transparent text-[#959595] border border-[#3f3f3f] py-3 rounded-md"
                              >
                                {loader ? "LOADING..." : "ENTER AMOUNT"}
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {button === "insufficientBalance" ? (
                              <button
                                disabled
                                className="mt-2 w-full flex items-center justify-center bg-[#6F5648] text-[#F2C4A0] border-[#AE642E] py-3 rounded-md"
                              >
                                INSUFFICIENT BALANCE
                              </button>
                            ) : button === "needApprove" ? (
                              <button
                                disabled={transactionInProgress}
                                className={`mt-2 w-full flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                                  transactionInProgress
                                    ? "bg-transparent flex items-center justify-center gap-2"
                                    : "bg-[#486556]"
                                }`}
                                type="button"
                                onClick={zapApprove}
                              >
                                <p>
                                  {needConfirm
                                    ? "Confirm in wallet"
                                    : `Approve ${
                                        underlyingToken?.address === option[0]
                                          ? underlyingToken.symbol
                                          : getTokenData(option[0])?.symbol
                                      }`}
                                </p>
                                {transactionInProgress && (
                                  <Loader color={"#486556"} />
                                )}
                              </button>
                            ) : button === "deposit" ? (
                              <button
                                disabled={transactionInProgress}
                                className={`mt-2 w-full flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                                  transactionInProgress
                                    ? "bg-transparent flex items-center justify-center gap-2"
                                    : "bg-[#486556]"
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
                                  <Loader color={"#486556"} />
                                )}
                              </button>
                            ) : (
                              <button
                                disabled
                                className="mt-2 w-full flex items-center justify-center bg-transparent text-[#959595] border border-[#3f3f3f] py-3 rounded-md"
                              >
                                {loader ? "LOADING..." : "ENTER AMOUNT"}
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
                        className="mt-2 w-full flex items-center justify-center bg-[#6F5648] text-[#F2C4A0] border-[#AE642E] py-3 rounded-md"
                      >
                        INSUFFICIENT BALANCE
                      </button>
                    ) : button === "needApprove" ? (
                      <button
                        disabled={transactionInProgress}
                        className={`mt-2 w-full flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                          transactionInProgress
                            ? "bg-transparent flex items-center justify-center gap-2"
                            : "bg-[#486556]"
                        }`}
                        type="button"
                        onClick={withdrawZapApprove}
                      >
                        <p>{needConfirm ? "Confirm in wallet" : "Approve"}</p>
                        {transactionInProgress && <Loader color={"#486556"} />}
                      </button>
                    ) : button === "withdraw" ? (
                      <button
                        disabled={transactionInProgress}
                        type="button"
                        className={`mt-2 w-full flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                          transactionInProgress
                            ? "bg-transparent flex items-center justify-center gap-2"
                            : "bg-[#486556]"
                        }`}
                        onClick={withdraw}
                      >
                        <p>{needConfirm ? "Confirm in wallet" : "WITHDRAW"}</p>
                        {transactionInProgress && <Loader color={"#486556"} />}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="mt-2 w-full flex items-center justify-center bg-transparent text-[#959595] border border-[#3f3f3f] py-3 rounded-md"
                      >
                        {loader ? "LOADING..." : "ENTER AMOUNT"}
                      </button>
                    )}
                  </>
                )}
              </>
            ) : (
              <button
                onClick={() => switchChain({ chainId: Number(network) })}
                className="mt-2 w-full flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] bg-[#486556]"
                type="button"
              >
                SWITCH NETWORK
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
            onClick={() => open()}
          >
            CONNECT WALLET
          </button>
        )}

        {error?.state && <InvestError error={error} setError={setError} />}
      </form>
    </div>
  );
};

export { InvestForm };
