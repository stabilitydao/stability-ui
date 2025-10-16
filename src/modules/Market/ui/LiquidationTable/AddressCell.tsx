import { useState } from "react";

import { getShortAddress, copyAddress } from "@utils";

import type { TAddress } from "@types";

type TProps = {
  address: string;
  title?: string;
  highlighted?: boolean;
  isSticky?: boolean;
};

const AddressCell: React.FC<TProps> = ({
  address,
  title,
  highlighted = false,
  isSticky = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyAddress(address as TAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      className={`
        ${isSticky ? "sticky top-0 left-0 z-10 bg-[#101012] lg:bg-transparent border-r border-b md:border-r-0 md:border-b-0 border-[#23252A]" : ""}
        group px-2 md:px-4 w-[150px] md:w-1/5 text-start flex items-center gap-1 cursor-pointer h-[56px]
        ${highlighted ? "underline" : ""}
      `}
      style={{ fontFamily: "monospace" }}
      title={title || address}
      onClick={handleCopy}
    >
      {getShortAddress(address, 6, 4)}

      {copied ? (
        <img
          className="flex-shrink-0 w-6 h-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          src="/icons/checkmark.svg"
          alt="Checkmark icon"
        />
      ) : (
        <img
          className="flex-shrink-0 w-6 h-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          src="/icons/copy.png"
          alt="Copy icon"
        />
      )}
    </div>
  );
};

export { AddressCell };
