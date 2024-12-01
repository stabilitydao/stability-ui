const Skeleton = (props: React.SVGProps<SVGSVGElement>): JSX.Element => {
  const { width, height, ...rest } = props;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 63"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect
        x="0"
        y="0"
        rx="10"
        ry="10"
        width="320"
        height="63"
        fill="#a995ff"
      />
      <rect x="0" y="0" rx="10" ry="10" width="320" height="63" fill="#15113A">
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

export { Skeleton };
