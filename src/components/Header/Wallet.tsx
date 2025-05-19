import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import { isMobile } from "react-device-detect";

import { useWeb3Modal } from "@web3modal/wagmi/react";

import {
  account,
  assetsBalances,
  assetsPrices,
  publicClient,
  currentChainID,
} from "@store";

import { IERC721Enumerable } from "@web3";

import { cn, getTokenData } from "@utils";

import { CHAINS, PM } from "@constants";

import type { TAddress } from "@types";

const Wallet = (): JSX.Element => {
  const { open } = useWeb3Modal();
  const { connector } = useAccount();

  const $account = useStore(account);
  const $currentChainID = useStore(currentChainID);
  const $publicClient = useStore(publicClient);
  const $assetsBalances = useStore(assetsBalances);
  const $assetsPrices = useStore(assetsPrices);

  const [userBalance, setUserBalance] = useState<number>(0);
  const [userAssets, setUserAssets] = useState<string[]>([]);
  const [providerImage, setProviderImage] = useState<string>("");

  const currentChain = CHAINS.find((item) => item.id === $currentChainID);

  const checkPM = async () => {
    try {
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
    } catch (error) {
      console.log(error);
    }
  };

  const insertAssets = () => {
    const web3ModalCard = document
      .querySelector("w3m-modal")
      ?.shadowRoot?.querySelector("wui-card")
      ?.querySelector("w3m-router")
      ?.shadowRoot?.querySelector("div")
      ?.querySelector("w3m-account-view")
      ?.shadowRoot?.querySelector("w3m-account-default-widget")?.shadowRoot;

    if (
      !web3ModalCard ||
      web3ModalCard.querySelector(".custom_assets__container")
    )
      return;

    const we3ModalDescription = web3ModalCard?.querySelector("wui-flex");

    const customContentContainer = document.createElement("div");
    const customContent = document.createElement("div");
    const customDescription = document.createElement("div");

    customContentContainer.classList.add("custom_assets__container");

    customContent.innerHTML = userAssets.join("");
    customContent.setAttribute(
      "style",
      `display: flex; align-items:center;justify-content:center; flex-wrap: wrap; gap: 10px; overflow-y: auto; ${isMobile ? "max-height:100px;" : "max-height:300px;"}`
    );

    customDescription.innerHTML = `<p style="margin:0; color:#949e9e;">$${userBalance}</p>`;

    customContentContainer.setAttribute(
      "style",
      "display: flex; align-items: center; justify-content: center; flex-direction: column; width: 100%;"
    );

    customContentContainer.appendChild(customContent);
    customContentContainer.appendChild(customDescription);

    web3ModalCard.appendChild(customContentContainer);

    if (we3ModalDescription) {
      we3ModalDescription.appendChild(customContentContainer);
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

    if (web3ModalCard && userAssets?.length) {
      insertAssets();
    } else {
      setTimeout(insertAssets, 1000);
    }
  };
  const initProfile = async () => {
    if (!$assetsBalances[$currentChainID]) return; // dublicated for TS
    let profileBalance = 0;

    const assets = Object.entries($assetsBalances[$currentChainID])
      .filter((token) => token[1] && getTokenData(token[0]))
      .map(([address, data]) => {
        const balance = Number(
          formatUnits(data, getTokenData(address)?.decimals as number)
        );
        const price = Number($assetsPrices?.[$currentChainID]?.[address].price);

        const balanceInUSD = balance * price;
        profileBalance += balanceInUSD;
        return {
          balance: balance.toFixed(2),
          balanceInUSD: balanceInUSD.toFixed(2),
          logo: getTokenData(address)?.logoURI,
          symbol: getTokenData(address)?.symbol,
        };
      });

    if (currentChain?.name === "Polygon") {
      const profitMaker = await checkPM();
      if (profitMaker) assets.push(profitMaker);
    }

    const assetsTemplates = assets.map(
      (asset) =>
        `<div style="width:100px; height:100px; color:#fff; background-color:rgba(255, 255, 255, 0.02); border-radius:4px;flex-grow:1;">
          <div style="display:flex; flex-direction:column; align-items:center; padding:10px;">
            <img style="width: 32px; height:32px; border-radius:100%" src=${
              asset.logo
            } alt="logo" />
            <p style="margin:0; font-size:13px; margin-top:2px;">${
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
    <div className="flex flex-nowrap justify-end whitespace-nowrap text-[14px] font-semibold">
      {currentChain && $account && (
        <button
          className="flex items-center gap-2 border-l border-[#23252A] min-h-full px-4"
          id="network"
          onClick={() => open({ view: "Networks" })}
        >
          <img
            className="w-4 h-4 md:w-5 md:h-5 rounded-full"
            src={currentChain?.logoURI}
            alt={currentChain?.name}
          />
          <p className="min-[1200px]:flex hidden">{currentChain?.name}</p>
        </button>
      )}
      <button
        data-testid="connectButton"
        className="flex items-center gap-2 border-l border-[#23252A] min-h-full pl-4"
        onClick={() => openProfile()}
      >
        {$account && providerImage ? (
          <img className="w-4 h-4" src={providerImage} alt="providerImage" />
        ) : (
          <img className="w-4 h-4" src="/icons/wallet.svg" alt="Wallet" />
        )}
        <span
          className={cn(
            "text-[14px] leading-5 font-medium",
            !$account && "text-[#A193F2] "
          )}
        >
          {$account
            ? `${$account.slice(0, 6)}...${$account.slice(-4)}`
            : "Connect Wallet"}
        </span>
      </button>
    </div>
  );
};
export { Wallet };
