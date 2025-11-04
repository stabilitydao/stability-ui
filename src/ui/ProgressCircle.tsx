import React from "react";

interface IProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const ProgressCircle: React.FC<IProps> = ({
  percentage,
  size = 16,
  strokeWidth = 2,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const isMax = percentage === 100;

  return (
    <svg
      width={size}
      height={size}
      className="text-[#18191C] fill-none -rotate-90"
    >
      <circle
        className="stroke-[#18191C]"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className={isMax ? "stroke-[#DE4343]" : "stroke-[#9180F4]"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};

export { ProgressCircle };
