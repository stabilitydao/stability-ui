import { getTimeDifference } from "@utils";

interface IProps {
  unix: string;
}

const TimeDifferenceIndicator: React.FC<IProps> = ({ unix }) => {
  const timeDifference = getTimeDifference(unix);
  return (
    <>
      {timeDifference.days ? (
        <>
          {timeDifference?.days < 1000 ? (
            <div className="text-[14px] bg-[#6F5648] text-[#F2C4A0] px-2 py-1 rounded-lg border-[2px] border-[#AE642E]">
              {timeDifference.days}
              {timeDifference.days > 1 ? "days" : "day"} {timeDifference.hours}h
              ago
            </div>
          ) : (
            <div className="text-[14px] bg-[#6F5648] text-[#F2C4A0] px-2 py-1 rounded-lg border-[2px] border-[#AE642E]">
              None
            </div>
          )}
        </>
      ) : (
        <div
          className={`text-[14px] px-2 py-1 rounded-lg border-[2px]  ${
            timeDifference.hours > 4
              ? "bg-[#485069] text-[#B4BFDF] border-[#6376AF]"
              : "bg-[#486556] text-[#B0DDB8] border-[#488B57]"
          }`}
        >
          {timeDifference.hours}h ago
        </div>
      )}
    </>
  );
};

export { TimeDifferenceIndicator };
