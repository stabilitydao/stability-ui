import { RowsIcon, GridIcon } from "./Icons";

import { cn } from "@utils";

import { DisplayTypes } from "@types";

interface IProps {
  type: string;
  setType: (type: DisplayTypes) => void;
}

const DisplayType: React.FC<IProps> = ({ type, setType }) => {
  const handleDisplayTypes = (display: DisplayTypes) => {
    setType(display);
  };

  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "border border-[#2C2E33] rounded-lg cursor-pointer",
          type === "rows" && "bg-[#22242A]"
        )}
        onClick={() => handleDisplayTypes(DisplayTypes.Rows)}
      >
        <div className="p-3">
          <RowsIcon isActive={type === "rows"} />
        </div>
      </div>
      <div
        className={cn(
          "border border-[#2C2E33] rounded-lg cursor-pointer",
          type === "grid" && "bg-[#22242A]"
        )}
        onClick={() => handleDisplayTypes(DisplayTypes.Grid)}
      >
        <div className="p-3">
          <GridIcon isActive={type === "grid"} />
        </div>
      </div>
    </div>
  );
};

export { DisplayType };
