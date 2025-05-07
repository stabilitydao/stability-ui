import { type ApiMainReply } from "@stabilitydao/stability";
import { useStore } from "@nanostores/react";

import { apiData } from "@store";

import type { NodeState } from "@stabilitydao/stability/out/api.types";
import { formatLifeTime } from "./index.tsx";

const shortMachineId = (machineId: string): string => {
  return `${machineId.slice(0, 4)}...${machineId.slice(-4)}`;
};

interface IProps {
  machineIdHash: string;
}

const Node: React.FC<IProps> = ({ machineIdHash }) => {
  const $apiData: ApiMainReply = useStore(apiData);
  const nodeState: NodeState | undefined =
    $apiData?.network.nodes[machineIdHash];
  const isOnline = !!(
    nodeState?.lastSeen &&
    new Date().getTime() / 1000 - nodeState.lastSeen < 180
  );

  return (
    <div className="max-w-[1200px] w-full xl:min-w-[1200px]">
      <h1>Node {shortMachineId(machineIdHash)}</h1>

      <div className="flex flex-col">
        <div className="flex flex-col mb-5">
          <div className="text-[12px] font-bold">Machine ID hash</div>
          <div>{machineIdHash}</div>
        </div>
        {nodeState?.hostname && (
          <div className="flex flex-col mb-5">
            <div className="text-[12px] font-bold">Hostname</div>
            <div>{nodeState.hostname}</div>
          </div>
        )}
        {nodeState?.seedNode && (
          <div className="flex mb-5">
            <div className="text-[16px]  font-bold bg-green-900 inline-flex px-5 py-2 rounded-2xl">
              Seed node
            </div>
          </div>
        )}

        {isOnline ? (
          <div className="flex flex-col mb-5">
            <div className="text-[12px] font-bold">Lifetime</div>
            <div>{formatLifeTime(nodeState.lifetime)}</div>
          </div>
        ) : (
          <div className="flex flex-col mb-5">
            <div className="text-[12px] font-bold">Last seen</div>
            <div>
              {formatLifeTime(
                new Date().getTime() / 1000 - Number(nodeState?.lastSeen)
              )}{" "}
              ago
            </div>
          </div>
        )}

        <div className="flex flex-col mb-5">
          <div className="text-[12px] font-bold">About</div>
          <div>{nodeState?.about}</div>
        </div>
        <div className="flex flex-col mb-5">
          <div className="text-[12px] font-bold">Services</div>
          <div className="flex-col">
            {nodeState?.services.map((service) => (
              <div
                key={service.name}
                className="flex flex-col p-5 bg-gray-900 rounded-2xl mb-7"
              >
                <div>{service.name}</div>
                {service.stat && (
                  <div className="text-[12px] bg-black p-4 mt-4">
                    <pre>{JSON.stringify(service.stat, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Node, shortMachineId };
