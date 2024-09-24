import {getStrategiesTotals, strategies, type StrategyShortId} from "@stabilitydao/stability";

const StrategyStatus: React.FC<{
  state: string;
}> = ({ state }) => {
  let bg = "bg-gray-800";
  let text = "text-white";
  if (state === "LIVE") {
    bg = "bg-green-800";
  } else if (state === "DEPLOYMENT") {
    bg = "bg-violet-800";
  } else if (state === "DEVELOPMENT") {
    bg = "bg-blue-700";
  } else if (state === "AWAITING") {
    bg = "bg-orange-900";
  } else if (state === "BLOCKED") {
    bg = "bg-red-900";
  } else if (state === "PROPOSAL") {
    bg = "bg-yellow-800";
  }

  return (
    <span
      className={`inline-flex text-[12px] px-3 py-1 rounded-2xl justify-center w-[120px] whitespace-nowrap ${bg} ${text} font-bold`}
    >
      {state
        /*.replace("AWAITING_DEPLOYMENT", "Awaiting deployment")
        .replace("NOT_SUPPORTED", "Not supported")
        .replace("SUPPORTED", "Supported")
        .replace("AWAITING_ISSUE_CREATION", "Awaiting issue creation")*/}
    </span>
  );
};

const Strategies = (): JSX.Element => {
  const strategiesTotals = getStrategiesTotals()
  return (
    <div>
      <div className="flex mb-5 text-[14px] text-gray-300"><a href="/platform"
                                                              className="mr-2 font-bold">Platform</a> - <span
        className="ml-2">Strategies</span></div>

      <h1>Strategies</h1>

      <div className="flex flex-wrap relative mb-7">
        {[
          ['Live', strategiesTotals.LIVE, 'text-green-400',],
          ['Awaiting deployment', strategiesTotals.DEPLOYMENT, 'text-violet-400',],
          ['Development', strategiesTotals.DEVELOPMENT, 'text-blue-400',],
          ['Awaiting developer', strategiesTotals.AWAITING, 'text-yellow-200',],
          ['Blocked', strategiesTotals.BLOCKED, 'text-red-200',],
          ['Proposal', strategiesTotals.PROPOSAL, 'text-orange-300',],
        ].map(t => (
          <div
            key={t[0]}
            className={`flex w-[140px] h-[120px] mx-[20px] rounded-full ${t[2]} items-center justify-center flex-col`}
          >
            <div className="text-4xl">{t[1]}</div>
            <div className="flex self-center justify-center text-[14px]">
              {t[0]}
            </div>
          </div>
        ))}
      </div>

      <table className="w-full">
        <thead>
        <tr>
          <td className="text-center px-3">ID</td>
          <td className=" px-3">Name</td>
          <td className="text-center px-3">State</td>
          <td className="text-center px-3">Issue</td>
        </tr>
        </thead>
        <tbody>
        {Object.keys(strategies).map((shortId: string) => {
          const strategy = strategies[shortId as StrategyShortId];
          return (
            <tr key={shortId}>
              <td className="px-3 py-1">
                <div className="flex justify-center">
                <span className="flex px-3 rounded-xl w-[86px]"
                      style={{backgroundColor: strategy.bgColor, color: strategy.color}}>
                  {strategy.shortId}
                </span>
                </div>

              </td>
              <td className="px-3">{strategy.id}</td>
              <td className="px-3">
                <div className="flex justify-center">
                  <StrategyStatus state={strategy.state}/>
                </div>
              </td>
              <td className="px-3 text-center">
                <div className="flex items-center justify-center">
                  <a
                    className="inline-flex"
                    href={`https://github.com/stabilitydao/stability-contracts/issues/${strategy.contractGithubId}`}
                    target="_blank"
                    title="Go to strategy issue page on Github"
                  >
                    <img
                      src="/icons/github.svg"
                      alt="Github"
                      className="w-[20px]"
                    />
                  </a>
                </div>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export {Strategies};
