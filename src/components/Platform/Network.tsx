import {type ApiMainReply} from "@stabilitydao/stability";
import {useStore} from "@nanostores/react";
import {apiData} from "@store";

const Network = () => {
  const $apiData: ApiMainReply = useStore(apiData);

  return (
    <div>
      <h1>Network</h1>

      <h2 className="mb-5">Nodes</h2>

      <div className="flex flex-wrap gap-4">
        {Object.keys($apiData?.network.nodes || []).map(machineId => {
          return (
            <a href={`/network/${machineId}`} className="flex flex-col hover:bg-gray-900 p-6">
              <div>{machineId}</div>
              <div className="flex flex-col">
                <div className="text-[12px] font-bold">Services</div>
                <div className="flex-col">
                  {$apiData.network.nodes[machineId].services.map(s => {
                    return (
                      <div className="flex">{s.name}</div>
                    )
                  })}
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export {Network}