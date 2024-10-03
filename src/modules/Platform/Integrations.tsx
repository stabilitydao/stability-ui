import { DefiCategory, integrations } from "@stabilitydao/stability";

import { Breadcrumbs } from "@ui";

const ProtocolBadge: React.FC<{
  name: string;
  category: DefiCategory;
  supportedChains: number;
}> = ({ name, category, supportedChains }) => {
  let categoryFont = "text-[16px]";
  return (
    <div className="inline-flex bg-blue-950 self-start h-[36px] items-center rounded-2xl my-2 px-2">
      <span className={`flex px-3 border-r-2 min-w-[104px] ${categoryFont}`}>
        {category}
      </span>
      <span className="flex px-3 border-r-2 min-w-[160px]">{name}</span>
      <span className="flex px-3 min-w-[50px] justify-center">
        {supportedChains}
      </span>
    </div>
  );
};

const Integrations = (): JSX.Element => {
  return (
    <div>
      <Breadcrumbs links={["Platform", "Integrations"]} />

      <h1>Integrations</h1>

      <table className="w-full font-manrope">
        <thead className="bg-[#130932] text-[#958CA1] h-[36px]">
          <tr className="text-[12px] font-bold uppercase">
            <td className="px-4 py-2 text-center">Organization</td>
            <td className="px-4 py-2 text-center">Links</td>
            <td className="px-4 py-2">Protocols</td>
            <td className="px-4 py-2">Usage</td>
          </tr>
        </thead>
        <tbody className="text-[14px]">
          {Object.entries(integrations).map(([, organization]) => (
            <tr className="h-[48px] hover:bg-[#130932]" key={organization.name}>
              <td className="px-4 py-3">
                <div className="flex items-center py-2">
                  <img
                    className="w-[32px]"
                    src={`https://raw.githubusercontent.com/stabilitydao/.github/main/assets/${organization.img}`}
                    alt={organization.name}
                  />
                  <span className="ml-2">{organization.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <a
                    href={organization.website}
                    className="hover:bg-gray-700 p-2"
                    target="_blank"
                    title="Go to organization's website"
                  >
                    <img
                      src="/icons/web.svg"
                      alt="Website"
                      className="w-[20px]"
                    />
                  </a>
                  {organization.github ? (
                    <a
                      href={`https://github.com/${organization.github}`}
                      className="hover:bg-gray-700 p-2"
                      target="_blank"
                      title="Go to organization's guthub"
                    >
                      <img
                        src="/icons/github.svg"
                        alt="Github"
                        className="w-[20px]"
                      />
                    </a>
                  ) : (
                    <span className="w-[22px] m-2" />
                  )}
                  {organization.defiLlama ? (
                    <a
                      href={`https://defillama.com/protocol/${organization.defiLlama}`}
                      className="hover:bg-gray-700 p-2"
                      target="_blank"
                      title="Go to Defillama"
                    >
                      <img
                        src="/icons/defillama.svg"
                        alt="DefiLlama"
                        className="w-[20px]"
                      />
                    </a>
                  ) : (
                    <span className="w-[22px] m-2" />
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  {Object.keys(organization.protocols).map((propocolId) => (
                    <ProtocolBadge
                      key={propocolId}
                      name={organization.protocols[propocolId].name}
                      category={organization.protocols[propocolId].category}
                      supportedChains={
                        organization.protocols[propocolId].chains.length
                      }
                    />
                  ))}
                </div>
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Integrations };
