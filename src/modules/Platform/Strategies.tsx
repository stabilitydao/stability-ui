import { strategies, type StrategyShortId } from "@stabilitydao/stability";

const Strategies = (): JSX.Element => {
  return (
    <div>
      <div className="flex mb-5 text-[14px] text-gray-300"><a href="/platform" className="mr-2 font-bold">Platform</a> - <span className="ml-2">Strategies</span></div>

      <h1>Strategies</h1>

      <table className="w-full">
        <thead>
        <tr>
          <td>ID</td>
          <td>Name</td>
          <td>State</td>
          <td>Issue</td>
        </tr>
        </thead>
        <tbody>
        {Object.keys(strategies).map((shortId: string) => {
          const strategy = strategies[shortId as StrategyShortId];
          return (
            <tr key={shortId}>
              <td>{strategy.shortId}</td>
              <td>{strategy.id}</td>
              <td>{strategy.state}</td>
              <td>{strategy.contractGithubId}</td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export {Strategies};
