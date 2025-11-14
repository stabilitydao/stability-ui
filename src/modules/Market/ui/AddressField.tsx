import { useState } from "react";

import { getShortAddress, copyAddress, cn } from "@utils";

import type { TAddress } from "@types";

type TProps = {
  symbol?: string;
  address: TAddress;
  explorer: string;
};

const AddressField: React.FC<TProps> = ({ symbol, address, explorer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyAddress(address as TAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className={cn(!!symbol && "flex items-center justify-between w-full")}>
      {!!symbol && <span className="text-[#7C7E81]">{symbol}</span>}
      <div className={cn("flex items-center gap-3", !symbol && "justify-end")}>
        <span
          className="text-[#9180F4] cursor-pointer font-mono"
          onClick={handleCopy}
        >
          {getShortAddress(address ?? "", 6, 4)}
        </span>
        <div className="flex items-center gap-2">
          <a href={`${explorer}/address/${address}`} target="_blank">
            <img
              src="/icons/purple_link.png"
              alt="external link"
              className="w-3 h-3 cursor-pointer"
            />
          </a>

          {copied ? (
            <img
              className="flex-shrink-0 w-3 h-3"
              src="/icons/checkmark.svg"
              alt="Checkmark icon"
            />
          ) : (
            <img
              src="/icons/copy.png"
              alt="Copy icon"
              className="flex-shrink-0 w-3 h-3 cursor-pointer"
              onClick={handleCopy}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export { AddressField };
