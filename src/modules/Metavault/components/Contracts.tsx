import { memo, useState, useEffect } from "react";

import { getAddress } from "viem";

import { HeadingText, ArrowIcon } from "@ui";

import { cn } from "@utils";

import type { TAddress, TMetaVault, TContractInfo } from "@types";

interface IProps {
  metaVault: TMetaVault;
}

const Contracts: React.FC<IProps> = memo(({ metaVault }) => {
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
    if (metaVault?.address) {
      const unwrapData =
        metaVault.symbol === "metaUSDC"
          ? {
              address: "0xeeeeeee6d95e55a468d32feb5d6648754d10a967",
              symbol: "wmetaUSDC",
            }
          : metaVault.symbol === "metascUSD"
            ? {
                address: "0xcccccccca9fc69a2b32408730011edb3205a93a1",
                symbol: "wmetascUSD",
              }
            : metaVault.symbol === "metaUSD"
              ? {
                  address: "0xaaaaaaaac311d0572bffb4772fe985a750e88805",
                  symbol: "wmetaUSD",
                }
              : metaVault.symbol === "metawS"
                ? {
                    address: "0xffffffff2fcbefae12f1372c56edc769bd411685",
                    symbol: "wmetawS",
                  }
                : metaVault.symbol === "metaS"
                  ? {
                      address: "0xbbbbbbbbbd0ae69510ce374a86749f8276647b19",
                      symbol: "wmetaS",
                    }
                  : {};

      const contractsInfo = [
        {
          logo: `/features/${metaVault.symbol}.png`,
          symbol: metaVault?.symbol,
          address: metaVault?.address,
          isCopy: false,
        },
        {
          logo: `/features/${unwrapData.symbol}.png`,
          symbol: unwrapData.symbol,
          address: unwrapData.address,
          isCopy: false,
        },
      ];
      setContracts(contractsInfo);
    }
  }, [metaVault]);

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-center bg-[#151618] border border-[#23252A] text-[#97979A] text-[14px] leading-5 h-[48px] rounded-t-lg overflow-hidden cursor-pointer",
          !expandedData && "rounded-b-lg"
        )}
        onClick={() => setExpandedData((prev) => !prev)}
      >
        <div className="px-4 flex items-center gap-2 w-[40%] cursor-pointer">
          Contracts{" "}
          <ArrowIcon isActive={false} rotate={expandedData ? 180 : 0} />
        </div>
        <div className="text-right w-[60%] pr-4">Address</div>
      </div>
      {expandedData &&
        contracts.map(({ address, logo, symbol, isCopy }, index: number) => (
          <div
            key={address + index}
            className={cn(
              "flex h-[64px] items-center text-[16px] border-b border-x border-[#23252A] font-semibold bg-[#101012]",
              contracts.length - 1 === index && "rounded-b-lg"
            )}
          >
            <div className="px-4 w-[40%] flex items-center gap-2">
              <img
                className="w-8 h-8 rounded-full"
                src={logo}
                alt="logo"
                title={symbol}
              />

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
                href={`https://sonicscan.org/address/${address}`}
                target="_blank"
              >
                <img src="/icons/link.png" alt="External link icon" />
              </a>
            </div>
          </div>
        ))}
    </div>
  );
});

export { Contracts };
