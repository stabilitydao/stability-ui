import { memo } from "react";

import type { TChain } from "@types";

interface IProps {
  activeNetworks: TChain[];
  activeNetworksHandler: (chain: string) => void;
}

const NetworkFilters: React.FC<IProps> = memo(
  ({ activeNetworks, activeNetworksHandler }) => {
    return (
      <div className="flex items-center gap-2 mb-4 min-[1020px]:mb-0">
        {activeNetworks.map((chain) => (
          <div
            className={`h-[48px] w-[44px] flex items-center justify-center  cursor-pointer rounded-2xl ${
              chain.active ? "bg-[#612FFB]" : "bg-[#2B1570]"
            }`}
            key={chain.name + chain.id}
            title={chain.name}
            onClick={() => activeNetworksHandler(chain.id)}
            data-testid="network"
          >
            <img
              className="h-6 w-6 rounded-full"
              src={chain.logoURI}
              alt={chain.name}
            />
          </div>
        ))}
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps?.activeNetworks.length !== nextProps.activeNetworks.length) {
      return false;
    }

    for (let i = 0; i < prevProps.activeNetworks.length; i++) {
      if (
        prevProps.activeNetworks[i].active !==
        nextProps.activeNetworks[i].active
      ) {
        return false;
      }
    }

    return true;
  }
);

export { NetworkFilters };
