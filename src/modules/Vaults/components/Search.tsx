import { useState, useEffect, useRef, RefObject } from "react";

import { createPortal } from "react-dom";

import type { Dispatch, SetStateAction } from "react";

import { useClickOutside } from "@utils";

interface IProps {
  search: RefObject<HTMLInputElement>;
  searchHistory: string[];
  setSearchHistory: Dispatch<SetStateAction<string[]>>;
  tableHandler: () => void;
}

const Search: React.FC<IProps> = ({
  search,
  searchHistory,
  setSearchHistory,
  tableHandler,
}) => {
  const containerRef = useRef<HTMLLabelElement>(null);
  const dropDownRef = useRef<HTMLDivElement>(null);

  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 15, left: 0, width: 0 });

  const handleSearch = (value: string) => {
    if (search?.current) {
      search.current.value = value;
      tableHandler();
      setSearchHistory([]);
    }
  };

  const clearSearchHistory = (history: string[]) => {
    if (history.length === searchHistory.length) {
      localStorage.setItem("searchHistory", JSON.stringify([]));
      setSearchHistory([]);
    } else {
      const updatedHistory = searchHistory.filter(
        (item) => !history.includes(item)
      );
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      setDropdownPos({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [searchHistory.length]);

  useClickOutside(dropDownRef, () => setSearchHistory([]));

  return (
    <label
      ref={containerRef}
      className="font-manrope relative block w-full text-[16px] bg-[#1D1E23] border border-[#35363B] rounded-lg"
    >
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <img
          src="/search.svg"
          alt="Search"
          className="w-4 h-4 text-[#97979A]"
        />
      </span>

      <input
        type="text"
        className="text-[#97979A] text-[14px] md:text-[16px] placeholder:text-[10px] md:placeholder:text-[14px] leading-5 font-medium bg-transparent w-full transition-all duration-300 h-[28px] pr-7 pl-8"
        placeholder="Search assets"
        ref={search}
        onChange={() => tableHandler()}
      />

      {search?.current?.value && (
        <span
          onClick={() => handleSearch("")}
          className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
        >
          <img src="/icons/circle-xmark.png" alt="xmark" />
        </span>
      )}

      {searchHistory.length > 0 &&
        createPortal(
          <div
            ref={dropDownRef}
            className="bg-[#1C1D1F] border border-[#383B42] rounded-lg z-[9999] p-[6px] shadow-lg"
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
          >
            <span className="text-[#97979A] text-[12px] leading-[14px] font-medium p-[6px]">
              Recent searches
            </span>
            {searchHistory.map((text, index) => (
              <div
                key={text + index}
                className="cursor-pointer flex items-center justify-between text-white"
              >
                <span
                  className="text-ellipsis whitespace-nowrap overflow-hidden text-[14px] leading-5 font-medium py-[6px] pl-[6px]"
                  onClick={() => handleSearch(text)}
                >
                  {text}
                </span>
                <img
                  className="py-[6px] pr-[6px]"
                  onClick={() => clearSearchHistory([text])}
                  src="/icons/xmark.svg"
                  alt="xmark"
                />
              </div>
            ))}
            <button
              className="text-[#A193F2] text-[12px] leading-[14px] font-medium p-[6px] w-full text-start"
              onClick={() => clearSearchHistory(searchHistory)}
            >
              Clear all
            </button>
          </div>,
          document.body
        )}
    </label>
  );
};

export { Search };
