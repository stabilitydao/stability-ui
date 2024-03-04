const Skeleton = (props) => {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 320 63"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="0"
        y="0"
        rx="10"
        ry="10"
        width="320"
        height="63"
        fill="#262830"
      />
      <rect x="0" y="0" rx="10" ry="10" width="320" height="63" fill="#a995ff">
        <animate
          attributeName="opacity"
          dur="1s"
          values="0.2; 1; 0.2"
          repeatCount="indefinite"
          begin="0.1"
        />
      </rect>
    </svg>
  );
};

export { Skeleton };
