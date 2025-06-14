import { cn } from "@utils";

interface IProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<IProps> = ({ checked, onChange }) => {
  return (
    <input
      checked={checked}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      type="checkbox"
      className={cn(
        "appearance-none h-[18px] w-[18px] bg-transparent border-[1.5px] border-[#626366] rounded-[4px] checked:bg-[#9180F4] checked:border-0 focus:outline-none transition duration-300 relative cursor-pointer flex-shrink-0",
        !checked && "hover:bg-transparent"
      )}
    />
  );
};

export { Checkbox };
