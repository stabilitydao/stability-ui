import { useState, useEffect } from "react";

interface IProps {
  end: number;
  withText?: boolean;
}

const Timer: React.FC<IProps> = ({ end, withText = true }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<"beforeStart" | "ongoing" | "ended">();

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);

      if (end < now) {
        setStatus("ended");
      } else if (now < end) {
        setTimeLeft(end - now);
        setStatus("ongoing");
      }
    };

    updateTimer();

    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [end]);

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
    <div className="flex items-center gap-3">
      {withText && (
        <h3 className="text-[#97979A] text-[14px] leading-5">
          {status === "beforeStart" ? "Starts" : "Distributed"} in
        </h3>
      )}

      <div className="flex gap-1 md:gap-3">
        {formattedTime.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-[#101012] rounded-lg border border-[#23252A] font-medium"
          >
            <span
              className="text-[12px] leading-3 md:text-[18px] md:leading-6"
              style={{ fontFamily: "monospace" }}
            >
              {unit.value.toString().padStart(2, "0")}
            </span>
            <span className="text-[8px] md:text-[12px] leading-3">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Timer };
