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
      className={`appearance-none h-[18px] w-[18px] bg-[#22242A] border-[1.5px] border-[#2C2E33] rounded-[4px] ${!checked ? "hover:bg-[#22242A]" : ""} checked:bg-[#22242A] checked:border-[#2C2E33] focus:outline-none transition duration-300 relative cursor-pointer`}
    />
  );
};

export { Checkbox };
