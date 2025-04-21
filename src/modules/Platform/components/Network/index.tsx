import { useStore } from "@nanostores/react";

import { type ApiMainReply } from "@stabilitydao/stability";

import { Breadcrumbs, HeadingText } from "@ui";

import { apiData } from "@store";

import { shortMachineId } from "./Node";
import {getShortAddress} from "@utils";
import {NodeState} from "@stabilitydao/stability/out/api.types";

const shortServiceName = (service: string): string => {
  return service.replace(/ v([0-9a-z\.\-]+)$/, " $1");
};

export const formatLifeTime = (lifetime: number): string => {
  if (lifetime < 60) {
    return `${lifetime} secs`
  }
  if (lifetime < 3600) {
    return `${Math.floor(lifetime / 60)} mins`
  }
  if (lifetime < 86400) {
    return `${Math.floor(lifetime / 3600)} hours`
  }
  return `${Math.floor(lifetime / 86400)} days ${Math.floor((lifetime - Math.floor(lifetime / 86400) * 86400) / 3600)} hours`
}

const Network = (): JSX.Element => {
  const $apiData: ApiMainReply = useStore(apiData);

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <Breadcrumbs links={["Platform", "Network"]} />

      <HeadingText text="Network" scale={1} />

      <HeadingText text="Nodes" scale={2} styles="mb-7" />

      <div className="flex items-stretch justify-center flex-wrap gap-4">
        {Object.keys($apiData?.network.nodes || [])
          .filter((machineId: string) => ((new Date()).getTime() / 1000) - Number($apiData.network.nodes[machineId]?.lastSeen) < 86400 * 2)
          .map((machineId) => {
          const node: NodeState = $apiData?.network.nodes[machineId]
          const isOnline = !!(node?.lastSeen && ((new Date()).getTime() / 1000) - node.lastSeen < 180)
          // @ts-ignore
          return (
            <a
              key={machineId}
              href={`/network/${machineId}`}
              className="flex flex-col hover:bg-accent-800 bg-accent-900 rounded-2xl"
            >
              {node.seedNode ? (
                <div className="flex items-center text-[20px] py-2 px-5 bg-cyan-900 rounded-t-2xl justify-between">
                  <span>{node.hostname ?? shortMachineId(machineId)}</span>
                  <span>
                    {isOnline ? (
                      <div className="inline-flex w-[12px] h-[12px] rounded-full bg-green-600"></div>
                    ) : (
                      <div className="inline-flex w-[12px] h-[12px] rounded-full bg-yellow-600"></div>
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-[20px] py-2 px-5 bg-transparent rounded-t-2xl justify-between">
                  <span className="text-gray-400">{node.hostname ?? shortMachineId(machineId)}</span>
                  <span>
                    {isOnline ? (
                      <div className="inline-flex w-[12px] h-[12px] rounded-full bg-green-600"></div>
                    ) : (
                      <div className="inline-flex w-[12px] h-[12px] rounded-full bg-yellow-600"></div>
                    )}
                  </span>
                </div>
              )}

              {isOnline ?
                <div className="flex flex-col text-[14px] px-6 pt-4">
                  <span>Lifetime: {formatLifeTime(node.lifetime)}</span>
                </div>
                :
                <div className="flex flex-col text-[14px] px-6 pt-4">
                  <span>Last seen: {formatLifeTime((new Date().getTime() / 1000) - Number(node?.lastSeen))} ago</span>
                </div>
              }

              <div className="flex flex-col px-6 pt-4 text-[14px]">
                {node.about}
              </div>

              <div className="flex flex-col p-6 pt-4">
                <div className="flex-col text-[14px]">
                  {node.services.filter(s => !s.name.match(/network|api/i)).map((service) => (
                    <div key={service.name} className="flex items-center gap-2 w-[200px]">
                      {shortServiceName(service.name)} {service.id && <span className="text-[12px] text-accent-300">{getShortAddress(service.id, 6, 4)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </a>
          )
          }
        )}
      </div>
    </div>
  );
};

export {Network};
