import React from "react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  if (totalPages <= 0) return null;

  return (
    <div className="flex justify-center gap-2 mt-8 px-4 pb-6">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className={`${
          currentPage === 1 ? "" : "cursor-pointer"
        } px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm text-gray-700 dark:text-gray-200`}
      >
        Anterior
      </button>

      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let pageToShow: number;
        if (totalPages <= 5) {
          pageToShow = i + 1;
        } else if (currentPage <= 3) {
          pageToShow = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageToShow = totalPages - 4 + i;
        } else {
          pageToShow = currentPage - 2 + i;
        }

        return (
          <button
            key={i}
            onClick={() => setCurrentPage(pageToShow)}
            className={`px-3 py-1 border rounded-md text-sm cursor-pointer ${
              currentPage === pageToShow
                ? "bg-teal-500 text-white border-teal-500"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {pageToShow}
          </button>
        );
      })}

      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`${
          currentPage === totalPages ? "" : "cursor-pointer"
        } px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm text-gray-700 dark:text-gray-200`}
      >
        Siguiente
      </button>
    </div>
  );
};
