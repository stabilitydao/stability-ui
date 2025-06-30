import { cn } from "@utils";

interface IProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toggler: React.FC<IProps> = ({ checked, onChange }) => {
  return (
    <label
      className={cn(
        "flex items-center justify-between px-[12px] py-2 gap-2 rounded-lg border text-[14px] leading-4 font-medium bg-[#18191C] cursor-pointer",
        checked
          ? "border-[#2BB656] text-[#2BB656] flex-row"
          : "border-[#232429] text-[#6A6B6F] flex-row-reverse"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
        aria-checked={checked}
      />
      <span>I</span>
      <span>{checked ? "On" : "Off"}</span>
    </label>
  );
};

export { Toggler };
