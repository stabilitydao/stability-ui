import { AssetInfo } from "./AssetInfo";

import { useWindowWidth } from "@utils";

import type { TMarketReserve, TNetwork } from "@types";

type TProps = {
  activeAsset: TMarketReserve | undefined;
  assets: TMarketReserve[] | undefined;
  network: TNetwork | undefined;
};

const AssetsInfo: React.FC<TProps> = ({ activeAsset, assets, network }) => {
  const windowWidth = useWindowWidth();
  if (assets?.length === 2 && windowWidth >= 1024) {
    return (
      <div className="flex items-start flex-col lg:flex-row gap-6 w-full">
        {assets.map((asset) => (
          <AssetInfo key={asset?.address} asset={asset} network={network} />
        ))}
      </div>
    );
  }

  return (
    <AssetInfo
      asset={activeAsset as TMarketReserve}
      isSingleAsset={true}
      network={network}
    />
  );
};

export { AssetsInfo };
