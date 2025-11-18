import { cn } from "@utils";

import { DAOSectionTypes } from "@types";

type TProps = {
  activeSection: DAOSectionTypes;
  changeSection: (section: DAOSectionTypes) => void;
};

const SectionHandler: React.FC<TProps> = ({ activeSection, changeSection }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full text-[16px] leading-6 font-semibold cursor-pointer sm:border-0 border border-[#232429] rounded-lg">
      <div
        className={cn(
          "w-full text-start sm:text-center py-2 px-4 sm:rounded-l-lg sm:border-y sm:border-l sm:border-[#232429]",
          activeSection === DAOSectionTypes.Governance
            ? "bg-[#232429] rounded-t-lg sm:rounded-tr-none"
            : "text-[#7C7E81]"
        )}
        onClick={() => changeSection(DAOSectionTypes.Governance)}
      >
        Governance
      </div>
      <div
        className={cn(
          "w-full text-start sm:text-center py-2 px-4 sm:border-y sm:border-[#232429]",
          activeSection === DAOSectionTypes.InterChain
            ? "bg-[#232429]"
            : "text-[#7C7E81]"
        )}
        onClick={() => changeSection(DAOSectionTypes.InterChain)}
      >
        Inter-chain
      </div>
      <div
        className={cn(
          "w-full text-start sm:text-center py-2 px-4 sm:border-y sm:border-[#232429]",
          activeSection === DAOSectionTypes.Tokenomics
            ? "bg-[#232429]"
            : "text-[#7C7E81]"
        )}
        onClick={() => changeSection(DAOSectionTypes.Tokenomics)}
      >
        Tokenomics
      </div>
      <div
        className={cn(
          "w-full text-start sm:text-center py-2 px-4 sm:rounded-r-lg sm:border-y sm:border-r sm:border-[#232429]",
          activeSection === DAOSectionTypes.Holders
            ? "bg-[#232429] rounded-b-lg sm:rounded-bl-none"
            : "text-[#7C7E81]"
        )}
        onClick={() => changeSection(DAOSectionTypes.Holders)}
      >
        Holders
      </div>
    </div>
  );
};

export { SectionHandler };
