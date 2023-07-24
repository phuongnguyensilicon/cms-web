"use client";

import { ITitlePaginationProps } from "./type";

const TitlePagination = ({
  page,
  totalPages,
  navigateToPage
}: ITitlePaginationProps) => {
  const paginationBtnClassName =
    "inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 cursor-pointer";
  const canClickPreviousBtn = page > 1;
  const canClickNextBtn = page < totalPages;

  const onPrevious = (): void => {
    if (canClickPreviousBtn) {
      navigateToPage(--page);
    }
  };

  const onNext = (): void => {
    if (canClickNextBtn) {
      navigateToPage(++page);
    }
  };

  return (
    <div className="flex flex-row-reverse py-8 gap-2">
      <a
        className={`${paginationBtnClassName} ${
          !canClickNextBtn ? "cursor-not-allowed" : ""
        }`}
        onClick={() => onNext()}
      >
        Next
      </a>
      <a
        className={`${paginationBtnClassName} ${
          !canClickPreviousBtn ? "cursor-not-allowed" : ""
        }`}
        onClick={() => onPrevious()}
      >
        Previous
      </a>
    </div>
  );
};

export default TitlePagination;
