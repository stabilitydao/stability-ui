const VaultType = ({ type }: { type: string }) => {
  const vaultTypes = [
    { type: "Compounding", styles: "text-[#00bb99] bg-[#00110a]", symbol: "C" },
    { type: "Rewarding", styles: "text-[#6052ff] bg-[#090816]", symbol: "R" },
    {
      type: "Rewarding Managed",
      styles: "text-[#d45a1d] bg-[#170a03]",
      symbol: "RM",
    },
  ];

  const currentType = vaultTypes.find((elem) => elem.type === type);

  return (
    <span
      title={`${currentType?.type} vault`}
      className={`text-[17px] font-bold border-0 inline-flex w-8 h-8 justify-center items-center rounded-full ${currentType?.styles}`}
    >
      {currentType?.symbol}
    </span>
  );
};

export { VaultType };
