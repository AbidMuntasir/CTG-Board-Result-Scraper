interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center mt-6 gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 sm:px-4 py-2   rounded-md bg-slate-700 border border-slate-600 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        Previous
      </button>
      
      <div className="flex items-center gap-2">
        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = idx + 1;
          } else if (currentPage <= 3) {
            pageNum = idx + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - (4 - idx);
          } else {
            pageNum = currentPage + idx - 2;
          }

          const isCurrentPage = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md transition-colors ${
                isCurrentPage
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className=" px-3 sm:px-4 py-2 rounded-md bg-slate-700 border border-slate-600 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
