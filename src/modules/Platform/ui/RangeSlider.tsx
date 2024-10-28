import { useState, useEffect } from "react";

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
        setRange({ min: newMinValue, max: maxValue });
      } else {
        const newMaxValue = Math.max(newValue, minValue + 10);
        setMaxValue(newMaxValue);
        setRange({ min: minValue, max: newMaxValue });
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

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = 0;
    const input = e.target.value.trim();
    const lastChar = input.slice(-1).toLowerCase();

    switch (lastChar) {
      case "m":
        value = Number(input.slice(0, -1)) * 1_000_000;
        break;
      case "k":
        value = Number(input.slice(0, -1)) * 1_000;
        break;
      case "b":
        value = Number(input.slice(0, -1)) * 1_000_000_000;
        break;
      default:
        value = parseFloat(input);
        break;
    }

    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > maxValue) {
      value = maxValue;
    }

    setMinValue(value);
    setRange({ min: value, max: maxValue });
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = 0;
    const input = e.target.value.trim();
    const lastChar = input.slice(-1).toLowerCase();

    switch (lastChar) {
      case "m":
        value = Number(input.slice(0, -1)) * 1_000_000;
        break;
      case "k":
        value = Number(input.slice(0, -1)) * 1_000;
        break;
      case "b":
        value = Number(input.slice(0, -1)) * 1_000_000_000;
        break;
      default:
        value = parseFloat(input);
        break;
    }

    if (isNaN(value)) {
      value = 0;
    } else if (value > range.max) {
      value = range.max;
    }

    setMaxValue(value);
    setRange({ min: minValue, max: value });
  };
  return (
    <div className="flex flex-col items-center w-full max-w-[300px] md:max-w-lg">
      <div className="flex items-center justify-between w-full text-neutral-50 font-manrope mb-2">
        <input
          value={minValue}
          onChange={handleMinInputChange}
          className="bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 pl-5"
        />

        <input
          value={maxValue}
          onChange={handleMaxInputChange}
          className="bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 pl-5"
        />
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
