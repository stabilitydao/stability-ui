import { memo, useState, useEffect } from "react";

import { zeroAddress } from "viem";

import { readContract } from "@wagmi/core";

import { useStore } from "@nanostores/react";

import { AssetsProportion } from "@components";

import { decodeHex } from "@utils";

import { connected, platformZAP } from "@store";

import { wagmiConfig, ERC20DQMFABI, ERC20MetadataUpgradeableABI } from "@web3";

import type { TAddress, TVault } from "@types";

interface IProps {
  vault: TVault;
}

const ContractsInfo: React.FC<IProps> = memo(({ vault }) => {
  // const $connected = useStore(connected);
  const $platformZAP = useStore(platformZAP);

  const [underlyingToken, setUnderlyingToken] = useState({
    symbol: "",
    logo: "",
  });

  const underlyingHandler = async () => {
    const logo =
      vault.strategyInfo.shortName === "DQMF"
        ? "/protocols/DefiEdge.svg"
        : vault.strategyInfo.shortName === "IQMF" ||
          vault.strategyInfo.shortName === "IRMF"
        ? "/protocols/Ichi.png"
        : "/protocols/Gamma.png";

    let underlyingSymbol = "";

    if (vault.strategyInfo.shortName === "DQMF") {
      underlyingSymbol = await readContract(wagmiConfig, {
        address: vault.underlying,
        abi: ERC20DQMFABI,
        functionName: "symbol",
      });
      underlyingSymbol = decodeHex(underlyingSymbol);
    } else {
      underlyingSymbol = await readContract(wagmiConfig, {
        address: vault.underlying,
        abi: ERC20MetadataUpgradeableABI,
        functionName: "symbol",
      });
    }

    setUnderlyingToken({ symbol: underlyingSymbol, logo: logo });
  };

  useEffect(() => {
    if (vault.underlying != zeroAddress) {
      underlyingHandler();
    }
  }, [vault]);

  const copyAddress = async (address: TAddress) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (error) {
      console.error("Error copying address:", error);
    }
  };
  return (
    <div className="rounded-md bg-button h-full">
      <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px]">
        <h2 className="text-[24px] text-start ml-4">Contracts Info</h2>
      </div>

      <div className="flex flex-col items-start gap-5 p-4">
        <div className="flex items-center">
          {vault?.assets && (
            <AssetsProportion
              proportions={vault.assetsProportions}
              assets={vault?.assets}
              type="vault"
            />
          )}

          <span className="inline-flex text-[18px] font-bold whitespace-nowrap">
            {vault?.symbol}
          </span>
          <span className="whitespace-nowrap mx-3">
            {vault?.address.slice(0, 10)}...
          </span>
          <svg
            onClick={() => copyAddress(vault?.address)}
            className="cursor-pointer"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
              stroke="white"
            />
            <rect x="10" y="10" width="10" height="10" rx="2" stroke="white" />
          </svg>

          <a
            className="flex items-center text-[15px] py-2 px-4 whitespace-nowrap"
            href={`https://polygonscan.com/address/${vault?.address}`}
            target="_blank"
          >
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
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
              <path d="M11 13l9 -9"></path>
              <path d="M15 4h5v5"></path>
            </svg>
          </a>
        </div>
        <div className="flex items-center">
          <span
            style={{
              backgroundColor: vault.strategyInfo.bgColor,
              color: vault.strategyInfo.color,
            }}
            className="inline-flex text-[18px] font-bold whitespace-nowrap px-2 py-1 rounded-md"
          >
            {vault?.strategyInfo?.shortName}
          </span>

          <div
            style={{
              backgroundColor: vault.strategyInfo.bgColor,
              color: vault.strategyInfo.color,
            }}
            className="px-3 mx-3 rounded-[8px] flex items-center text-[16px]"
          >
            <p>{vault.strategyInfo.name}</p>
          </div>
          <span className="whitespace-nowrap mx-3">
            {vault?.strategyAddress.slice(0, 10)}...
          </span>
          <svg
            onClick={() => copyAddress(vault?.strategyAddress)}
            className="cursor-pointer"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
              stroke="white"
            />
            <rect x="10" y="10" width="10" height="10" rx="2" stroke="white" />
          </svg>

          <a
            className="flex items-center text-[15px] py-2 px-4 whitespace-nowrap"
            href={`https://polygonscan.com/address/${vault?.strategyAddress}`}
            target="_blank"
          >
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
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
              <path d="M11 13l9 -9"></path>
              <path d="M15 4h5v5"></path>
            </svg>
          </a>
        </div>
        {!!underlyingToken?.symbol && (
          <div className="flex items-center">
            <img
              className="max-w-10"
              src={underlyingToken.logo}
              alt={underlyingToken.symbol}
            />

            <div className="px-3 mx-3 rounded-[8px] flex items-center text-[16px]">
              <p>{underlyingToken.symbol}</p>
            </div>
            <span className="whitespace-nowrap mx-3">
              {vault?.underlying.slice(0, 10)}...
            </span>
            <svg
              onClick={() => copyAddress(vault?.underlying)}
              className="cursor-pointer"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
                stroke="white"
              />
              <rect
                x="10"
                y="10"
                width="10"
                height="10"
                rx="2"
                stroke="white"
              />
            </svg>

            <a
              className="flex items-center text-[15px] py-2 px-4 whitespace-nowrap"
              href={`https://polygonscan.com/address/${vault?.underlying}`}
              target="_blank"
            >
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
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                <path d="M11 13l9 -9"></path>
                <path d="M15 4h5v5"></path>
              </svg>
            </a>
          </div>
        )}

        <div className="flex items-center">
          <img
            className="max-w-10"
            src={vault.strategyInfo.protocols[1].logoSrc}
            alt={vault.strategyInfo.protocols[1].name}
          />

          <div className="px-3 mx-3 rounded-[8px] flex items-center text-[16px]">
            <p>{vault.strategyInfo.protocols[1].name}</p>
          </div>
          <span className="whitespace-nowrap mx-3">
            {vault?.underlying.slice(0, 10)}...
          </span>
          <svg
            onClick={() => copyAddress(vault?.underlying)}
            className="cursor-pointer"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
              stroke="white"
            />
            <rect x="10" y="10" width="10" height="10" rx="2" stroke="white" />
          </svg>

          <a
            className="flex items-center text-[15px] py-2 px-4 whitespace-nowrap"
            href={`https://polygonscan.com/address/${vault?.underlying}`}
            target="_blank"
          >
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
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
              <path d="M11 13l9 -9"></path>
              <path d="M15 4h5v5"></path>
            </svg>
          </a>
        </div>
        {vault?.assets.map((asset) => (
          <div key={asset?.address} className="flex items-center">
            <img
              className="max-w-10 rounded-full"
              src={asset?.logo}
              alt={asset?.symbol}
            />

            <div className="px-3 mx-3 rounded-[8px] flex items-center text-[16px]">
              <p>{asset.symbol}</p>
            </div>
            <span className="whitespace-nowrap mx-3">
              {asset?.address.slice(0, 10)}...
            </span>
            <svg
              onClick={() => copyAddress(asset?.address)}
              className="cursor-pointer"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
                stroke="white"
              />
              <rect
                x="10"
                y="10"
                width="10"
                height="10"
                rx="2"
                stroke="white"
              />
            </svg>

            <a
              className="flex items-center text-[15px] py-2 px-4 whitespace-nowrap"
              href={`https://polygonscan.com/address/${asset?.address}`}
              target="_blank"
            >
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
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                <path d="M11 13l9 -9"></path>
                <path d="M15 4h5v5"></path>
              </svg>
            </a>
          </div>
        ))}
        <div className="flex items-center">
          <img className="max-w-10" src="/logo.svg" alt="logo" />

          <div className="px-3 mx-3 rounded-[8px] flex items-center text-[16px]">
            <p>ZAP</p>
          </div>
          <span className="whitespace-nowrap mx-3">
            {$platformZAP.slice(0, 10)}...
          </span>
          <svg
            onClick={() => copyAddress($platformZAP as TAddress)}
            className="cursor-pointer"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
              stroke="white"
            />
            <rect x="10" y="10" width="10" height="10" rx="2" stroke="white" />
          </svg>

          <a
            className="flex items-center text-[15px] py-2 px-4 whitespace-nowrap"
            href={`https://polygonscan.com/address/${$platformZAP}`}
            target="_blank"
          >
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
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
              <path d="M11 13l9 -9"></path>
              <path d="M15 4h5v5"></path>
            </svg>
          </a>
        </div>

        {/* <div>
          <p className="uppercase text-[13px] leading-3 text-[#8D8E96]">
            GAS RESERVE
          </p>
          <p className="text-[16px] mt-1"> {vault?.gasReserve} MATIC</p>
        </div> */}
      </div>
    </div>
  );
});

export { ContractsInfo };
