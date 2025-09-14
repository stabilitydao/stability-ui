import { TimelineTypes } from "@types";

import { TIMESTAMPS_IN_SECONDS } from "@constants";

type TSegment = keyof typeof TIMESTAMPS_IN_SECONDS;

type TProps = {
  timeline: TSegment;
  onChange: (segment: TSegment) => void;
};

const ChartTimelineSwitcher = ({ timeline, onChange }: TProps): JSX.Element => {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center p-2 bg-transparent border border-[#23252A] h-[48px] rounded-lg select-none text-[16px] font-semibold">
        <p
          onClick={() => onChange(TimelineTypes.Week as TSegment)}
          className={`h-8 px-4 py-1 cursor-pointer rounded-lg ${
            timeline === "WEEK"
              ? "bg-[#22242A] border border-[#2C2E33]"
              : "text-[#97979A]" //hover
          }`}
        >
          Week
        </p>
        <p
          onClick={() => onChange(TimelineTypes.Month as TSegment)}
          className={`h-8 px-4 py-1 cursor-pointer rounded-lg ${
            timeline === "MONTH"
              ? "bg-[#22242A] border border-[#2C2E33]"
              : "text-[#97979A]" //hover
          }`}
        >
          Month
        </p>
        <p
          onClick={() => onChange(TimelineTypes.Year as TSegment)}
          className={`h-8 px-4 py-1 cursor-pointer rounded-lg  ${
            timeline === "YEAR"
              ? "bg-[#22242A] border border-[#2C2E33]"
              : "text-[#97979A]" //hover
          }`}
        >
          All
        </p>
      </div>
    </div>
  );
};
export { ChartTimelineSwitcher };
