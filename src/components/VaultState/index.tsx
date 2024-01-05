import { useState, useEffect, useRef } from "react";
import { VAULT_STATUSES } from "@constants";

interface IProps {
  status: number;
}

const VaultState: React.FC<IProps> = ({ status }) => {
  const [tooltip, setTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: MouseEvent) => {
    if (
      tooltipRef.current &&
      !tooltipRef.current.contains(event.target as Node)
    ) {
      setTooltip(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="relative">
      <div
        className={`h-5 w-5 md:w-3 md:h-3 ${
          status === 1 ? "bg-[#488B57]" : "bg-[#EE6A63]"
        } rounded-full mr-2`}
        title={VAULT_STATUSES[status]}
        onClick={(e) => {
          e.stopPropagation();
          setTooltip((prev) => !prev);
        }}
      ></div>
      {tooltip && (
        <div
          ref={tooltipRef}
          className="absolute bottom-[-55px] right-[-50px] py-2 px-3 rounded-md bg-button z-[150]"
        >
          {VAULT_STATUSES[status]}
        </div>
      )}
    </div>
  );
};

export { VaultState };
