import { useEffect } from "react";

export const useModalClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
): void => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;

      if ("preventDefault" in event && event.cancelable) {
        event.preventDefault();
        event.stopPropagation();
      }

      handler(event);
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("click", listener, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", listener, true);
    };
  }, [ref, handler]);
};
