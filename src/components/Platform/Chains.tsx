import {networks} from "@stabilitydao/stability";

const Chains = () => {

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
        {Object.keys(networks).map((chainId) => {
          const network = networks[chainId]
          return (
            <tr>
              <td>{network.chainId}</td>
              <td>{network.id}</td>
              <td>{network.status}</td>
            </tr>
          )
        })}
        </tbody>
      </table>
    </div>
  )
}

export {Chains}