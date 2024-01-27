import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { formatUnits, parseUnits, zeroAddress, maxUint256 } from "viem";
import { readContract } from "viem/actions";
import { usePublicClient } from "wagmi";
import { writeContract } from "@wagmi/core";

import { SettingsModal } from "./SettingsModal";

import { Loader, ShareSkeleton, AssetsSkeleton } from "@components";

import {
  vaultData,
  assets,
  assetsPrices,
  assetsBalances,
  account,
  platformData,
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
} from "@web3";

import {
  getTokenData,
  formatFromBigInt,
  get1InchRoutes,
  debounce,
  decodeHex,
  setLocalStoreHash,
} from "@utils";

import type {
  TAddress,
  TVaultAllowance,
  TVaultInput,
  TVaultBalance,
  TTokenData,
  TPlatformData,
  TVault,
} from "@types";

import tokensJson from "../../stability.tokenlist.json";
interface IProps {
  vault: TVault;
}

const VaultActionForm: React.FC<IProps> = ({ vault }) => {
  const _publicClient = usePublicClient();

  const { open } = useWeb3Modal();

  const $vaultData = useStore(vaultData);
  const $assets: any = useStore(assets);
  const $account = useStore(account);
  const $assetsPrices: any = useStore(assetsPrices);
  const $assetsBalances = useStore(assetsBalances);
  const $transactionSettings = useStore(transactionSettings);
  const $platformData: TPlatformData | any = useStore(platformData);
  const $tokens: TAddress[] | any = useStore(tokens);
  const $connected = useStore(connected);

  const [tab, setTab] = useState("Deposit");
  const [option, setOption] = useState<string[] | any>([]);
  const [defaultOptionSymbols, setDefaultOptionSymbols] = useState("");
  const [defaultOptionAssets, setDefaultOptionAssets] = useState("");
  const [allowance, setAllowance] = useState<TVaultAllowance | undefined | any>(
    {}
  );
  const [isApprove, setIsApprove] = useState<number | undefined>();
  const [balances, setBalances] = useState<TVaultBalance | any>({});

  const [inputs, setInputs] = useState<TVaultInput | any>({});
  const [lastKeyPress, setLastKeyPress] = useState<{
    key1: string | undefined;
    key2: string | undefined;
  }>({ key1: undefined, key2: undefined });

  const [sharesOut, setSharesOut] = useState<bigint | any>();

  const [withdrawAmount, setWithdrawAmount] = useState<string[] | any>(false);
  const [zapPreviewWithdraw, setZapPreviewWithdraw] = useState<any>();
  const [underlyingToken, setUnderlyingToken] = useState<any>();
  const [underlyingShares, setUnderlyingShares] = useState<any>();
  const [zapShares, setZapShares] = useState<any>();
  const [zapButton, setZapButton] = useState<string>("none");
  const [optionTokens, setOptionTokens] = useState<any>();
  const [approveIndex, setApproveIndex] = useState<any>(false);

  const [tokenSelector, setTokenSelector] = useState<boolean>(false);
  const [activeOptionToken, setActiveOptionToken] = useState<any>({
    symbol: "",
    address: "",
    logoURI: "",
  });
  const [defaultOptionImages, setDefaultOptionImages] = useState<any>();
  const [settingsModal, setSettingsModal] = useState(false);

  const [settings, setSettings] = useState($transactionSettings);

  const [zapTokens, setZapTokens] = useState<any>(false);
  const [zapError, setZapError] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [isRefresh, setIsRefresh] = useState(false);
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [loader, setLoader] = useState<boolean>(false);

  const [error, setError] = useState<any>(false);

  const tokenSelectorRef = useRef<HTMLDivElement>(null);

  const checkButtonApproveDeposit = (apprDepo: number[]) => {
    if (vault.strategyInfo.shortName === "IQMF") {
      if (apprDepo.includes(1)) return true;
    }
    if (apprDepo.length < 2) {
      return true;
    }
    return apprDepo.every((element) => element === apprDepo[0]);
  };

  const checkInputsAllowance = (input: bigint[]) => {
    const apprDepo = [];
    let change = false;

    for (let i = 0; i < input.length; i++) {
      if ($assetsBalances && input[i] > $assetsBalances[$assets[i]]) {
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
          input[i] <= $assetsBalances[$assets[i]] &&
          allowance[$assets[i]]?.allowance[0] >= input[i]
        ) {
          apprDepo.push(1);
        } else {
          apprDepo.push(2);
        }
      }

      const button = checkButtonApproveDeposit(apprDepo);
      if (button) {
        if (vault.strategyInfo.shortName === "IQMF") {
          setIsApprove(1);
        } else {
          setIsApprove(apprDepo[apprDepo.length - 1]);
        }
      } else {
        setIsApprove(2);
      }
    }
  };
  ///// INPUTS & OPTIONS
  const optionHandler = (
    option: any,
    symbol: string,
    address: string | TAddress,
    logoURI: string | string[]
  ) => {
    setTokenSelector((prevState) => !prevState);

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
      if (
        option.length > 1 ||
        (defaultOptionAssets === option[0] && option.length < 2)
      ) {
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
  const resetOptions = () => {
    if ($assets) {
      const logos = defaultOptionAssets.split(", ").map((address) => {
        const token = optionTokens.find(
          (token: any) => token.address.toLowerCase() === address
        );
        return token?.logoURI;
      });

      setOption($assets);
      setActiveOptionToken({
        symbol: defaultOptionSymbols,
        address: defaultOptionAssets,
        logoURI: logos,
      });
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
    const logoURIs: string[] = [];
    for (let i = 0; i < assets.length; i++) {
      const token = getTokenData(assets[i].toLowerCase());
      if (token) {
        defaultOptionAssets[i] = token.symbol;
        logoURIs.push(token.logoURI);
      } else {
        defaultOptionAssets[i] = "Token not found.";
      }
    }
    setDefaultOptionSymbols(defaultOptionAssets.join(" + "));
    setDefaultOptionAssets(assets.join(", "));
    setDefaultOptionImages(logoURIs);
  };

  /////
  /////   SELECT TOKENS
  const selectTokensHandler = async () => {
    if (!$tokens) return;
    let filtredTokens = tokensJson.tokens
      .filter((token) => $tokens.includes(token.address.toLowerCase()))
      .map(({ address, symbol, logoURI }) => ({ address, symbol, logoURI }));

    filtredTokens = filtredTokens.filter(
      (token) => token.address != defaultOptionAssets
    );
    if ($assets?.length < 2) {
      filtredTokens = filtredTokens.filter(
        (token) => token.address != $assets[0]
      );
    }
    ///// GET UNDERLYING TOKEN
    try {
      if (vault.underlying != zeroAddress) {
        const logo =
          vault.strategyInfo.shortName === "DQMF"
            ? "/protocols/DefiEdge.svg"
            : "/protocols/Gamma.png";
        if ($connected) {
          let underlyingSymbol = "";

          if (vault.strategyInfo.shortName === "DQMF") {
            underlyingSymbol = await readContract(_publicClient, {
              address: vault.underlying,
              abi: ERC20DQMFABI,
              functionName: "symbol",
            });
            underlyingSymbol = decodeHex(underlyingSymbol);
          } else {
            underlyingSymbol = await readContract(_publicClient, {
              address: vault.underlying,
              abi: ERC20MetadataUpgradeableABI,
              functionName: "symbol",
            });
          }

          const underlyingDecimals = await readContract(_publicClient, {
            address: vault.underlying,
            abi: ERC20MetadataUpgradeableABI,
            functionName: "decimals",
          });
          const underlyingAllowance = await readContract(_publicClient, {
            address: vault.underlying,
            abi: ERC20MetadataUpgradeableABI,
            functionName: "allowance",
            args: [$account as TAddress, vault.address],
          });
          const underlyingBalance = await readContract(_publicClient, {
            address: vault.underlying,
            abi: ERC20MetadataUpgradeableABI,
            functionName: "balanceOf",
            args: [$account as TAddress],
          });

          setUnderlyingToken({
            address: vault.underlying,
            symbol: underlyingSymbol,
            decimals: underlyingDecimals,
            balance: formatUnits(underlyingBalance, underlyingDecimals),
            allowance: formatUnits(underlyingAllowance, underlyingDecimals),
            logoURI: logo,
          });
        } else {
          const defaultTokens = defaultOptionSymbols.split(" + ");
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
      setOptionTokens(filtredTokens);
    } catch (error) {
      setOptionTokens(filtredTokens);
      console.error("UNDERLYING TOKEN ERROR:", error);
    }
  };
  /////
  /////         ZAP
  const getZapAllowance = async (asset = option[0]) => {
    let allowanceData;
    if (tab === "Deposit") {
      if (asset === underlyingToken?.address) {
        allowanceData = await readContract(_publicClient, {
          address: asset as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, vault.address],
        });
      } else {
        allowanceData = await readContract(_publicClient, {
          address: asset as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, $platformData.zap as TAddress],
        });
      }
    } else {
      allowanceData = await readContract(_publicClient, {
        address: vault.address,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [$account as TAddress, $platformData.zap as TAddress],
      });
    }

    return allowanceData;
  };

  const debouncedZap = useCallback(
    debounce(async (amount: string, asset: string) => {
      if (!Number(amount)) {
        setZapButton("none");
        setZapTokens(false);
        setLoader(false);
        return;
      }

      if (tab === "Deposit" && Number(amount) > Number(balances[asset])) {
        setZapButton("insufficientBalance");
      }

      if (
        tab === "Withdraw" &&
        Number(amount) >
          parseFloat(
            formatUnits($vaultData[vault.address].vaultUserBalance, 18)
          )
      ) {
        setZapButton("insufficientBalance");
        setZapTokens(false);
        return;
      }

      if (asset === underlyingToken?.address) {
        try {
          const previewDepositAssets = await readContract(_publicClient, {
            address: vault.address,
            abi: VaultABI,
            functionName: "previewDepositAssets",
            args: [[asset as TAddress], [parseUnits(amount, 18)]],
          });

          setUnderlyingShares(formatUnits(previewDepositAssets[1], 18));
          const allowanceData = (await readContract(_publicClient, {
            address: option[0] as TAddress,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account as TAddress, vault.address],
          })) as bigint;
          if (
            Number(formatUnits(allowanceData, 18)) < Number(amount) &&
            Number(amount) <= Number(balances[asset])
          ) {
            setZapButton("needApprove");
          }

          if (
            Number(amount) <= Number(balances[asset]) &&
            Number(formatUnits(allowanceData, 18)) >= Number(amount)
          ) {
            setZapButton(tab.toLowerCase());
          }

          checkInputsAllowance(previewDepositAssets[0] as bigint[]);
          setSharesOut(
            ((previewDepositAssets[1] as bigint) * BigInt(1)) / BigInt(100)
          );
          setLoader(false);
        } catch (error) {
          console.error("UNDERLYING SHARES ERROR:", error);
        }
      } else {
        ///// DEPOSIT / WITHDRAW
        try {
          const decimals = Number(getTokenData(asset)?.decimals);

          const allowanceData = await getZapAllowance(asset);

          if (tab === "Withdraw" && option.length === 1) {
            if (Number(formatUnits(allowanceData, decimals)) < Number(amount)) {
              setZapButton("needApprove");
            }
          }
          if (tab === "Deposit") {
            if (
              Number(formatUnits(allowanceData, decimals)) < Number(amount) &&
              Number(amount) <= Number(balances[asset])
            ) {
              setZapButton("needApprove");
            }
            getZapDepositSwapAmounts(amount);
          }
        } catch (error) {
          console.error("ZAP ERROR:", error);
        }
      }
    }, 1000),
    [option, balances]
  );
  const zapInputHandler = (amount: string, asset: string) => {
    setInputs(
      (prevInputs: any) =>
        ({
          ...prevInputs,
          [asset]: {
            amount: amount,
          },
        } as TVaultInput)
    );

    setZapButton("none");
    setZapTokens(false);
    setZapPreviewWithdraw(false);
    setLoader(true);

    // @ts-ignore
    debouncedZap(amount, asset);
  };

  const zapApprove = async () => {
    ///// ZAP TOKENS & UNDERLYING TOKENS
    setError(false);
    setTransactionInProgress(true);
    const amount = inputs[option[0]]?.amount;
    const decimals = getTokenData(option[0])?.decimals || 18;

    const approveSum =
      settings.approves === "unlimited"
        ? maxUint256
        : parseUnits(amount, decimals);

    if (option[0] !== underlyingToken?.address) {
      if (amount && decimals) {
        try {
          const gas = await _publicClient.estimateContractGas({
            address: option[0],
            abi: ERC20ABI,
            functionName: "approve",
            args: [$platformData.zap as TAddress, approveSum],
            account: $account as TAddress,
          });
          const gasLimit = BigInt(
            Math.trunc(Number(gas) * Number(settings.gasLimit))
          );

          const assetApprove = await writeContract({
            address: option[0],
            abi: ERC20ABI,
            functionName: "approve",
            args: [$platformData.zap as TAddress, approveSum],
            gas: gasLimit,
          });
          setLoader(true);
          const transaction = await _publicClient.waitForTransactionReceipt({
            confirmations: 5,
            hash: assetApprove?.hash,
          });

          if (transaction.status === "success") {
            lastTx.set(transaction?.transactionHash);
            const allowance = formatUnits(await getZapAllowance(), 18);

            if (Number(allowance) >= Number(amount)) {
              getZapDepositSwapAmounts(amount);
              setZapButton(tab.toLowerCase());
            }
            setLoader(false);
          }
        } catch (err) {
          lastTx.set("No approve hash...");
          if (err instanceof Error) {
            const errName = err.name;
            const errorMessageLength =
              err.message.indexOf("Contract Call:") !== -1
                ? err.message.indexOf("Contract Call:")
                : 150;

            const errorMessage =
              err.message.substring(0, errorMessageLength) + "...";

            setError({ name: errName, message: errorMessage });
          }
          setLoader(false);
          console.error("APPROVE ERROR:", err);
        }
      }
    } else {
      try {
        const gas = await _publicClient.estimateContractGas({
          address: underlyingToken?.address,
          abi: ERC20ABI,
          functionName: "approve",
          args: [vault.address, approveSum],
          account: $account as TAddress,
        });
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );

        const assetApprove = await writeContract({
          address: underlyingToken?.address,
          abi: ERC20ABI,
          functionName: "approve",
          args: [vault.address, approveSum],
          gas: gasLimit,
        });
        setLoader(true);

        const transaction = await _publicClient.waitForTransactionReceipt({
          confirmations: 5,
          hash: assetApprove?.hash,
        });

        if (transaction.status === "success") {
          lastTx.set(transaction?.transactionHash);
          const allowance = formatUnits(await getZapAllowance(), 18);
          if (Number(allowance) >= Number(amount)) {
            setZapButton(tab.toLowerCase());
          }
          setLoader(false);
        }
      } catch (err) {
        lastTx.set("No approve hash...");
        if (err instanceof Error) {
          const errName = err.name;
          const errorMessageLength =
            err.message.indexOf("Contract Call:") !== -1
              ? err.message.indexOf("Contract Call:")
              : 150;

          const errorMessage =
            err.message.substring(0, errorMessageLength) + "...";

          setError({ name: errName, message: errorMessage });
        }
        setLoader(false);
        console.error("APPROVE ERROR:", err);
      }
    }
    setTransactionInProgress(false);
  };
  const zapDeposit = async () => {
    ///// UNDERLYING
    setError(false);
    setTransactionInProgress(true);
    setLoader(true);
    let transaction, depositAssets: any, zapDeposit: any;
    if (underlyingToken?.address === option[0]) {
      try {
        const shares = parseUnits(underlyingShares, 18);
        const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));

        const out = shares - (shares * decimalPercent) / 100n;

        const gas = await _publicClient.estimateContractGas({
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [
            option as TAddress[],
            [parseUnits(inputs[option[0]]?.amount, 18)],
            out,
            $account as TAddress,
          ],
          account: $account as TAddress,
        });
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );

        depositAssets = await writeContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [
            option as TAddress[],
            [parseUnits(inputs[option[0]]?.amount, 18)],
            out,
            $account as TAddress,
          ],
          gas: gasLimit,
        });
        setLoader(true);

        transaction = await _publicClient.waitForTransactionReceipt({
          confirmations: 5,
          hash: depositAssets?.hash,
        });

        lastTx.set(transaction?.transactionHash);
        setLoader(false);
      } catch (err) {
        lastTx.set("No depositAssets hash...");
        if (err instanceof Error) {
          const errName = err.name;
          const errorMessageLength =
            err.message.indexOf("Contract Call:") !== -1
              ? err.message.indexOf("Contract Call:")
              : 150;

          const errorMessage =
            err.message.substring(0, errorMessageLength) + "...";

          setError({ name: errName, message: errorMessage });
        }
        setLoader(false);
        console.error("UNDERLYING DEPOSIT ERROR:", err);
      }
      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: depositAssets?.hash,
        status: transaction?.status || "reverted",
        type: "deposit",
        vault: vault.address,
        tokens: option,
      });
    } else {
      try {
        const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));

        const shares = parseUnits(zapShares, 18);

        const out = shares - (shares * decimalPercent) / 100n;

        const amountIn = parseUnits(
          inputs[option[0]].amount,
          getTokenData(option[0])?.decimals || 18
        );

        const router = zapTokens[0].router || zapTokens[1].router;

        const txData = zapTokens.map((tokens: any) => tokens.txData);

        const gas = await _publicClient.estimateContractGas({
          address: $platformData.zap,
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
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );

        zapDeposit = await writeContract({
          address: $platformData.zap,
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
        setLoader(true);

        transaction = await _publicClient.waitForTransactionReceipt({
          confirmations: 5,
          hash: zapDeposit?.hash,
        });

        lastTx.set(transaction?.transactionHash);
        setLoader(false);
      } catch (err) {
        lastTx.set("No deposit hash...");
        if (err instanceof Error) {
          const errName = err.name;
          const errorMessageLength =
            err.message.indexOf("Contract Call:") !== -1
              ? err.message.indexOf("Contract Call:")
              : 150;

          const errorMessage =
            err.message.substring(0, errorMessageLength) + "...";

          setError({ name: errName, message: errorMessage });
        }

        setLoader(false);
        console.error("ZAP DEPOSIT ERROR:", err);
      }
      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: zapDeposit?.hash,
        status: transaction?.status || "reverted",
        type: "deposit",
        vault: vault.address,
        tokens: option,
      });
    }
    setTransactionInProgress(false);
  };
  const getZapDepositSwapAmounts = async (amount: string) => {
    setLoader(true);
    try {
      const decimals = Number(getTokenData(option[0])?.decimals);
      const allowanceData = await getZapAllowance(option[0]);
      const zapAmounts = await readContract(_publicClient, {
        address: $platformData.zap,
        abi: ZapABI,
        functionName: "getDepositSwapAmounts",
        args: [vault.address, option[0], parseUnits(amount, decimals)],
      });
      const promises = zapAmounts[0].map(
        async (toAddress, index) =>
          vault.assetsProportions[index] &&
          (await get1InchRoutes(
            option[0],
            toAddress,
            decimals,
            String(zapAmounts[1][index]),
            setZapError,
            "deposit"
          ))
      );

      let outData = await Promise.all(promises);
      outData = outData.filter(
        (obj) => Number(obj.amountIn) > 0 || Number(obj.amountOut) > 0
      );

      setZapTokens(outData);

      let assets: TAddress[] = vault.assets.map((asset) => asset.address);
      let amounts;
      if (vault.strategyInfo.shortName === "IQMF") {
        amounts = vault.assetsProportions.map((proportion, index) =>
          proportion
            ? parseUnits(
                outData[index].amountOut,
                getTokenData(outData[index]?.address as TAddress)?.decimals
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
      const previewDepositAssets = await readContract(_publicClient, {
        address: vault.address,
        abi: VaultABI,
        functionName: "previewDepositAssets",
        args: [assets as TAddress[], amounts],
      });

      setZapShares(formatUnits(previewDepositAssets[1], 18));
      if (
        Number(formatUnits(allowanceData, decimals)) < Number(amount) &&
        Number(amount) <= Number(balances[option[0]])
      ) {
        setZapButton("needApprove");
      }
      if (
        Number(formatUnits(allowanceData, decimals)) >= Number(amount) &&
        Number(amount) <= Number(balances[option[0]])
      ) {
        setZapButton("deposit");
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
      console.error("ZAP DEPOSIT ERROR:", error);
    }
  };

  const withdrawZapApprove = async () => {
    setError(false);
    setTransactionInProgress(true);

    const amount = inputs[option[0]].amount;

    const approveSum =
      settings.approves === "unlimited" ? maxUint256 : parseUnits(amount, 18);

    try {
      const gas = await _publicClient.estimateContractGas({
        address: vault.address,
        abi: ERC20ABI,
        functionName: "approve",
        args: [$platformData.zap, approveSum],
        account: $account as TAddress,
      });
      const gasLimit = BigInt(
        Math.trunc(Number(gas) * Number(settings.gasLimit))
      );

      const assetApprove = await writeContract({
        address: vault.address,
        abi: ERC20ABI,
        functionName: "approve",
        args: [$platformData.zap, approveSum],
        gas: gasLimit,
      });
      setLoader(true);
      const transaction = await _publicClient.waitForTransactionReceipt({
        confirmations: 5,
        hash: assetApprove?.hash,
      });

      if (transaction.status === "success") {
        lastTx.set(transaction?.transactionHash);
        const newAllowance = await readContract(_publicClient, {
          address: option[0] as TAddress,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, $platformData.zap as TAddress],
        });

        if (
          Number(formatUnits(newAllowance, 18)) >=
          Number(inputs[option[0]].amount)
        ) {
          setZapButton("withdraw");
        }
        setLoader(false);
      }
    } catch (err) {
      lastTx.set("No approve hash...");
      if (err instanceof Error) {
        const errName = err.name;
        const errorMessageLength =
          err.message.indexOf("Contract Call:") !== -1
            ? err.message.indexOf("Contract Call:")
            : 150;

        const errorMessage =
          err.message.substring(0, errorMessageLength) + "...";

        setError({ name: errName, message: errorMessage });
      }
      setLoader(false);
      console.error("ZAP ERROR:", err);
    }
    setTransactionInProgress(false);
  };

  ///// 1INCH DATA REFRESH
  const refreshData = async () => {
    if (!isRefresh || loader) return;
    setRotation(rotation + 360);
    setLoader(true);
    loadAssetsBalances();
    zapInputHandler(inputs[option[0]]?.amount, option[0]);
  };
  /////

  const approve = async (asset: TAddress, index: number) => {
    setApproveIndex(index);
    const amount = inputs[asset].amount;
    const decimals = getTokenData(asset)?.decimals || 18;

    const approveSum =
      settings.approves === "unlimited"
        ? maxUint256
        : parseUnits(amount, decimals);

    setError(false);
    const needApprove = option.filter(
      (asset: TAddress) =>
        allowance &&
        formatUnits(
          allowance[asset]?.allowance[0],
          Number(getTokenData(asset)?.decimals)
        ) < inputs[asset].amount
    );
    if (vault.address) {
      try {
        const gas = await _publicClient.estimateContractGas({
          address: asset,
          abi: ERC20ABI,
          functionName: "approve",
          args: [vault.address, approveSum],
          account: $account as TAddress,
        });
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );

        const assetApprove = await writeContract({
          address: asset,
          abi: ERC20ABI,
          functionName: "approve",
          args: [vault.address, approveSum],
          gas: gasLimit,
        });
        setLoader(true);
        const transaction = await _publicClient.waitForTransactionReceipt({
          confirmations: 5,
          hash: assetApprove?.hash,
        });

        if (transaction.status === "success") {
          lastTx.set(transaction?.transactionHash);
          const newAllowance = (await readContract(_publicClient, {
            address: asset,
            abi: ERC20ABI,
            functionName: "allowance",
            args: [$account as TAddress, vault.address],
          })) as bigint;

          setAllowance((prevAllowance: any) => ({
            ...prevAllowance,
            [asset]: {
              allowance: [newAllowance],
            },
          }));

          // this is a temp condition before rewrite
          if (
            needApprove.length == 1 &&
            formatUnits(newAllowance, Number(getTokenData(asset)?.decimals)) >=
              inputs[asset].amount
          ) {
            setIsApprove(1);
          }
          setLoader(false);
        }
      } catch (err) {
        lastTx.set("No approve hash...");
        const newAllowance = (await readContract(_publicClient, {
          address: asset,
          abi: ERC20ABI,
          functionName: "allowance",
          args: [$account as TAddress, vault.address],
        })) as bigint;

        setAllowance((prevAllowance: any) => ({
          ...prevAllowance,
          [asset]: {
            allowance: [newAllowance],
          },
        }));
        // this is a temp condition before rewrite
        if (
          needApprove.length == 1 &&
          formatUnits(newAllowance, Number(getTokenData(asset)?.decimals)) >=
            inputs[asset].amount
        ) {
          setIsApprove(1);
        }
        if (err instanceof Error) {
          const errName = err.name;
          const errorMessageLength =
            err.message.indexOf("Contract Call:") !== -1
              ? err.message.indexOf("Contract Call:")
              : 150;

          const errorMessage =
            err.message.substring(0, errorMessageLength) + "...";

          setError({ name: errName, message: errorMessage });
        }
        setLoader(false);
      }
    }
    setApproveIndex(false);
  };

  const deposit = async () => {
    setError(false);
    setTransactionInProgress(true);
    let assets: string[] = [];
    let input: any = [];

    for (let i = 0; i < option.length; i++) {
      assets.push(option[i]);

      const token: any = getTokenData(option[i]);

      input.push(parseUnits(inputs[option[i]].amount, token.decimals));
    }
    const changedInput = $assets?.indexOf(lastKeyPress.key1);
    const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));
    const out = sharesOut - (sharesOut * decimalPercent) / 100n;

    let transaction,
      depositAssets: any,
      gas,
      gasLimit,
      amounts = [];

    for (let i = 0; i < option.length; i++) {
      if (i === changedInput) {
        amounts.push(
          parseUnits(
            inputs[lastKeyPress.key1 as string].amount,
            Number(getTokenData(lastKeyPress.key1 as string)?.decimals)
          )
        );
      } else {
        const token = tokensJson.tokens.find(
          (token) => token.address === option[changedInput ? 0 : 1]
        );

        const decimals = token ? token.decimals + 18 : 24;

        amounts.push(parseUnits("1", decimals));
      }
    }

    try {
      if ($assets?.length > 1) {
        gas = await _publicClient.estimateContractGas({
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [$assets as TAddress[], input, out, $account as TAddress],
          account: $account as TAddress,
        });
        gasLimit = BigInt(Math.trunc(Number(gas) * Number(settings.gasLimit)));
        depositAssets = await writeContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [$assets as TAddress[], input, out, $account as TAddress],
          gas: gasLimit,
        });
      } else {
        // IQMF strategy only
        let assets: TAddress[] = vault.assets.map((asset) => asset.address);

        let IQMFAmounts: bigint[] = vault.assetsProportions.map((proportion) =>
          proportion ? amounts[0] : 0n
        );
        gas = await _publicClient.estimateContractGas({
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [assets, IQMFAmounts, out, $account as TAddress],
          account: $account as TAddress,
        });
        gasLimit = BigInt(Math.trunc(Number(gas) * Number(settings.gasLimit)));
        depositAssets = await writeContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "depositAssets",
          args: [assets, IQMFAmounts, out, $account as TAddress],
          gas: gasLimit,
        });
      }
      setLoader(true);
      transaction = await _publicClient.waitForTransactionReceipt({
        confirmations: 5,
        hash: depositAssets?.hash,
      });

      lastTx.set(transaction?.transactionHash);
      setLoader(false);
    } catch (err) {
      lastTx.set("No depositAssets hash...");
      if (err instanceof Error) {
        const errName = err.name;
        const errorMessageLength =
          err.message.indexOf("Contract Call:") !== -1
            ? err.message.indexOf("Contract Call:")
            : 150;

        const errorMessage =
          err.message.substring(0, errorMessageLength) + "...";

        setError({ name: errName, message: errorMessage });
      }
      setLoader(false);
      console.error("DEPOSIT ASSETS ERROR:", err);
    }
    setLocalStoreHash({
      timestamp: new Date().getTime(),
      hash: depositAssets?.hash,
      status: transaction?.status || "reverted",
      type: "deposit",
      vault: vault.address,
      tokens: option,
    });
    setTransactionInProgress(false);
  };

  const withdraw = async () => {
    setError(false);
    setTransactionInProgress(true);
    const sharesToBurn = parseUnits(inputs[option[0]]?.amount, 18);

    if (!sharesToBurn) return;

    ///// 2ASSETS -> UNDERLYING -> ZAP
    //before rewrite
    let withdrawAssets: any, transaction, zapWithdraw: any;
    if (
      (defaultOptionAssets === option[0] && option.length < 2) ||
      underlyingToken?.address === option[0] ||
      option.length > 1
    ) {
      const decimalPercent = BigInt(Math.floor(Number(settings.slippage)));
      const withdrawAmounts = withdrawAmount.map((obj: any) => {
        const decimals = tokensJson.tokens.find(
          (token) => token.symbol === obj.symbol
        )?.decimals;

        const amount = parseUnits(obj.amount, decimals ? decimals : 18);
        return amount - (amount * decimalPercent) / 100n;
      });

      try {
        const gas = await _publicClient.estimateContractGas({
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [$assets as TAddress[], sharesToBurn, withdrawAmounts],
          account: $account as TAddress,
        });
        const gasLimit = BigInt(
          Math.trunc(Number(gas) * Number(settings.gasLimit))
        );

        withdrawAssets = await writeContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [$assets as TAddress[], sharesToBurn, withdrawAmounts],
          gas: gasLimit,
        });
        setLoader(true);
        transaction = await _publicClient.waitForTransactionReceipt({
          confirmations: 5,
          hash: withdrawAssets?.hash,
        });

        lastTx.set(transaction?.transactionHash);
        setLoader(false);
      } catch (err) {
        lastTx.set("No withdrawAssets hash...");
        if (err instanceof Error) {
          const errName = err.name;
          const errorMessageLength =
            err.message.indexOf("Contract Call:") !== -1
              ? err.message.indexOf("Contract Call:")
              : 150;

          const errorMessage =
            err.message.substring(0, errorMessageLength) + "...";

          setError({ name: errName, message: errorMessage });
        }
        setLoader(false);
        console.error("WITHDRAW ERROR:", err);
      }
      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: withdrawAssets?.hash,
        status: transaction?.status || "reverted",
        type: "deposit",
        vault: vault.address,
        tokens: option,
      });
    } else {
      const optionAmount = Number(inputs[option[0]]?.amount);
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
        const gas = await _publicClient.estimateContractGas({
          address: $platformData.zap,
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

        zapWithdraw = await writeContract({
          address: $platformData.zap,
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
        setLoader(true);
        transaction = await _publicClient.waitForTransactionReceipt({
          confirmations: 5,
          hash: zapWithdraw?.hash,
        });

        lastTx.set(transaction?.transactionHash);
        setInputs((prevInputs: any) => ({
          ...prevInputs,
          [option[0]]: {
            amount: "",
          },
        }));
        setLoader(false);
      } catch (err) {
        lastTx.set("No withdraw hash...");
        if (err instanceof Error) {
          const errName = err.name;
          const errorMessageLength =
            err.message.indexOf("Contract Call:") !== -1
              ? err.message.indexOf("Contract Call:")
              : 150;

          const errorMessage =
            err.message.substring(0, errorMessageLength) + "...";

          setError({ name: errName, message: errorMessage });
        }
        setLoader(false);
        console.error("WITHDRAW ERROR:", err);
      }
      setLocalStoreHash({
        timestamp: new Date().getTime(),
        hash: zapWithdraw?.hash,
        status: transaction?.status || "reverted",
        type: "deposit",
        vault: vault.address,
        tokens: option,
      });
    }
    setTransactionInProgress(false);
  };

  const loadAssetsBalances = () => {
    const balance: TVaultBalance | any = {};

    if ($assetsBalances) {
      for (let i = 0; i < option.length; i++) {
        const decimals = getTokenData(option[i])?.decimals;

        if (decimals) {
          balance[option[i]] = formatUnits(
            $assetsBalances[option[i]],
            decimals
          );
        }
      }
    }
    if (underlyingToken && underlyingToken?.address === option[0]) {
      balance[option[0]] = underlyingToken.balance;
    }

    setBalances(balance);
  };
  const debouncedPreviewWithdraw = useCallback(
    debounce(async (value: string) => {
      const balance = Number(
        formatUnits($vaultData[vault.address].vaultUserBalance, 18)
      );
      if (!Number(value)) {
        setWithdrawAmount(false);
        setZapPreviewWithdraw(false);
        return;
      }

      if (Number(value) > balance) {
        setZapButton("insufficientBalance");
        return;
      }

      ///// UNDERLYING TOKEN
      const currentValue = parseUnits(value, 18);

      if (underlyingToken?.address === option[0]) {
        const { result } = await _publicClient.simulateContract({
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
        setZapButton("withdraw");
      } else {
        const assetsLength = $assets.map((_: any) => 0n);

        const { result } = await _publicClient.simulateContract({
          address: vault.address,
          abi: VaultABI,
          functionName: "withdrawAssets",
          args: [$assets as TAddress[], currentValue, assetsLength],
          account: $account as TAddress,
        });

        if (
          (defaultOptionAssets === option[0] && option.length < 2) ||
          option.length > 1
        ) {
          const preview = result.map((amount: any, index: number) => {
            const tokenData: TTokenData | any = getTokenData($assets[index]);
            const amountInTokens = Number(
              formatUnits(amount, tokenData?.decimals)
            );
            const amountInUSD =
              amountInTokens *
              Number(formatUnits($assetsPrices[$assets[index]], 18));
            return {
              symbol: tokenData?.symbol,
              logo: tokenData?.logoURI,
              amount: amountInTokens.toFixed(5),
              amountInUSD: amountInUSD.toFixed(2),
            };
          });
          setWithdrawAmount(preview);
          setZapButton("withdraw");
          setLoader(false);
        } else {
          try {
            setLoader(true);
            const allowanceData: any = formatUnits(await getZapAllowance(), 18);
            if (Number(formatUnits(allowanceData, 18)) < Number(value)) {
              setZapButton("needApprove");
              setLoader(false);
              return;
            }
            const promises = result.map(
              async (amount, index) =>
                await get1InchRoutes(
                  $assets[index],
                  option[0],
                  Number(getTokenData($assets[index])?.decimals),
                  amount,
                  setZapError,
                  "withdraw"
                )
            );

            const outData = await Promise.all(promises);
            setZapPreviewWithdraw(outData);
            setZapButton("withdraw");
            setLoader(false);
          } catch (error) {
            setLoader(false);
            console.error("WITHDRAW ERROR:", error);
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
    const allowanceResult: TVaultAllowance | any = {};

    for (let i = 0; i < option.length; i++) {
      const allowanceData = (await readContract(_publicClient, {
        address: option[i] as TAddress,
        abi: ERC20ABI,
        functionName: "allowance",
        args: [$account as TAddress, vault.address],
      })) as bigint;

      if (!allowanceResult[option[i]]) {
        allowanceResult[option[i]] = { allowance: [] };
      }
      allowanceResult[option[i]].allowance.push(allowanceData);
    }
    setAllowance(allowanceResult);
  };

  const previewDeposit = async () => {
    // if (!Number(lastKeyPress.key2)) return;
    setLoader(true);
    if ($assets && tab === "Deposit") {
      const changedInput = $assets?.indexOf(lastKeyPress.key1);
      const preview: TVaultInput | any = {};
      if (option) {
        let amounts: bigint[] = [];
        for (let i = 0; i < option.length; i++) {
          if (i === changedInput) {
            amounts.push(
              parseUnits(
                inputs[lastKeyPress.key1 as string].amount,
                Number(getTokenData(lastKeyPress.key1 as string)?.decimals)
              )
            );
          } else {
            const token = tokensJson.tokens.find(
              (token) => token.address === option[changedInput ? 0 : 1]
            );

            const decimals = token ? token.decimals + 18 : 24;

            amounts.push(parseUnits("1", decimals));
          }
        }
        try {
          let previewDepositAssets: any;
          if ($assets?.length > 1) {
            previewDepositAssets = await readContract(_publicClient, {
              address: vault.address,
              abi: VaultABI,
              functionName: "previewDepositAssets",
              args: [$assets as TAddress[], amounts],
            });
          } else {
            // IQMF strategy only
            let assets: TAddress[] = vault.assets.map((asset) => asset.address);

            let IQMFAmounts: bigint[] = vault.assetsProportions.map(
              (proportion) => (proportion ? amounts[0] : 0n)
            );

            previewDepositAssets = await readContract(_publicClient, {
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
          for (let i = 0; i < $assets?.length; i++) {
            const decimals = getTokenData($assets[i])?.decimals;
            if (i !== changedInput && decimals) {
              preview[$assets[i]] = {
                amount: formatUnits(previewDepositAssetsArray[i], decimals),
              };
            }
          }
          setInputs((prevInputs: any) => ({
            ...prevInputs,
            ...preview,
          }));
        } catch (error) {
          console.error(
            "Error: the asset balance is too low to convert.",
            error
          );
          setIsApprove(undefined);
        }
      }
    }
    setLoader(false);
  };
  useEffect(() => {
    localStorage.setItem("transactionSettings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (vault) {
      const assetsData = vault.assets
        .map((asset: any) => asset.address.toLowerCase())
        .filter((_, index) => vault.assetsProportions[index]);
      if (Array.isArray(assetsData)) {
        assets.set(assetsData);
        setOption(assetsData);
        defaultAssetsOption(assetsData);
      }
    }
  }, [vault]);

  useEffect(() => {
    checkAllowance();
    loadAssetsBalances();
  }, [option, $assetsBalances]);

  useEffect(() => {
    previewDeposit();
  }, [lastKeyPress]);

  useEffect(() => {
    setZapButton("none");
    setSharesOut(false);
    setWithdrawAmount(false);
    setUnderlyingShares(false);
    setZapShares(false);
    setZapTokens(false);
    setZapError(false);
    setZapPreviewWithdraw(false);
    setLoader(false);
  }, [option]);

  useEffect(() => {
    if (vault) {
      selectTokensHandler();
    }
  }, [vault, $tokens, defaultOptionSymbols, $assets]);

  useEffect(() => {
    setZapTokens(false);
  }, [inputs]);

  ///// interval refresh data
  useEffect(() => {
    if (zapTokens || withdrawAmount || zapPreviewWithdraw) {
      const reload = async () => {
        if (transactionInProgress) return;
        if (inputs[option[0]]?.amount) {
          if (tab === "Deposit") {
            await getZapDepositSwapAmounts(inputs[option[0]]?.amount);
          }
          if (tab === "Withdraw") {
            await previewWithdraw(inputs[option[0]]?.amount);
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
    zapButton,
    transactionInProgress,
  ]);

  useEffect(() => {
    setUnderlyingShares(false);
    setZapShares(false);
    if (option[0] === underlyingToken?.address || !inputs[option[0]]?.amount) {
      setIsRefresh(false);
      return;
    }
    setIsRefresh(true);
  }, [option, inputs]);
  /////
  useEffect(() => {
    if (
      (!activeOptionToken.symbol || !activeOptionToken.address) &&
      optionTokens
    ) {
      const logos = defaultOptionAssets.split(", ").map((address) => {
        const token = optionTokens.find(
          (token: any) => token.address.toLowerCase() === address.toLowerCase()
        );

        return token?.logoURI;
      });
      setActiveOptionToken({
        symbol: defaultOptionSymbols,
        address: defaultOptionAssets,
        logoURI: logos,
      });
    }
  }, [defaultOptionAssets, defaultOptionSymbols, optionTokens]);

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
  return (
    <div className="mt-5 bg-button rounded-md">
      <div className="flex">
        <button
          className={`h-[60px] cursor-pointer text-[16px] w-full rounded-tl-md  bg-[#1c1c23] ${
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
          className={`h-[60px] cursor-pointer text-[16px] w-full rounded-tr-md  bg-[#1c1c23]  ${
            tab === "Withdraw" && "border-b-[2px] border-[#6376AF]"
          }`}
          onClick={() => {
            setTab("Withdraw");
            resetOptions();
            resetInputs(option);
          }}
        >
          Withdraw
        </button>
      </div>
      <form autoComplete="off" className="w-full px-4 mb-10 pb-5">
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
                  {activeOptionToken?.logoURI &&
                  Array.isArray(activeOptionToken?.logoURI) ? (
                    <div className="flex items-center">
                      {$connected && defaultOptionImages
                        ? defaultOptionImages.map((logo: string) => (
                            <img
                              key={Math.random()}
                              className="max-w-6 max-h-6 rounded-full"
                              src={logo}
                              alt="logo"
                            />
                          ))
                        : activeOptionToken?.logoURI.map((logo: string) => (
                            <img
                              key={Math.random()}
                              className="max-w-6 max-h-6 rounded-full"
                              src={logo}
                              alt="logo"
                            />
                          ))}
                    </div>
                  ) : (
                    activeOptionToken?.logoURI && (
                      <img
                        className="max-w-6 max-h-6 rounded-full"
                        src={activeOptionToken?.logoURI}
                        alt="logo"
                      />
                    )
                  )}
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
                      defaultOptionAssets.split(", "),
                      defaultOptionSymbols,
                      defaultOptionAssets,
                      defaultOptionImages
                    );
                  }}
                  className="text-center cursor-pointer opacity-60 hover:opacity-100 flex items-center justify-start px-3 gap-3"
                >
                  {defaultOptionImages?.length && (
                    <div
                      className={`flex items-center ${
                        defaultOptionImages?.length < 2 && "ml-3"
                      }`}
                    >
                      {defaultOptionImages.map((logo: string) => (
                        <img
                          key={Math.random()}
                          className="max-w-6 max-h-6 rounded-full"
                          src={logo}
                          alt="logo"
                        />
                      ))}
                    </div>
                  )}
                  <p
                    className={`${
                      defaultOptionImages?.length < 2 ? "ml-2" : "ml-[-4px]"
                    }  text-[16px] md:text-[15px] lg:text-[20px] py-1 lg:py-0`}
                  >
                    {defaultOptionSymbols}
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
                        vault.strategyInfo.shortName === "DQMF"
                          ? "/protocols/DefiEdge.svg"
                          : "/protocols/Gamma.png"
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
                {optionTokens.map(
                  ({
                    address,
                    symbol,
                    logoURI,
                  }: {
                    address: TAddress;
                    symbol: string;
                    logoURI: string;
                  }) => {
                    return (
                      <div
                        className="text-center cursor-pointer opacity-60 hover:opacity-100 flex items-center justify-start px-3 gap-3 ml-3"
                        key={address}
                        onClick={() => {
                          optionHandler([address], symbol, address, logoURI);
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
                  }
                )}
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

        {tab === "Deposit" &&
          ($connected ? (
            <>
              {option?.length > 1 ||
              (defaultOptionAssets === option[0] && option.length < 2) ? (
                <>
                  <div className="flex flex-col items-center justify-center gap-3 mt-2 w-full">
                    {option.map((asset: any) => (
                      <div className="w-full" key={asset}>
                        <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                          <p>Balance: </p>
                          <p>{balances[asset]}</p>
                        </div>

                        <div className="rounded-xl  relative max-h-[150px] border-[2px] border-[#6376AF] w-full">
                          <div className="absolute end-5 bottom-4">
                            <div className="flex items-center">
                              <button
                                className="rounded-md w-14 border border-gray-500 ring-gray-500 hover:ring-1 text-gray-500 text-lg"
                                type="button"
                                onClick={() =>
                                  balances[asset] &&
                                  handleInputChange(balances[asset], asset)
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
                              if (token.address.toLowerCase() === asset) {
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

                        <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                          <p>
                            $
                            {$assetsPrices &&
                            inputs[asset]?.amount > 0 &&
                            underlyingToken?.address != option[0]
                              ? (
                                  Number(
                                    formatUnits($assetsPrices[asset], 18)
                                  ) * inputs[asset].amount
                                ).toFixed(2)
                              : 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    {loader ? (
                      <ShareSkeleton />
                    ) : (
                      <div className="h-[63px] text-[18px]">
                        {sharesOut && (
                          <div>
                            <p className="uppercase leading-3 text-[#8D8E96] text-[18px] my-3">
                              YOU RECEIVE
                            </p>
                            Shares: {formatUnits(sharesOut * BigInt(100), 18)}{" "}
                            ($
                            {(
                              formatUnits(sharesOut * BigInt(100), 18) *
                              formatFromBigInt(
                                vault.shareprice,
                                18,
                                "withDecimals"
                              )
                            ).toFixed(2)}
                            )
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isApprove === 1 ? (
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
                      <p>Deposit</p>
                      {transactionInProgress && <Loader color={"#486556"} />}
                    </button>
                  ) : isApprove === 2 ? (
                    <div className="flex gap-3">
                      {option.map(
                        (asset: any, index: number) =>
                          allowance &&
                          formatUnits(
                            allowance[asset]?.allowance[0],
                            Number(getTokenData(asset)?.decimals)
                          ) < inputs[asset].amount && (
                            <button
                              disabled={approveIndex !== false}
                              className={`mt-2 w-full text-[14px] flex items-center justify-center py-3 rounded-md border text-[#B0DDB8] border-[#488B57] ${
                                approveIndex === index
                                  ? "bg-transparent flex items-center justify-center gap-1"
                                  : "bg-[#486556]"
                              }`}
                              key={asset}
                              type="button"
                              onClick={() => approve(asset as TAddress, index)}
                            >
                              <p>Approve {getTokenData(asset)?.symbol}</p>
                              {approveIndex === index && (
                                <Loader color={"#486556"} />
                              )}
                            </button>
                          )
                      )}
                    </div>
                  ) : isApprove === 0 ? (
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
                  <div className="flex flex-col mt-[15px] text-[15px] w-full">
                    {balances[option[0]] && (
                      <div className="text-left text-[gray] ml-2">
                        Balance: {balances[option[0]]}
                      </div>
                    )}

                    <div className="rounded-xl  relative max-h-[150px] border-[2px] border-[#6376AF] w-full">
                      <div className="absolute top-[30%] left-[5%]">
                        {tokensJson.tokens.map((token) => {
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
                      </div>
                      {$connected && balances[option[0]] && (
                        <div>
                          <div
                            className={`absolute right-0 pt-[15px] pl-[15px] pr-3 pb-3 ${
                              underlyingToken?.address === option[0]
                                ? "bottom-[-9%]"
                                : "bottom-0"
                            }`}
                          >
                            <div className="flex items-center">
                              <button
                                onClick={() =>
                                  zapInputHandler(
                                    balances[option[0]],
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
                            ["e", "E", "+", "-", " ", ","].includes(evt.key) &&
                            evt.preventDefault()
                          }
                          className={` py-3 flex items-center h-full   bg-transparent ${
                            underlyingToken?.address === option[0]
                              ? "text-[16px] w-[70%] pl-[10px]"
                              : "text-[25px] w-[58%] pl-[50px]"
                          } `}
                        />
                      )}
                    </div>

                    <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                      <p>
                        $
                        {$assetsPrices &&
                        inputs[option[0]]?.amount > 0 &&
                        underlyingToken?.address !== option[0]
                          ? (
                              Number(
                                formatUnits($assetsPrices[option[0]], 18)
                              ) * inputs[option[0]]?.amount
                            ).toFixed(2)
                          : 0}
                      </p>
                    </div>

                    <div className="my-2 ml-2 flex flex-col gap-2">
                      {loader ? (
                        <AssetsSkeleton />
                      ) : (
                        <div className="h-[100px]">
                          {zapTokens && (
                            <div>
                              <p className="uppercase text-[18px] leading-3 text-[#8D8E96] mb-3">
                                SWAPS
                              </p>
                              {zapTokens.map((token: any) => (
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
                                              {Number(token.amountIn).toFixed(
                                                2
                                              )}
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
                                              {Number(token.amountOut).toFixed(
                                                2
                                              )}
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
                          )}
                        </div>
                      )}
                      <div className="mt-5">
                        {loader ? (
                          <ShareSkeleton />
                        ) : (
                          <div className="h-[63px]">
                            {(underlyingShares &&
                              inputs[option[0]]?.amount > 0) ||
                              (zapShares && inputs[option[0]]?.amount > 0 && (
                                <div className="text-left text-[18px]">
                                  <p className="uppercase leading-3 text-[#8D8E96] mb-3">
                                    YOU RECEIVE
                                  </p>
                                  {underlyingShares &&
                                  inputs[option[0]]?.amount > 0
                                    ? `Shares: ${underlyingShares} ($${(
                                        underlyingShares *
                                        formatFromBigInt(
                                          vault.shareprice,
                                          18,
                                          "withDecimals"
                                        )
                                      ).toFixed(2)})`
                                    : zapShares &&
                                      inputs[option[0]]?.amount > 0 &&
                                      `Shares: ${zapShares} ($${(
                                        zapShares *
                                        formatFromBigInt(
                                          vault.shareprice,
                                          18,
                                          "withDecimals"
                                        )
                                      ).toFixed(2)})`}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {zapButton === "insufficientBalance" ? (
                    <button
                      disabled
                      className="mt-2 w-full flex items-center justify-center bg-[#6F5648] text-[#F2C4A0] border-[#AE642E] py-3 rounded-md"
                    >
                      INSUFFICIENT BALANCE
                    </button>
                  ) : zapButton === "needApprove" ? (
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
                        Approve{" "}
                        {underlyingToken?.address === option[0]
                          ? underlyingToken.symbol
                          : getTokenData(option[0])?.symbol}
                      </p>
                      {transactionInProgress && <Loader color={"#486556"} />}
                    </button>
                  ) : zapButton === "deposit" ? (
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
                      <p>Deposit</p>
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
                </div>
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
          ))}

        {tab === "Withdraw" &&
          ($connected ? (
            <>
              <div className="grid mt-[15px] text-[15px] w-full">
                {balances[option[0]] && (
                  <div className="text-left text-[gray] ml-2">
                    Balance:{" "}
                    {parseFloat(
                      formatUnits(
                        $vaultData[vault.address].vaultUserBalance,
                        18
                      )
                    )}
                  </div>
                )}

                <div className="rounded-xl  relative max-h-[150px] border-[2px] border-[#6376AF] w-full">
                  {balances[option[0]] && (
                    <div className="absolute right-0 pt-[15px] pl-[15px] pr-3 pb-3 bottom-[-9%]">
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            zapInputHandler(
                              formatUnits(
                                $vaultData[vault.address]?.vaultUserBalance,
                                18
                              ),
                              option[0]
                            );
                            previewWithdraw(
                              formatUnits(
                                $vaultData[vault.address]?.vaultUserBalance,
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
                    value={inputs[option[0]]?.amount}
                    name="amount"
                    placeholder="0"
                    onChange={(e) => {
                      zapInputHandler(e.target.value, e.target.id);
                      previewWithdraw(e.target.value);
                      handleInputChange(e.target.value, e.target.id);
                    }}
                    onKeyDown={(evt) =>
                      ["e", "E", "+", "-", " ", ","].includes(evt.key) &&
                      evt.preventDefault()
                    }
                    pattern="^[0-9]*[.,]?[0-9]*$"
                    inputMode="decimal"
                    className="py-3 flex items-center h-full  bg-transparent  text-[16px] w-[70%] pl-[10px]"
                  />
                </div>

                <div className="text-[16px] text-[gray] flex items-center gap-1 ml-2">
                  <p>
                    $
                    {$assetsPrices && inputs[option[0]]?.amount > 0
                      ? (
                          formatFromBigInt(
                            vault.shareprice,
                            18,
                            "withDecimals"
                          ) * inputs[option[0]]?.amount
                        ).toFixed(2)
                      : 0}
                  </p>
                </div>
              </div>
              <div className="my-2 ml-2 flex flex-col gap-2">
                {loader ? (
                  <AssetsSkeleton />
                ) : (
                  <div className="h-[100px]">
                    {withdrawAmount && (
                      <p className="uppercase text-[18px] leading-3 text-[#8D8E96] mb-3">
                        YOU RECEIVE
                      </p>
                    )}

                    {withdrawAmount &&
                      withdrawAmount?.map(
                        ({
                          symbol,
                          logo,
                          amount,
                          amountInUSD,
                        }: {
                          symbol: string;
                          logo: string;
                          amount: string;
                          amountInUSD: number;
                        }) => (
                          <div key={symbol} className="flex items-center gap-1">
                            <img
                              src={logo}
                              alt={symbol}
                              title={symbol}
                              className="w-6 h-6 rounded-full"
                            />
                            <p>{amount}</p>
                            {amountInUSD && <p>{`($${amountInUSD})`}</p>}
                          </div>
                        )
                      )}
                    {zapPreviewWithdraw && (
                      <div>
                        <p className="uppercase text-[18px] leading-3 text-[#8D8E96] mb-3">
                          SWAPS
                        </p>
                        {zapPreviewWithdraw?.map(
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
                                        <p>{Number(amountIn).toFixed(5)}</p>
                                        <img
                                          src={getTokenData(address)?.logoURI}
                                          title={getTokenData(address)?.symbol}
                                          alt={getTokenData(address)?.symbol}
                                          className="w-6 h-6 rounded-full"
                                        />
                                      </div>
                                      -&gt;
                                      <div className="flex items-center gap-1">
                                        <p>{Number(amountOut).toFixed(5)}</p>

                                        <img
                                          src={getTokenData(option[0])?.logoURI}
                                          title={
                                            getTokenData(option[0])?.symbol
                                          }
                                          alt={getTokenData(option[0])?.symbol}
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
                <div className="mt-5">
                  {loader ? (
                    <ShareSkeleton />
                  ) : (
                    <div className="h-[63px]">
                      {zapPreviewWithdraw && (
                        <div>
                          <p className="uppercase text-[18px] leading-3 text-[#8D8E96] mb-3">
                            YOU RECEIVE
                          </p>
                          <div className="flex items-center gap-1">
                            <img
                              src={getTokenData(option[0])?.logoURI}
                              alt={getTokenData(option[0])?.symbol}
                              title={getTokenData(option[0])?.symbol}
                              className="w-6 h-6 rounded-full"
                            />
                            <p>
                              {(
                                Number(
                                  Number(zapPreviewWithdraw[0]?.amountOut)
                                    ? zapPreviewWithdraw[0]?.amountOut
                                    : zapPreviewWithdraw[0]?.amountIn
                                ) +
                                Number(
                                  Number(zapPreviewWithdraw[1]?.amountOut)
                                    ? zapPreviewWithdraw[1]?.amountOut
                                    : zapPreviewWithdraw[1]?.amountIn
                                )
                              ).toFixed(5)}
                            </p>
                            <p>{`($${(
                              (Number(
                                Number(zapPreviewWithdraw[0]?.amountOut)
                                  ? zapPreviewWithdraw[0]?.amountOut
                                  : zapPreviewWithdraw[0]?.amountIn
                              ) +
                                Number(
                                  Number(zapPreviewWithdraw[1]?.amountOut)
                                    ? zapPreviewWithdraw[1]?.amountOut
                                    : zapPreviewWithdraw[1]?.amountIn
                                )) *
                              Number(formatUnits($assetsPrices[option[0]], 18))
                            ).toFixed(2)})`}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {zapButton === "insufficientBalance" ? (
                <button
                  disabled
                  className="mt-2 w-full flex items-center justify-center bg-[#6F5648] text-[#F2C4A0] border-[#AE642E] py-3 rounded-md"
                >
                  INSUFFICIENT BALANCE
                </button>
              ) : zapButton === "needApprove" ? (
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
                  <p>Approve</p>
                  {transactionInProgress && <Loader color={"#486556"} />}
                </button>
              ) : zapButton === "withdraw" || zapButton === "deposit" ? (
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
                  <p>WITHDRAW</p>
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
          ) : (
            <button
              type="button"
              className="mt-2 w-full flex items-center justify-center bg-[#486556] text-[#B0DDB8] border-[#488B57] py-3 rounded-md"
              onClick={() => open()}
            >
              CONNECT WALLET
            </button>
          ))}

        {error && (
          <div className="bg-[#734950] border border-[#b75457] rounded-sm mt-5 relative">
            <div className="px-2 py-2 flex items-center justify-center flex-col">
              <div className="flex items-center justify-between w-full">
                <svg
                  width="24"
                  height="21"
                  viewBox="0 0 24 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M23.2266 17.7266L13.8516 1.4375C13.1484 0.226562 11.3125 0.1875 10.6094 1.4375L1.23438 17.7266C0.53125 18.9375 1.42969 20.5 2.875 20.5H21.5859C23.0312 20.5 23.9297 18.9766 23.2266 17.7266ZM12.25 14.3281C13.2266 14.3281 14.0469 15.1484 14.0469 16.125C14.0469 17.1406 13.2266 17.9219 12.25 17.9219C11.2344 17.9219 10.4531 17.1406 10.4531 16.125C10.4531 15.1484 11.2344 14.3281 12.25 14.3281ZM10.5312 7.88281C10.4922 7.60938 10.7266 7.375 11 7.375H13.4609C13.7344 7.375 13.9688 7.60938 13.9297 7.88281L13.6562 13.1953C13.6172 13.4688 13.4219 13.625 13.1875 13.625H11.2734C11.0391 13.625 10.8438 13.4688 10.8047 13.1953L10.5312 7.88281Z"
                    fill="#DE2E2E"
                  />
                </svg>
                <p className="text-[18px] text-[#f2aeae]">{error.name}</p>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                  onClick={() => setError(false)}
                >
                  <g filter="url(#filter0_i_910_1842)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.292893 1.70711C-0.097631 1.31658 -0.097631 0.683417 0.292893 0.292893C0.683418 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L6 4.58579L10.2929 0.292893C10.6834 -0.0976311 11.3166 -0.0976311 11.7071 0.292893C12.0976 0.683417 12.0976 1.31658 11.7071 1.70711L7.41421 6L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L6 7.41421L1.70711 11.7071C1.31658 12.0976 0.683417 12.0976 0.292893 11.7071C-0.0976311 11.3166 -0.0976311 10.6834 0.292893 10.2929L4.58579 6L0.292893 1.70711Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <filter
                      id="filter0_i_910_1842"
                      x="0"
                      y="0"
                      width="14"
                      height="14"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dx="2" dy="2" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite
                        in2="hardAlpha"
                        operator="arithmetic"
                        k2="-1"
                        k3="1"
                      />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="shape"
                        result="effect1_innerShadow_910_1842"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>
              <p className="text-[16px] text-[#f2aeae]">{error.message}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export { VaultActionForm };
