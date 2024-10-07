interface INameValueProps {
  name: string;
  value: any;
}

const NameValue: React.FC<INameValueProps> = ({
  name,
  value,
}) => {

  return (
    <div className="flex flex-col h-[46px]">
      <p className="uppercase text-[14px] leading-3 text-neutral-500 mb-[2px]">
        {name}
      </p>
      <p className="text-[18px] font-semibold whitespace-nowrap">
        {value}
      </p>
    </div>
  )
}

export {NameValue}
