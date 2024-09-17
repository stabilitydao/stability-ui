import {type ApiMainReply} from "@stabilitydao/stability";
import {useStore} from "@nanostores/react";
import {apiData} from "@store";
import type {NodeState} from "@stabilitydao/stability/out/api.types";

interface IProps {
  machineIdHash: string;
}

const Node : React.FC<IProps> = ({ machineIdHash, }) => {
  const $apiData: ApiMainReply = useStore(apiData);
  const nodeState: NodeState|undefined = $apiData?.network.nodes[machineIdHash]

  return (
    <div>
      <h1>Node {machineIdHash}</h1>

      <div className="flex flex-col">
        <div className="flex flex-col mb-5">
          <div className="text-[12px] font-bold">Machine ID hash</div>
          <div>{machineIdHash}</div>
        </div>
        <div className="flex flex-col mb-5">
          <div className="text-[12px] font-bold">About</div>
          <div>{nodeState?.about}</div>
        </div>
        <div className="flex flex-col mb-5">
          <div className="text-[12px] font-bold">Services</div>
          <div className="flex-col">
            {nodeState?.services.map(s => {
              return (
                <div className="flex">{s.name}</div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

export {Node}