import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { formatUnits } from "viem";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { account, assetsBalances, assetsPrices, network } from "@store";

import { getTokenData } from "@utils";

import { CHAINS } from "@constants";

const Wallet = () => {
  const $account = useStore(account);
  const $network = useStore(network);
  const $assetsBalances = useStore(assetsBalances);
  const $assetsPrices = useStore(assetsPrices);

  const [userBalance, setUserBalance] = useState<number>(0);
  const [userAssets, setUserAssets] = useState<any>();

  const chain = CHAINS.find((item) => item.name === $network);

  const { open } = useWeb3Modal();

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
        "display: flex; align-items:center;justify-content:space-between; flex-wrap: wrap; gap: 10px;"
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

  useEffect(() => {
    if (!$assetsBalances) return;

    let profileBalance = 0;

    const assets = Object.entries($assetsBalances)
      .filter((token) => token[1].assetBalance && getTokenData(token[0]))
      .map(([address, data]) => {
        const balance = Number(
          formatUnits(
            data.assetBalance,
            getTokenData(address)?.decimals as number
          )
        );
        const price = Number(
          formatUnits($assetsPrices?.[address].tokenPrice || 0n, 18)
        );
        const balanceInUSD = balance * price;

        profileBalance += balanceInUSD;

        return {
          balance: balance.toFixed(2),
          balanceInUSD: balanceInUSD.toFixed(2),
          logo: getTokenData(address)?.logoURI,
          symbol: getTokenData(address)?.symbol,
        };
      });

    const assetsTemplates = assets.map(
      (asset) =>
        `<div style="width:70px; color:#fff; background-color:rgba(255, 255, 255, 0.02); border-radius:4px">
          <div style="display:flex; flex-direction:column; align-items:center; padding:10px;">
            <img style="width: 32px; height:32px; border-radius:100%" src=${asset.logo} alt="logo" />
            <p style="margin:0; font-size:14px; margin-top:2px;">${asset.symbol}</p>
            <div style="font-size:12px; display:flex; flex-wrap:wrap; align-items:center; justify-content:center;">
              <p style="margin:0; ">${asset.balance}</p>
              <p style="margin:0; ">($${asset.balanceInUSD})</p>
            </div>
          </div>
        </div>`
    );

    setUserBalance(Number(profileBalance.toFixed(2)));
    setUserAssets(assetsTemplates);
  }, [$assetsBalances]);

  return (
    <div className="flex flex-nowrap justify-end whitespace-nowrap">
      {chain && (
        <button
          className="bg-button sm:py-1 px-2 rounded-md mx-2 sm:mx-4 flex items-center sm:gap-1"
          id="network"
          onClick={() => open({ view: "Networks" })}
        >
          <img
            className="w-6 h-6 rounded-full sm:mx-1"
            src={chain?.logoURI}
            alt={chain?.name}
          />
          <p className="hidden sm:flex"> {chain?.name}</p>
        </button>
      )}
      <button
        className="bg-button py-1 px-2 rounded-md sm:mx-4"
        onClick={() => openProfile()}
      >
        {$account
          ? `${$account.slice(0, 6)}...${$account.slice(-4)}`
          : "Connect wallet"}
      </button>
    </div>
  );
};
export { Wallet };
