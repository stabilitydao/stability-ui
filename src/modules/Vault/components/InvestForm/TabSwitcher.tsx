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
    <div className="flex border-[2px] border-accent-950 rounded-t-2xl">
      {TABS.map((tab: string, index: number) => (
        <button
          key={tab}
          className={`h-[52px] text-neutral-50 font-semibold text-[14px] cursor-pointer w-full bg-accent-1000 ${
            activeTab === tab && "border-b-[2px] border-accent-500"
          } ${!!index ? "rounded-tr-2xl" : "rounded-tl-2xl"}`}
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
