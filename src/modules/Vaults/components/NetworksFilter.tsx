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
            className={`h-[40px] w-[40px]  flex items-center justify-center cursor-pointer rounded-[16px] hover:bg-[#2B1570] ${
              chain.active ? "bg-[#1F0F50] border-[#3D1E9F] border-[2px]" : "bg-[#1F0F50]"
            }`}
            key={chain.name + chain.id}
            title={chain.name}
            onClick={() => activeNetworksHandler(chain.id)}
            data-testid="network"
          >
            <img
              className="h-[16px] w-[16px] rounded-full"
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
