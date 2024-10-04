interface IProps {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: React.FC<IProps> = ({ checked, onChange }) => {
  return (
    <input
      checked={checked}
      onChange={onChange}
      type="checkbox"
      className={`appearance-none h-5 w-5 border-[1.5px] border-[#612FFB] rounded-md ${!checked ? "hover:bg-[#2B1570]" : ""} checked:bg-[#612FFB] checked:border-[#612FFB] focus:outline-none transition duration-300 relative cursor-pointer`}
    />
  );
};

export { Checkbox };
