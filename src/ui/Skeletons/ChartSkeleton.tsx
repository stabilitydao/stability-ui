const ChartSkeleton = (): JSX.Element => {
  return (
    <svg
      width="100%"
      height="260px"
      viewBox="0 0 1800 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        rx="10"
        ry="10"
        width="100%"
        height="360px"
        fill="#a995ff"
      />
      <rect
        x="0"
        y="0"
        rx="10"
        ry="10"
        width="100%"
        height="360px"
        fill="#15113A"
      >
        <animate
          attributeName="opacity"
          dur="2s"
          values="1; 0.5; 1"
          repeatCount="indefinite"
          begin="1"
        />
      </rect>
    </svg>
  );
};

export { ChartSkeleton };
