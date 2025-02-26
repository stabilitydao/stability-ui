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
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${d}d ${h}h ${m}m ${s}s`;
  };

  if (status === "ended") {
    return null;
  }

  return (
    <div className="font-manrope text-[24px] font-bold text-center">
      <h3>{status === "beforeStart" ? "Starts" : "Ends"} in:</h3>
      <h5>{formatTime(timeLeft)}</h5>
    </div>
  );
};

export { Timer };
