import { useStore } from "@nanostores/react";

import { type ApiMainReply } from "@stabilitydao/stability";

import { apiData } from "@store";

const Network = (): JSX.Element => {
  const $apiData: ApiMainReply = useStore(apiData);

  return (
    <div>
      <h1>Network</h1>

      <h2 className="mb-5">Nodes</h2>

      <div className="flex flex-wrap gap-4">
        {Object.keys($apiData?.network.nodes || []).map((machineId) => (
          <a
            key={machineId}
            href={`/network/${machineId}`}
            className="flex flex-col hover:bg-gray-900 p-6"
          >
            <div>{machineId}</div>
            <div className="flex flex-col">
              <div className="text-[12px] font-bold">Services</div>
              <div className="flex-col">
                {$apiData.network.nodes[machineId].services.map((service) => (
                  <div key={service.name} className="flex">
                    {service.name}
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
