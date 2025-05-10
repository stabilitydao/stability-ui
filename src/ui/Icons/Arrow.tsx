interface IProps {
  isActive: boolean;
  rotate?: number;
}

export const ArrowIcon: React.FC<IProps> = ({ isActive, rotate = 0 }) => {
  const color = isActive ? "#fff" : "#595A5C";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      style={{ transform: `rotate(${rotate}deg)` }}
      className="transition delay-[50ms]"
    >
      <path
        d="M4.99993 3.78101L8.2998 0.481201L9.2426 1.42401L4.99993 5.66668L0.757324 1.42401L1.70013 0.481201L4.99993 3.78101Z"
        fill={color}
      />
    </svg>
  );
};
