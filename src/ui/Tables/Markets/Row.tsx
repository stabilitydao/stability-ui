import { formatNumber, getTokenData } from "@utils";

interface IProps {
  market: any;
  // setModalState: React.Dispatch<React.SetStateAction<TAPRModal>>;
}

const Row: React.FC<IProps> = ({ market }) => {
  // const isSTBLVault =
  //   Array.isArray(vault?.assets) &&
  //   vault.assets.some((asset) => asset?.symbol && asset?.symbol === "STBL");

  // const link =
  //   vault?.type === VaultTypes.Vault
  //     ? `/vaults/vault/${vault.network}/${vault.address}`
  //     : `/metavaults/metavault/${vault.address}`;

  return (
    <div className="border border-[#23252A]">
      {market.assets.map((asset) => {
        const assetData = getTokenData(asset.address);

        return (
          <div
            key={market.name + asset.address}
            className="text-center bg-[#101012] cursor-pointer h-[56px] font-medium relative flex items-center"
          >
            <div className="sticky bg-[#101012] lg:bg-transparent top-0 left-0 flex items-center w-[150px] md:w-[15%] justify-between gap-3 px-2 md:px-4 h-[56px] z-10 border-r border-[#23252A] lg:border-r-0">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="font-semibold text-[16px] max-w-[100px] md:max-w-[130px] truncate overflow-hidden whitespace-nowrap">
                  {market.name}
                </span>
              </div>
            </div>
            <div className="px-2 md:px-4 text-left text-[16px] w-[100px] md:w-[15%] flex items-center gap-2">
              <img
                src={assetData?.logoURI}
                alt={assetData?.symbol}
                className="w-4 h-4 rounded-full"
              />
              <span>{assetData?.symbol}</span>
            </div>
            <div className="px-2 md:px-4 text-right text-[16px] w-[100px] md:w-[17.5%]">
              {formatNumber(asset.supplyAPR, "format")}%
            </div>
            <div className="px-2 md:px-4 text-right text-[16px] w-[100px] md:w-[17.5%]">
              {formatNumber(asset.borrowAPR, "format")}%
            </div>
            <div className="px-2 md:px-4 text-right text-[16px] w-[100px] md:w-[17.5%]">
              {formatNumber(asset.supplyTVL, "abbreviate")}
            </div>
            <div className="px-2 md:px-4 text-right text-[16px] w-[100px] md:w-[17.5%]">
              {formatNumber(asset.borrowTVL, "abbreviate")}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { Row };
