import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";
import { useSwitchChain, useAccount } from "wagmi";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import {
  account,
  assetsBalances,
  visible,
  assetsPrices,
  network,
  publicClient,
} from "@store";

import { IERC721Enumerable } from "@web3";

import { getTokenData } from "@utils";

import { CHAINS, PM } from "@constants";

import type { TAddress } from "@types";

const Wallet = () => {
  const { open } = useWeb3Modal();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { connector } = useAccount();

  const $account = useStore(account);
  const $network = useStore(network);
  const $visible = useStore(visible);
  const $publicClient = useStore(publicClient);
  const $assetsBalances = useStore(assetsBalances);
  const $assetsPrices = useStore(assetsPrices);

  const [userBalance, setUserBalance] = useState<number>(0);
  const [userAssets, setUserAssets] = useState<any>();
  const [providerImage, setProviderImage] = useState<string>("");

  const maticChain = CHAINS.find((item) => item.name === $network);

  const checkPM = async () => {
    const balance = (await $publicClient?.readContract({
      address: PM[0],
      abi: IERC721Enumerable,
      functionName: "balanceOf",
      args: [$account as TAddress],
    })) as bigint;
    if (balance) {
      return {
        balance: String(formatUnits(balance, 18)),
        balanceInUSD: "",
        logo: "https://stabilitydao.org/pm.png",
        symbol: "PM",
      };
    }
  };
  const openProfile = () => {
    open();
    if (!$account) return;
    const web3ModalCard = document
      .querySelector("w3m-modal")
      ?.shadowRoot?.querySelector("wui-card")
      ?.querySelector("w3m-router")
      ?.shadowRoot?.querySelector("div")
      ?.querySelector("w3m-account-view")
      ?.shadowRoot?.querySelector("wui-flex");
    const we3ModalDescription = web3ModalCard?.querySelector("wui-flex");
    if (web3ModalCard && userAssets) {
      const customContent = document.createElement("div");
      const customDescription = document.createElement("div");
      customContent.innerHTML = userAssets.join("");
      customContent.setAttribute(
        "style",
        "display: flex; align-items:center;justify-content:center; flex-wrap: wrap; gap: 10px;"
      );
      customDescription.innerHTML = `<p style="margin:0; color:#949e9e;">$${userBalance}</p>`;
      web3ModalCard.appendChild(customContent);
      if (we3ModalDescription) {
        we3ModalDescription.appendChild(customDescription);
      }
    } else {
      setTimeout(openProfile, 1000);
    }
  };
  const initProfile = async () => {
    if (!$assetsBalances) return; // dublicated for TS
    let profileBalance = 0;
    const assets = Object.entries($assetsBalances)
      .filter((token) => token[1] && getTokenData(token[0]))
      .map(([address, data]) => {
        const balance = Number(
          formatUnits(data, getTokenData(address)?.decimals as number)
        );
        const price = Number(formatUnits($assetsPrices?.[address] || 0n, 18));
        const balanceInUSD = balance * price;
        profileBalance += balanceInUSD;
        return {
          balance: balance.toFixed(2),
          balanceInUSD: balanceInUSD.toFixed(2),
          logo: getTokenData(address)?.logoURI,
          symbol: getTokenData(address)?.symbol,
        };
      });
    const profitMaker = await checkPM();
    if (profitMaker) assets.push(profitMaker);
    const assetsTemplates = assets.map(
      (asset) =>
        `<div style="width:70px; color:#fff; background-color:rgba(255, 255, 255, 0.02); border-radius:4px;flex-grow:1;">
          <div style="display:flex; flex-direction:column; align-items:center; padding:10px;">
            <img style="width: 32px; height:32px; border-radius:100%" src=${
              asset.logo
            } alt="logo" />
            <p style="margin:0; font-size:14px; margin-top:2px;">${
              asset.symbol
            }</p>
            <div style="font-size:12px; display:flex; flex-wrap:wrap; align-items:center; justify-content:center;">
              <p style="margin:0; ">${asset.balance}</p>
              ${
                asset.balanceInUSD
                  ? `<p style="margin:0;">($${asset.balanceInUSD})</p>`
                  : ""
              }
            </div>
          </div>
        </div>`
    );
    setUserBalance(Number(profileBalance.toFixed(2)));
    setUserAssets(assetsTemplates);
  };

  useEffect(() => {
    if ($account && $assetsBalances) {
      initProfile();
    }
  }, [$assetsBalances, $account]);
  useEffect(() => {
    if (connector) {
      const connectorIdToImage = {
        walletConnect: "/wallet-connect.svg",
        "io.metamask": "/metamask.svg",
        "com.trustwallet.app": "/trustwallet.svg",
      };

      const defaultImage = connector?.icon || "";

      const providerImage =
        connectorIdToImage[connector.id as keyof typeof connectorIdToImage] ||
        defaultImage;

      setProviderImage(providerImage);
    }
  }, [$assetsBalances, $account, connector]);
  useEffect(() => {
    localStorage.removeItem("@w3m/connected_wallet_image_url");
  }, []);
  return (
    <div className="flex flex-nowrap justify-end whitespace-nowrap">
      {maticChain && (
        <button
          className="bg-[#272451] sm:py-1 px-3 rounded-xl mx-2 sm:mx-4 flex items-center sm:gap-1"
          id="network"
          onClick={() => open({ view: "Networks" })}
        >
          <img
            className="w-5 h-5 rounded-full sm:mx-1"
            src={maticChain?.logoURI}
            alt={maticChain?.name}
          />
          <p className="hidden sm:flex"> {maticChain?.name}</p>
        </button>
      )}
      {chain && chain?.id !== 137 && (
        <button
          className="bg-button sm:py-1 px-2 rounded-md mx-2 sm:mx-4 flex items-center sm:gap-1"
          onClick={() => switchChain({ chainId: 137 })}
        >
          <p>Switch Network</p>
        </button>
      )}
      <button
        className="bg-[#30127f] text-[#fcf3f6] py-0.5 px-4 rounded-xl sm:mx-4 min-w-[120px] flex items-center justify-center gap-1"
        onClick={() => openProfile()}
      >
        {$account && providerImage && (
          <img className="w-5" src={providerImage} alt="providerImage" />
        )}
        {$account
          ? `${
              $visible
                ? `${$account.slice(0, 6)}...${$account.slice(-4)}`
                : "*************"
            }`
          : "Connect Wallet"}
      </button>
    </div>
  );
};
export { Wallet };
