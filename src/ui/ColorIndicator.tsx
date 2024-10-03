interface IProps {
  color: string;
}

const ColorIndicator: React.FC<IProps> = ({ color }) => {
  return (
    <div
      className="w-[8px] h-[8px] rounded-full"
      style={{
        backgroundColor: color,
        boxShadow: `0px 0px 0px 3px ${color}40`,
      }}
    />
  );
};

export { ColorIndicator };
