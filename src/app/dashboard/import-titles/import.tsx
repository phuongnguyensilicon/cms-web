import { IAddTitlePayload } from "@/service/title/title.type";
import axios from "axios";
import { ITitleImportProps } from "./type";
import { TMDBMediaTypeEnum } from "@/utils/enum";

const TitleImport = ({
  allTitleSelected,
  onToggleSelectAll,
  handleImport,
  totalResults = 0,
  hasSelected,
  filterBy
}: ITitleImportProps) => {
  const btnClass =
    "inline-flex items-center text-sm cursor-pointer text-indigo-700 hover:text-indigo-700 font-bold";

  return (
    <>
      <div className="flex items-center">
        {totalResults > 0 && filterBy !== TMDBMediaTypeEnum.IMPORTED ? (
          <div className="flex justify-between gap-3">
            {(hasSelected || allTitleSelected) && (
              <a className={btnClass} onClick={handleImport}>
                Import
              </a>
            )}
            <a
              className={btnClass}
              onClick={onToggleSelectAll}
              style={{ width: "85px" }}
            >
              {allTitleSelected ? "Unselect All" : "Select All"}
            </a>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default TitleImport;
