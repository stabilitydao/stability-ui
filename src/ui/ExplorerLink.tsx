interface ExplorerLinkProps {
  explorer: string;
  address: string;
  width?: number;
  height?: number;
}

const ExplorerLink: React.FC<ExplorerLinkProps> = ({
                                                     explorer,
                                                     address,
                                                     width = 20,
                                                     height = 20
}) => {
  return (
    <>
      <a
        data-testid="contractLinkBtn"
        className="flex items-center px-1 py-1 whitespace-nowrap"
        href={`${explorer}${address}`}
        target="_blank"
        title="Go to explorer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="icon icon-tabler icon-tabler-external-link ms-1"
          width={width}
          height={height}
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            stroke="none"
            d="M0 0h24v24H0z"
            fill="none"
          ></path>
          <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
          <path d="M11 13l9 -9"></path>
          <path d="M15 4h5v5"></path>
        </svg>
      </a>
      </>
  );
};

export {ExplorerLink};
