import { cn } from "@utils";

import { MetaVaultSectionTypes, MetaVaultDisplayTypes } from "@types";

type TProps = {
  activeSection: MetaVaultSectionTypes;
  displayType: MetaVaultDisplayTypes;
  setActiveSection: React.Dispatch<React.SetStateAction<MetaVaultSectionTypes>>;
};

const SectionHandler: React.FC<TProps> = ({
  activeSection,
  displayType,
  setActiveSection,
}) => {
  if (displayType === MetaVaultDisplayTypes.Lite) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full text-[16px] leading-6 font-semibold cursor-pointer sm:border-0 border border-[#232429] rounded-lg">
      <div
        className={cn(
          "w-full text-center py-2 px-4 sm:rounded-l-lg sm:border-y sm:border-l sm:border-[#232429]",
          activeSection === MetaVaultSectionTypes.Operations
            ? "bg-[#232429] rounded-t-lg sm:rounded-tr-none"
            : "text-[#7C7E81]"
        )}
        onClick={() => setActiveSection(MetaVaultSectionTypes.Operations)}
      >
        Operations
      </div>
      <div
        className={cn(
          "w-full text-center py-2 px-4 sm:border-y sm:border-[#232429]",
          activeSection === MetaVaultSectionTypes.Allocations
            ? "bg-[#232429]"
            : "text-[#7C7E81]"
        )}
        onClick={() => setActiveSection(MetaVaultSectionTypes.Allocations)}
      >
        Allocations
      </div>
      <div
        className={cn(
          "w-full text-center py-2 px-4 sm:rounded-r-lg sm:border-y sm:border-r sm:border-[#232429]",
          activeSection === MetaVaultSectionTypes.Charts
            ? "bg-[#232429] rounded-b-lg sm:rounded-bl-none"
            : "text-[#7C7E81]"
        )}
        onClick={() => setActiveSection(MetaVaultSectionTypes.Charts)}
      >
        Historical Rate
      </div>
    </div>
  );
};

export { SectionHandler };
