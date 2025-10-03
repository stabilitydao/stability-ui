import { useState, useEffect, useRef } from "react";

import { Dispatch, SetStateAction } from "react";

import { motion } from "framer-motion";

import { cn, updateQueryParams } from "@utils";

import { MARKET_SECTIONS } from "../../constants";

import { MarketSectionTypes } from "@types";

type TProps = {
  market: string;
  activeSection: MarketSectionTypes;
  setActiveSection: Dispatch<SetStateAction<MarketSectionTypes>>;
};

const SectionSelector: React.FC<TProps> = ({
  market,
  activeSection,
  setActiveSection,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);

  const changeSection = (section: MarketSectionTypes) => {
    if (section === MarketSectionTypes.Deposit) {
      updateQueryParams({ section: null });
    } else {
      updateQueryParams({ section });
    }

    setActiveSection(section);
  };

  useEffect(() => {
    if (carouselRef.current) {
      const scrollWidth = carouselRef.current.scrollWidth;
      const offsetWidth = carouselRef.current.offsetWidth;
      setWidth(scrollWidth - offsetWidth);
    }
  }, []);

  return (
    <div className="w-full md:w-auto overflow-hidden md:overflow-visible">
      <motion.div
        ref={carouselRef}
        className="block md:hidden cursor-grab overflow-hidden"
      >
        <motion.div
          className="flex items-center gap-2"
          drag="x"
          dragConstraints={{ right: 0, left: -width }}
          whileTap={{ cursor: "grabbing" }}
        >
          {MARKET_SECTIONS.map((section: MarketSectionTypes) => {
            // temp
            if (section === "Users" && market === "Main") return null;

            return (
              <motion.div
                key={section}
                className={cn(
                  "min-w-[70px] flex-shrink-0 flex items-center gap-2 py-2 px-3 rounded-lg border",
                  activeSection === section
                    ? "bg-[#232429] border-[#35363B]"
                    : " bg-transparent border-[#232429]"
                )}
                onClick={() => changeSection(section)}
              >
                <span
                  className={cn(
                    "text-[14px] leading-5 font-medium pointer-events-none select-none",
                    activeSection === section ? "text-white" : "text-[#7C7E81]"
                  )}
                >
                  {section}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <div className="hidden md:flex items-center justify-end gap-2">
        {MARKET_SECTIONS.map((section: MarketSectionTypes) => {
          // temp
          if (section === "Users" && market === "Main") return null;

          return (
            <div
              key={section}
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-lg border cursor-pointer",
                activeSection === section
                  ? "bg-[#232429] border-[#35363B]"
                  : " bg-transparent border-[#232429]"
              )}
              onClick={() => changeSection(section)}
            >
              <span
                className={cn(
                  "text-[14px] leading-5 font-medium pointer-events-none select-none",
                  activeSection === section ? "text-white" : "text-[#7C7E81]"
                )}
              >
                {section}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { SectionSelector };
