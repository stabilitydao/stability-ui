import { cn } from "@utils";

import { MetaVaultDisplayTypes } from "@types";

type TProps = {
  displayType: MetaVaultDisplayTypes;
  changeDisplay: (type: MetaVaultDisplayTypes) => void;
};

const DisplayHandler: React.FC<TProps> = ({ displayType, changeDisplay }) => {
  return (
    <div className="flex items-center text-[14px] leading-5 max-w-[220px] h-10">
      <div
        className={cn(
          "py-2 px-3 cursor-pointer border-y border-l border-[#232429] rounded-l-lg h-10",
          displayType === MetaVaultDisplayTypes.Lite
            ? "bg-[#232429] font-semibold"
            : "text-[#7C7E81] font-medium"
        )}
        onClick={() => changeDisplay(MetaVaultDisplayTypes.Lite)}
      >
        Lite
      </div>
      <div
        className={cn(
          "py-2 px-3 cursor-pointer h-10 border border-[#232429] rounded-r-lg",
          displayType === MetaVaultDisplayTypes.Pro
            ? "bg-[#232429] font-semibold"
            : "text-[#7C7E81] font-medium"
        )}
        onClick={() => changeDisplay(MetaVaultDisplayTypes.Pro)}
      >
        Pro
      </div>
    </div>
  );
};

export { DisplayHandler };
