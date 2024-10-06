import { getTimeDifference } from "@utils";

interface IProps {
  unix: string;
  greater?: boolean;
}

const TimeDifferenceIndicator: React.FC<IProps> = ({
  unix,
  greater = true,
}) => {
  const timeDifference = getTimeDifference(unix);
  return (
    <div className="font-manrope font-semibold">
      {timeDifference.days ? (
        <>
          {timeDifference?.days < 1000 ? (
            <div
              className={`bg-warning-950 text-warning-400 rounded-2xl px-2  ${greater ? "py-1 text-[12px]" : "py-[2px] text-[10px]"}`}
            >
              <p className=""></p>
              {timeDifference.days}
              {timeDifference.days > 1 ? "days" : "day"} {timeDifference.hours}h
              ago
            </div>
          ) : (
            <div
              className={`bg-warning-950 text-warning-400 rounded-2xl px-2  ${greater ? "py-1 text-[12px]" : "py-[2px] text-[10px]"}`}
            >
              None
            </div>
          )}
        </>
      ) : (
        <div
          className={`px-2 rounded-2xl ${greater ? "py-1 text-[12px]" : "py-[2px] text-[10px]"} ${
            timeDifference.hours > 4
              ? "bg-accent-950 text-accent-400"
              : "bg-success-950 text-success-400"
          }`}
        >
          {timeDifference.hours}h ago
        </div>
      )}
    </div>
  );
};

export { TimeDifferenceIndicator };
