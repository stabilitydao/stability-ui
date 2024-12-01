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
      className={`appearance-none h-5 w-5 border-[1.5px] border-accent-500 rounded-md ${!checked ? "hover:bg-accent-800" : ""} checked:bg-accent-500 checked:border-accent-500 focus:outline-none transition duration-300 relative cursor-pointer`}
    />
  );
};

export { Checkbox };
