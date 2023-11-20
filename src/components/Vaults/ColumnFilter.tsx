type TableColumn = {
  name: string;
  keyName: string;
  sortType: string;
  dataType: string;
};

type TProps = {
  index: number;
  value: string;
  table: TableColumn[];
  filter: (table: TableColumn[]) => void;
};

const ColumnFilter: React.FC<TProps> = ({ index, value, table, filter }) => {
  const tabController = () => {
    let nextCase: string = "";

    switch (table[index].sortType) {
      case "none":
        nextCase = "ascendentic";
        break;
      case "ascendentic":
        nextCase = "descendentic";
        break;
      case "descendentic":
        nextCase = "none";
        break;
      default:
        break;
    }

    const updatedTable: any = table.map((column: TableColumn, i: number) => {
      if (index === i) {
        return { ...column, sortType: nextCase };
      } else {
        return { ...column, sortType: "none" };
      }
    });

    filter(updatedTable);
  };
  return (
    <th
      onClick={tabController}
      className="px-4 py-2 text-center cursor-pointer"
    >
      <p className="inline-block">{value}</p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="7"
        viewBox="0 0 12 7"
        fill="none"
        className={`inline-block ml-[10px] transition duration-300 ease-in-out ${
          table[index].sortType === "ascendentic" && "rotate-[180deg]"
        }`}
      >
        <path
          d="M6 7L11.1962 0.25H0.803848L6 7Z"
          fill="white"
          fillOpacity="0.6"
        />
      </svg>
    </th>
  );
};

export { ColumnFilter };
