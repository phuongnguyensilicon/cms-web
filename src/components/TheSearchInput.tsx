"use client";
import { ChangeEvent, FormEvent, useState } from "react";

interface Props {
  onSearch: (searchText: string) => void;
  placeholder?: string;
}

export default function TheSearchInput(props: Props) {
  const [searchText, setSearchText] = useState("");

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSearch(searchText);
  };

  return (
    <form
      className="relative flex rounded-md shadow-sm"
      onSubmit={handleFormSubmit}
    >
      <input
        type="text"
        id="hs-trailing-button-add-on-with-icon-and-button"
        name="hs-trailing-button-add-on-with-icon-and-button"
        className="py-3 px-4 pl-11 block w-full border-gray-200 shadow-sm rounded-l-md text-sm dark:text-gray-400"
        placeholder={props.placeholder || 'Search...'}
        onChange={handleInputChange}
      />
      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-20 pl-4">
        <svg
          className="h-4 w-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
      </div>
      <button className="py-3 px-4 inline-flex flex-shrink-0 justify-center items-center rounded-r-md border border-transparent font-semibold bg-indigo-500 text-white hover:bg-indigo-600 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm">
        Search
      </button>
    </form>
  );
}
