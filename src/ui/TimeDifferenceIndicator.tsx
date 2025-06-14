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

  const baseClasses = "rounded-[4px] px-1";
  const sizeClasses = greater ? "py-1 text-[12px]" : "py-[2px] text-[10px]";

  if (timeDifference.days) {
    return (
      <div className="font-manrope font-semibold">
        {timeDifference.days < 1000 ? (
          <div
            className={`${baseClasses} ${sizeClasses} bg-[#40331A] border border-[#FFA500] text-[#FFBC00]`}
          >
            {timeDifference.days} {timeDifference.days > 1 ? "days" : "day"}{" "}
            {timeDifference.hours}h ago
          </div>
        ) : (
          <div
            className={`${baseClasses} ${sizeClasses} bg-[#40331A] border border-[#FFA500] text-[#FFBC00]`}
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
            ? "bg-[#2C2A3F] text-[#9180F4] border border-[#816FEA]"
            : "bg-[#233729] border border-[#48C05C] text-[#2BB656]"
        }`}
      >
        {timeDifference.hours}h ago
      </div>
    </div>
  );
};

export { TimeDifferenceIndicator };
