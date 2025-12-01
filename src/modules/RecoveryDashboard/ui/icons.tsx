interface IProps {
  className?: string;
  color?: string;
  height?: string | number;
  width?: string | number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

const DEFAULT_SIZE = "100%";

export const CopyIcon = ({ height, width }: IProps) => (
  <svg
    width={width ?? DEFAULT_SIZE}
    height={height ?? DEFAULT_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
  </svg>
);

export const CheckmarkIcon = ({ height, width }: IProps) => (
  <svg
    width={width ?? DEFAULT_SIZE}
    height={height ?? DEFAULT_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3 text-green-500"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export const SearchIcon = ({ height, width, className }: IProps) => (
  <svg
    className={className}
    width={width ?? DEFAULT_SIZE}
    height={height ?? DEFAULT_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export const ExternalLinkIcon = ({ height, width }: IProps) => (
  <svg
    className="w-4 h-4"
    width={width ?? DEFAULT_SIZE}
    height={height ?? DEFAULT_SIZE}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

export const BackwardIcon = ({ height, width, className }: IProps) => (
  <svg
    className={className}
    width={width ?? DEFAULT_SIZE}
    height={height ?? DEFAULT_SIZE}
    viewBox="0 0 10 6"
    fill="none"
  >
    <path
      d="M4.99993 3.78101L8.2998 0.481201L9.2426 1.42401L4.99993 5.66668L0.757324 1.42401L1.70013 0.481201L4.99993 3.78101Z"
      fill="currentColor"
    ></path>
  </svg>
);

export const ForwardIcon = ({ height, width, className }: IProps) => (
  <svg
    className={className}
    width={width ?? DEFAULT_SIZE}
    height={height ?? DEFAULT_SIZE}
    viewBox="0 0 10 6"
    fill="none"
  >
    <path
      d="M4.99993 3.78101L8.2998 0.481201L9.2426 1.42401L4.99993 5.66668L0.757324 1.42401L1.70013 0.481201L4.99993 3.78101Z"
      fill="currentColor"
    ></path>
  </svg>
);

export const SortArrowIcon = ({ height, width, className }: IProps) => (
  <svg
    className={className}
    width={width ?? DEFAULT_SIZE}
    height={height ?? DEFAULT_SIZE}
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.8335 5.8995V7.00048H10.1668V5.8995L8.00016 3.56543L5.8335 5.8995ZM10.1668 10.1013V9.00032H5.8335V10.1013L8.00016 12.4354L10.1668 10.1013Z"
      fill="#97979A"
    ></path>
  </svg>
);
