import { assets } from "@stabilitydao/stability";

const Assets = (): JSX.Element => {
  return (
    <div className="">
      <div className="flex mb-5 text-[14px] text-gray-300"><a href="/platform" className="mr-2 font-bold">Platform</a> - <span className="ml-2">Assets</span></div>

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
        {assets.map(({addresses, symbol, website}) => (
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

export {Assets};
