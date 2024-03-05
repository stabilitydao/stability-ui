const AssetsSkeleton = () => {
  return (
    <svg
      width="320"
      height="100"
      viewBox="0 0 320 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        rx="10"
        ry="10"
        width="320"
        height="100"
        fill="#15113A"
      />
      <rect x="0" y="0" rx="10" ry="10" width="320" height="100" fill="#a995ff">
        <animate
          attributeName="opacity"
          dur="2s"
          values="0.2; 1; 0.2"
          repeatCount="indefinite"
          begin="0.1"
        />
      </rect>
    </svg>
  );
};

export { AssetsSkeleton };
