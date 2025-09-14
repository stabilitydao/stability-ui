import { useEffect, useRef } from "react";

import { TRANSACTION_SETTINGS } from "../../constants";

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
      className=" bg-[#1c1d1f] border border-[#383B42] absolute w-[250px] min-h-[150px] z-20 top-[60px] right-0 rounded-md text-[18px]"
    >
      <div className="p-3 flex flex-col items-start gap-2">
        <div>
          <p className="text-[12px] leading-3 text-[#909193] mb-1">
            Slippage (%)
          </p>
          <div className="flex items-center gap-2">
            <input
              className="bg-[#232429] border-[#2C2E33] w-[80px] py-2 rounded-md pl-5 border h-8"
              name="Slippage"
              placeholder="0"
              value={settingsState.slippage}
              onChange={handleInputChange}
            />
            <div className="flex items-center gap-2">
              {TRANSACTION_SETTINGS.slippage.map((value) => (
                <div
                  key={value}
                  className={`bg-[#232429] w-10 h-8 flex items-center justify-center rounded-md cursor-pointer ${
                    settingsState.slippage === value &&
                    "border border-[#2C2E33]"
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
        </div>
        <div>
          <p className="text-[12px] leading-3 text-[#909193] mb-1">Approves</p>
          <div className="flex items-center gap-2">
            {TRANSACTION_SETTINGS.approves.map((value) => (
              <div
                key={value}
                className={`bg-[#232429] w-auto h-8 flex items-center justify-center rounded-md cursor-pointer p-2 ${
                  settingsState.approves === value && "border border-[#2C2E33]"
                }`}
                onClick={() =>
                  setSettingsState((prev) => ({ ...prev, approves: value }))
                }
              >
                {value}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[12px] leading-3 text-[#909193] mb-1">
            Gas Limit Multiplier
          </p>
          <div className="flex items-center gap-2">
            {TRANSACTION_SETTINGS.gasLimits.map((value) => (
              <div
                key={value}
                className={`bg-[#232429] w-auto h-8 flex items-center justify-center rounded-md cursor-pointer p-2 ${
                  settingsState.gasLimit === value && "border border-[#2C2E33]"
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
    </div>
  );
};

export { SettingsModal };
