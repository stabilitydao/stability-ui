import {
  getStrategyProtocols,
  StrategyShortId,
  strategies,
} from "@stabilitydao/stability";

interface IProps {
  strategiesIDs: string[];
}

const MetaVaultStrategies: React.FC<IProps> = ({ strategiesIDs }) => {
  const protocols =
    strategiesIDs?.flatMap((id) =>
      getStrategyProtocols(id as StrategyShortId)
    ) ?? [];

  const strategyImgMap = protocols.reduce<Record<string, string>>(
    (acc, protocol) => {
      protocol.strategies?.forEach((sId) => {
        acc[sId] = protocol.img;
      });
      return acc;
    },
    {}
  );

  const _strategies = strategiesIDs.map((id) => ({
    ...strategies[id],
    img: strategyImgMap[id],
  }));

  return (
    <div className="flex items-center gap-2">
      {_strategies.map((strategy, index) => (
        <div
          key={strategy.id + index}
          style={{
            backgroundColor: strategy.bgColor + "66",
            border: `1px solid ${strategy.bgColor}`,
          }}
          className="px-1 rounded-[4px] h-6 flex items-center gap-1 text-[12px]"
        >
          <span
            style={{
              color: strategy.color,
            }}
            title={strategy.id}
          >
            {strategy.shortId}
          </span>

          <img
            className="rounded-full w-4 h-4"
            src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${strategy.img}`}
            alt={strategy.id}
            title={strategy.id}
          />
        </div>
      ))}
    </div>
  );
};

export { MetaVaultStrategies };
