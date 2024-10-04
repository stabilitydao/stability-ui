import { assets } from "@stabilitydao/stability";

import { Breadcrumbs } from "@ui";

const Assets = (): JSX.Element => {
  return (
    <div className="">
      <Breadcrumbs links={["Platform", "Assets"]} />

      <h1>Assets</h1>

      <table className="font-manrope w-full">
        <thead className="bg-[#130932] text-[#958CA1] h-[36px]">
          <tr className="text-[12px] uppercase">
            <td className="px-4 py-2">Symbol</td>
            <td className="px-4 py-2">Website</td>
            <td className="px-4 py-2">Addresses</td>
          </tr>
        </thead>
        <tbody className="text-[14px]">
          {assets.map(({ addresses, symbol, website }) => (
            <tr className="h-[48px] hover:bg-[#130932]" key={website}>
              <td className="px-4 py-3">{symbol}</td>
              <td className="px-4 py-3 ">
                <a
                  className="flex items-center justify-center"
                  href={website}
                  target="_blank"
                  title="Go to asset website"
                >
                  <img
                    src="/icons/web.svg"
                    alt="Website"
                    className="w-[20px]"
                  />
                </a>
              </td>
              <td className="px-4 py-3 text-end">
                {Object.keys(addresses).length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Assets };
