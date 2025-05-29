const VaultType = ({
  type,
  greater = false,
}: {
  type: string;
  greater?: boolean;
}): JSX.Element => {
  const vaultTypes = [
    {
      type: "Compounding",
      styles: "text-white bg-[#192c1e] border border-[#48C05C] rounded-md",
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

  return greater ? (
    <span
      title={`${currentType?.type} vault`}
      className={`text-[14px] px-3 py-2 flex self-center items-center justify-center h-8 ${currentType?.styles} max-w-[120px]`}
    >
      {currentType?.type}
    </span>
  ) : (
    <span
      title={`${currentType?.type} vault`}
      className={`text-[17px] font-bold border-0 inline-flex w-8 h-8 justify-center items-center self-center rounded-full ${currentType?.styles}`}
    >
      {currentType?.symbol}
    </span>
  );
};

export { VaultType };
