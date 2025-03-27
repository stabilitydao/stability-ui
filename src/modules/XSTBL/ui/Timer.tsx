import { useState, useEffect } from "react";

interface IProps {
  end: number;
}

const Timer: React.FC<IProps> = ({ end }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [status, setStatus] = useState<"ended" | "ongoing">();

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
    <div className="font-manrope text-[18px] sm:text-[20px] text-center uppercase flex items-center gap-2">
      <h5>{formatTime(timeLeft)}</h5>
    </div>
  );
};

export { Timer };
