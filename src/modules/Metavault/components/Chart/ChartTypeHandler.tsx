import { cn } from "@utils";

import { MetaVaultDisplayTypes } from "@types";

interface IProps {
  display: MetaVaultDisplayTypes;
  chart: string;
  metaVaultSymbol: string;
  handler: (value: string) => void;
}

const ChartTypeHandler: React.FC<IProps> = ({
  display,
  chart,
  metaVaultSymbol,
  handler,
}) => {
  if (display === MetaVaultDisplayTypes.Pro) return null;

  return (
    <div className="bg-[#18191C] rounded-lg text-[14px] leading-5 font-medium flex items-center border border-[#232429]">
      <span
        className={cn(
          "px-4 h-10 text-center rounded-lg flex items-center justify-center",
          chart !== "APR"
            ? "text-[#6A6B6F] cursor-pointer"
            : "bg-[#232429] border border-[#2C2E33]"
        )}
        onClick={() => handler("APR")}
      >
        Native APR
      </span>
      <span
        className={cn(
          "px-4 h-10 text-center rounded-lg flex items-center justify-center",
          chart !== "TVL"
            ? "text-[#6A6B6F] cursor-pointer"
            : "bg-[#232429] border border-[#2C2E33]"
        )}
        onClick={() => handler("TVL")}
      >
        TVL
      </span>
      <span
        className={cn(
          "px-4 h-10 text-center rounded-lg flex items-center justify-center",
          chart !== "sharePrice"
            ? "text-[#6A6B6F] cursor-pointer"
            : "bg-[#232429] border border-[#2C2E33]"
        )}
        onClick={() => handler("sharePrice")}
      >
        {metaVaultSymbol === "metaUSD" ? "wmetaUSD" : metaVaultSymbol} Price
      </span>
    </div>
  );
};

export { ChartTypeHandler };
