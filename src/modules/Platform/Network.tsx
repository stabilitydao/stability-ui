import { useStore } from "@nanostores/react";

import { type ApiMainReply } from "@stabilitydao/stability";

import { apiData } from "@store";
import { shortMachineId } from "./Node.tsx";

const shortServiceName = (service: string): string => {
  return service.replace(/ v[0-9a-z\.\-]+$/, "");
};

const Network = (): JSX.Element => {
  const $apiData: ApiMainReply = useStore(apiData);

  return (
    <div>
      <div className="flex mb-5 text-[14px] text-gray-300">
        <a href="/platform" className="mr-2 font-bold">
          Platform
        </a>{" "}
        - <span className="ml-2">Network</span>
      </div>

      <h1>Network</h1>

      <h2 className="mb-5">Nodes</h2>

      <div className="flex flex-wrap gap-4">
        {Object.keys($apiData?.network.nodes || []).map((machineId) => (
          <a
            key={machineId}
            href={`/network/${machineId}`}
            className="flex flex-col hover:bg-gray-800 bg-gray-900 rounded-2xl"
          >
            <div className="text-[20px] p-6 pb-0">
              {shortMachineId(machineId)}
            </div>
            <div className="flex flex-col p-6 pt-4">
              <div className="flex-col">
                {$apiData.network.nodes[machineId].services.map((service) => (
                  <div key={service.name} className="flex w-[200px]">
                    {shortServiceName(service.name)}
                  </div>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export { Network };
