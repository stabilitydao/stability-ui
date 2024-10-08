const ShareSkeleton = (props: React.SVGProps<SVGSVGElement>): JSX.Element => {
  return (
    <svg
      width="900"
      height="63"
      viewBox="0 0 900 63"
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

export { ShareSkeleton };
