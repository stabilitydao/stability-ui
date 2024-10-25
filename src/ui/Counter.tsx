import { ColorIndicator } from "./ColorIndicator";

interface ICounterProps {
  color: string;
  name: string;
  value: string;
}

const Counter: React.FC<ICounterProps> = ({ color, name, value }) => {
  return (
    <div className="flex flex-col rounded-[36px] gap-[6px] w-full">
      <div className="flex font-semibold text-[20px] md:text-[28px] text-neutral-50 justify-center">
        {value}
      </div>
      <div className="flex items-center gap-[8px] justify-center">
        <ColorIndicator color={color} />
        <span className="text-[16px] sm:text-[14px] lg:text-[14px] whitespace-nowrap font-normal text-neutral-500">
          {name}
        </span>
      </div>
    </div>
  );
};

export { Counter, type ICounterProps };
