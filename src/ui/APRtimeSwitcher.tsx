import { useState, useEffect, useRef } from "react";

import { useStore } from "@nanostores/react";

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
    <div className="relative select-none switcher font-manrope text-[14px] font-semibold">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setDropDownSelector((prevState) => !prevState);
        }}
        data-testid="APRTimeSwitcher"
        className="flex items-center justify-between gap-3 px-5 py-3 cursor-pointer border border-[#23252A] rounded-lg"
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
          className={`transition delay-[50ms] w-3 h-3 ${
            dropDownSelector ? "rotate-[180deg]" : "rotate-[0deg]"
          }`}
          src="/icons/arrow-down.svg"
          alt="arrowDown"
        />
      </div>
      <div
        ref={dropDownRef}
        className={`bg-accent-900 mt-2 rounded-2xl w-full z-20 ${
          dropDownSelector ? "absolute transition delay-[50ms]" : "hidden"
        } `}
      >
        <div className="flex flex-col items-start">
          {APRsType.map((APRType, index: number) => {
            const isActive =
              activeAPRType.includes(APRType) ||
              (activeAPRType === "daily" && APRType === "24h");

            return (
              <p
                key={APRType}
                onClick={() => APRsHandler(APRType)}
                className={`${!index && "rounded-t-2xl"} ${index === APRsType.length - 1 ? "rounded-b-2xl" : ""} py-[10px] px-4 cursor-pointer w-full ${
                  isActive ? "bg-accent-800" : ""
                }`}
                data-testid="APRType"
              >
                {APRType}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { APRtimeSwitcher };
