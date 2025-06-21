interface TextSkeletonProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  lineHeight?: number;
}

const TextSkeleton: React.FC<TextSkeletonProps> = ({
  width = 100,
  lineHeight = 24,
  ...rest
}) => {
  return (
    <svg
      width={typeof width === "number" ? `${width}px` : width}
      height={`${lineHeight}px`}
      viewBox={`0 0 ${width} ${lineHeight}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <rect
        x="0"
        y="0"
        rx="6"
        ry="6"
        width="100%"
        height="100%"
        fill="#1B1D21"
      />
      <rect x="0" y="0" rx="6" ry="6" width="100%" height="100%" fill="#1B1D21">
        <animate
          attributeName="opacity"
          dur="2s"
          values="1; 0.5; 1"
          repeatCount="indefinite"
          begin="0s"
        />
      </rect>
    </svg>
  );
};

export { TextSkeleton };
