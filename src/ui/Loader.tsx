interface LoaderProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({
  width = "16",
  height = "16",
  color = "#7c76ee",
}) => {
  return (
    <div className="flex items-center justify-center">
      <svg
        width={width}
        height={height}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0V1.4545C11.6147 1.45479 14.5449 4.38518 14.5449 7.99996C14.5449 11.6149 11.6144 14.5454 7.99947 14.5454C4.38453 14.5454 1.45404 11.6149 1.45401 8H0C0 12.4183 3.58172 16 8 16Z"
          fill={color}
        />
      </svg>
    </div>
  );
};

export { Loader };
