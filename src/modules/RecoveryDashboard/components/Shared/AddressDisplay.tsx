import { useState } from "react";
import { CheckmarkIcon, CopyIcon, ExternalLinkIcon } from "../../ui/icons";

interface Props {
  address: string;
  id: number;
  showExternalLink?: boolean;
}

export function AddressDisplay({
  address,
  id,
  showExternalLink = true,
}: Props) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleExternalLink = () => {
    window.open(`https://etherscan.io/address/${address}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[#EAECEF] font-mono text-sm">
        {truncateAddress(address)}
      </span>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center cursor-pointer h-6 w-6 p-0"
      >
        {copiedId === id ? <CheckmarkIcon /> : <CopyIcon />}
      </button>
      {showExternalLink && (
        <button
          onClick={handleExternalLink}
          className="flex items-center justify-center cursor-pointer h-6 w-6 p-0 text-[#EAECEF]"
          title="View on explorer"
        >
          <ExternalLinkIcon />
        </button>
      )}
    </div>
  );
}
