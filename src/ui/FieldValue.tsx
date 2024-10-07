interface IProps {
  name: string;
  value: any;
}

const FieldValue: React.FC<IProps> = ({ name, value }) => {
  return (
    <div className="flex flex-col h-[46px]">
      <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
        {name}
      </p>
      <div className="text-[18px] font-semibold whitespace-nowrap">{value}</div>
    </div>
  );
};

export { FieldValue };
