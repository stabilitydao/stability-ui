import { useEffect, useState } from "react";

const HISTORY_KEY = "urlHistory";

interface UrlHistory {
  currentUrl: string;
  previousUrl: string;
}

export const useUrlHistory = (): UrlHistory => {
  const [history, setHistory] = useState<UrlHistory>({
    currentUrl: "",
    previousUrl: "",
  });

  useEffect(() => {
    const currentUrl = window.location.pathname;

    const storedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}");

    const previousUrl = storedHistory.currentUrl || "";
    const beforePreviousUrl = storedHistory.previousUrl || "";

    if (currentUrl === previousUrl) {
      setHistory({
        currentUrl: previousUrl,
        previousUrl: beforePreviousUrl,
      });
      return;
    }

    setHistory({
      currentUrl: previousUrl,
      previousUrl: beforePreviousUrl,
    });

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify({
        currentUrl: currentUrl,
        previousUrl: previousUrl,
      })
    );
  }, []);

  return history;
};
