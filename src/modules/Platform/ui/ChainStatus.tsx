type TProps = {
  status: string;
};

const ChainStatus: React.FC<TProps> = ({ status }) => {
  let bg = "bg-gray-800";
  let text = "text-white";
  if (status === "SUPPORTED") {
    bg = "bg-green-800";
  } else if (status === "AWAITING_DEPLOYMENT") {
    bg = "bg-violet-800";
  } else if (status === "AWAITING_ISSUE_CREATION") {
    bg = "bg-orange-900";
  }

  return (
    <span
      className={`inline-flex text-[12px] px-3 py-1 rounded-2xl justify-center w-[160px] whitespace-nowrap ${bg} ${text}`}
    >
      {status
        .replace("AWAITING_DEPLOYMENT", "Awaiting deployment")
        .replace("NOT_SUPPORTED", "Not supported")
        .replace("SUPPORTED", "Supported")
        .replace("AWAITING_ISSUE_CREATION", "Awaiting issue creation")}
    </span>
  );
};

export { ChainStatus };
