import {formatNumber} from "@utils";
import {IBuilderAgent} from "@stabilitydao/stability/out/agents";
import {AgentId, getAgent} from "@stabilitydao/stability";

const StabilityBuilder  = (): JSX.Element => {
  const builderAgent: IBuilderAgent = getAgent("BUILDER" as AgentId) as IBuilderAgent;


  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <h1>🏗️🚧 Stability Builder</h1>

      <div className="flex w-full flex-wrap gap-[20px] mb-[50px]">

        <div className="flex flex-col rounded-xl lg:w-[300px]">
          <div className="flex p-2 font-bold bg-accent-800">Burn rate</div>
          <div className="flex p-2 text-[14px] bg-accent-900">
            {builderAgent.burnRate.map(value => (
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

        <div className="flex flex-col rounded-xl lg:w-[300px]">
          <div className="flex p-2 font-bold bg-accent-800">Repositories</div>
          <div className="flex p-2 flex-col bg-accent-900">
            {builderAgent.repo.map(value => (
              <a title="Go to repo" target="_blank" href={`https://github.com/${value}`} className="flex text-[14px]">{value}</a>
            ))}
          </div>
        </div>

        <div className="flex flex-col rounded-xl lg:w-[300px]">
          <div className="flex p-2 font-bold bg-accent-800">Tokenization</div>
          <div className="flex p-2 bg-accent-900">
            {builderAgent.tokenization}
          </div>
        </div>


      </div>

      <h2>Pools</h2>
      <div className="flex w-full mb-[50px]">
      </div>

      <h2>Conveyors</h2>
      <div className="flex w-full mb-[50px]">
      </div>


    </div>
  )
}
export {StabilityBuilder};
