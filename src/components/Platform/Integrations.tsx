import {integrations} from "@stabilitydao/stability";

const Integrations = () => {

  return (
    <div>
      <h1>Integrations</h1>

      <table>
        <thead>
        <tr>
          <td className="px-4 text-center text-sm font-bold">Organization</td>
          <td className="px-4 text-center text-sm font-bold">Links</td>
          <td className=" text-sm font-bold">Protocol</td>
          <td className=" text-sm font-bold">Category</td>
          <td className=" text-sm font-bold">Chains</td>
          <td className=" text-sm font-bold">Usage</td>
        </tr>
        </thead>
        <tbody>
        {Object.keys(integrations).map((org: string) => {
          const organization = integrations[org]
          return Object.keys(organization.protocols).map(p => {
            const protocol = organization.protocols[p]
            return (
              <tr>
                <td className="px-4">
                  <div className="flex items-center py-2">
                    <img
                      className="w-[32px]"
                      src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${organization.img}`} alt={organization.name}
                    />
                    <span className="ml-2">{organization.name}</span>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center">
                    <a href={organization.website} className="hover:bg-gray-700 p-2"
                       target="_blank" title="Go to organization's website">
                      <img src="/icons/web.svg" alt="Website" className="w-[20px]"/>
                    </a>
                    {organization.github ?
                      <a href={`https://github.com/${organization.github}`} className="hover:bg-gray-700 p-2"
                         target="_blank" title="Go to organization's guthub">
                        <img src="/icons/github.svg" alt="Github" className="w-[20px]"/>
                      </a>
                      : <span className="w-[22px] m-2"/>
                    }
                    {organization.defiLlama ?
                      <a href={`https://defillama.com/protocol/${organization.defiLlama}`} className="hover:bg-gray-700 p-2"
                         target="_blank" title="Go to Defillama">
                        <img src="/icons/defillama.svg" alt="DefiLlama" className="w-[20px]"/>
                      </a>
                      : <span className="w-[22px] m-2"/>
                    }
                  </div>

                </td>
                <td>{protocol.name}</td>
                <td>{protocol.category}</td>
                <td className="text-right">{protocol.networks.length}</td>
                <td>

                </td>
              </tr>
            )
          })
        })}
        </tbody>
      </table>
    </div>
  )
}


export {Integrations}
