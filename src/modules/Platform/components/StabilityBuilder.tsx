import {formatNumber} from "@utils";
import {IBuilderAgent} from "@stabilitydao/stability/out/agents";
import {AgentId, getAgent} from "@stabilitydao/stability";
import {IConveyor, IPool} from "@stabilitydao/stability/out/builder";

const StabilityBuilder  = (): JSX.Element => {
  const builderAgent: IBuilderAgent = getAgent("BUILDER" as AgentId) as IBuilderAgent;


  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <h1>🏗️🚧 Stability Builder</h1>

      <div className="flex w-full flex-wrap gap-[20px] mb-[50px]">

        <div className="flex flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]">
          <div className="flex p-[20px] font-bold rounded-t-xl bg-[#202027]">Burn rate</div>
          <div className="flex p-[20px] text-[14px]">
            {builderAgent.burnRate.map((value: IBuilderAgent) => (
              <div>
                <table>
                  <tbody>
                  <tr>
                    <td className="min-w-[160px]">{value.period}</td>
                    <td>{formatNumber(value.usdAmount, "abbreviate")}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]">
          <div className="flex p-[20px] font-bold rounded-t-xl  bg-[#202027]">Repositories</div>
          <div className="flex p-[20px] flex-col">
            {builderAgent.repo.map((value: string) => (
              <a title="Go to repo" target="_blank" href={`https://github.com/${value}`} className="flex text-[14px]">{value}</a>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]">
          <div className="flex p-[20px] font-bold rounded-t-xl bg-[#202027]">Tokenization</div>
          <div className="flex p-[20px]">
            {builderAgent.tokenization}
          </div>
        </div>
      </div>

      <h2 className="text-[24px] font-bold mb-[10px]">Pools</h2>
      <div className="flex w-full flex-wrap gap-[20px] mb-[50px]">
        {builderAgent.pools.map((value: IPool) => (
          <div className="flex flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]">
            <div className="flex p-[20px] font-bold rounded-t-xl bg-[#202027]">{value.name}</div>
            <div className="flex p-[20px]">
              🚧
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-[24px] font-bold mb-[10px]">Conveyors</h2>
      <div className="flex flex-col w-full mb-[50px] gap-[20px]">
        {builderAgent.conveyors.map((conveyor: IConveyor) => (
          <div className="flex flex-col bg-[#111114] border border-[#232429]">
            <div className="flex p-[20px] gap-[20px] font-bold bg-[#202027]">{conveyor.name}</div>
            <div className="flex belt flex-nowrap justify-between  p-[20px]">
              {conveyor.steps.map((step) => (
                <div className="flex flex-col">
                  <div>
                    {step.name}
                  </div>
                  <div>
                    🚧
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex mt-[100px]"> </div>
    </div>
  )
}
export {StabilityBuilder};
