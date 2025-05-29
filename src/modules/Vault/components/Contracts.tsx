import { memo, useMemo, useState, useEffect } from "react";

import { getAddress } from "viem";

import { HeadingText } from "@ui";

import { cn } from "@utils";

import { DEXes, CHAINS } from "@constants";

import { seeds } from "@stabilitydao/stability";

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

      if (!["BSF", "BWF", "EF"].includes(vault.strategyInfo.shortId)) {
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
              ? `${vault?.assets[0]?.symbol}-${vault.assets[1]?.symbol}`
              : vault?.assets[0]?.symbol;

          const dexPool = Object.values(DEXes).find((dex) =>
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
      } else {
        if (vault?.pool?.address) {
          const poolSymbol =
            vault?.assets.length > 1
              ? `${vault?.assets[0]?.symbol}-${vault.assets[1]?.symbol}`
              : vault?.assets[0]?.symbol;

          contractsInfo.push({
            logo: vault.underlying.logo,
            symbol: poolSymbol,
            type: "Pool",
            address: vault?.pool?.address,
            isCopy: false,
          });
        }
      }

      if (vault?.assets) {
        vault.assets.map((asset) => {
          contractsInfo.push({
            logo: asset?.logo,
            symbol: asset?.symbol,
            type: "Asset",
            address: asset?.address,
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
    <div>
      <HeadingText text="Contracts" scale={2} styles="text-left mb-4" />
      <div className="w-full">
        <div className="flex items-center bg-[#151618] border border-[#23252A] text-[#97979A] text-[14px] leading-5 h-[48px] rounded-t-lg overflow-hidden">
          <div className="px-4 w-[50%]"></div>
          <div className="text-right w-[30%]">Address</div>
          <div className="text-right w-[20%] pr-4">Actions</div>
        </div>
        {contracts.map(
          ({ address, logo, symbol, type, isCopy }, index: number) => (
            <div
              key={address + index}
              className={cn(
                "flex h-[64px] items-center text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]",
                contracts.length - 1 === index && "rounded-b-lg"
              )}
            >
              <div className="px-4 w-[50%] flex items-center gap-3">
                <div data-testid="contractsLogo">
                  {logo === "proportions" ? (
                    <img
                      src={`${seeds[0]}/vault/${vault.network}/${vault.address}/logo.svg`}
                      alt="logo"
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <img
                      className={cn(
                        "w-10 h-10",
                        type != "Strategy" && "rounded-full"
                      )}
                      src={logo}
                      alt="logo"
                    />
                  )}
                </div>

                <div className="flex flex-col items-start">
                  <span
                    data-testid="contractsSymbol"
                    className="text-[16px] leading-5 font-semibold"
                  >
                    {symbol}
                  </span>
                  <span
                    data-testid="contractsType"
                    className="text-[#97979A] text-[14px] leading-[16px] font-medium"
                  >
                    {type}
                  </span>
                </div>
              </div>

              <div className="w-[30%] text-end">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>

              <div className="w-[20%] pr-4">
                <div className="flex items-center justify-end gap-1">
                  {isCopy ? (
                    <img
                      className="px-1 py-1"
                      src="/icons/checkmark.svg"
                      alt="Checkmark icon"
                    />
                  ) : (
                    <img
                      data-testid="contractCopyBtn"
                      onClick={() => copyHandler(address)}
                      className="px-1 py-1 cursor-pointer"
                      src="/icons/copy.png"
                      alt="Copy icon"
                    />
                  )}

                  <a
                    data-testid="contractLinkBtn"
                    className="flex items-center px-1 py-1 whitespace-nowrap"
                    href={`${explorer}${address}`}
                    target="_blank"
                  >
                    <img src="/icons/link.png" alt="External link icon" />
                  </a>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
});

export { Contracts };
