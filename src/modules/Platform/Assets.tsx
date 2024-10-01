import { assets } from "@stabilitydao/stability";

import { Breadcrumbs } from "@ui";

const Assets = (): JSX.Element => {
  return (
    <div className="">
      <Breadcrumbs links={["Platform", "Assets"]} />

      <h1>Assets</h1>

      <table className="w-full">
        <thead>
          <tr>
            <td>Symbol</td>
            <td>Website</td>
            <td>Addresses</td>
          </tr>
        </thead>
        <tbody>
          {assets.map(({ addresses, symbol, website }) => (
            <tr key={website}>
              <td>{symbol}</td>
              <td>
                <a href={website} target="_blank" title="Go to asset website">
                  <img
                    src="/icons/web.svg"
                    alt="Website"
                    className="w-[20px]"
                  />
                </a>
              </td>
              <td>{Object.keys(addresses).length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Assets };
