import { memo, useState, useEffect } from "react";

import { zeroAddress } from "viem";

import { readContract } from "@wagmi/core";

import { useStore } from "@nanostores/react";

import { AssetsProportion } from "@components";

import { decodeHex } from "@utils";

import { platformZAP } from "@store";

import { wagmiConfig, ERC20DQMFABI, ERC20MetadataUpgradeableABI } from "@web3";

import type { TAddress, TVault } from "@types";

interface IProps {
  vault: TVault;
}

const Contracts: React.FC<IProps> = memo(({ vault }) => {
  //const $platformZAP = useStore(platformZAP);

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

  // const copyHandler = (index: number) => {};

  const copyAddress = async (address: TAddress) => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (error) {
      console.error("Error copying address:", error);
    }
  };

  useEffect(() => {
    if (vault.underlying != zeroAddress) {
      underlyingHandler();
    }
  }, [vault]);

  //   <svg
  //   width="24"
  //   height="24"
  //   viewBox="0 0 24 24"
  //   fill="none"
  //   xmlns="http://www.w3.org/2000/svg"
  // >
  //   <path
  //     d="M5 14L8.23309 16.4248C8.66178 16.7463 9.26772 16.6728 9.60705 16.2581L18 6"
  //     stroke="white"
  //     strokeWidth="2"
  //     strokeLinecap="round"
  //   />
  // </svg>
  return (
    <div className="rounded-md bg-button h-full">
      <div className="bg-[#1c1c23] rounded-t-md flex justify-between items-center h-[60px]">
        <h2 className="text-[24px] text-start ml-4">Contracts</h2>
      </div>

      <table className="w-full mx-auto lg:max-w-[500px] text-[16px]">
        <tbody>
          <tr className="border-b border-[#4f5158] h-[60px]">
            <td>
              <div className="ml-3">
                <AssetsProportion
                  proportions={vault.assetsProportions}
                  assets={vault?.assets}
                  type="vault"
                />
              </div>
            </td>
            <td>
              <div className="flex flex-col items-start">
                <span>{vault?.symbol}</span>
                <span>Vault</span>
              </div>
            </td>
            <td className="flex items-center justify-end gap-5 h-[60px]">
              <span className="whitespace-nowrap font-mono">
                {vault?.address.slice(0, 6)}...{vault?.address.slice(-4)}
              </span>
              <div className="flex items-center">
                <div
                  onClick={() => copyAddress(vault?.address)}
                  className="cursor-pointer px-1 py-1"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <rect
                      x="10"
                      y="10"
                      width="10"
                      height="10"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <a
                  className="flex items-center px-1 py-1 whitespace-nowrap"
                  href={`https://polygonscan.com/address/${vault?.address}`}
                  target="_blank"
                >
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
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                    <path d="M11 13l9 -9"></path>
                    <path d="M15 4h5v5"></path>
                  </svg>
                </a>
              </div>
            </td>
          </tr>
          <tr className="border-b border-[#4f5158] h-[60px]">
            <td>
              <img className="w-8 h-8 ml-3" src="/logo.svg" alt="logo" />
            </td>
            <td>
              <div className="flex flex-col items-start">
                <span
                  style={{
                    color: vault.strategyInfo.color,
                  }}
                  className="inline-flex text-[18px] font-bold whitespace-nowrap rounded-md"
                >
                  {vault?.strategyInfo?.shortName}
                </span>
                <span>Strategy</span>
              </div>
            </td>
            <td className="flex items-center justify-end gap-5 h-[60px]">
              <span className="font-mono whitespace-nowrap">
                {vault?.strategyAddress.slice(0, 6)}...
                {vault?.strategyAddress.slice(-4)}
              </span>
              <div className="flex items-center">
                <div
                  onClick={() => copyAddress(vault?.strategyAddress)}
                  className="cursor-pointer px-1 py-1"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <rect
                      x="10"
                      y="10"
                      width="10"
                      height="10"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <a
                  className="flex items-center px-1 py-1 whitespace-nowrap"
                  href={`https://polygonscan.com/address/${vault?.strategyAddress}`}
                  target="_blank"
                >
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
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                    <path d="M11 13l9 -9"></path>
                    <path d="M15 4h5v5"></path>
                  </svg>
                </a>
              </div>
            </td>
          </tr>
          {!!underlyingToken?.symbol && (
            <tr className="border-b border-[#4f5158]">
              <td>
                <img
                  className="ml-3 w-8 h-8 rounded-full"
                  src={underlyingToken.logo}
                  alt={underlyingToken.symbol}
                />
              </td>
              <td>
                <div className="flex flex-col items-start">
                  <span>{underlyingToken.symbol}</span>
                  <span>ALM</span>
                </div>
              </td>
              <td className="flex items-center justify-end gap-5 h-[60px]">
                <span className="font-mono whitespace-nowrap">
                  {vault?.underlying.slice(0, 6)}...
                  {vault?.underlying.slice(-4)}
                </span>
                <div className="flex items-center">
                  <div
                    onClick={() => copyAddress(vault?.underlying)}
                    className="cursor-pointer px-1 py-1"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <rect
                        x="10"
                        y="10"
                        width="10"
                        height="10"
                        rx="2"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <a
                    className="flex items-center px-1 py-1 whitespace-nowrap"
                    href={`https://polygonscan.com/address/${vault?.underlying}`}
                    target="_blank"
                  >
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
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                      <path d="M11 13l9 -9"></path>
                      <path d="M15 4h5v5"></path>
                    </svg>
                  </a>
                </div>
              </td>
            </tr>
          )}
          {vault?.strategyPool && (
            <tr className="border-b border-[#4f5158]">
              <td>
                <img
                  className="ml-3 w-8 h-8"
                  src={vault.strategyInfo.protocols[1].logoSrc}
                  alt={vault.strategyInfo.protocols[1].name}
                />
              </td>
              <td>
                <div className="flex flex-col items-start">
                  <p>
                    {vault?.assets[0]?.symbol}
                    {vault?.assets.length > 1 && (
                      <span>-{vault.assets[1].symbol}</span>
                    )}
                  </p>
                  <span>Pool</span>
                </div>
              </td>

              <td className="flex items-center justify-end gap-5 h-[60px]">
                <span className="font-mono whitespace-nowrap">
                  {vault?.strategyPool.slice(0, 6)}...
                  {vault?.strategyPool.slice(-4)}
                </span>
                <div className="flex items-center">
                  <div
                    onClick={() => copyAddress(vault?.strategyPool)}
                    className="cursor-pointer px-1 py-1"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <rect
                        x="10"
                        y="10"
                        width="10"
                        height="10"
                        rx="2"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <a
                    className="flex items-center px-1 py-1 whitespace-nowrap"
                    href={`https://polygonscan.com/address/${vault?.strategyPool}`}
                    target="_blank"
                  >
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
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                      <path d="M11 13l9 -9"></path>
                      <path d="M15 4h5v5"></path>
                    </svg>
                  </a>
                </div>
              </td>
            </tr>
          )}
          {vault?.assets.map((asset) => (
            <tr key={asset?.address} className="border-b border-[#4f5158]">
              <td>
                <img
                  className="ml-3 w-8 h-8 rounded-full"
                  src={asset?.logo}
                  alt={asset?.symbol}
                />
              </td>

              <td>
                <div className="flex flex-col items-start">
                  <span>{asset.symbol}</span>
                  <span>Asset</span>
                </div>
              </td>
              <td className="flex items-center justify-end gap-5 h-[60px]">
                <span className="font-mono whitespace-nowrap">
                  {asset?.address.slice(0, 6)}...{asset?.address.slice(-4)}
                </span>
                <div className="flex items-center">
                  <div
                    onClick={() => copyAddress(asset?.address)}
                    className="cursor-pointer px-1 py-1"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <rect
                        x="10"
                        y="10"
                        width="10"
                        height="10"
                        rx="2"
                        stroke="white"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <a
                    className="flex items-center px-1 py-1 whitespace-nowrap"
                    href={`https://polygonscan.com/address/${asset?.address}`}
                    target="_blank"
                  >
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
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                      <path d="M11 13l9 -9"></path>
                      <path d="M15 4h5v5"></path>
                    </svg>
                  </a>
                </div>
              </td>
            </tr>
          ))}
          {/* <tr>
            <td>
              <img className="ml-3 w-8 h-8" src="/logo.svg" alt="logo" />
            </td>
            <td>ZAP</td>
            <td className="flex items-center justify-end gap-5 h-[60px]">
              <span className="font-mono whitespace-nowrap">
                {$platformZAP.slice(0, 6)}...{$platformZAP.slice(-4)}
              </span>
              <div className="flex items-center">
                <div
                  onClick={() => copyAddress($platformZAP as TAddress)}
                  className="cursor-pointer px-1 py-1"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <rect
                      x="10"
                      y="10"
                      width="10"
                      height="10"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <a
                  className="flex items-center px-1 py-1 whitespace-nowrap"
                  href={`https://polygonscan.com/address/${$platformZAP}`}
                  target="_blank"
                >
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
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
                    <path d="M11 13l9 -9"></path>
                    <path d="M15 4h5v5"></path>
                  </svg>
                </a>
              </div>
            </td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
});

export { Contracts };
