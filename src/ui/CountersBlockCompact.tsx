import { CounterListItem } from "./CounterListItem";

import type { ICounterProps } from "./Counter";

interface IProps {
  title: string;
  link: string;
  linkTitle: string;
  counters: ICounterProps[];
}

const CountersBlockCompact: React.FC<IProps> = ({
  title,
  link,
  linkTitle,
  counters,
}) => {
  return (
    <div className="w-full md:w-1/2 lg:w-4/12 min-[1440px]:w-4/12 flex p-[24px]">
      <a
        className="bg-accent-950 hover:bg-[#1B0D45] p-[26px] rounded-[44px] flex flex-col w-full"
        href={link}
        title={linkTitle}
        key={link}
      >
        <h3 className="text-[32px] font-bold text-center mb-[12px] flex items-center justify-center">
          {title}
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mt-[8px] ml-2"
          >
            <path
              d="M1.5 11L6.5 6L1.5 1"
              stroke="#F9F8FA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </h3>
        <div className="flex flex-col relative justify-center ">
          {counters.map((counter) => (
            <CounterListItem
              key={counter.name}
              color={counter.color.toString()}
              value={counter.value.toString()}
              name={counter.name.toString()}
            />
          ))}
        </div>
      </a>
    </div>
  );
};

export { CountersBlockCompact };
