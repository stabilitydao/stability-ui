import {getStrategyProtocols, integrations, strategies, strategyStateDescription} from "@stabilitydao/stability";

import type { Strategy, StrategyShortId } from "@stabilitydao/stability";

import { Breadcrumbs, HeadingText } from "@ui";

import { StrategyStatus } from "../../ui";

import type { TStrategyState } from "@types";

interface IProps {
  strategyId: string;
}

const Strategy: React.FC<IProps> = ({ strategyId }) => {
  const strategy: Strategy =
    strategies[strategyId.toUpperCase() as keyof typeof StrategyShortId] || {};
  return (
    <div className="flex flex-col lg:w-[960px] xl:min-w-[1200px]">
      <Breadcrumbs
        links={["Platform", "Strategies", strategyId.toUpperCase()]}
      />

      <div className="flex flex-col items-center gap-5">
        <div>
          <HeadingText text={strategyId.toUpperCase()} scale={2}/>
          <p>Strategy {strategy.id}</p>
        </div>
        <div className="flex flex-col items-start w-full">
          <h2>State</h2>
          <div className="flex flex-col gap-2 mt-2">
            <StrategyStatus state={strategy.state as TStrategyState}/>
            <span className="text-[14px]">{strategyStateDescription[strategy.state]}</span>
          </div>

        </div>

        <div className="flex flex-col items-start w-full">
          <h2>Contract development issue</h2>
          <a
            className="inline-flex items-center gap-2"
            href={`https://github.com/stabilitydao/stability-contracts/issues/${strategy.contractGithubId}`}
            target="_blank"
            title="Go to strategy issue page on Github"
          >
            <img src="/icons/github.svg" alt="Github" className="w-[20px]"/>
            <span>#{strategy.contractGithubId}</span>
          </a>
        </div>

        <div className="flex flex-col items-start w-full">
          <h2>Base strategies</h2>
          <div className="flex flex-col">
            {strategy.baseStrategies.map(b => <span>{b}</span>)}
          </div>
        </div>

        <div className="flex flex-col items-start w-full">
          <h2>Protocols</h2>
          <div className="flex flex-col">
            {getStrategyProtocols(strategy.shortId).map(b => <span className="flex items-center gap-2">
              <img className="w-[28px] h-[28px]" src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${b.img || integrations[b.organization as string].img}`} alt=""/>{b.name}
            </span>)}
          </div>
        </div>

        {strategy.description &&
            <div className="flex flex-col items-start w-full">
                <h2>Description</h2>
                <span>{strategy.description}</span>
            </div>
        }

      </div>
    </div>
  );
};

export {Strategy};
