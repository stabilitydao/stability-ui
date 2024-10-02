interface ICounterProps {
  color: string;
  name: string;
  value: string;
}

const Counter: React.FC<ICounterProps> = ({color, name, value}) => {
  return (
    <div className="flex flex-col rounded-[36px] gap-[6px] w-full">
      <div className="flex font-semibold text-[28px] text-[#F9F8FA] justify-center">
        {value}
      </div>
      <div className="flex items-center gap-[8px] justify-center">
        <span className="inline-flex w-[10px] h-[10px] rounded-full mt-[2px]" style={{
          backgroundColor: color,
          boxShadow: `0px 0px 0px 3px ${color}40`,
        }}/>
        <span
          className="text-[16px] sm:text-[14px] lg:text-[14px] whitespace-nowrap font-normal text-[#A6A0B2]">{name}</span>
      </div>
    </div>
  )
}

export {Counter, type ICounterProps}
