import { getShortAddress, copyAddress } from "@utils";

import type { TAddress } from "@types";

type TProps = {
  symbol: string;
  address: TAddress;
  explorer: string;
};

const AddressField: React.FC<TProps> = ({ symbol, address, explorer }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-[#7C7E81]">{symbol} address</span>
      <div className="flex items-center gap-3">
        <span className="text-[#9180F4]">
          {getShortAddress(address ?? "", 6, 4)}
        </span>
        <div className="flex items-center gap-2">
          <a href={`${explorer}${address}`} target="_blank">
            <img
              src="/icons/purple_link.png"
              alt="external link"
              className="w-3 h-3 cursor-pointer"
            />
          </a>
          <img
            src="/icons/copy.png"
            alt="copy link"
            className="w-3 h-3 cursor-pointer"
            onClick={() => copyAddress(address)}
          />
        </div>
      </div>
    </div>
  );
};

export { AddressField };
