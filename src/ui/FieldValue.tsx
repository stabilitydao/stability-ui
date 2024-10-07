interface IProps {
  name: string;
  value: any;
  bottomValue?: string;
}

const FieldValue: React.FC<IProps> = ({ name, value, bottomValue }) => {
  return (
    <div className="h-[72px] flex flex-col">
      <div className="h-[12px] flex uppercase text-[14px] leading-3 text-neutral-500">{name}</div>
      <div className="h-[48px] flex items-center text-[18px] font-semibold whitespace-nowrap">{value}</div>
      <div className="h-[12px] flex text-[12px] leading-3">{bottomValue}</div>
    </div>
  );
};

export { FieldValue };
