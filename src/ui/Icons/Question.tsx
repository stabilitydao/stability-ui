interface IProps {
  isWarning?: boolean;
}

export const QuestionIcon: React.FC<IProps> = ({ isWarning = false }) => {
  const color = isWarning ? "#ED4C42" : "#58595D";

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1688_15593)">
        <path
          d="M8.00011 14.4436C11.5593 14.4436 14.4446 11.5583 14.4446 7.99913C14.4446 4.43996 11.5593 1.55469 8.00011 1.55469C4.44094 1.55469 1.55566 4.43996 1.55566 7.99913C1.55566 11.5583 4.44094 14.4436 8.00011 14.4436Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.15527 5.88091C6.50016 4.94135 7.3055 4.55469 8.09305 4.55469C8.88861 4.55469 9.70905 5.1218 9.70905 6.1618C9.70905 7.74758 8.09483 7.46669 7.84594 8.88624"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.81467 12.059C7.324 12.059 6.92578 11.6599 6.92578 11.1701C6.92578 10.6804 7.324 10.2812 7.81467 10.2812C8.30534 10.2812 8.70356 10.6804 8.70356 11.1701C8.70356 11.6599 8.30534 12.059 7.81467 12.059Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_1688_15593">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
