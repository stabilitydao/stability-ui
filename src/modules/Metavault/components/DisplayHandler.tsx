import { cn } from "@utils";

import { MetaVaultDisplayTypes } from "@types";

type TProps = {
  displayType: MetaVaultDisplayTypes;
  setDisplayType: React.Dispatch<React.SetStateAction<MetaVaultDisplayTypes>>;
};

const DisplayHandler: React.FC<TProps> = ({ displayType, setDisplayType }) => {
  return (
    <div className="flex items-center text-[14px] leading-5 max-w-[220px] h-10">
      <div className="px-4 py-2 border-y border-l border-[#232429] rounded-l-lg h-10">
        <img src="/metavaults_full_logo.png" alt="Stability logo" />
      </div>
      <div
        className={cn(
          "py-2 px-3 font-medium cursor-pointer border border-[#232429] h-10",
          displayType === MetaVaultDisplayTypes.Lite
            ? "bg-[#232429]"
            : "text-[#7C7E81]"
        )}
        onClick={() => setDisplayType(MetaVaultDisplayTypes.Lite)}
      >
        Lite
      </div>
      <div
        className={cn(
          "py-2 px-3 font-semibold cursor-pointer h-10 border border-[#232429] rounded-r-lg",
          displayType === MetaVaultDisplayTypes.Pro
            ? "bg-[#232429]"
            : "text-[#7C7E81]"
        )}
        onClick={() => setDisplayType(MetaVaultDisplayTypes.Pro)}
      >
        Pro
      </div>
    </div>
  );
};

export { DisplayHandler };
