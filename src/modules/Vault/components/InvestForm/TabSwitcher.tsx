import type React from "react";

import { cn } from "@utils";

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
    <div className="bg-[#18191C] rounded-lg text-[14px] leading-5 font-medium flex items-center border border-[#232429] w-full">
      {TABS.map((tab: string) => (
        <span
          key={tab}
          className={cn(
            "h-10 text-center rounded-lg flex items-center justify-center w-1/2",
            activeTab === tab
              ? "bg-[#232429] border border-[#2C2E33]"
              : "text-[#6A6B6F] cursor-pointer"
          )}
          onClick={() => {
            setActiveTab(tab);
            resetInputs();
            resetOptions();
          }}
        >
          {tab}
        </span>
      ))}
    </div>
  );
};

export { TabSwitcher };
