import { SortArrowIcon } from "../../ui/icons";

interface Props {
  label: string;
  onSort: () => void;
}

export function SortableHeader({ label, onSort }: Props) {
  return (
    <div className="flex items-center">
      <p>{label}</p>
      <button
        onClick={onSort}
        className="flex items-center cursor-pointer text-left"
      >
        <SortArrowIcon className="w-5 h-5 text-[#97979A] ml-1 shrink-0" />
      </button>
    </div>
  );
}
