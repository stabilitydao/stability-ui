import { useState, useEffect, memo } from "react";

import { usePublicClient } from "wagmi";

import { AssetsProportion, VaultState } from "@components";
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
    <div className="flex justify-between items-center p-4 bg-button rounded-md">
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-4 w-full lg:justify-between flex-wrap">
          <div className="flex items-center">
            <VaultState status={vault?.status} />
            {vault?.assets && (
              <AssetsProportion
                proportions={vault.assetsProportions}
                assets={vault?.assets}
                type="vault"
              />
            )}

            <span className="inline-flex text-[18px] font-bold whitespace-nowrap">
              {vault.symbol}
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-[18px] lg:text-[20px]">{vault.name}</span>
          </div>
          <img
            className="w-8 h-8 rounded-full mx-1 hidden lg:flex"
            src={currentChain?.logoURI}
            alt={currentChain?.name}
            title={currentChain?.name}
          />
        </div>
      </div>
    </div>
  );
});

export { VaultBar };