import { chains } from "@stabilitydao/stability";

const shortAddr = (m: string): string => {
  return `${m.slice(0, 4)}...${m.slice(-2)}`
}

const ChainStatus: React.FC<{
  status: string
}> = ({status}) => {
  let bg = 'bg-gray-800'
  let text = 'text-white'
  if (status === "SUPPORTED") {
    bg = 'bg-green-800'
  } else if (status === "AWAITING_DEPLOYMENT") {
    bg = 'bg-violet-800'
  }

  return (
    <span className={`inline-flex text-[12px] px-3 py-1 rounded-2xl justify-center w-[160px] whitespace-nowrap ${bg} ${text}`}>
      {
        status
          .replace('AWAITING_DEPLOYMENT', 'Awaiting deployment')
          .replace('NOT_SUPPORTED', 'Not supported')
          .replace('SUPPORTED', 'Supported')
      }
    </span>
  )
}

const Chains = (): JSX.Element => {
  return (
    <div>
      <h1>Chains</h1>

      <table>
        <thead>
          <tr className="text-[14px] font-bold">
            <td>Chain</td>
            <td className="px-3 text-center">ID</td>
            <td className="px-3">Multisig</td>
            <td className="px-3">Issue</td>
            <td className="px-3 text-center">Status</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(chains).map(([chainId, { name, status, img, multisig, chainLibGithubId }]) => (
            <tr key={chainId}>
              <td className="py-1">
                <div className="flex items-center">
                  {img &&
                      <img
                          src={`https://raw.githubusercontent.com/stabilitydao/.github/main/chains/${img}`}
                          alt={name}
                          className="w-[24px] h-[24px] mr-2"
                      />
                  }
                  {name}
                </div>
              </td>
              <td className="px-3 text-center text-[14px] font-bold">{chainId}</td>
              <td className="px-3 text-[12px]">
                <div className="flex">
                  {multisig &&
                      <span>{shortAddr(multisig)}</span>
                  }
                </div>
              </td>
              <td>
                <div className="flex items-center justify-center">
                  {chainLibGithubId &&
                      <a
                          className="inline-flex"
                          href={`https://github.com/stabilitydao/stability-contracts/issues/${chainLibGithubId}`}
                          target="_blank"
                          title="Go to chain library issue page on Github"
                      >
                          <img
                              src="/icons/github.svg"
                              alt="Github"
                              className="w-[20px]"
                          />
                      </a>
                  }
                </div>
              </td>
              <td className="px-3"><ChainStatus status={status}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export {Chains};
