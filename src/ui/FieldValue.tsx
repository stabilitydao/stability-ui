interface IProps {
  name: string;
  value: any;
  bottomValue?: string;
  testId?: string;
}

const FieldValue: React.FC<IProps> = ({ name, value, bottomValue, testId }) => {
  return (
    <div className="flex flex-row items-center justify-between w-full md:justify-normal md:items-start md:flex-col gap-1">
      <div className="flex text-[14px] leading-5 text-[#97979A]">{name}</div>
      <div
        className="flex items-center text-[20px] leading-6 font-semibold whitespace-nowrap"
        {...(testId && { "data-testid": testId })}
      >
        {value}
      </div>
      <div className="hidden h-[12px] md:flex text-[12px] leading-3">
        {bottomValue}
      </div>
    </div>
  );
};

export { FieldValue };
