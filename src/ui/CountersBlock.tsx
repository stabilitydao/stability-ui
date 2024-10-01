import {Counter, type ICounterProps} from "./Counter.tsx";

interface IProps {
  title: string;
  link: string;
  linkTitle: string;
  counters: ICounterProps[];
}

const CountersBlock: React.FC<IProps> = ({ title, link, linkTitle, counters }) => {
  return (
    <a
      className="bg-[#130932] hover:bg-[#141033] p-[36px] rounded-[44px] mb-6 flex flex-col"
      href={link}
      title={linkTitle}
      key={link}
    >
      <h3 className="text-[32px] font-bold text-center mb-[32px]">{title}</h3>
      <div className="flex flex-wrap relative mb-5 justify-center">
        {counters.map(t => (
          <div key={t.name} className="flex p-[12px] w-full sm:w-6/12 md:w-4/12 lg:w-3/12">
            <Counter color={t.color.toString()} value={t.value.toString()} name={t.name.toString()}/>
          </div>
        ))}
      </div>
    </a>
  )
}

export {CountersBlock}
