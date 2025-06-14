import { useWeb3Modal } from "@web3modal/wagmi/react";

import { cn } from "@utils";

import { DisplayTypes } from "@types";

interface IProps {
  isUserVaults: boolean;
  display: DisplayTypes;
}

const EmptyTable: React.FC<IProps> = ({ isUserVaults, display }) => {
  const { open } = useWeb3Modal();

  return (
    <div
      className={cn(
        "h-[280px] flex items-center justify-center bg-[#101012] border-x border-t border-[#23252A]",
        display === "grid" && "rounded-lg border-b"
      )}
    >
      {isUserVaults ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/icons/wallet-key.svg" alt="Wallet" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[16px] leading-6 font-semibold">
              You haven't connected your wallet
            </span>
            <span className="text-[14px] leading-5 font-medium text-[#97979A]">
              Connect to view your vaults
            </span>
          </div>
          <button
            className="text-[14px] leading-5 font-semibold px-4 py-2 rounded-[10px] border border-[#9180F4] bg-[linear-gradient(340deg,_#5B63D3_17.51%,_#9180F4_100%)]"
            onClick={() => open()}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <img src="/icons/file-search.svg" alt="Not found" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[16px] leading-6 font-semibold">
              No results found
            </span>
            <span className="text-[14px] leading-5 font-medium text-[#97979A]">
              Try clearing your filters or changing your search term
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export { EmptyTable };
