import {
  getStrategyProtocols,
  integrations,
  type StrategyShortId,
} from "@stabilitydao/stability";

interface IProps {
  id: StrategyShortId;
  bgColor: string;
  color: string;
}

const ProtocolsChip: React.FC<IProps> = ({ id, bgColor, color }) => {
  return (
    <div
      className="flex items-center justify-between whitespace-nowrap rounded-[10px] h-8 max-w-[200px]"
      style={{
        backgroundColor: bgColor,
        color: color,
      }}
    >
      <span className="flex justify-center rounded-[10px] text-[16px] font-bold w-[80px]">
        {id}
      </span>
      <div className="flex !items-center justify-start w-[100px] gap-1 h-full rounded-r-[10px]">
        {getStrategyProtocols(id as StrategyShortId).map((protocol) => (
          <img
            key={protocol.name}
            className="w-6 h-6"
            src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${protocol.img || integrations[protocol.organization as string].img}`}
            alt=""
          />
        ))}
      </div>
    </div>
  );
};

export { ProtocolsChip };
