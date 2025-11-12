import { useTimer } from "@utils";

interface IProps {
  start: number;
  end: number;
}

const Timer: React.FC<IProps> = ({ start, end }) => {
  const { status, timeParts } = useTimer(start, end);

  if (status === "ended") return null;

  return (
    <div className="flex items-center gap-2 text-[12px] leading-4">
      <h3 className="text-[#97979A]">
        {status === "beforeStart" ? "STARTS" : "ENDS"} IN
      </h3>
      <div className="flex gap-2">
        {timeParts.slice(0, -1).map((part) => (
          <div
            key={part.label}
            className="flex items-center justify-center gap-1 font-medium"
          >
            <span>{part.value.toString().padStart(2, "0")}</span>
            <span>{part.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Timer };
