import { useState, useEffect } from "react";

import { formatTime } from "../functions/formatTime";

type TimerStatus = "beforeStart" | "ongoing" | "ended";

interface TReturn {
  timeLeft: number;
  status: TimerStatus;
  timeParts: { label: string; value: number }[];
}

export const useTimer = (start: number, end: number): TReturn => {
  const [timeLeft, setTimeLeft] = useState(0);

  const [status, setStatus] = useState<TimerStatus>("beforeStart");

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
        setTimeLeft(0);
        setStatus("ended");
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [start, end]);

  return { timeLeft, status, timeParts: formatTime(timeLeft) };
};
