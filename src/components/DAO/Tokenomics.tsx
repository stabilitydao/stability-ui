import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { account, publicClient, assetsPrices } from "@store";
import { formatUnits, parseUnits } from "viem";
import { getTokenData } from "@utils";
import type {
  TTokenomics,
  TProfitTokenWallet,
  TAddress,
  TSdivTokenWallet,
} from "@types";
import { writeContract } from "@wagmi/core";
import { SDIV, PROFIT, PM } from "@constants";
import ShortAddress from "./ShortAddress";
import {
  DividendMinterABI,
  DividendTokenABI,
  ERC20ABI,
  IERC721Enumerable,
  ERC20MetadataUpgradeableABI,
} from "@web3";
import { Loader } from "@components";

function Tokenomics() {
  const $assetsPrices = useStore(assetsPrices);
  const $account = useStore(account);
  const $publicClient = useStore(publicClient);
  const [tokenomics, setTokenomics] = useState<TTokenomics | any>("");
  const [profitWallet, setProfitWallet] = useState<TProfitTokenWallet>();
  const [sdivWallet, setSdivtWallet] = useState<TSdivTokenWallet>();
  const [input, setInput] = useState("");
  const [_profitStakingAllowance, setProfitStakingAllowance] = useState("");
  const [_pmMintAllowance, setPmMintAllowance] = useState("");
  const [showMintModal, setShowMintModal] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [tabStakeModal, setTabStakeModal] = useState("stake");
  const [loader, setLoader] = useState(false);

  const fetchTokenomicsData = async () => {
    if ($publicClient && $account) {
      try {
        const profitTotalSupply = await $publicClient.readContract({
          address: PROFIT[0] as TAddress,
          abi: ERC20ABI,
          functionName: "totalSupply",
        });

        const pmTotalSupply = await $publicClient.readContract({
          address: PM[0] as TAddress,
          abi: IERC721Enumerable,
          functionName: "totalSupply",
        });

        const sdivTotalSupply = await $publicClient.readContract({
          address: SDIV[0] as TAddress,
          abi: ERC20ABI,
          functionName: "totalSupply",
        });

        if ($assetsPrices) {
          const _tokenomics = {
            profitPrice:
              Math.trunc(
                Number(formatUnits($assetsPrices?.[PROFIT[0]].tokenPrice, 18)) *
                  100
              ) / 100,
            profitTotalSupply: Number(
              formatUnits(profitTotalSupply, 18)
            ).toLocaleString(),
            profitMarketCap: (
              (Math.trunc(
                Number(formatUnits($assetsPrices?.[PROFIT[0]].tokenPrice, 18)) *
                  100
              ) /
                100) *
              Number(formatUnits(profitTotalSupply, 18))
            ).toLocaleString(),
            sdivTotalSupply: Number(
              formatUnits(sdivTotalSupply, 18)
            ).toLocaleString(),

            pmToMint: (Number(10) - Number(pmTotalSupply)).toLocaleString(),
            pmTotalSupply: Number(pmTotalSupply).toLocaleString(),
          };
          setTokenomics(_tokenomics);
        }
      } catch (error) {
        console.error("Error fetching Tokenomics:", error);
      }
    }
  };

  const profitStakingAllowance = async () => {
    const profitStakingAllowance = await $publicClient?.readContract({
      address: PROFIT[0] as TAddress,
      abi: ERC20MetadataUpgradeableABI,
      functionName: "allowance",
      args: [
        $account as TAddress,
        "0x29353bB4c9010c6112a77d702Ac890e70CD73d53",
      ],
    });
    setProfitStakingAllowance(
      formatUnits(profitStakingAllowance as bigint, 18)
    );
  };

  const aproveStaking = async () => {
    try {
      const amount = parseUnits(input, 18);

      const aproveStaking = await writeContract({
        address: PROFIT[0] as TAddress,
        abi: ERC20MetadataUpgradeableABI,
        functionName: "approve",
        args: [$account as TAddress, amount],
      });

      const transaction = await $publicClient?.waitForTransactionReceipt(
        aproveStaking
      );

      if (transaction?.status === "success") {
        profitStakingAllowance();
        profitBalance();
      } else {
        console.error("Transaction error");
      }
    } catch (error) {
      console.error("Error in aproveStaking:", error);
    }
  };

  const stake = async () => {
    try {
      const amount = parseUnits(input, 18);
      const stake = await writeContract({
        address: "0x29353bB4c9010c6112a77d702Ac890e70CD73d53",
        abi: DividendMinterABI,
        functionName: "stake",
        args: [amount],
      });

      const transaction = await $publicClient?.waitForTransactionReceipt(stake);

      if (transaction?.status === "success") {
        profitBalance();
        sdivBalance();
        setInput("");
        setLoader(false);
      } else {
        console.error("Transaction error");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error in stake:", error);
    }
  };

  const unStake = async () => {
    try {
      const amount = parseUnits(input, 18);
      const unStake = await writeContract({
        address: "0x29353bB4c9010c6112a77d702Ac890e70CD73d53" as TAddress,
        abi: DividendMinterABI,
        functionName: "unstake",
        args: [amount],
      });
      const transaction = await $publicClient?.waitForTransactionReceipt(
        unStake
      );

      if (transaction?.status === "success") {
        profitBalance();
        sdivBalance();
        setInput("");
        setLoader(false);
      } else {
        console.error("Transaction error");
      }
    } catch (error) {
      setLoader(false);
      console.error("Error in unstake:", error);
    }
  };

  const harvest = async () => {
    if ($publicClient) {
      try {
        const harvest = await writeContract({
          address: "0x29353bB4c9010c6112a77d702Ac890e70CD73d53" as TAddress,
          abi: DividendMinterABI,
          functionName: "harvest",
        });

        const transaction = await $publicClient?.waitForTransactionReceipt(
          harvest
        );

        if (transaction?.status === "success") {
          sdivBalance();
        } else {
          console.error("Transaction error");
        }
        setLoader(false);
      } catch (error) {
        console.error("Error in harvest:", error);
        setLoader(false);
      }
    }
  };

  const pmMintAllowance = async () => {
    if ($publicClient) {
      try {
        const pmMintAllowance = await $publicClient.readContract({
          address: PROFIT[0] as TAddress,
          abi: ERC20MetadataUpgradeableABI,
          functionName: "allowance",
          args: [$account as TAddress, PM[0] as TAddress],
        });

        setPmMintAllowance(formatUnits(pmMintAllowance as bigint, 18));
      } catch (error) {
        console.error("Error fetching mint allowance:", error);
      }
    }
  };

  const aproveMinting = async () => {
    try {
      const amount = parseUnits(input, 18);

      const aproveMinting = await writeContract({
        address: PROFIT[0] as TAddress,
        abi: ERC20MetadataUpgradeableABI,
        functionName: "approve",
        args: [$account as TAddress, amount],
      });

      const transaction = await $publicClient?.waitForTransactionReceipt(
        aproveStaking
      );

      if (transaction?.status === "success") {
        profitStakingAllowance();
        profitBalance();
      } else {
        console.error("Transaction error");
      }
    } catch (error) {
      console.error("Error in aproveStaking:", error);
    }
  };

  const mint = async () => {
    if ($publicClient) {
      try {
        const mint = await writeContract({
          address: "0x9844a1c30462B55cd383A2C06f90BB4171f9D4bB" as TAddress,
          abi: DividendTokenABI,
          functionName: "mint",
        });

        const transaction = await $publicClient?.waitForTransactionReceipt(
          mint
        );

        if (transaction?.status === "success") {
          fetchTokenomicsData();
          profitBalance();
          setInput("");
          setLoader(false);
        } else {
          console.error("Transaction error");
        }
      } catch (error) {
        setLoader(false);
        console.error("Error in mint:", error);
      }
    }
  };

  const sdivBalance = async () => {
    if ($publicClient) {
      try {
        const sdivBalance = await $publicClient.readContract({
          address: SDIV[0] as TAddress,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [$account as TAddress],
        });

        const sdivEarned = (await $publicClient.readContract({
          address: "0x29353bB4c9010c6112a77d702Ac890e70CD73d53" as TAddress,
          abi: DividendMinterABI,
          functionName: "pending",
          args: [$account],
        })) as bigint;

        const sdivWallet = {
          sdivBalance:
            Math.trunc(Number(formatUnits(sdivBalance, 18)) * 100) / 100,
          sdivEarned:
            Math.trunc(Number(formatUnits(sdivEarned, 18)) * 100) / 100,
        };

        setSdivtWallet(sdivWallet);
      } catch (error) {
        console.error("Error fetching sdivBalance:", error);
      }
    }
  };

  const profitBalance = async () => {
    if ($publicClient) {
      try {
        const profitBalance = (await $publicClient?.readContract({
          address: PROFIT[0] as TAddress,
          abi: ERC20ABI,
          functionName: "balanceOf",
          args: [$account as TAddress],
        })) as bigint;

        const profitStaked = (await $publicClient?.readContract({
          address: "0x29353bB4c9010c6112a77d702Ac890e70CD73d53" as TAddress,
          abi: DividendMinterABI,
          functionName: "userInfo",
          args: [$account],
        })) as bigint[];

        const profitWallet = {
          profitBalance:
            Math.trunc(Number(formatUnits(profitBalance, 18)) * 100) / 100,
          profitStaked:
            Math.trunc(Number(formatUnits(profitStaked[0], 18)) * 100) / 100,
        };

        setProfitWallet(profitWallet);
      } catch (error) {
        console.error("Error fetching profitBalance:", error);
      }
    }
  };

  useEffect(() => {
    fetchTokenomicsData();
    profitStakingAllowance();
    pmMintAllowance();
    sdivBalance();
    profitBalance();
  }, [$assetsPrices]);

  const isStakingAllowed =
    tabStakeModal === "stake" &&
    Number(input) > 0 &&
    Number(input) <= Number(_profitStakingAllowance) &&
    Number(input) <= Number(profitWallet?.profitBalance);

  const isStakingNotAproved =
    tabStakeModal === "stake" &&
    Number(input) > Number(_profitStakingAllowance) &&
    Number(input) <= Number(profitWallet?.profitBalance);

  const isStakingInsufficient =
    tabStakeModal === "stake" &&
    Number(input) > Number(profitWallet?.profitBalance);

  const isUnstakingAllowed =
    tabStakeModal === "unstake" &&
    Number(input) > 0 &&
    Number(input) <= Number(profitWallet?.profitStaked);

  const isUnstakingInsufficient =
    tabStakeModal === "unstake" &&
    Number(input) > Number(profitWallet?.profitStaked);

  const isMintAllowed =
    Number(input) > 0 &&
    Number(input) === Number(tokenomics.pmMintAllowance) &&
    Number(input) <= Number(profitWallet?.profitBalance);

  const isMintNotAproved =
    Number(input) > 0 &&
    Number(input) > Number(tokenomics.pmMintAllowance) &&
    Number(input) <= Number(profitWallet?.profitBalance);

  return tokenomics ? (
    <div className="overflow-hidden mt-5 bg-[#3d404b] rounded-md border border-gray-600">
      <h1 className="text-xxl text-left text-[#8D8E96] ps-4 my-auto">
        Tokenomics
      </h1>

      <div className="mt-2  border border-gray-600 rounded-md w-full">
        <div className="p-2 grid lg:flex gap-2">
          <div className="bg-[#2c2f38] rounded-md p-3 relative lg:w-1/3 shadow-sm border border-gray-700">
            <table className="text-sm font-medium h-[215px] text-[#8D8E96]">
              <tbody>
                <tr>
                  <td className="min-w-[95px]">Name: </td>
                  <td>{getTokenData(PROFIT[0])?.name} </td>
                </tr>
                <tr>
                  <td>Symbol: </td>
                  <td>{getTokenData(PROFIT[0])?.symbol} </td>
                </tr>
                <tr>
                  <td>Address: </td>
                  <td className="overflow-clip">
                    <ShortAddress address={getTokenData(PROFIT[0])?.address} />
                  </td>
                </tr>
                <tr>
                  <td>Price: </td>
                  <td>
                    {"$ "}
                    {tokenomics?.profitPrice}{" "}
                  </td>
                </tr>
                <tr>
                  <td>Total supply: </td>
                  <td>{tokenomics?.profitTotalSupply} PROFIT</td>
                </tr>
                <tr>
                  <td>Market Cap: </td>
                  <td>
                    {"$ "}
                    {tokenomics?.profitMarketCap}{" "}
                  </td>
                </tr>

                <tr>
                  <td>Wallet: </td>
                  <td>{profitWallet?.profitBalance} PROFIT</td>
                </tr>
                <tr>
                  <td>Staked:</td>
                  <td>
                    <p className="my-auto ">
                      {profitWallet?.profitStaked} PROFIT
                    </p>{" "}
                  </td>
                </tr>
              </tbody>
            </table>

            <img
              className="rounded-full absolute right-3 top-3 w-1/6 md:w-1/5 lg:w-1/5"
              src={getTokenData(PROFIT[0])?.logoURI}
              alt={getTokenData(PROFIT[0])?.logoURI}
              title={getTokenData(PROFIT[0])?.symbol}
            />

            <div className="flex mt-3 text-sm me-auto  justify-between">
              <button
                onClick={() => {
                  setShowStakeModal(true);
                  setInput("");
                  setTabStakeModal("stake");
                }}
                className="bg-button me-3 rounded-sm p-2 font-medium text-[#8D8E96]">
                Stake | Unstake
              </button>

              <div className="flex">
                <a
                  className="rounded-sm p-2 text-sm my-auto flex bg-button me-2"
                  href="https://dexscreener.com/polygon/0xd3B1f11f0ff29Add929941095C696D464D6961FC?embed=1&amp;theme=dark&amp;trades=0&amp;info=0"
                  title="Live chart"
                  target="_blank">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#fff"
                    fillRule="evenodd"
                    viewBox="0 0 252 300"
                    focusable="false"
                    className="w-[20px] h-[20px]">
                    <path d="M151.818 106.866c9.177-4.576 20.854-11.312 32.545-20.541 2.465 5.119 2.735 9.586 1.465 13.193-.9 2.542-2.596 4.753-4.826 6.512-2.415 1.901-5.431 3.285-8.765 4.033-6.326 1.425-13.712.593-20.419-3.197m1.591 46.886l12.148 7.017c-24.804 13.902-31.547 39.716-39.557 64.859-8.009-25.143-14.753-50.957-39.556-64.859l12.148-7.017a5.95 5.95 0 003.84-5.845c-1.113-23.547 5.245-33.96 13.821-40.498 3.076-2.342 6.434-3.518 9.747-3.518s6.671 1.176 9.748 3.518c8.576 6.538 14.934 16.951 13.821 40.498a5.95 5.95 0 003.84 5.845zM126 0c14.042.377 28.119 3.103 40.336 8.406 8.46 3.677 16.354 8.534 23.502 14.342 3.228 2.622 5.886 5.155 8.814 8.071 7.897.273 19.438-8.5 24.796-16.709-9.221 30.23-51.299 65.929-80.43 79.589-.012-.005-.02-.012-.029-.018-5.228-3.992-11.108-5.988-16.989-5.988s-11.76 1.996-16.988 5.988c-.009.005-.017.014-.029.018-29.132-13.66-71.209-49.359-80.43-79.589 5.357 8.209 16.898 16.982 24.795 16.709 2.929-2.915 5.587-5.449 8.814-8.071C69.31 16.94 77.204 12.083 85.664 8.406 97.882 3.103 111.959.377 126 0m-25.818 106.866c-9.176-4.576-20.854-11.312-32.544-20.541-2.465 5.119-2.735 9.586-1.466 13.193.901 2.542 2.597 4.753 4.826 6.512 2.416 1.901 5.432 3.285 8.766 4.033 6.326 1.425 13.711.593 20.418-3.197"></path>
                    <path d="M197.167 75.016c6.436-6.495 12.107-13.684 16.667-20.099l2.316 4.359c7.456 14.917 11.33 29.774 11.33 46.494l-.016 26.532.14 13.754c.54 33.766 7.846 67.929 24.396 99.193l-34.627-27.922-24.501 39.759-25.74-24.231L126 299.604l-41.132-66.748-25.739 24.231-24.501-39.759L0 245.25c16.55-31.264 23.856-65.427 24.397-99.193l.14-13.754-.016-26.532c0-16.721 3.873-31.578 11.331-46.494l2.315-4.359c4.56 6.415 10.23 13.603 16.667 20.099l-2.01 4.175c-3.905 8.109-5.198 17.176-2.156 25.799 1.961 5.554 5.54 10.317 10.154 13.953 4.48 3.531 9.782 5.911 15.333 7.161 3.616.814 7.3 1.149 10.96 1.035-.854 4.841-1.227 9.862-1.251 14.978L53.2 160.984l25.206 14.129a41.926 41.926 0 015.734 3.869c20.781 18.658 33.275 73.855 41.861 100.816 8.587-26.961 21.08-82.158 41.862-100.816a41.865 41.865 0 015.734-3.869l25.206-14.129-32.665-18.866c-.024-5.116-.397-10.137-1.251-14.978 3.66.114 7.344-.221 10.96-1.035 5.551-1.25 10.854-3.63 15.333-7.161 4.613-3.636 8.193-8.399 10.153-13.953 3.043-8.623 1.749-17.689-2.155-25.799l-2.01-4.175z"></path>
                  </svg>
                </a>
                <a
                  className="rounded-sm p-2 my-auto flex bg-button me-2"
                  href="https://app.1inch.io/#/137/simple/swap/ETH/PROFIT"
                  title="Swap by 1inch"
                  target="_blank">
                  <svg
                    className="w-[20px] h-[20px]"
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="231.000000pt"
                    height="218.000000pt"
                    viewBox="0 0 231.000000 218.000000"
                    preserveAspectRatio="xMidYMid meet">
                    {" "}
                    <g
                      transform="translate(0.000000,218.000000) scale(0.100000,-0.100000)"
                      fill="#ffffff"
                      stroke="none">
                      {" "}
                      <path d="M902 2169 c-118 -20 -233 -108 -283 -217 -13 -29 -27 -52 -30 -52 -3 0 -16 35 -29 77 l-23 77 -20 -25 c-58 -71 -89 -199 -69 -286 6 -27 6 -43 0 -43 -5 0 -104 34 -220 75 -116 42 -216 74 -222 72 -10 -3 125 -107 403 -308 l103 -75 2 -65 c1 -35 9 -82 18 -104 15 -37 14 -53 -8 -225 -23 -176 -26 -190 -69 -280 l-45 -95 16 -55 c26 -88 59 -146 91 -158 97 -38 190 -43 218 -12 14 15 31 20 74 20 71 0 100 16 195 106 77 73 105 127 92 179 -3 12 -1 36 4 54 9 33 136 211 150 211 20 0 132 -136 159 -192 38 -81 50 -135 51 -223 1 -224 -149 -427 -373 -505 -73 -26 -189 -42 -252 -36 -46 5 -44 3 25 -15 92 -25 308 -36 393 -20 32 6 84 21 117 35 33 13 60 21 60 18 0 -4 -21 -28 -47 -54 l-46 -47 63 15 c147 34 324 147 419 268 24 31 45 56 46 56 2 0 -3 -32 -11 -72 -8 -39 -12 -73 -10 -76 9 -8 195 186 233 243 103 154 153 313 153 489 l0 80 33 -43 32 -42 9 42 c13 57 -6 260 -34 364 -62 233 -229 450 -450 582 l-75 45 90 -6 90 -6 -49 34 c-77 56 -215 123 -312 152 -80 25 -104 27 -239 27 -134 0 -159 -2 -238 -26 -49 -15 -107 -37 -130 -48 l-41 -21 18 27 c10 16 27 43 38 62 23 38 25 38 -70 22z m197 -213 c18 -73 14 -137 -14 -192 -27 -54 -83 -114 -130 -138 l-30 -16 50 0 c32 0 69 9 101 24 l52 24 12 -26 c7 -15 25 -60 41 -100 l29 -73 -41 -97 c-23 -53 -45 -101 -50 -107 -5 -5 -33 -17 -61 -25 l-52 -16 -48 -119 c-26 -66 -47 -126 -48 -132 0 -7 -7 -13 -15 -13 -8 0 -29 -13 -47 -28 l-31 -29 55 5 c52 4 58 2 96 -32 89 -81 81 -138 -33 -239 -67 -58 -81 -67 -116 -67 -21 0 -39 4 -39 9 0 4 38 45 85 90 61 58 85 88 85 106 0 29 -24 55 -53 55 -18 0 -19 2 -7 10 12 8 11 10 -6 10 -45 0 -65 -31 -80 -120 -12 -81 -15 -85 -66 -137 -61 -62 -82 -70 -144 -53 -48 14 -56 24 -85 104 l-17 50 39 78 c39 78 55 151 74 341 4 37 11 67 15 67 5 0 19 -22 33 -50 18 -35 27 -45 31 -34 13 35 5 101 -20 154 -38 79 -35 131 14 267 51 140 49 138 73 117 10 -9 25 -14 33 -11 17 7 128 153 226 298 36 53 68 95 71 93 4 -2 12 -24 18 -48z m271 -222 c114 -33 209 -92 311 -194 86 -85 102 -107 147 -200 61 -128 82 -216 82 -353 0 -247 -120 -484 -314 -621 -116 -82 -123 -82 -45 0 79 84 129 161 159 246 12 33 31 62 55 82 35 30 38 36 42 103 5 67 4 73 -24 110 -21 27 -35 62 -47 118 -17 84 -70 207 -112 263 -14 18 -27 45 -30 60 -13 80 -82 206 -132 240 -49 34 -51 33 -29 -15 17 -38 22 -66 22 -138 0 -82 -3 -95 -31 -145 -43 -75 -100 -111 -195 -119 -81 -8 -89 -15 -161 -142 l-43 -76 -48 1 c-57 1 -57 -4 2 145 l38 96 57 20 c51 18 59 25 77 65 24 54 21 51 60 59 26 5 34 14 50 56 l19 50 -51 132 -51 133 21 29 c20 27 23 28 68 20 27 -5 73 -16 103 -25z m-925 -96 c134 -49 161 -63 169 -84 6 -16 -9 -44 -24 -44 -10 0 -272 158 -285 172 -7 8 -4 9 10 4 11 -4 70 -26 130 -48z m1199 -412 c37 -64 65 -140 83 -225 11 -58 22 -83 45 -107 29 -31 30 -34 23 -99 -7 -62 -10 -69 -41 -87 -21 -13 -37 -32 -45 -56 -27 -86 -93 -195 -161 -265 -60 -63 -64 -66 -32 -22 46 62 107 192 125 265 7 30 13 98 13 150 -1 79 -6 108 -29 170 -15 41 -28 86 -28 100 0 35 15 220 19 220 1 0 14 -20 28 -44z m-743 -436 c29 -16 23 -32 -24 -72 l-44 -36 8 51 c5 28 14 54 21 59 16 10 16 10 39 -2z" />{" "}
                      <path d="M998 1802 c-31 -47 -55 -88 -53 -91 3 -2 23 8 45 22 47 32 72 76 68 122 -3 33 -4 33 -60 -53z" />{" "}
                      <path d="M846 1404 c-49 -74 -94 -138 -99 -141 -5 -3 -18 5 -28 18 l-19 24 0 -35 c0 -38 23 -80 43 -80 19 0 147 69 188 102 20 15 40 40 43 55 9 35 -9 78 -39 91 -24 11 -24 12 -10 53 9 23 14 43 13 45 -2 1 -43 -58 -92 -132z m78 -27 c8 -23 5 -31 -20 -58 -30 -31 -92 -74 -98 -68 -8 8 88 159 98 156 6 -2 15 -16 20 -30z" />{" "}
                      <path d="M573 726 c-22 -46 -24 -57 -14 -70 18 -21 27 -20 51 4 23 23 26 65 6 73 -9 4 -12 14 -9 26 10 38 -7 22 -34 -33z" />{" "}
                    </g>{" "}
                  </svg>
                </a>
                <a
                  className="rounded-sm p-2 text-sm my-auto flex bg-button"
                  href="https://app.uniswap.org/swap?inputCurrency=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619&outputCurrency=0x48469a0481254d5945E7E56c1Eb9861429c02f44"
                  title="Swap by Uniswap"
                  target="_blank">
                  <svg
                    fill="white"
                    className="w-[20px] h-[20px]"
                    viewBox="0 0 14 15"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.152 1.551c-.188-.029-.196-.032-.107-.045.17-.026.57.009.846.074.644.152 1.23.542 1.856 1.235l.166.184.238-.038c1.002-.16 2.02-.033 2.873.358.235.108.605.322.65.377.016.018.043.13.06.251.064.418.033.737-.096.976-.07.13-.074.171-.027.283a.274.274 0 0 0 .246.154c.212 0 .44-.34.545-.814l.042-.189.083.094c.457.514.815 1.214.876 1.712l.016.13-.076-.118a1.462 1.462 0 0 0-.435-.453c-.306-.201-.63-.27-1.486-.315-.774-.04-1.212-.106-1.646-.247-.739-.24-1.111-.558-1.989-1.702-.39-.509-.63-.79-.87-1.016-.545-.515-1.08-.785-1.765-.89Z"></path>
                    <path d="M10.85 2.686c.019-.34.065-.565.159-.77a.825.825 0 0 1 .077-.148c.005 0-.011.06-.036.133-.068.2-.08.472-.032.789.06.402.093.46.52.894.201.204.434.46.519.571l.154.2-.154-.143c-.188-.175-.62-.517-.716-.566-.064-.032-.074-.032-.113.007-.037.036-.044.09-.05.346-.007.399-.062.655-.194.91-.071.14-.082.11-.018-.047.048-.116.053-.168.053-.554 0-.775-.094-.962-.637-1.28a5.971 5.971 0 0 0-.504-.26 1.912 1.912 0 0 1-.246-.12c.015-.015.545.139.758.22.318.122.37.137.409.123.025-.01.038-.085.05-.305ZM4.517 4.013c-.381-.522-.618-1.323-.566-1.922l.015-.185.087.015c.164.03.445.134.577.214.361.218.518.505.677 1.243.047.216.108.46.136.544.045.133.217.444.356.646.1.146.034.215-.188.195-.339-.03-.798-.345-1.094-.75ZM10.386 7.9c-1.784-.713-2.412-1.333-2.412-2.378 0-.154.005-.28.012-.28.006 0 .075.05.153.113.362.288.767.411 1.889.574.66.096 1.03.173 1.373.286 1.09.359 1.763 1.087 1.924 2.08.046.288.02.828-.057 1.113-.06.225-.242.63-.29.646-.014.005-.027-.046-.03-.116-.018-.372-.208-.735-.526-1.007-.362-.309-.848-.555-2.036-1.03ZM9.134 8.197a3.133 3.133 0 0 0-.086-.375l-.046-.135.085.095c.117.13.21.297.288.52.06.17.066.22.066.496 0 .271-.008.328-.064.48a1.518 1.518 0 0 1-.376.596c-.326.33-.745.512-1.35.588-.105.013-.411.035-.68.049-.679.035-1.126.108-1.527.248a.324.324 0 0 1-.115.027c-.016-.016.258-.178.483-.286.318-.153.635-.236 1.345-.353.35-.058.713-.129.805-.157.868-.264 1.315-.947 1.172-1.793Z"></path>
                    <path d="M9.952 9.641c-.237-.506-.292-.995-.162-1.451.014-.05.036-.089.05-.089.013 0 .07.03.124.067.11.073.328.196.912.512.728.395 1.144.7 1.426 1.05.247.305.4.654.474 1.078.042.24.017.82-.045 1.062-.196.764-.65 1.364-1.3 1.714-.095.051-.18.093-.19.093-.009 0 .026-.087.077-.194.219-.454.244-.895.079-1.386-.102-.301-.308-.668-.724-1.289-.484-.72-.602-.913-.721-1.167ZM3.25 12.374c.663-.556 1.486-.95 2.237-1.072a3.51 3.51 0 0 1 1.161.045c.48.122.91.396 1.133.721.218.319.312.596.41 1.214.038.243.08.488.092.543.073.32.216.576.392.704.28.204.764.217 1.239.033a.618.618 0 0 1 .155-.048c.017.017-.222.176-.39.26a1.334 1.334 0 0 1-.648.156c-.435 0-.796-.22-1.098-.668a5.3 5.3 0 0 1-.296-.588c-.318-.721-.475-.94-.844-1.181-.322-.21-.737-.247-1.049-.095-.41.2-.524.72-.23 1.05a.911.911 0 0 0 .512.266.545.545 0 0 0 .619-.544c0-.217-.084-.34-.295-.436-.289-.129-.598.022-.597.291 0 .115.051.187.167.24.074.033.076.035.015.023-.264-.055-.326-.372-.114-.582.256-.252.784-.141.965.204.076.145.085.433.019.607-.15.39-.582.595-1.022.483-.3-.076-.421-.158-.782-.527-.627-.642-.87-.767-1.774-.907l-.174-.027.197-.165Z"></path>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M.308.884C2.402 3.41 3.845 4.452 4.005 4.672c.132.182.082.346-.144.474a1.381 1.381 0 0 1-.515.143c-.147 0-.198-.056-.198-.056-.085-.08-.133-.066-.57-.837A132.96 132.96 0 0 0 1.45 2.67c-.032-.03-.031-.03 1.067 1.923.177.407.035.556.035.614 0 .118-.033.18-.179.343-.244.27-.353.574-.432 1.203-.088.705-.336 1.203-1.024 2.056-.402.499-.468.59-.57.792-.128.253-.163.395-.177.714-.015.339.014.557.118.88.09.284.186.47.429.844.21.323.33.563.33.657 0 .074.014.074.34.001.776-.174 1.407-.48 1.762-.857.22-.233.271-.361.273-.68.001-.208-.006-.252-.063-.372-.092-.195-.26-.358-.63-.61-.486-.33-.694-.595-.75-.96-.048-.3.007-.511.275-1.07.278-.58.347-.827.394-1.41.03-.377.071-.526.18-.646.114-.124.216-.166.498-.204.459-.063.75-.18.99-.4a.853.853 0 0 0 .31-.652l.01-.21-.117-.134C4.098 4.004.026.5 0 .5-.005.5.133.673.308.884Zm.976 9.815a.37.37 0 0 0-.115-.489c-.15-.1-.385-.052-.385.077 0 .04.022.069.072.094.084.043.09.091.024.19-.067.099-.061.186.015.246.123.095.297.043.389-.118ZM4.925 5.999c-.215.065-.424.292-.49.53-.039.145-.016.4.043.478.096.127.188.16.439.159.49-.003.916-.212.966-.474.04-.214-.147-.51-.405-.641a.965.965 0 0 0-.553-.052Zm.574.445c.075-.107.042-.222-.087-.3-.244-.149-.615-.026-.615.204 0 .115.193.24.37.24.118 0 .28-.07.332-.144Z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:w-2/3 gap-2 w-full">
            <div className="bg-[#2c2f38] rounded-md p-3 relative shadow-sm border border-gray-700">
              <table
                className={`${
                  sdivWallet && sdivWallet?.sdivEarned > 0
                    ? "max-h-[215px]"
                    : "h-full"
                } text-sm font-medium h-full min-h-[215px] text-[#8D8E96]`}>
                <tbody>
                  <tr>
                    <td className="min-w-[95px]">Name: </td>
                    <td>{getTokenData(SDIV[0])?.name} </td>
                  </tr>
                  <tr>
                    <td>Symbol: </td>
                    <td>{getTokenData(SDIV[0])?.symbol} </td>
                  </tr>
                  <tr>
                    <td>Address: </td>
                    <td className="overflow-clip">
                      <ShortAddress address={getTokenData(SDIV[0])?.address} />
                    </td>
                  </tr>
                  <tr>
                    <td>Total supply: </td>
                    <td>{tokenomics.sdivTotalSupply} SDIV</td>
                  </tr>
                  <tr>
                    <td>Wallet: </td>
                    <td>{sdivWallet?.sdivBalance} SDIV</td>
                  </tr>
                  <tr>
                    <td>Earned: </td>
                    <td>{sdivWallet?.sdivEarned} SDIV</td>
                  </tr>
                </tbody>
              </table>

              <img
                className="rounded-full absolute right-3 top-3 w-1/6 lg:w-1/5"
                src={getTokenData(SDIV[0])?.logoURI}
                alt={getTokenData(SDIV[0])?.logoURI}
                title={getTokenData(SDIV[0])?.symbol}
              />
              {sdivWallet && sdivWallet?.sdivEarned > 0 && (
                <div className="flex mt-3 text-sm w-[51px] h-[36px]">
                  {loader === true &&
                  showMintModal === false &&
                  showStakeModal === false ? (
                    <button
                      className="bg-button rounded-sm p-2 font-medium text-[#8D8E96] w-full"
                      disabled>
                      <Loader />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        harvest();
                        setLoader(true);
                      }}
                      className="bg-button rounded-sm p-2 font-medium text-[#8D8E96] w-full">
                      Claim
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#2c2f38] rounded-md p-3 relative shadow-sm border border-gray-700">
              <table className="text-sm font-medium h-[215px] text-[#8D8E96]">
                <tbody>
                  <tr>
                    <td className="min-w-[95px]">Name: </td>
                    <td>Profit Maker </td>
                  </tr>
                  <tr>
                    <td>Symbol: </td>
                    <td>PM </td>
                  </tr>
                  <tr>
                    <td>Address: </td>
                    <td>
                      <ShortAddress address={PM[0]} />{" "}
                    </td>
                  </tr>
                  <tr>
                    <td>Total supply: </td>
                    <td>{tokenomics.pmTotalSupply} PM</td>
                  </tr>
                  <tr>
                    <td>To mint: </td>
                    <td>{tokenomics.pmToMint} PM</td>
                  </tr>
                  <tr>
                    <td>Minted: </td>
                    <td>0 PM</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between mt-3 text-sm">
                <button
                  onClick={() => {
                    setShowMintModal(true);
                    setInput("");
                  }}
                  className="bg-button rounded-sm p-2 font-medium text-[#8D8E96]">
                  Mint
                </button>

                <div className="flex">
                  <a
                    className="rounded-sm text-start p-2 text-sm my-auto flex bg-button "
                    href="https://opensea.io/collection/profit-maker"
                    target="blank"
                    title="Marketplace">
                    Marketplace
                  </a>
                </div>
              </div>

              <img
                className="rounded-full absolute right-3 top-3 w-1/6 lg:w-1/5"
                alt="Profit maker"
                src="https://stabilitydao.org/pm.png"
                title={getTokenData(PM[0])?.symbol}
              />
            </div>
          </div>
        </div>
      </div>

      {showStakeModal === true && (
        <div
          className="overlay"
          onClick={() => {
            setShowStakeModal(false);
            setLoader(false);
          }}>
          <div
            className="flex flex-col min-w-[270px] h-auto z-[120] p-4 rounded-md bg-modal"
            onClick={e => {
              e.stopPropagation();
            }}>
            <div className="w-full flex justify-evenly">
              <button
                onClick={() => {
                  setTabStakeModal("stake");
                  setInput("");
                }}
                className={`w-1/2 text-gray-400 ${
                  tabStakeModal === "stake" &&
                  "border border-b-1 border-t-0 border-l-0 border-r-0 border-gray-400 text-white rounded-top-md"
                }`}>
                STAKE
              </button>

              <button
                onClick={() => {
                  setTabStakeModal("unstake");
                  setInput("");
                }}
                className={`w-1/2 text-gray-400 ${
                  tabStakeModal === "unstake" &&
                  "border border-b-1 border-t-0 border-l-0 border-r-0 border-gray-400 text-white"
                }`}>
                UNSTAKE
              </button>
            </div>
            <table className="w-full m-auto mt-3">
              <tbody>
                <tr>
                  <td>Wallet: </td>
                  <td>{profitWallet?.profitBalance} PROFIT</td>
                </tr>
                <tr>
                  <td className="w-[70px]">Staked: </td>
                  <td className="my-auto ">
                    {profitWallet?.profitStaked} PROFIT
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex items-center w-full relative m-auto">
              <input
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  setProfitStakingAllowance("");
                  profitBalance();
                  sdivBalance();
                  profitStakingAllowance();
                }}
                onClick={e => e.stopPropagation()}
                className="ps-2 rounded-sm p-1 my-3 text-gray-400 bg-transparent border border-gray-600 w-full m-auto"
                placeholder="0"
              />
              <button
                onClick={() => {
                  if (tabStakeModal === "stake") {
                    setInput(String(profitWallet?.profitBalance));
                  } else {
                    setInput(String(profitWallet?.profitStaked));
                  }
                  setProfitStakingAllowance("");
                  profitStakingAllowance();
                }}
                className="flex rounded-md w-10 border border-gray-500 ring-gray-500 hover:ring-1 text-gray-500 text-sm absolute right-2 justify-center"
                type="button">
                MAX
              </button>
            </div>

            {_profitStakingAllowance !== "" && loader !== true ? (
              <>
                {isStakingAllowed ? (
                  <div className="flex w-full m-auto">
                    <button
                      onClick={() => {
                        stake();
                        setLoader(true);
                      }}
                      className="bg-button w-full h-[48px] m-auto rounded-sm p-2 text-[#8D8E96]">
                      Stake
                    </button>
                  </div>
                ) : isStakingNotAproved ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      aproveStaking();
                    }}
                    className="bg-button w-full h-[48px] m-auto rounded-sm p-2 text-[#8D8E96]">
                    Aprove
                  </button>
                ) : isStakingInsufficient ? (
                  <button
                    className="bg-button w-full h-[48px] m-auto rounded-sm p-2 text-[#8D8E96]"
                    disabled>
                    INSUFFICIENT BALANCE
                  </button>
                ) : null}

                {isUnstakingAllowed ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      unStake();
                      setLoader(true);
                    }}
                    className="bg-button w-full h-[48px] m-auto rounded-sm p-2 text-[#8D8E96]">
                    Unstake
                  </button>
                ) : isUnstakingInsufficient ? (
                  <button
                    className="bg-button rounded-sm p-2 text-sm text-[#8D8E96] m-auto w-full h-[48px]"
                    disabled>
                    INSUFFICIENT STAKED AMOUNT
                  </button>
                ) : null}
              </>
            ) : (
              <button
                className="bg-button w-full h-[48px] m-auto rounded-sm p-2 text-[#8D8E96]"
                disabled>
                <Loader
                  customHeight={30}
                  customWidth={30}
                />
              </button>
            )}
          </div>
        </div>
      )}

      {showMintModal && (
        <div
          className="overlay"
          onClick={() => setShowMintModal(false)}>
          <div
            className="flex flex-col min-w-[270px] h-auto z-[120] p-4 rounded-md bg-modal"
            onClick={e => {
              e.stopPropagation();
            }}>
            <div className="w-full flex justify-evenly">
              <button
                className="w-1/2 border border-b-1 border-t-0 border-l-0 border-r-0 border-gray-400 text-white"
                disabled>
                MINT
              </button>
            </div>

            <table className="w-full m-auto mt-3">
              <tbody>
                <tr>
                  <td className="w-[70px]">Wallet: </td>
                  <td>{profitWallet?.profitBalance} PROFIT</td>
                </tr>
                <tr>
                  <td>Minted:</td>
                  <td className="my-auto">0 PM</td>
                </tr>
              </tbody>
            </table>

            <div className="flex items-center w-full m-auto relative  ">
              <input
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  pmMintAllowance();
                }}
                onClick={e => e.stopPropagation()}
                className="ps-2 rounded-sm p-1 my-5 text-gray-400 bg-transparent border border-gray-600 w-full m-auto"
                placeholder="0"
              />
              <button
                onClick={() => setInput(String(profitWallet?.profitBalance))}
                className="flex rounded-md w-10 border border-gray-500 ring-gray-500 hover:ring-1 text-gray-500 text-sm absolute right-2 justify-center"
                type="button">
                MAX
              </button>
            </div>

            {_pmMintAllowance !== "" && loader !== true ? (
              <>
                {isMintAllowed ? (
                  <div className="flex justify-between w-full">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        mint();
                      }}
                      className="bg-button w-full h-[48px] m-auto rounded-sm p-2 text-[#8D8E96]">
                      Mint
                    </button>
                  </div>
                ) : isMintNotAproved ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      mint();
                      pmMintAllowance();
                    }}
                    className="bg-button w-full h-[48px] m-auto rounded-sm p-2 text-[#8D8E96]">
                    Aprove
                  </button>
                ) : Number(input) > Number(profitWallet?.profitBalance) ? (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                    }}
                    className="bg-button w-full h-[48px] m-auto rounded-sm p-2 text-[#8D8E96]"
                    disabled>
                    INSUFFICIENT BALANCE
                  </button>
                ) : null}
              </>
            ) : (
              <button
                className="bg-button w-full h-[48px] m-auto rounded-sm p-2 text-[#8D8E96]"
                disabled>
                <Loader
                  customHeight={30}
                  customWidth={30}
                />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex p-3 shadow-lg rounded-md justify-center min-h-[368px] m-auto mt-5 bg-[#3d404b] border-gray-600">
      <Loader
        customHeight={100}
        customWidth={100}
      />
    </div>
  );
}

export default Tokenomics;
