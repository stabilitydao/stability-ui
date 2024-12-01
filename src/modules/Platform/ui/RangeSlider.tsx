import { useState, useEffect } from "react";

import type { TVLRange } from "@types";

type TProps = {
  range: TVLRange;
  setRange: React.Dispatch<React.SetStateAction<TVLRange>>;
};

const RangeSlider: React.FC<TProps> = ({ range, setRange }) => {
  const [min, max] = [Number(range.min.toFixed()), Number(range.max.toFixed())];

  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  const [minInputValue, setMinInputValue] = useState(min.toFixed());
  const [maxInputValue, setMaxInputValue] = useState(max.toFixed());

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    type: "min" | "max"
  ) => {
    const slider = e.currentTarget.closest(".slider") as HTMLElement;
    const rect = slider.getBoundingClientRect();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newOffset = moveEvent.clientX - rect.left;
      const newValue = Math.min(
        max,
        Math.max(min, Math.round((newOffset / rect.width) * max))
      );

      if (type === "min") {
        const newMinValue = Math.min(newValue, maxValue - 10);

        setMinValue(newMinValue);
        setMinInputValue(String(newMinValue));
        setRange({ min: newMinValue, max: maxValue });
      } else {
        const newMaxValue = Math.max(newValue, minValue + 10);

        setMaxValue(newMaxValue);
        setMaxInputValue(String(newMaxValue));
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

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.trim();
    const lastChar = input.slice(-1).toLowerCase();

    input = input.replace(/^0+(?=\d)/, "");

    let value = 0;
    let inputValue = String(input);

    const correctInputSlice =
      input.length === 1 ? Number(input) : Number(input.slice(0, -1));

    if (!isNaN(correctInputSlice)) {
      if (isNaN(Number(lastChar))) {
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
            inputValue = String(input.slice(0, -1));
            break;
        }
      } else {
        value = parseFloat(input);
      }

      if (isNaN(value)) {
        value = 0;
      }

      if (value >= maxValue) {
        value = maxValue;
        inputValue = String(maxValue);
      }

      setMinInputValue(inputValue.toUpperCase());
      setMinValue(value);
      setRange({ min: value, max: maxValue });
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.trim();
    const lastChar = input.slice(-1).toLowerCase();

    input = input.replace(/^0+(?=\d)/, "");

    let value = 0;
    let inputValue = String(input);

    const correctInputSlice =
      input.length === 1 ? Number(input) : Number(input.slice(0, -1));

    if (!isNaN(correctInputSlice)) {
      if (isNaN(Number(lastChar))) {
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
            inputValue = String(input.slice(0, -1));
            break;
        }
      } else {
        value = parseFloat(input);
      }

      if (isNaN(value)) {
        value = 0;
      } else if (value >= max) {
        value = max;
        inputValue = String(max);
      } else if (value <= minValue) {
        value = minValue;
        inputValue = String(minValue);
      }

      setMaxInputValue(inputValue.toUpperCase());
      setMaxValue(value);
      setRange({ min: minValue, max: value });
    }
  };

  useEffect(() => {
    setMinValue(min);
    setMinInputValue(String(min));

    setMaxValue(max);
    setMaxInputValue(String(max));
  }, [range]);
  return (
    <div className="flex flex-col items-center w-full max-w-[300px] md:max-w-lg">
      <div className="flex items-center justify-between w-full text-neutral-50 font-manrope mb-2">
        <input
          value={minInputValue}
          onChange={handleMinInputChange}
          className="bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 pl-5"
        />

        <input
          value={maxInputValue}
          onChange={handleMaxInputChange}
          className="bg-accent-900 hover:border-accent-500 hover:bg-accent-800 outline-none py-[3px] rounded-2xl border-[2px] border-accent-800 focus:border-accent-500 focus:text-neutral-50 text-neutral-500 transition-all duration-300 pl-5"
        />
      </div>

      <div className="relative w-full slider h-3 bg-accent-900 rounded-lg">
        <div
          className="absolute bg-accent-800 h-3 rounded-lg transition-all duration-300"
          style={{
            left: `${(minValue / max) * 100}%`,
            width: `${((maxValue - minValue) / max) * 100}%`,
            top: "50%",
            transform: "translateY(-50%)",
            borderRadius: "8px",
          }}
        />

        <div
          className="absolute bg-accent-500 rounded-full w-5 h-5 cursor-pointer shadow-lg transition-transform duration-200 hover:scale-110"
          style={{
            left: `${(minValue / max) * 100}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          onMouseDown={(e) => handleMouseDown(e, "min")}
        />

        <div
          className="absolute bg-accent-500 rounded-full w-5 h-5 cursor-pointer shadow-lg transition-transform duration-200 hover:scale-110"
          style={{
            left: `${(maxValue / max) * 100}%`,
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
