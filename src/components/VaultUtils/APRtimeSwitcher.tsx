import { useState, useEffect, useRef } from "react";

import { useStore } from "@nanostores/react";

import { aprFilter } from "@store";

import { APRsType } from "@constants";

const APRtimeSwitcher = (): JSX.Element => {
  const $aprFilter = useStore(aprFilter);

  const dropDownRef = useRef<HTMLDivElement>(null);

  const [dropDownSelector, setDropDownSelector] = useState(false);
  const [activeAPRType, setActiveAPRType] = useState($aprFilter);

  const APRsHandler = (APRType: string) => {
    switch (APRType) {
      case "24h":
        aprFilter.set("daily");
        break;
      case "week":
        aprFilter.set("weekly");
        break;
      default:
        aprFilter.set(APRType);
        break;
    }

    setActiveAPRType(APRType);
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
    <div className="relative select-none w-[140px] switcher">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setDropDownSelector((prevState) => !prevState);
        }}
        className="flex items-center justify-between gap-3 rounded-md px-3 h-[30px] bg-button cursor-pointer"
      >
        <p className="text-[16px]">
          APRs:{" "}
          {activeAPRType === "weekly"
            ? "week"
            : activeAPRType === "daily"
              ? "24h"
              : activeAPRType}
        </p>
        <svg
          width="15"
          height="9"
          viewBox="0 0 15 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition delay-[50ms] ${
            dropDownSelector ? "rotate-[180deg]" : "rotate-[0deg]"
          }`}
        >
          <path d="M1 1L7.5 7.5L14 1" stroke="white" />
        </svg>
      </div>
      <div
        ref={dropDownRef}
        className={`bg-button mt-1 rounded-md w-full z-50 ${
          dropDownSelector ? "absolute transition delay-[50ms]" : "hidden"
        } `}
      >
        <div className="flex flex-col items-start">
          {APRsType.map((APRType) => (
            <p
              key={APRType}
              onClick={() => APRsHandler(APRType)}
              className={`py-2 px-3 cursor-pointer text-[16px] w-full ${
                APRType === activeAPRType
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-80"
              }`}
            >
              {APRType}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export { APRtimeSwitcher };
