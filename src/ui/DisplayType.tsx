import { RowsIcon, GridIcon } from "./Icons";

import { cn } from "@utils";

import { TDisplay } from "@types";

interface IProps {
  type: string;
  setType: (type: TDisplay) => void;
}

const DisplayType: React.FC<IProps> = ({ type, setType }) => {
  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "border border-[#2C2E33] rounded-lg cursor-pointer",
          type === "rows" && "bg-[#22242A]"
        )}
        onClick={() => setType("rows")}
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
        onClick={() => setType("grid")}
      >
        <div className="p-3">
          <GridIcon isActive={type === "grid"} />
        </div>
      </div>
    </div>
  );
};

export { DisplayType };
