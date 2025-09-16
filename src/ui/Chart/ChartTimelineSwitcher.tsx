import { TimelineTypes } from "@types";

import { TIMESTAMPS_IN_SECONDS } from "@constants";

type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

type TProps = {
  timeline: TSegment;
  onChange: (segment: TSegment) => void;
  isActive?: boolean;
};

const ChartTimelineSwitcher: React.FC<TProps> = ({
  timeline,
  onChange,
  isActive = true,
}) => {
  if (!isActive) return null;

  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center p-2 bg-transparent border border-[#23252A] h-[48px] rounded-lg select-none text-[16px] font-semibold">
        <p
          onClick={() => onChange(TimelineTypes.Week as TSegment)}
          className={`h-8 px-4 py-1 cursor-pointer rounded-lg ${
            timeline === "WEEK"
              ? "bg-[#22242A] border border-[#2C2E33]"
              : "text-[#97979A]"
          }`}
        >
          Week
        </p>
        <p
          onClick={() => onChange(TimelineTypes.Month as TSegment)}
          className={`h-8 px-4 py-1 cursor-pointer rounded-lg ${
            timeline === "MONTH"
              ? "bg-[#22242A] border border-[#2C2E33]"
              : "text-[#97979A]"
          }`}
        >
          Month
        </p>
        <p
          onClick={() => onChange(TimelineTypes.Year as TSegment)}
          className={`h-8 px-4 py-1 cursor-pointer rounded-lg  ${
            timeline === "YEAR"
              ? "bg-[#22242A] border border-[#2C2E33]"
              : "text-[#97979A]"
          }`}
        >
          All
        </p>
      </div>
    </div>
  );
};
export { ChartTimelineSwitcher };
