import { useState, useEffect, memo } from "react";

import { usePublicClient } from "wagmi";

import { AssetsProportion } from "@components";
import { CHAINS } from "@constants";

import type { TVault } from "@types";

interface IProps {
  vault: TVault;
}

const VaultBar: React.FC<IProps> = memo(({ vault }) => {
  const _publicClient = usePublicClient();

  const [currentChain, setCurrentChain] = useState<any>();

  useEffect(() => {
    if (_publicClient) {
      setCurrentChain(
        CHAINS.find((item) => item.name === _publicClient.chain.name)
      );
    }
  }, [_publicClient]);
  return (
    <div className="flex justify-between items-center p-0">
      <div className="flex flex-col w-full">
        <div className="flex flex-col items-start gap-4 w-full lg:justify-between flex-wrap">
          <div className="flex items-start">
            
            <span className="inline-flex text-[32px] font-medium whitespace-nowrap">
              {vault.symbol}
            </span>
          </div>

          <div className="flex items-center">

          {vault?.assets && (
              <AssetsProportion
                proportions={vault.assetsProportions}
                assets={vault?.assets}
                type="vault"
              />
            )}

          <img
            className="w-7 h-7 rounded-full mr-3 hidden lg:flex"
            src={currentChain?.logoURI}
            alt={currentChain?.name}
            title={currentChain?.name}
          />

          <div className="flex items-center">
            <span className="text-[18px] lg:text-[20px]">{vault.name}</span>
          </div>
          
        </div>
        </div>
          
      </div>
    </div>
  );
});

export { VaultBar };
