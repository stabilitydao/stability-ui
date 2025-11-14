import { AssetsInfo, AddressField } from "../../ui";

import type { TMarket, TMarketReserve, TAddress } from "@types";

type TProps = {
  market: TMarket;
  activeAsset: TMarketReserve | undefined;
};

const InformationTab: React.FC<TProps> = ({ market, activeAsset }) => {
  return (
    <div className="flex flex-col gap-6">
      <AssetsInfo
        activeAsset={activeAsset}
        assets={market?.reserves}
        network={market?.network}
      />

      <div className="flex flex-col gap-3">
        <span className="text-[24px] leading-8 font-medium">
          Overall details
        </span>
        <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col gap-2 w-full font-medium text-[16px] leading-6">
          <div className="w-full flex items-center justify-between">
            <span className="text-[#7C7E81]">Market ID</span>
            <span className="font-semibold">{market?.marketId}</span>
          </div>
          <div className="w-full flex items-center justify-between">
            <span className="font-medium text-[16px] leading-6 text-[#7C7E81]">
              Deployed
            </span>
            <span className="font-semibold">{market?.deployed}</span>
          </div>
        </div>
      </div>

      {!!market?.roles?.length && (
        <div className="flex flex-col gap-3">
          <span className="text-[24px] leading-8 font-medium">Roles</span>
          <div className="bg-[#111114] border border-[#232429] rounded-xl p-4 flex flex-col gap-2 w-full font-medium text-[16px] leading-6">
            {market?.roles.map(({ name, addresses }) => (
              <div
                key={name}
                className="w-full flex items-start justify-between flex-col md:flex-row"
              >
                <span className="text-[#7C7E81]">{name}</span>
                <div className="flex flex-col gap-1 ml-5 md:ml-0">
                  {addresses.map((address) => (
                    <AddressField
                      key={address}
                      address={address as TAddress}
                      explorer={market?.network?.explorer ?? ""}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { InformationTab };
