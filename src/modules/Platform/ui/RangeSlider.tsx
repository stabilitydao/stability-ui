import { useState, useEffect } from "react";

import { formatNumber } from "@utils";

import type { TVLRange } from "@types";

type TProps = {
  range: TVLRange;
  setRange: React.Dispatch<React.SetStateAction<TVLRange>>;
};

const RangeSlider: React.FC<TProps> = ({ range, setRange }) => {
  const [minValue, setMinValue] = useState(range.min);
  const [maxValue, setMaxValue] = useState(range.max);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "min" | "max"
  ) => {
    const slider = e.currentTarget.closest(".slider") as HTMLElement;
    const rect = slider.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newOffset = moveEvent.clientX - rect.left;
      const newValue = Math.min(
        range.max,
        Math.max(range.min, Math.round((newOffset / rect.width) * range.max))
      );

      if (type === "min") {
        const newMinValue = Math.min(newValue, maxValue - 10);
        setMinValue(newMinValue);
        setRange((prevRange) => ({
          min: newMinValue,
          max: prevRange.max,
        }));
      } else {
        const newMaxValue = Math.max(newValue, minValue + 10);
        setMaxValue(newMaxValue);
        setRange((prevRange) => ({
          min: prevRange.min,
          max: newMaxValue,
        }));
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    setMinValue(range.min);
    setMaxValue(range.max);
  }, [range]);

  return (
    <div className="flex flex-col items-center w-full max-w-[300px] md:max-w-lg">
      <div className="flex items-center justify-between w-full text-neutral-50 font-manrope">
        <span>{formatNumber(minValue, "abbreviate")}</span>
        <span>{formatNumber(maxValue, "abbreviate")}</span>
      </div>

      <div className="relative w-full slider h-3 bg-accent-900 rounded-lg">
        <div
          className="absolute bg-accent-800 h-3 rounded-lg transition-all duration-300"
          style={{
            left: `${(minValue / range.max) * 100}%`,
            width: `${((maxValue - minValue) / range.max) * 100}%`,
            top: "50%",
            transform: "translateY(-50%)",
            borderRadius: "8px",
          }}
        />

        <div
          className="absolute bg-accent-500 rounded-full w-5 h-5 cursor-pointer shadow-lg transition-transform duration-200 hover:scale-110"
          style={{
            left: `${(minValue / range.max) * 100}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onMouseDown={(e) => handleMouseDown(e, "min")}
        />

        <div
          className="absolute bg-accent-500 rounded-full w-5 h-5 cursor-pointer shadow-lg transition-transform duration-200 hover:scale-110"
          style={{
            left: `${(maxValue / range.max) * 100}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onMouseDown={(e) => handleMouseDown(e, "max")}
        />
      </div>
    </div>
  );
};

export { RangeSlider };
