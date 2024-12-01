import { useState, useEffect, useRef } from "react";

interface IProps {
  status: string;
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
          status === "Active" ? "bg-[#488B57]" : "bg-[#EE6A63]"
        } rounded-full mr-2`}
        title={status}
        onClick={(e) => {
          e.stopPropagation();
          setTooltip((prev) => !prev);
        }}
      ></div>
      {tooltip && (
        <div
          ref={tooltipRef}
          className="absolute bottom-[-55px] right-[-50px] py-2 px-3 rounded-md bg-button"
        >
          {status}
        </div>
      )}
    </div>
  );
};

export { VaultState };
