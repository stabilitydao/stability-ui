interface IProps {
  proportions: number[];
  assets: any;
  type: string;
}

const AssetsProportion = ({ proportions, assets, type }: IProps) => {
  return proportions.length > 1 ? (
    <div
      className={
        type === "vaults"
          ? "md:flex hidden w-[30px] h-6 ml-[12px] mr-5 relative"
          : "flex ml-4 min-w-[40px] mr-5"
      }
    >
      <div
        style={{
          width: `${proportions ? (30 * proportions[0]) / 100 : 25}px`,
          backgroundColor: assets[0]?.color,
        }}
        className={type === "vault" ? "h-7" : "h-6"}
      >
        <img
          className={
            type === "vault"
              ? "absolute w-7 h-7 rounded-full ml-[-16px]"
              : "absolute w-6 h-6 rounded-full ml-[-12px]"
          }
          src={assets[0].logo}
          alt={assets[0].symbol}
          title={assets[0].name}
        />
      </div>
      <div
        style={{
          width: `${proportions ? (30 * proportions[1]) / 100 : 25}px`,
          backgroundColor: assets[1]?.color,
        }}
        className={
          type === "vault" ? "h-7 flex justify-end" : "h-6 flex justify-end"
        }
      >
        <img
          className={
            type === "vault"
              ? "absolute w-7 h-7 rounded-full mr-[-16px]"
              : "absolute w-6 h-6 rounded-full mr-[-12px]"
          }
          src={assets[1].logo}
          alt={assets[1].symbol}
          title={assets[1].name}
        />
      </div>
    </div>
  ) : (
    <div
      className={
        type === "vaults"
          ? "hidden md:flex w-[50px] h-6 mr-[14px]"
          : "flex mr-2  w-[60px]"
      }
    >
      <div
        style={{
          backgroundColor: assets[0]?.color,
        }}
        className="h-6 w-full rounded-full flex items-center justify-center"
      >
        <img
          className="w-6 h-6 rounded-full"
          src={assets[0].logo}
          alt={assets[0].symbol}
          title={assets[0].name}
        />
      </div>
    </div>
  );
};

export { AssetsProportion };
