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
    <div className="flex">
      {TABS.map((tab) => (
        <button
          className={`h-[60px] cursor-pointer text-[16px] w-full rounded-tl-md  bg-[#1c1c23] ${
            activeTab === tab && "border-b-[2px] border-[#6376AF]"
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
