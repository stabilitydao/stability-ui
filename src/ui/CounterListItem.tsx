import { ColorIndicator } from "./ColorIndicator";

interface ICounterProps {
  color: string;
  name: string;
  value: string;
}

const CounterListItem: React.FC<ICounterProps> = ({ color, name, value }) => {
  return (
    <div className="flex h-[58px] justify-between items-center rounded-[24px] gap-[6px] w-full  pl-[16px] pr-[24px]">
      <div className="flex items-center gap-[8px] justify-center">
        <ColorIndicator color={color} />
        <span className="text-[18px] whitespace-nowrap font-semibold text-neutral-500">
          {name}
        </span>
      </div>
      <div className="flex font-semibold text-[18px] text-neutral-50 justify-center">
        {value}
      </div>
    </div>
  );
};

export { CounterListItem, type ICounterProps };
