import axios, { AxiosError } from "axios";
import { ChangeEvent, Key, useEffect, useState } from "react";
import { ToastOptions } from "react-toastify";


interface ITag {
  id: string;
  name: string;
  active?: boolean;
}

interface Props {
  onTagsChange: (value: Array<string>) => void;
  items: Array<string>;
}


function TagsInput(prop: Props) {
  const [tags, setTags]: any = useState([]);


  function handleAddItem(e: any) {
    let updatedTags;
    if (e.key !== "Enter") return;
    const value = e?.target?.value?.trim();
    if (!value) return;
    updatedTags =  [...tags, value];
    setTags(updatedTags);
    e.target.value = "";

    if (prop.onTagsChange) {
      prop.onTagsChange(updatedTags);
    }
  }

  function removeTag(index: any) {
    setTags(tags.filter((el: any, i: any) => i !== index));
  }

  useEffect(() => {
    if(prop.items.length){
      setTags(prop.items);
    }
  }, [prop.items])

  return (
    <div className="flex items-center gap-2 border flex-wrap p-3 rounded border-gray-100 shadow-sm ring-1 ring-inset ring-gray-300">
      {tags.map((tag: string, index: Key) => (
        <div className="" key={index}>
          <span
            className="inline-flex items-center gap-1.5 py-1.5 pl-3 pr-2 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: "rgba(55, 65, 81, 1)" }}
          >
            {tag}
            <button
                onClick={() => removeTag(index)}
              type="button"
              className="flex-shrink-0 h-4 w-4 inline-flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200 focus:text-blue-500"
            >
              <span className="sr-only">Remove badge</span>
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#fff"
                viewBox="0 0 16 16"
              >
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </span>
        </div>
      ))}
      <input
        onKeyDown={handleAddItem}
        type="text"
        className="focus:border-transparent focus:ring-0 flex-grow border-0 p-0"
        placeholder="Type to add tags"
      />
    </div>
  );
}

export default TagsInput;
