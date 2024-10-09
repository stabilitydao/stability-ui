import type { TAsset, TToken } from "@types";

interface IProps {
  proportions: number[];
  assets: TToken[] | TAsset[];
  vaultLogo?: string;
}

const AssetsProportion = ({
  proportions,
  assets,
  vaultLogo = "",
}: IProps): JSX.Element => {
  return proportions.length > 1 ? (
    <div className="flex w-[80px] relative">
      <div
        style={{
          width: `${proportions ? (30 * proportions[0]) / 100 + 28 : 40}px`,
          backgroundColor: assets[0]?.color,
        }}
        className="h-7 rounded-l-full"
      ></div>
      {!!vaultLogo && (
        <img
          src={vaultLogo}
          alt="logo"
          className="w-7 h-7 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      )}
      <div
        style={{
          width: `${proportions ? (30 * proportions[1]) / 100 + 28 : 40}px`,
          backgroundColor: assets[1]?.color,
        }}
        className="h-7 flex justify-end rounded-r-full"
      ></div>
    </div>
  ) : (
    <div className="flex relative w-[80px]">
      <div
        style={{
          backgroundColor: assets[0]?.color,
        }}
        className="h-7 w-full rounded-full flex items-center justify-center"
      >
        {!!vaultLogo && (
          <img
            src={vaultLogo}
            alt="logo"
            className="w-7 h-7 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />
        )}
      </div>
    </div>
  );
};

export { AssetsProportion };
