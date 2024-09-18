import { networks } from "@stabilitydao/stability";

const Chains = (): JSX.Element => {
  return (
    <div>
      <h1>Chains</h1>

      <table>
        <thead>
          <tr>
            <td>ChainId</td>
            <td>Name</td>
            <td>Status</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(networks).map(([chainId, { id, status }]) => (
            <tr key={chainId}>
              <td>{chainId}</td>
              <td>{id}</td>
              <td>{status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Chains };
