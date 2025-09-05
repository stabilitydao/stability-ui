import { memo, useState, useEffect, useMemo } from "react";

import { getAddress } from "viem";

import { HeadingText, ArrowIcon } from "@ui";

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
  const [expandedData, setExpandedData] = useState(true);

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
    <div className="w-full">
      <HeadingText
        text="Contracts"
        scale={2}
        styles="text-left mb-4 block lg:hidden"
      />
      <div
        className={cn(
          "flex items-center bg-[#151618] border border-[#23252A] text-[#97979A] text-[14px] leading-5 h-[48px] rounded-t-lg overflow-hidden cursor-pointer",
          !expandedData && "rounded-b-lg"
        )}
        onClick={() => setExpandedData((prev) => !prev)}
      >
        <div className="px-4 lg:hidden flex items-center gap-2 w-[40%] cursor-pointer">
          Name
        </div>
        <div className="px-4 lg:flex hidden items-center gap-2 w-[40%] cursor-pointer">
          Contracts{" "}
          <ArrowIcon isActive={false} rotate={expandedData ? 180 : 0} />
        </div>
        <div className="text-right w-[60%] pr-4">Address</div>
      </div>
      {expandedData &&
        contracts.map(
          ({ address, logo, type, symbol, isCopy }, index: number) => (
            <div
              key={address + index}
              className={cn(
                "flex h-[64px] items-center text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]",
                contracts.length - 1 === index && "rounded-b-lg"
              )}
            >
              <div className="px-4 w-[60%] flex items-center gap-2 whitespace-nowrap">
                <div className="flex" data-testid="contractsLogo">
                  {logo === "proportions" ? (
                    <img
                      src={`${seeds[0]}/vault/${vault.network}/${vault.address}/logo.svg`}
                      alt="logo"
                      className="w-8 h-8 shrink-0 rounded-full"
                    />
                  ) : (
                    <img
                      className={cn(
                        "w-8 h-8 shrink-0",
                        type != "Strategy" && "rounded-full"
                      )}
                      src={logo}
                      alt="logo"
                    />
                  )}
                </div>

                <span className="text-[14px] leading-5 font-semibold">
                  {symbol}
                </span>
              </div>

              <div
                className="flex items-center justify-end gap-1 text-[14px] leading-5 pr-4 w-full"
                style={{ fontFamily: "monospace" }}
              >
                <div
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => copyHandler(address)}
                >
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                  {isCopy ? (
                    <img
                      className="mx:px-1 mx:py-1 flex-shrink-0 w-[26px] h-[26px]"
                      src="/icons/checkmark.svg"
                      alt="Checkmark icon"
                    />
                  ) : (
                    <img
                      className="px-1 py-1 cursor-pointer flex-shrink-0 w-[26px] h-[26px]"
                      src="/icons/copy.png"
                      alt="Copy icon"
                    />
                  )}
                </div>

                <a
                  className="flex items-center px-1 py-1 whitespace-nowrap flex-shrink-0 w-[26px] h-[26px]"
                  href={`${explorer}${address}`}
                  target="_blank"
                >
                  <img src="/icons/link.png" alt="External link icon" />
                </a>
              </div>
            </div>
          )
        )}
    </div>
  );
});

export { Contracts };
