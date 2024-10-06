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

  const baseClasses = "rounded-2xl px-2";
  const sizeClasses = greater ? "py-1 text-[12px]" : "py-[2px] text-[10px]";

  if (timeDifference.days) {
    return (
      <div className="font-manrope font-semibold">
        {timeDifference.days < 1000 ? (
          <div
            className={`${baseClasses} ${sizeClasses} bg-warning-950 text-warning-400`}
          >
            {timeDifference.days} {timeDifference.days > 1 ? "days" : "day"}{" "}
            {timeDifference.hours}h ago
          </div>
        ) : (
          <div
            className={`${baseClasses} ${sizeClasses} bg-warning-950 text-warning-400`}
          >
            None
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="font-manrope font-semibold">
      <div
        className={`${baseClasses} ${sizeClasses} ${
          timeDifference.hours > 4
            ? "bg-accent-950 text-accent-400"
            : "bg-success-950 text-success-400"
        }`}
      >
        {timeDifference.hours}h ago
      </div>
    </div>
  );
};

export { TimeDifferenceIndicator };
