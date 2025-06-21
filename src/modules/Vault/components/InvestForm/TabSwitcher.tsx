import type React from "react";

import { TABS } from "../../constants";

interface IProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  resetInputs: () => void;
  resetOptions: () => void;
}

const TabSwitcher: React.FC<IProps> = ({
  activeTab,
  setActiveTab,
  resetInputs,
  resetOptions,
}) => {
  return (
    <div className="flex border border-[#2C2E33] rounded-lg">
      {TABS.map((tab: string) => (
        <button
          key={tab}
          className={`h-[52px] text-neutral-50 font-semibold text-[14px] cursor-pointer w-full bg-[#18191c] ${
            activeTab === tab && "bg-[#232429]"
          }`}
          onClick={() => {
            setActiveTab(tab);
            resetInputs();
            resetOptions();
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export { TabSwitcher };
