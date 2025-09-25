import { Dispatch, SetStateAction } from "react";

import { cn } from "@utils";

import { MARKET_SECTIONS } from "../../constants";

import { MarketSectionTypes } from "@types";

type TProps = {
  activeSection: MarketSectionTypes;
  setActiveSection: Dispatch<SetStateAction<MarketSectionTypes>>;
};

const SectionSelector: React.FC<TProps> = ({
  activeSection,
  setActiveSection,
}) => {
  return (
    <div className="flex items-center gap-2">
      {MARKET_SECTIONS.map((section: MarketSectionTypes) => {
        return (
          <div
            key={section}
            className={cn(
              "flex items-center gap-2 py-2 px-3 rounded-lg border cursor-pointer",
              activeSection === section
                ? "bg-[#232429] border-[#35363B]"
                : " bg-transparent border-[#232429]"
            )}
            onClick={() => setActiveSection(section)}
          >
            <span
              className={cn(
                "text-[14px] leading-5 font-medium",
                activeSection === section ? "text-white" : "text-[#7C7E81]"
              )}
            >
              {section}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export { SectionSelector };
