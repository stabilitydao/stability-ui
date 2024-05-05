import { useState } from "react";

import type { TAddress } from "@types";

interface IProps {
  address: TAddress;
}

const ShortAddress: React.FC<IProps> = ({ address }) => {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 500);
    } catch (error) {
      console.error("Error copying address:", error);
    }
  };

  return (
    <div className="inline-flex">
      <p>{shortAddress}</p>
      <button className="mx-3" onClick={copyAddress} title="Copy address">
        {copied ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-[18px] icon icon-tabler icon-tabler-check my-auto text-green-500"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 12l5 5l10 -10" />
            </svg>
          </>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-[18px] icon icon-tabler icon-tabler-copy my-auto"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
            <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
          </svg>
        )}
      </button>
      <a
        target="_blank"
        href={`https://polygonscan.com/address/${address}`}
        title="Go to polygonscan"
        className="my-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-[18px] icon icon-tabler icon-tabler-external-link my-auto"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6" />
          <path d="M11 13l9 -9" />
          <path d="M15 4h5v5" />
        </svg>
      </a>
    </div>
  );
};

export { ShortAddress };
