import { useEffect, useRef } from "react";

import { TRANSACTION_SETTINGS } from "@constants";

import type { TSettings } from "@types";

interface IProps {
  settingsState: TSettings;
  setSettingsState: React.Dispatch<React.SetStateAction<TSettings>>;
  setModalState: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsModal: React.FC<IProps> = ({
  settingsState,
  setSettingsState,
  setModalState,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    const isSvgClick = (event.target as HTMLElement).classList.contains(
      "settingsModal"
    );

    if (
      modalRef.current &&
      !modalRef.current.contains(event.target as Node) &&
      !isSvgClick
    ) {
      setModalState(false);
    }
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    const validInputRegex = /^[0-9]*(\.[0-9]{0,2})?$/;

    if (validInputRegex.test(inputValue) && Number(inputValue) <= 100) {
      setSettingsState((prev) => ({ ...prev, slippage: inputValue }));
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
      className="bg-[#13141f] absolute w-[300px] min-h-[150px]  z-20 top-[50px] right-0 rounded-md"
    >
      <div className="px-5 py-3">
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96] mb-2 ">
          SLIPPAGE (%)
        </p>
        <div className="flex items-center gap-2">
          <input
            className="bg-button w-full py-2 rounded-md pl-5 border border-[#6376AF]"
            name="Slippage"
            placeholder="0"
            value={settingsState.slippage}
            onChange={handleInputChange}
          />
          <div className="flex items-center gap-2">
            {TRANSACTION_SETTINGS.slippage.map((value) => (
              <div
                key={value}
                className={`bg-button w-10 h-8 flex items-center justify-center rounded-md cursor-pointer ${
                  settingsState.slippage === value && "border border-[#6376AF]"
                }`}
                onClick={() =>
                  setSettingsState((prev) => ({ ...prev, slippage: value }))
                }
              >
                {value}
              </div>
            ))}
          </div>
        </div>
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96] my-2 mt-7">
          APPROVES
        </p>
        <div className="flex items-center gap-3">
          {TRANSACTION_SETTINGS.approves.map((value) => (
            <div
              key={value}
              className={`bg-button w-auto h-8 flex items-center justify-center rounded-md cursor-pointer p-2 ${
                settingsState.approves === value && "border border-[#6376AF]"
              }`}
              onClick={() =>
                setSettingsState((prev) => ({ ...prev, approves: value }))
              }
            >
              {value}
            </div>
          ))}
        </div>
        <p className="uppercase text-[14px] leading-3 text-[#8D8E96] my-2 mt-7">
          GAS LIMIT MULTIPLIER
        </p>
        <div className="flex items-center gap-3">
          {TRANSACTION_SETTINGS.gasLimits.map((value) => (
            <div
              key={value}
              className={`bg-button w-auto h-8 flex items-center justify-center rounded-md cursor-pointer p-2 ${
                settingsState.gasLimit === value && "border border-[#6376AF]"
              }`}
              onClick={() =>
                setSettingsState((prev) => ({ ...prev, gasLimit: value }))
              }
            >
              {value}x
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { SettingsModal };
