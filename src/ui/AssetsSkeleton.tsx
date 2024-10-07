const AssetsSkeleton = (): JSX.Element => {
  return (
    <svg
      className="mb-[10px]"
      width="320"
      height="52"
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
        fill="#a995ff"
      />
      <rect x="0" y="0" rx="10" ry="10" width="320" height="100" fill="#15113A">
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

export { AssetsSkeleton };
