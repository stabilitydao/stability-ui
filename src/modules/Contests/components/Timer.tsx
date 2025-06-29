import { useState, useEffect } from "react";

interface IProps {
  start: number;
  end: number;
}

const Timer: React.FC<IProps> = ({ start, end }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<"beforeStart" | "ongoing" | "ended">();

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);

      if (now < start) {
        setTimeLeft(start - now);
        setStatus("beforeStart");
      } else if (now >= start && now < end) {
        setTimeLeft(end - now);
        setStatus("ongoing");
      } else {
        setStatus("ended");
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [start, end]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      { label: "DAY", value: days },
      { label: "HOUR", value: hours },
      { label: "MIN", value: minutes },
      { label: "SEC", value: secs },
    ];
  };

  if (status === "ended") {
    return null;
  }

  const formattedTime = formatTime(timeLeft);

  return (
    <div className="flex flex-col items-center gap-3 px-[12px] md:px-[34px] py-2 md:py-5 bg-[#151618] border border-[#23252A] rounded-lg">
      <h3 className="text-[#97979A] text-[14px] leading-5">
        {status === "beforeStart" ? "STARTS" : "ENDS"} IN
      </h3>
      <div className="flex gap-3">
        {formattedTime.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center justify-center px-4 py-2 bg-[#101012] rounded-lg border border-[#23252A] font-medium"
          >
            <span
              className="text-[20px] md:text-[32px] leading-5 md:leading-10"
              style={{ fontFamily: "monospace" }}
            >
              {unit.value.toString().padStart(2, "0")}
            </span>
            <span className="text-[14px] leading-5">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Timer };
