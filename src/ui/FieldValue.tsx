interface IProps {
  name: string;
  value: any;
  bottomValue?: string;
}

const FieldValue: React.FC<IProps> = ({ name, value, bottomValue }) => {
  return (
    <div className="h-[72px] flex flex-row items-center justify-between w-full md:justify-normal md:items-start md:flex-col">
      <div className="h-[12px] flex uppercase text-[14px] leading-3 text-neutral-500 mb-0 md:mb-[2px]">{name}</div>
      <div className="h-[48px] flex items-center text-[18px] font-semibold whitespace-nowrap">{value}</div>
      <div className="h-[12px] flex text-[12px] leading-3">{bottomValue}</div>
    </div>
  );
};

export { FieldValue };
