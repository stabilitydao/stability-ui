import { BackwardIcon, ForwardIcon } from "../../ui/icons";

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

export function TablePagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onItemsPerPageChange,
}: Props) {
  return (
    <div className="flex items-center justify-between text-sm md:px-6 bg-[#151618] border-t border-[#23252A]">
      {/* Left side - Items per page */}
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
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <span className="text-[#97979A] border-r md:border-l border-[#23252a] px-4 py-3">
          {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}{" "}
          items
        </span>
      </div>

      {/* Right side - Navigation */}
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
            className="text-white disabled:text-[#97979A] cursor-pointer disabled:cursor-not-allowed px-3"
          >
            Next &gt;
          </button>
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="border-r border-l border-[#23252a] py-3 px-4 text-white disabled:text-[#97979A] disabled:cursor-not-allowed cursor-pointer"
          >
            <BackwardIcon className="w-4 h-4 rotate-90" />
          </button>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="py-3 pr-4 text-white disabled:text-[#97979A] cursor-pointer disabled:cursor-not-allowed"
          >
            <ForwardIcon className="w-4 h-4 rotate-270" />
          </button>
        </div>
      </div>
    </div>
  );
}
