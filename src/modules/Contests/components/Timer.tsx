import { useTimer } from "@utils";

interface IProps {
  start: number;
  end: number;
}

const Timer: React.FC<IProps> = ({ start, end }) => {
  const { status, timeParts } = useTimer(start, end);

  if (status === "ended") return null;

  return (
    <div className="flex flex-col items-center gap-3 px-[12px] md:px-[34px] py-2 md:py-5 bg-[#151618] border border-[#23252A] rounded-lg">
      <h3 className="text-[#97979A] text-[14px] leading-5">
        {status === "beforeStart" ? "STARTS" : "ENDS"} IN
      </h3>
      <div className="flex gap-3">
        {timeParts.map((part) => (
          <div
            key={part.label}
            className="flex flex-col items-center justify-center px-4 py-2 bg-[#101012] rounded-lg border border-[#23252A] font-medium"
          >
            <span
              className="text-[20px] md:text-[32px] leading-5 md:leading-10"
              style={{ fontFamily: "monospace" }}
            >
              {part.value.toString().padStart(2, "0")}
            </span>
            <span className="text-[14px] leading-5">{part.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Timer };
