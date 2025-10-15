type TProps = {
  status: string;
};

const ChainStatus: React.FC<TProps> = ({ status }) => {
  let bg = "bg-gray-800";
  let text = "text-white";
  if (status === "SUPPORTED") {
    bg = "bg-green-800";
  }

  return (
    <span
      className={`inline-flex text-[12px] px-3 py-1 rounded-2xl justify-center w-[160px] whitespace-nowrap ${bg} ${text}`}
    >
      {status
        .replace("NOT_SUPPORTED", "Not supported")
        .replace("SUPPORTED", "Supported")}
    </span>
  );
};

export { ChainStatus };
