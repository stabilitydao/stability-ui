const VaultType = ({
  type,
  text = "short",
}: {
  type: string;
  text?: string;
}): JSX.Element => {
  const vaultTypes = [
    {
      type: "Compounding",
      styles: "text-[#00bb99] bg-[#00110a]",
      symbol: "C",
    },
    { type: "Rewarding", styles: "text-[#6052ff] bg-[#090816]", symbol: "R" },
    {
      type: "Rewarding Managed",
      styles: "text-[#d45a1d] bg-[#170a03]",
      symbol: "RM",
    },
  ];

  const currentType = vaultTypes.find((elem) => elem.type === type);

  return text === "short" ? (
    <span
      title={`${currentType?.type} vault`}
      className={`text-[17px] font-bold border-0 inline-flex w-8 h-8 justify-center items-center rounded-full ${currentType?.styles}`}
    >
      {currentType?.symbol}
    </span>
  ) : (
    <span
      title={`${currentType?.type} vault`}
      className={`text-[17px] flex font-bold h-8 px-4 rounded-md uppercase ${currentType?.styles} max-w-[165px]`}
    >
      {currentType?.type}
    </span>
  );
};

export { VaultType };
