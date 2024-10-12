import type { DefiCategory } from "@stabilitydao/stability";

type TProps = {
  name: string;
  category: DefiCategory;
  supportedChains: number;
};

const ProtocolBadge: React.FC<TProps> = ({
  name,
  category,
  supportedChains,
}) => {
  return (
    <div className="inline-flex bg-blue-950 self-start h-[36px] items-center rounded-2xl my-2 px-2">
      <span className="flex px-3 border-r-2 min-w-[104px] 16px">
        {category}
      </span>
      <span className="flex px-3 border-r-2 min-w-[160px]">{name}</span>
      <span className="flex px-3 min-w-[50px] justify-center">
        {supportedChains}
      </span>
    </div>
  );
};

export { ProtocolBadge };
