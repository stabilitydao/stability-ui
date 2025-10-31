interface IProps {
  text: string;
}

const BaseButton: React.FC<IProps> = ({ text }) => {
  return (
    <button
      disabled
      className="bg-[#35363B] rounded-lg w-full text-[16px] leading-5 font-bold"
    >
      <p className="px-6 py-4 text-[#6A6B6F]">{text}</p>
    </button>
  );
};

export { BaseButton };
