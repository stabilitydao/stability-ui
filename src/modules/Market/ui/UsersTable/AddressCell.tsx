import { useState } from "react";

import { useStore } from "@nanostores/react";

import { getShortAddress, copyAddress } from "@utils";

import { account } from "@store";

import type { TAddress } from "@types";

type TProps = {
  address: TAddress;
};

const AddressCell: React.FC<TProps> = ({ address }) => {
  const $account = useStore(account);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyAddress(address as TAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      className={`group px-2 md:px-4 w-1/4 text-start flex items-center gap-1 cursor-pointer ${$account?.toLowerCase() === address ? "underline" : ""}`}
      style={{ fontFamily: "monospace" }}
      title={address}
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
