import { memo, useMemo, useState, useEffect } from "react";

import { getAddress } from "viem";

import { HeadingText } from "@ui";

import { DEXes, CHAINS } from "@constants";

import type { TAddress, TVault, TContractInfo } from "@types";

interface IProps {
  vault: TVault;
  network: string;
}

const Contracts: React.FC<IProps> = memo(({ vault, network }) => {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout>>();

  const [contracts, setContracts] = useState<TContractInfo[]>([]);

  const copyHandler = async (address: TAddress) => {
    try {
      await navigator.clipboard.writeText(getAddress(address));
    } catch (error) {
      console.error("Error copying address:", error);
    }

    const contractsInfo = contracts.map((contract) => ({
      ...contract,
      isCopy: contract?.address === address,
    }));

    setContracts(contractsInfo);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      const updatedContractsInfo = contracts.map((contract) => ({
        ...contract,
        isCopy: false,
      }));
      setContracts(updatedContractsInfo);
    }, 3000);

    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    if (vault?.address) {
      const contractsInfo = [
        {
          logo: "proportions",
          symbol: vault?.symbol,
          type: "Vault",
          address: vault?.address,
          isCopy: false,
        },
        {
          logo: "/logo.svg",
          symbol: vault?.strategyInfo?.shortId,
          type: "Strategy",
          address: vault?.strategyAddress,
          isCopy: false,
        },
      ];

      if (vault.underlying.symbol) {
        contractsInfo.push({
          logo: vault.underlying.logo,
          symbol: vault.underlying.symbol,
          type: isALM ? "ALM" : "Underlying",
          address: vault?.underlying.address,
          isCopy: false,
        });
      }
      if (vault?.pool?.address) {
        const poolSymbol =
          vault?.assets.length > 1
            ? `${vault?.assets[0]?.symbol}-${vault.assets[1].symbol}`
            : vault?.assets[0]?.symbol;

        const dexPool = DEXes.find((dex) =>
          vault.strategyInfo.protocols.some(
            (protocol) => protocol.name === dex.name
          )
        );

        contractsInfo.push({
          logo: dexPool?.img as string,
          symbol: poolSymbol,
          type: "Pool",
          address: vault?.pool?.address,
          isCopy: false,
        });
      }
      if (vault?.assets) {
        vault.assets.map((asset) => {
          contractsInfo.push({
            logo: asset?.logo,
            symbol: asset.symbol,
            type: "Asset",
            address: asset.address,
            isCopy: false,
          });
        });
      }
      setContracts(contractsInfo);
    }
  }, [vault]);

  const isALM = useMemo(
    () =>
      vault?.alm && ["Ichi", "DefiEdge", "Gamma"].includes(vault.alm.protocol),
    [vault?.alm]
  );

  const explorer = useMemo(
    () => CHAINS.find((chain) => chain.id === network)?.explorer,
    [network]
  );

  return (
    <div className="rounded-md h-full">
      <HeadingText text="Contracts" scale={2} styles="text-left md:mb-0 mb-2" />

      <table className="w-full lg:max-w-[500px] text-[16px]">
        <tbody>
          {contracts.map(
            ({ address, logo, symbol, type, isCopy }, index: number) => (
              <tr
                key={address + index}
                className="border-b border-[#4f5158] h-[60px]"
              >
                <td>
                  <div
                    data-testid="contractsLogo"
                    className="ml-3 hidden sm:block"
                  >
                    {logo === "proportions" ? (
                      <img
                        src={`https://api.stabilitydao.org/vault/${vault.network}/${vault.address}/logo.svg`}
                        alt="logo"
                        className="w-[26px] h-[26px] rounded-full"
                      />
                    ) : (
                      <img
                        className={`w-[26px] h-[26px] ${
                          type != "Strategy" && "rounded-full"
                        }`}
                        src={logo}
                        alt="logo"
                      />
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex flex-col items-start">
                    <span
                      data-testid="contractsSymbol"
                      className="text-[14px] sm:text-[18px]"
                    >
                      {symbol}
                    </span>
                    <span
                      data-testid="contractsType"
                      className="text-[#8D8E96] text-[14px] mt-[-6px]"
                    >
                      {type}
                    </span>
                  </div>
                </td>
                <td className="flex items-center justify-end gap-3 sm:gap-5 h-[60px]">
                  <span
                    data-testid="contractsAddress"
                    className="whitespace-nowrap font-mono text-[14px] sm:text-[16px]"
                  >
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <div className="flex items-center">
                    {isCopy ? (
                      <div className="px-1 py-1">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 14L8.23309 16.4248C8.66178 16.7463 9.26772 16.6728 9.60705 16.2581L18 6"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div
                        data-testid="contractCopyBtn"
                        onClick={() => copyHandler(address)}
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
                    )}

                    <a
                      data-testid="contractLinkBtn"
                      className="flex items-center px-1 py-1 whitespace-nowrap"
                      href={`${explorer}${address}`}
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
                </td>
              </tr>
            )
          )}

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
