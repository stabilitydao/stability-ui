import { formatNumber } from "@utils";
import { IBuilderAgent } from "@stabilitydao/stability";
import { AgentId, getAgent } from "@stabilitydao/stability";
import {
  IBuilderMemory,
  IConveyor,
  IPool,
} from "@stabilitydao/stability/out/builder";
import { useEffect, useState } from "react";
import axios from "axios";

const StabilityBuilder = (): JSX.Element => {
  const agent: IBuilderAgent = getAgent("BUILDER" as AgentId) as IBuilderAgent;
  const [builderMemory, setBuilderMemory] = useState<IBuilderMemory>();

  const loadBuilderMemory = async () => {
    try {
      const response = await axios.get(
        `https://builder.stability.farm/api/builder-memory`
      );

      if (response.data) {
        setBuilderMemory(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadBuilderMemory();
  }, []);

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <h1>🏗️🚧 {agent.name}</h1>

      <div className="flex w-full flex-wrap gap-[20px] mb-[50px]">
        <div className="flex flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]">
          <div className="flex p-[20px] font-bold rounded-t-xl bg-[#202027]">
            Burn rate
          </div>
          <div className="flex p-[20px] text-[14px]">
            <table>
              <tbody>
                {agent.burnRate.map(
                  (value: { period: string; usdAmount: number }) => (
                    <tr key={value.period}>
                      <td className="min-w-[160px]">{value.period}</td>
                      <td className="text-right">
                        {formatNumber(value.usdAmount, "abbreviate")}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]">
          <div className="flex p-[20px] font-bold rounded-t-xl  bg-[#202027]">
            Repositories
          </div>
          <div className="flex p-[20px] flex-col">
            {agent.repo.map((value: string) => (
              <div
                key={value}
                className="flex items-center text-[14px] justify-between"
              >
                <a
                  title="Go to repo"
                  target="_blank"
                  href={`https://github.com/${value}`}
                  className="flex"
                >
                  {value.replace("stabilitydao/", "")}
                </a>
                <a
                  title="Go to issues"
                  target="_blank"
                  href={`https://github.com/${value}/issues`}
                >
                  {builderMemory?.openIssues.total[value]}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]">
          <div className="flex p-[20px] font-bold rounded-t-xl bg-[#202027]">
            Tokenization
          </div>
          <div className="flex p-[20px] flex-col gap-[10px]">
            <div className="flex w-full items-center">
              <img
                className="w-[32px] h-[32px] mr-[10px]"
                src={`https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/${agent.image}`}
                alt={agent.name}
              />
              <span className="font-bold">BUILDER</span>
            </div>
            <div className="flex">
              <span className="flex px-[16px] py-[10px] rounded-xl bg-[#1f2b69]">
                📆 {agent.tokenization}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-[24px] font-bold mb-[10px]">Pools</h2>
      <div className="flex w-full flex-wrap gap-[20px] mb-[50px]">
        {agent.pools.map((value: IPool) => (
          <div
            key={value.name}
            className="flex flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]"
          >
            <div className="flex p-[20px] font-bold rounded-t-xl bg-[#202027]">
              {value.name}
            </div>
            <div className="flex p-[20px]">🚧</div>
          </div>
        ))}
      </div>

      <h2 className="text-[24px] font-bold mb-[10px]">Conveyors</h2>
      <div className="flex flex-col w-full mb-[50px] gap-[20px]">
        {agent.conveyors.map((conveyor: IConveyor) => (
          <div
            key={conveyor.name}
            className="flex flex-col bg-[#111114] border border-[#232429]"
          >
            <div className="flex p-[20px] gap-[20px] font-bold bg-[#202027]">
              {conveyor.name}
            </div>
            <div className="flex belt flex-nowrap justify-between  p-[20px]">
              {conveyor.steps.map((step, index) => (
                <div
                  key={`${step.name}/${conveyor.name}/${index}`}
                  className="flex flex-col"
                >
                  <div>{step.name}</div>
                  <div>🚧</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex mt-[100px]"> </div>
    </div>
  );
};
export { StabilityBuilder };
