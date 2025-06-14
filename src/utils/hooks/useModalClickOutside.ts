import { useEffect } from "react";

export const useModalClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent) => void
): void => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };

    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
    });

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};
