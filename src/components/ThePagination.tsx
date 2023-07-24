"use client"
import React, { useEffect, useState } from "react";

const ThePagination = ({ itemsPerPage, totalItems, defaultPage, paginate }: Pagination) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageNumbers = [];
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  let firstPageIndex;
  let lastPageIndex;

  if (currentPage <= 2) {
    firstPageIndex = 1;
    lastPageIndex = Math.min(totalPages, 4);
  } else if (currentPage >= totalPages - 1) {
    firstPageIndex = Math.max(1, totalPages - 3);
    lastPageIndex = totalPages;
  } else {
    firstPageIndex = currentPage - 2;
    lastPageIndex = currentPage + 1;
  }

  const onPaginate = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    if (pageIndex === currentPage) {
      return;
    }
    // const offset = itemsPerPage * pageIndex - itemsPerPage;
    paginate({ page: pageIndex } as PaginateResult);
  };

  const pagesToShow = pageNumbers.slice(firstPageIndex - 1, lastPageIndex);


  useEffect(() => {
    setCurrentPage(defaultPage || 1);
  }, [defaultPage])

  return (
    <nav className="flex justify-center mt-6">
      <div>
        <a
          onClick={() => (currentPage < 2 ? null : onPaginate(1))}
          className={`px-3 py-1 bg-white border rounded-md mx-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:border-indigo-300 ${
            currentPage > 1 ? "" : "text-stone-300 cursor-not-allowed"
          }`}
        >
          &#60;&#60;
        </a>
      </div>
      <ul className="flex">
        <li>
          <a
            onClick={() =>
              currentPage < 2 ? null : onPaginate(currentPage - 1)
            }
            className={`px-3 py-1 bg-white border rounded-md mx-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:border-indigo-300 ${
              currentPage > 1 ? "" : "text-stone-300 cursor-not-allowed"
            }`}
          >
            &#60;
          </a>
        </li>
        {pagesToShow.map(number => (
          <li key={number}>
            <a
              onClick={() => onPaginate(number)}
              className={`px-3 py-1 border rounded-md mx-1 text-sm font-medium focus:outline-none focus:ring focus:border-indigo-300 cursor-default ${
                number === currentPage
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {number}
            </a>
          </li>
        ))}

        <li>
          <a
            href="#"
            onClick={() =>
              currentPage >= totalPages ? null : onPaginate(currentPage + 1)
            }
            className={`px-3 py-1 bg-white border rounded-md mx-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:border-indigo-300 ${
              currentPage >= totalPages
                ? "text-stone-300 cursor-not-allowed"
                : ""
            }`}
          >
            &#62;
          </a>
        </li>
      </ul>
      <div>
        <a
          href="#"
          onClick={() =>
            currentPage >= totalPages ? null : onPaginate(totalPages)
          }
          className={`px-3 py-1 bg-white border rounded-md mx-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:border-indigo-300 ${
            currentPage >= totalPages ? "text-stone-300 cursor-not-allowed" : ""
          }`}
        >
          &#62;&#62;
        </a>
      </div>
    </nav>
  );
};

export default ThePagination;

export interface Pagination {
  itemsPerPage: number;
  totalItems: number;
  defaultPage?: number;
  paginate: Function;
}

export interface PaginateResult {
  offset?: number;
  limit?: number;
  page: number;
}
