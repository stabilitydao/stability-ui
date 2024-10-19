import { strategies } from "@stabilitydao/stability";

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
          <HeadingText text={strategyId.toUpperCase()} scale={2} />
          <p>{strategy.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <StrategyStatus state={strategy.state as TStrategyState} />
          <a
            className="inline-flex"
            href={`https://github.com/stabilitydao/stability-contracts/issues/${strategy.contractGithubId}`}
            target="_blank"
            title="Go to strategy issue page on Github"
          >
            <img src="/icons/github.svg" alt="Github" className="w-[20px]" />
          </a>
        </div>
      </div>
    </div>
  );
};

export { Strategy };
