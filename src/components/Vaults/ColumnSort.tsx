import type { TTableColumn } from "@types";

type TProps = {
  index: number;
  value: string;
  table: TTableColumn[];
  type: string;
  sort: (table: TTableColumn[]) => void;
};

const ColumnSort: React.FC<TProps> = ({ index, value, table, type, sort }) => {
  const styles: Record<string, string> = {
    Type: "hidden xl:table-cell",
    Strategy: "hidden min-[1130px]:table-cell",
  };

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
        nextCase = "ascendentic";
        break;
      default:
        break;
    }

    const updatedTable: TTableColumn[] = table.map(
      (column: TTableColumn, i: number) => {
        if (index === i) {
          return { ...column, sortType: nextCase };
        } else {
          return { ...column, sortType: "none" };
        }
      }
    );
    sort(updatedTable);
  };
  return (
    <>
      {type === "table" ? (
        <th
          onClick={tabController}
          className={`${
            index < 5
              ? "px-0 md:px-2  min-[1130px]:px-4"
              : "pl-0 md:px-2  min-[1130px]:px-3 text-right"
          } py-2 text-center cursor-pointer ${styles[value] || ""}`}
        >
          {value !== "APR / APY" ? (
            <p className="inline-block">{value}</p>
          ) : (
            <p className="inline-block">
              {window.innerWidth > 915 ? value : "APR"}
            </p>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="7"
            viewBox="0 0 12 7"
            fill="none"
            className={`inline-block ml-[3px] md:ml-[6px]  min-[1130px]:ml-[10px] transition duration-300 ease-in-out ${
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
      ) : (
        <div
          onClick={tabController}
          className={`px-0 md:px-2 min-[1130px]:px-4 py-2 text-center cursor-pointer ${
            styles[value] || ""
          }`}
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
        </div>
      )}
    </>
  );
};
export { ColumnSort };
