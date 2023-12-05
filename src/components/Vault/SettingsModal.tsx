import { useEffect, useRef } from "react";

import { SLIPPAGE_VALUES } from "@constants";

interface IProps {
  slippageState: string;
  setSlippageState: React.Dispatch<React.SetStateAction<string>>;
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsModal: React.FC<IProps> = ({
  slippageState,
  setSlippageState,
  setModalState,
}) => {
  const modalRef: any = useRef();

  const handleClickOutside = (event: MouseEvent) => {
    const isSvgClick = (event.target as HTMLElement).classList.contains(
      "settingsModal"
    );

    if (
      modalRef.current &&
      !modalRef.current.contains(event.target) &&
      !isSvgClick
    ) {
      setModalState(false);
    }
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    const validInputRegex = /^[0-9.]*$/;

    if (validInputRegex.test(inputValue) && Number(inputValue) <= 100) {
      setSlippageState(inputValue);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={modalRef}
      className="bg-[#13141f] absolute w-[300px] h-[150px] z-20 top-[50px] right-0 rounded-md"
    >
      <div className="px-5 py-3">
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96] mb-2 ">
          SLIPPAGE (%)
        </p>
        <input
          className="bg-button w-full py-2 rounded-md pl-5 border border-[#6376AF]"
          name="Slippage"
          placeholder="0"
          value={slippageState}
          onChange={handleInputChange}
        />
        <div className="flex items-center gap-3 mt-5">
          {SLIPPAGE_VALUES.map((value) => (
            <div
              key={value}
              className={`bg-button w-10 h-8 flex items-center justify-center rounded-md cursor-pointer ${
                slippageState === value && "border border-[#6376AF]"
              }`}
              onClick={() => setSlippageState(value)}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { SettingsModal };
