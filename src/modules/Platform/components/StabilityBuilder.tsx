import { useEffect, useState } from "react";

import axios from "axios";

import { formatNumber } from "@utils";

import { Agent, getAgents } from "@stabilitydao/stability";

import {
  AgentRole,
  IBuilderMemory,
  IConveyor,
  IPool,
} from "@stabilitydao/stability/out/agents";

const StabilityBuilder = (): JSX.Element => {
  const agents: Agent[] = getAgents("BUILDER" as AgentRole) as Agent[];
  const agent = agents[0];

  const [builderMemory, setBuilderMemory] = useState<IBuilderMemory>();

  const loadBuilderMemory = async () => {
    try {
      const response = await axios.get(
        `https://builder.stability.farm/api/builder-memory`
      );

      if (response.data) {
        console.log(response.data);
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
      <h1 className="mb-[10px]">🏗️🚧 {agent.name}</h1>

      <h2 className="text-[26px] font-bold mb-[10px]">Development</h2>

      <h3 className="text-[22px] font-bold mb-[20px] text-center">Pools</h3>
      <div className="flex w-full flex-wrap gap-[20px] mb-[50px]">
        {agent.builderData.pools.map((value: IPool) => (
          <div
            key={value.name}
            className="flex w-full md:w-5/12 flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]"
          >
            <div className="flex p-[20px] font-bold rounded-t-xl bg-[#202027]">
              {value.name}
            </div>
            <div className="flex p-[20px] flex-col">
              {builderMemory?.openIssues.pools[value.name].map((issue) => {
                return (
                  <a
                    key={issue.title}
                    href={`https://github.com/${issue.repo}/issues/${issue.repoId}`}
                    target="_blank"
                    className="flex text-[14px] w-full"
                  >
                    {issue.title}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-[22px] font-bold mb-[20px] text-center">Conveyors</h3>
      <div className="flex flex-col w-full mb-[50px] gap-[20px]">
        {agent.builderData.conveyors.map((conveyor: IConveyor) => (
          <div
            key={conveyor.name}
            className="flex flex-col bg-[#111114] border border-[#232429]"
          >
            <div className="flex p-[20px] gap-[20px] font-bold bg-[#202027]">
              {conveyor.name}
            </div>
            <div className="flex flex-col md:flex-row md:flex-nowrap justify-between  p-[20px]">
              {conveyor.steps.map((step, index) => (
                <div
                  key={`${step.name}/${conveyor.name}/${index}`}
                  className="flex flex-col"
                >
                  <div className="text-[16px] mb-[4px]">{step.name}</div>
                  <div className="flex min-h-[38px]">
                    {!!builderMemory &&
                      Object.keys(builderMemory.conveyors[conveyor.name])
                        .filter((taskId) =>
                          Object.keys(
                            (builderMemory as IBuilderMemory).conveyors[
                              conveyor.name
                            ][taskId]
                          ).includes(step.name)
                        )
                        .map((taskId) => {
                          return (
                            <div
                              key={taskId}
                              className="inline-flex min-w-[70px] border-[2px] justify-center mr-[10px] rounded-lg font-bold"
                            >
                              {taskId}
                            </div>
                          );
                        })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-[50px] flex flex-col rounded-xl w-full md:w-5/12 lg:w-[280px] bg-[#111114] border border-[#232429]">
        <div className="flex p-[20px] font-bold rounded-t-xl  bg-[#202027]">
          Open issues
        </div>
        <div className="flex p-[20px] flex-col">
          {agent.builderData.repo.map((value: string) => (
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

      <h2 className="text-[26px] font-bold mb-[20px]">Agent info</h2>

      <div className="flex w-full flex-wrap gap-[20px] mb-[50px]">
        <div className="flex flex-col rounded-xl w-full md:w-5/12 lg:w-[280px] bg-[#111114] border border-[#232429]">
          <div className="flex p-[20px] font-bold rounded-t-xl bg-[#202027]">
            Burn rate
          </div>
          <div className="flex p-[20px] text-[14px]">
            <table>
              <tbody>
                {agent.builderData.burnRate.map(
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

        <div className="flex flex-col rounded-xl w-full md:w-5/12 lg:w-[280px] bg-[#111114] border border-[#232429]">
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
                📆 {agent.tokenization.eta}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex mt-[100px]"></div>
    </div>
  );
};
export { StabilityBuilder };
