import { getStrategyProtocols, StrategyShortId } from "@stabilitydao/stability";

interface IProps {
  strategies: string[];
}

const MetaVaultStrategies: React.FC<IProps> = ({ strategies }) => {
  const protocols =
    strategies?.flatMap((cur) =>
      getStrategyProtocols(cur as StrategyShortId)
    ) ?? [];

  const strategiesData = Array.from(
    new Map(protocols.map((item) => [item.name, item])).values()
  );

  return (
    <div className="py-1 px-2 flex items-center">
      {strategiesData.map((strategy) => (
        <img
          key={strategy.name}
          src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${strategy.img}`}
          alt={strategy.name}
          title={strategy.name}
          className="h-4 w-4 rounded-full bg-[#252528]"
        />
      ))}
    </div>
  );
};

export { MetaVaultStrategies };
