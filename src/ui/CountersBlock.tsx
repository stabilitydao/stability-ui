import { Counter, type ICounterProps } from "./Counter.tsx";

interface IProps {
  title: string;
  link: string;
  linkTitle: string;
  counters: ICounterProps[];
}

const CountersBlock: React.FC<IProps> = ({
  title,
  link,
  linkTitle,
  counters,
}) => {
  return (
    <a
      className="bg-accent-950 hover:bg-[#1B0D45] p-[26px] rounded-[44px] mb-6 flex flex-col"
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
      <div className="flex flex-wrap relative justify-center">
        {counters.map((t) => (
          <div
            key={t.name}
            className="flex p-[12px] w-full sm:w-6/12 md:w-4/12 lg:w-3/12 min-[1440px]:w-2/12"
          >
            <Counter
              color={t.color.toString()}
              value={t.value.toString()}
              name={t.name.toString()}
            />
          </div>
        ))}
      </div>
    </a>
  );
};

export { CountersBlock };
