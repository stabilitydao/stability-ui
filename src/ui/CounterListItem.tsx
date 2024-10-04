import { ColorIndicator } from "./ColorIndicator";

interface ICounterProps {
  color: string;
  name: string;
  value: string;
}

const CounterListItem: React.FC<ICounterProps> = ({ color, name, value }) => {
  return (
    <div className="flex h-[58px] justify-between items-center rounded-[24px] gap-[6px] w-full bg-[#1B0D45] pl-[16px] pr-[24px]">
      <div className="flex items-center gap-[8px] justify-center">
        <ColorIndicator color={color}/>
        <span className="text-[16px] sm:text-[14px] lg:text-[14px] whitespace-nowrap font-normal text-[#A6A0B2]">
          {name}
        </span>
      </div>
      <div className="flex font-semibold text-[24px] text-[#F9F8FA] justify-center">
        {value}
      </div>
    </div>
  );
};

export {CounterListItem, type ICounterProps};
