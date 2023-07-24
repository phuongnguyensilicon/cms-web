"use client";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ThePagination from "@/components/ThePagination";
import { DATE_FORMAT_LL, DEFAULT_IMAGE_URL } from "@/utils/constant.util";
import TheSearchInput from "@/components/TheSearchInput";
import { scrollTop } from "@/utils/client.util";
import ViewEditIcon from "@/components/view-edit-icon/ViewEditIcon";
import { useAsyncEffect } from "@/utils/client.util";
import { apiCall } from "@/utils/api.util";
import { ITmdbGenre } from "@/model/media/tmdp-media";

const DEFAULT_FILTER_BY = "All";

const LIMIT = 20;
export default function Titles() {
  const [loading, setLoading] = useState(true);
  const [pageChange, setPageChange]: any = useState({
    page: 1
  });
  const scrollToTopRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [selectedIds, setSelectedIds]: any[] = useState([]);
  const [dataSource, setDataSource]: any[] = useState([]);
  const [filterData, setFilterData]: any[] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [genres, setGenres] = useState<ITmdbGenre[]>([]);
  const [filterBy, setFilterBy] = useState(DEFAULT_FILTER_BY);

  const setDataSrouce = (data: any) => {
    setDataSource(data);
    setFilterData(data);
  };

  const onFilter = (value: string) => {
    setFilterBy(value);
    setPageChange({ page: 1, genre: value === DEFAULT_FILTER_BY ? "" : value });
  };

  const onPageChange = ({ page }: { page: number }) => {
    console.log(333, page);

    setPageChange({ page, genre: filterBy === DEFAULT_FILTER_BY ? "" : filterBy });
  };

  useEffect(() => {
    const { page } = pageChange;

    if (page >= 0) {
      getTitles(pageChange);
    }

    async function getTitles(params: any) {
      setLoading(true);
      params = searchValue
        ? { ...params, query: searchValue }
        : params;
      try {
        const { results, totalResults } = await apiCall("media/search", {
          method: "GET",
          payload: params
        });

        setLoading(false);

        setTotalItems(totalResults);
        if (!results.length) {
          setDataSrouce([]);
          return;
        }
        convertTitles(results);
        scrollTop(scrollToTopRef);
      } catch (error) {
        setLoading(false);
      }
    }

    const convertTitles = (items: any[]) => {
      const dataMapping = items.map(item => {
        if (item.active) {
          selectedIds.push(item.id);
        }
        const mapped = {
          ...item,
          casts: item?.casts?.length
            ? item.casts.map((cast: { name: string }) => cast.name).join(", ")
            : ""
        };
        return mapped;
      });
      setDataSrouce(dataMapping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageChange, searchValue]);

  useAsyncEffect(async () => {
    const genres = await apiCall("metadata/genre", { method: "GET" });
    setGenres([{ id: 0, name: DEFAULT_FILTER_BY }, ...genres]);
  }, []);

  return (
    <>
      <div>
        <div className="mb-3">
          <TheSearchInput onSearch={(e) => {
            setSearchValue(e);
            setPageChange({page: 1})
          }}></TheSearchInput>
        </div>
        <div className="flow-root">
          <div className="header py-2">
            <div className="total flex mb-2">
              <span className="font-bold">Titles Imported:</span> &nbsp;
              <span className="text-gray-700">{totalItems}</span>
            </div>
            <div className="filter flex gap-5">
              <div className="flex gap-2 max-h-[50px] overflow-x-auto">
                {genres.map((genre: ITmdbGenre, idx: number) => (
                  <div key={idx} className="flex-shrink-0 py-1">
                    <button
                      onClick={() => onFilter(genre.name)}
                      className={`py-0 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent font-semibold text-white/90 hover:text-white/90 hover:bg-gray-500 focus:outline-none  transition-all text-sm dark:hover:bg-gray-600 dark:focus:ring-indigo-600 dark:text-white/90 dark:focus:ring-offset-gray-800 ${
                        filterBy === genre.name
                          ? "bg-indigo-500 text-white/90 hover:bg-indigo-600"
                          : ""
                      }`}
                    >
                      {genre.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="title-list-container relative">
            {loading && (
              <div
                style={{ bottom: "45px" }}
                className="absolute top-0 left-0 right-0 bg-white/[.5] z-10 flex items-center justify-center"
              >
                <div
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20`}
                >
                  <div
                    className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                    role="status"
                    aria-label="loading"
                  >
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              </div>
            )}
            <div
              className={`table-container relative ${
                loading ? "overflow-hidden" : "overflow-auto"
              }`}
              style={{ maxHeight: "calc(100vh - 240px)", minHeight: "200px" }}
              ref={scrollToTopRef}
            >
              <table
                className="min-w-full divide-y divide-gray-300"
                style={{ minHeight: "200px" }}
              >
                <thead
                  className="sticky top-0 bg-white"
                  style={{ zIndex: "2" }}
                >
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Cast
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Genre
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Streamer
                    </th>
                    {/* <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Visibility
                    </th> */}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      View/Edit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 relative">
                  {filterData.map((d: any) => (
                    <tr key={d.id}>
                      <td
                        className="py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0"
                        width={"35%"}
                      >
                        <div className="flex gap-3">
                          <Image
                            src={d.posterPath || DEFAULT_IMAGE_URL}
                            className="max-w-full w-14 h-20 object-container rounded object-cover"
                            width={57}
                            height={84}
                            alt="poster thumbnail"
                          ></Image>
                          <div>
                            <div className="font-semibold">{d.name}</div>
                            <div className="text-gray-500 font-medium">
                              {dayjs(d.releaseDate).format(DATE_FORMAT_LL)}
                            </div>
                            <div className="text-gray-500 line-clamp-3">
                              {d.overview}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div className="line-clamp-3">{d.casts}</div>
                      </td>
                      <td
                        className="px-3 py-4 text-sm text-gray-500"
                        width={200}
                      >
                        <div className="flex gap-1 flex-wrap">
                          {d.genres.map((g: string, idx: number) => (
                            <div
                              key={idx}
                              className="py-0 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent text-white/90 transition-all text-sm"
                            >
                              {g}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {d.mediaType && (
                          <div className="py-0 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent text-white/90 transition-all text-sm">
                            {(d.mediaType === "tv" && "TV") ||
                              (d.mediaType === "movie" && "Movie") ||
                              d.mediaType}
                          </div>
                        )}
                      </td>
                      <td
                        className="px-3 py-4 text-sm text-gray-500"
                        width={200}
                      >
                        <div className="value text-gray-300 flex gap-2 flex-wrap">
                          {d?.watchProviders?.map(
                            (stream: any, idx: number) => (
                              <div
                                className="max-w-full h-auto active"
                                key={stream.providerId}
                              >
                                <Image
                                  key={idx}
                                  className="object-cover rounded border"
                                  src={stream?.logoPath}
                                  alt="Image Description"
                                  width={50}
                                  height={50}
                                />
                              </div>
                            )
                          )}
                        </div>
                      </td>
                      <td className="relative bg-te py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <div className="flex gap-2 justify-center">
                          <ViewEditIcon
                            endpoint={`/dashboard/titles/${d.id}?tmdbId=${d.tmdbId}`}
                          ></ViewEditIcon>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && !filterData.length && (
                    <tr>
                      <td className="text-center font-semibold" colSpan={9}>
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <ThePagination
              totalItems={totalItems}
              itemsPerPage={LIMIT}
              paginate={(e: any) => onPageChange(e)}
              defaultPage={pageChange?.page}
            ></ThePagination>
          </div>
        </div>
      </div>
    </>
  );
}
