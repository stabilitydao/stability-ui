import {AgentId, type ApiMainReply, getAgent, status} from "@stabilitydao/stability";
import {IOperatorAgent} from "@stabilitydao/stability/out/agents";
import {useStore} from "@nanostores/react";
import {apiData} from "@store";

const StabilityOperator  = (): JSX.Element => {
  const agent: IOperatorAgent = getAgent("OPERATOR" as AgentId) as IOperatorAgent;
  const $apiData: ApiMainReply | undefined = useStore(apiData);
  console.log($apiData?.network)

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <h1>🏗️🚧 {agent.name}</h1>

      <div className="flex w-full flex-wrap gap-[20px] mb-[50px]">

        <div className="flex flex-col rounded-xl w-full bg-[#111114] border border-[#232429]">
          <div className="flex p-[20px] font-bold rounded-t-xl  bg-[#202027]">Status</div>
          <div className="flex p-[20px] flex-col">
            <pre className="text-[14px]" dangerouslySetInnerHTML={{__html: $apiData?.statusString?.replace(/\n\n/g, '\n')}}>
            </pre>
          </div>
        </div>

        <div className="flex flex-col rounded-xl lg:w-[280px] bg-[#111114] border border-[#232429]">
          <div className="flex p-[20px] font-bold rounded-t-xl bg-[#202027]">Tokenization</div>
          <div className="flex p-[20px] flex-col gap-[10px]">
            <div className="flex w-full items-center">
              <img
                className="w-[32px] h-[32px] mr-[10px]"
                src={`https://raw.githubusercontent.com/stabilitydao/.github/main/tokens/${agent.image}`}
                alt={agent.name}
              />
              <span className="font-bold">OPERATOR</span>
            </div>
            <div className="flex">
              <span className="flex px-[16px] py-[10px] rounded-xl bg-[#1f2b69]">📆 {agent.tokenization}</span>
            </div>
          </div>
        </div>



      </div>
    </div>
  )
}
export {StabilityOperator};
