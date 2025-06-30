import { useState, useEffect, useRef } from "react";

import { useStore } from "@nanostores/react";

import { cn, capitalize } from "@utils";

import { aprFilter } from "@store";

import { APRsType } from "@constants";

interface IProps {
  withText?: boolean;
}

const APRtimeSwitcher: React.FC<IProps> = ({ withText = false }) => {
  const $aprFilter = useStore(aprFilter);

  const dropDownRef = useRef<HTMLDivElement>(null);

  const [dropDownSelector, setDropDownSelector] = useState(false);
  const [activeAPRType, setActiveAPRType] = useState($aprFilter);

  const APRsHandler = (APRType: string) => {
    switch (APRType) {
      case "latest":
        aprFilter.set("latest");
        setActiveAPRType("latest");
        break;
      case "24h":
        aprFilter.set("daily");
        setActiveAPRType("daily");
        break;
      case "week":
        aprFilter.set("weekly");
        setActiveAPRType("weekly");
        break;
      default:
        break;
    }

    setDropDownSelector(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target || !dropDownRef.current) return;

      const targetElement = event.target as Element;

      if (
        !dropDownRef.current.contains(event.target as Node) &&
        !targetElement.closest(".switcher")
      ) {
        setDropDownSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropDownRef]);

  return (
    <div className="relative select-none switcher font-manrope font-semibold w-[100px] md:w-[170px]">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setDropDownSelector((prevState) => !prevState);
        }}
        data-testid="APRTimeSwitcher"
        className="flex items-center justify-between gap-2 px-3 py-1 md:gap-3 md:px-5 md:py-3 cursor-pointer border border-[#35363B] md:border-[#23252A] rounded-lg bg-[#1D1E23] md:bg-transparent"
      >
        <p className="text-[16px]">
          {withText ? <span className="text-[#97979a]">Period: </span> : ""}
          <span>
            {activeAPRType === "weekly"
              ? "week"
              : activeAPRType === "daily"
                ? "24h"
                : activeAPRType}
          </span>
        </p>

        <img
          className={cn(
            "transition delay-[50ms] w-3 h-3",
            dropDownSelector ? "rotate-[180deg]" : "rotate-[0deg]"
          )}
          src="/icons/arrow-down.svg"
          alt="arrowDown"
        />
      </div>
      <div
        ref={dropDownRef}
        className={cn(
          "bg-[#1C1D1F] mt-2 rounded-lg border border-[#383B42] w-full z-20",
          dropDownSelector ? "absolute transition delay-[50ms]" : "hidden"
        )}
      >
        <div className="flex flex-col items-start text-[14px] leading-5 font-medium p-[6px]">
          {APRsType.map((APRType) => {
            const isActive =
              activeAPRType.includes(APRType) ||
              (activeAPRType === "daily" && APRType === "24h");

            const text = APRType === "24h" ? "24 hours" : capitalize(APRType);

            return (
              <div
                key={APRType}
                onClick={() => APRsHandler(APRType)}
                data-testid="APRType"
                className={cn(
                  "p-[6px] cursor-pointer w-full rounded-lg flex items-center justify-between",
                  isActive && "bg-[#27292E] cursor-default"
                )}
              >
                <p>{text}</p>
                {isActive && <img src="/icons/checkmark.svg" alt="Checkmark" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { APRtimeSwitcher };
