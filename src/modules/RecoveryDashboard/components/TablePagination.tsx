import { ArrowIcon } from "@ui";

interface Props {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

const TablePagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onItemsPerPageChange,
}: Props): JSX.Element => {
  return (
    <div className="flex items-center justify-between text-sm md:px-6 bg-[#151618] border-t border-[#23252A]">
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 py-3">
          <span className="text-[#97979A]">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="text-white bg-[#151618] cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>
        <span className="text-[#97979A] border-r md:border-l border-[#23252a] px-4 py-3">
          {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}{" "}
          items
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 text-white disabled:text-[#97979A] cursor-pointer disabled:cursor-not-allowed"
          >
            &lt; Previous
          </button>
          <span className="text-[#97979A]">
            {currentPage} of {totalPages} pages
          </span>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 text-white disabled:text-[#97979A] cursor-pointer disabled:cursor-not-allowed"
          >
            Next &gt;
          </button>
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="border-r border-l border-[#23252a] py-3 px-4 text-white disabled:text-[#97979A] cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowIcon isActive={currentPage !== 1} rotate={90} />
          </button>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="py-3 pr-4 text-white disabled:text-[#97979A] cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowIcon isActive={currentPage !== totalPages} rotate={270} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { TablePagination };
