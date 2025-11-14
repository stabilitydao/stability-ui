import { Skeleton } from "@ui";

import { cn } from "@utils";

type TProps = {
  label: string;
  value: string;
  futureValue?: string;
  valuesColor?: { current: string; future: string };
  subValue?: string;
  isLoading: boolean;
  symbol?: string;
};

const StatItem: React.FC<TProps> = ({
  label,
  value,
  futureValue,
  valuesColor,
  subValue,
  isLoading,
  symbol,
}) => {
  return (
    <div className="flex flex-col items-start w-full md:w-1/2">
      <span className="text-[#7C7E81] text-[16px] leading-6">{label}</span>
      {isLoading ? (
        <Skeleton height={32} width={100} />
      ) : futureValue && futureValue !== "0" ? (
        <div className="flex items-center gap-2 text-[24px] leading-8">
          <span
            className={cn(
              valuesColor?.current ? valuesColor?.current : "text-[#7C7E81]"
            )}
          >
            {value}
          </span>
          <img
            src="/icons/arrow-right.png"
            alt="arrow right"
            className="w-4 h-4"
          />
          <p className="flex items-center gap-1">
            <span className={valuesColor?.future}>{futureValue}</span>
            <span>{symbol}</span>
          </p>
        </div>
      ) : (
        <p className="flex items-center gap-1 text-[24px] leading-8">
          <span className={valuesColor?.current}> {value}</span>
          <span>{symbol}</span>
        </p>
      )}

      {!!subValue && (
        <>
          {isLoading ? (
            <Skeleton height={20} width={50} />
          ) : (
            <span className="text-[#7C7E81] text-[14px] leading-5">
              {subValue}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export { StatItem };
