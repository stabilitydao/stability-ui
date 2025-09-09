import { memo } from "react";

import type { TChain } from "@types";

interface IProps {
  activeNetworks: TChain[];
  activeNetworksHandler: (chains: string[]) => void;
}

const NetworksFilter: React.FC<IProps> = memo(
  ({ activeNetworks, activeNetworksHandler }) => {
    return (
      <div className="flex items-center gap-2 select-none">
        {activeNetworks.map((chain) => (
          <div
            className={`flex items-center justify-center cursor-pointer px-3 py-2 border rounded-lg ${
              chain.active
                ? "bg-[#22242A] border-[#35363B]"
                : "border-[#23252A]"
            }`}
            key={chain.name + chain.id}
            title={chain.name}
            onClick={() => activeNetworksHandler([chain.id])}
            data-testid="network"
          >
            <div className="flex items-center gap-2">
              <img
                className="h-5 w-5 rounded-full"
                src={chain.logoURI}
                alt={chain.name}
              />
              <span className="text-[14px] leading-5 font-medium">
                {chain.name}
              </span>
            </div>
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

export { NetworksFilter };
