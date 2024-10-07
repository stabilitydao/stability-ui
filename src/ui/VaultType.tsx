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

  return greater ? (
    <span
      title={`${currentType?.type} vault`}
      className={`text-[16px] flex self-center items-center font-bold h-8 px-0 rounded-md uppercase ${currentType?.styles} max-w-[165px]`}
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
