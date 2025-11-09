interface IProps {
  title: string;
  value: string | React.ReactNode;
  subValue?: string | React.ReactNode;
}

const Indicator: React.FC<IProps> = ({ title, value, subValue }) => {
  return (
    <div className="flex min-w-[110px] flex-col gap-1 md:w-auto mt-2 md:mt-0">
      <span className="text-[#97979A] text-[14px] leading-5 font-medium flex">
        {title}
      </span>
      <div className="font-semibold leading-6 flex items-start gap-0 flex-col">
        <span className="font-bold text-[18px]">{value ?? ""}</span>
        <span className="text-[16px]">{subValue ?? ""}</span>
      </div>
    </div>
  );
};

export { Indicator };
