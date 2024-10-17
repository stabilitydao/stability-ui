import { HeadingText } from "@ui";

import { formatTimestampToDate } from "../functions";

const Contests = ({ periodsData }): JSX.Element => {
  return (
    <>
      <HeadingText text="Contests" scale={2} styles="mb-0" />
      <div className="flex justify-center gap-10 flex-wrap items-stretch">
        {!!periodsData.length &&
          periodsData.map((period, index: number) => (
            <div
              key={period.start}
              className="bg-accent-950 rounded-2xl  min-w-[200px]"
            >
              <div className="p-5 flex flex-col gap-3 items-center justify-center text-[18px]">
                <HeadingText text={period.name} scale={3} />
                <p>{`${formatTimestampToDate(period.start)} - ${formatTimestampToDate(period.end)}`}</p>
                <p>
                  Status:{" "}
                  {!index ? "Completed" : index === 1 ? "Active" : "Future"}
                </p>

                {!!period.rewards.length &&
                  period.rewards.map((reward, index: number) => (
                    <div key={index} className="bg-accent-400 rounded-2xl">
                      <div className="p-2">
                        <p>Type: {reward.type}</p>
                        <p>Winner reward: {reward.winnerReward}</p>
                        <p>Winners: {reward.winners}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
export { Contests };
