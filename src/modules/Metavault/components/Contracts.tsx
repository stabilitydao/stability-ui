import { memo, useState, useEffect } from "react";

import { getAddress } from "viem";

import { ArrowIcon } from "@ui";

import { cn, getTokenData } from "@utils";

import { deployments } from "@stabilitydao/stability";

import type { TAddress, TContractInfo } from "@types";

interface IProps {
  network: string;
  metavault: TAddress;
}

const Contracts: React.FC<IProps> = memo(({ network, metavault }) => {
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
    if (!metavault) return;

    try {
      const metaVault = deployments?.[network]?.metaVaults?.find(
        (mv) => mv?.address?.toLowerCase() === metavault?.toLowerCase()
      );

      if (!metaVault?.wrapper || !metaVault?.symbol || !metaVault?.address)
        return;

      const wrappedMetaVault = getTokenData(metaVault.wrapper);

      if (!wrappedMetaVault?.symbol || !wrappedMetaVault?.address) return;

      const contractsInfo = [
        {
          logo: `/features/${metaVault.symbol}.png`,
          symbol: metaVault.symbol,
          address: metaVault.address,
          isCopy: false,
        },
        {
          logo: `/features/${wrappedMetaVault.symbol}.png`,
          symbol: wrappedMetaVault.symbol,
          address: wrappedMetaVault.address,
          isCopy: false,
        },
      ];

      setContracts(contractsInfo);
    } catch (error) {
      console.error("Failed to set metavault contracts:", error);
    }
  }, [metavault]);

  if (!contracts.length) return null;

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
