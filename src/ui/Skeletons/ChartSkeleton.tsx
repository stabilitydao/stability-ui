const ChartSkeleton = (): JSX.Element => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1800 400"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full pl-5"
    >
      <rect
        x="0"
        y="0"
        rx="10"
        ry="10"
        width="100%"
        height="100%"
        fill="#1B1D21"
      />
      <rect
        x="0"
        y="0"
        rx="10"
        ry="10"
        width="100%"
        height="100%"
        fill="#1B1D21"
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
