import { useWeb3Modal } from "@web3modal/wagmi/react";

import { cn } from "@utils";

import { DisplayTypes } from "@types";

interface IProps {
  isUserVaults?: boolean;
  display?: DisplayTypes;
  text?: string;
  description?: string;
  isSticky?: boolean;
}

const EmptyTable: React.FC<IProps> = ({
  isUserVaults = false,
  display = DisplayTypes.Rows,
  text = "No results found",
  description = "Try clearing your filters or changing your search term",
  isSticky = false,
}) => {
  const { open } = useWeb3Modal();

  return (
    <div
      className={cn(
        "bg-[#101012] border-x border-t border-[#23252A]",
        display === "grid" && "rounded-lg border-b"
      )}
    >
      <div
        className={cn(
          "h-[280px] flex items-center justify-center",
          isSticky &&
            "sticky top-0 left-1/2 -translate-x-1/2 max-w-[250px] md:max-w-full md:relative"
        )}
      >
        {isUserVaults ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <img src="/icons/wallet-key.svg" alt="Wallet" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[16px] leading-6 font-semibold text-center">
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
                {text}
              </span>
              <span className="text-[14px] leading-5 font-medium text-[#97979A] text-center">
                {description}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { EmptyTable };
