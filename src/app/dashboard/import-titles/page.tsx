"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import TitleImport from "./import";
import TheSearchInput from "@/components/TheSearchInput";
import {
  DATE_FORMAT_LL,
  DEFAULT_IMAGE_URL,
  LIMIT_PER_PAGE
} from "@/utils/constant.util";
import dayjs from "dayjs";
import { TMDBMediaTypeEnum } from "@/utils/enum";
import axios from "axios";
import { scrollTop, useAsyncEffect } from "@/utils/client.util";
import { apiCall } from "@/utils/api.util";
import Link from "next/link";
import ThePagination from "@/components/ThePagination";

const SEARCH_ENDPOINT = "media/search";

const Title = () => {
  const [allTitleSelected, setAllTitleSelected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const tableScrollToTop: React.RefObject<HTMLDivElement> = useRef(null);
  const [itemSelectedList, setItemSelectedList] = useState<any>([]);
  const [filterData, setFilterData] = useState([]);
  const [filterBy, setFilterBy]: any[] = useState<TMDBMediaTypeEnum>(
    TMDBMediaTypeEnum.MOVIE
  );
  const [searchValue, setSearchValue] = useState("");
  const [movies, setMovies] = useState<any>([]);
  const [tvShows, setTVShows] = useState<any>([]);
  const [importedList, setImportedList] = useState<any>([]);
  let [counter, setCounter] = useState<any>({});
  const [page, setPage] = useState<number>(1);
  const [pageChange, setPageChange]: any = useState({
    page: 1
  });
  let [payload, setPayload] = useState<any>({});
  const [fetchCategory, setFetchCategory] = useState("");
  const [pageInfo, setPageInfo] = useState<any>({});
  const onCheckCard = (id: number, _idx: number) => {
    if (!itemSelectedList.includes(id)) {
      setItemSelectedList([...itemSelectedList, id]);
    } else {
      setItemSelectedList(
        itemSelectedList.filter((el: any, i: any) => el !== id)
      );
    }
  };

  const onToggleSelectAll = () => {
    if (allTitleSelected) {
      resetAction();
      return;
    }
    setAllTitleSelected(true);
    setItemSelectedList(
      filterBy === TMDBMediaTypeEnum.MOVIE
        ? movies.map((m: { tmdbId: number }) => m.tmdbId)
        : tvShows.map((m: { tmdbId: number }) => m.tmdbId)
    );
  };

  const resetAction = () => {
    setItemSelectedList([]);
    setAllTitleSelected(false);
  };

  const onFilter = (type: TMDBMediaTypeEnum) => {
    setFilterBy(type);
    setPage(counter?.[type]?.page);
    resetAction();
    switch (type) {
      case TMDBMediaTypeEnum.MOVIE:
        setFilterData(movies);
        break;
      case TMDBMediaTypeEnum.TV:
        setFilterData(tvShows);
        break;
      default:
        setFilterData(importedList);
        break;
    }
  };



  const onSearch = async (value: string) => {
    setSearchValue(value);
    setFetchCategory("");
    setFilterBy(TMDBMediaTypeEnum.MOVIE);
    setPage(1);
    navigateToPage(page);
  };

  const onPageChange = ({ page }: { page: number }) => {
    setFetchCategory(filterBy);
    resetAction();
    navigateToPage(page);
  };

  const onImport = async () => {
    setLoading(true);
    const body = {
      type: filterBy,
      tmdbIds: itemSelectedList
    };
    await apiCall("media/import", { method: "POST", payload: body });
    setFetchCategory('');
    setPayload({ page, query: searchValue });
    resetAction();
  };

  const navigateToPage = (page: number, category: string = "") => {
    setPage(page);
    setPayload({ page, query: searchValue });
  };

  const getMovies = async () => {
    const params = { ...payload, type: TMDBMediaTypeEnum.MOVIE };
    const { results, page, totalPages, totalResults } = await apiCall(
      SEARCH_ENDPOINT,
      { method: "GET", payload: params }
    );

    setMovies([...results]);
    setFilterData(results);
    setPageInfo({ movie: { page, totalPages, totalResults } });
    return { results, page, totalPages, totalResults };
  };

  const getTVs = async () => {
    const params = { ...payload, type: TMDBMediaTypeEnum.TV };
    const { results, page, totalPages, totalResults } = await apiCall(
      SEARCH_ENDPOINT,
      {
        method: "GET",
        payload: params
      }
    );

    setTVShows([...results]);
    setFilterData(results);
    setPageInfo({ tv: { page, totalPages, totalResults } });

    return { results, page, totalPages, totalResults };
  };

  const getItemsImported = async () => {
    const params = { ...payload, type: TMDBMediaTypeEnum.IMPORTED };
    const { results, page, totalPages, totalResults } = await apiCall(
      SEARCH_ENDPOINT,
      { method: "GET", payload: params }
    );

    setImportedList([...results]);
    setFilterData(results);
    setPageInfo({ imported: { page, totalPages, totalResults } });
    return { results, page, totalPages, totalResults };
  };

  const fetchAllData = async () => {
    payload = { ...payload, query: searchValue };

    try {
      const [moviesRes, tvShowsRes, importedListRes] = await Promise.all([
        getMovies(),
        getTVs(),
        getItemsImported()
      ]);
      setPageInfo({
        movie: {
          page: moviesRes.page,
          totalPages: moviesRes.totalPages,
          totalResults: moviesRes.totalResults
        },
        tv: {
          page: tvShowsRes.page,
          totalPages: tvShowsRes.totalPages,
          totalResults: tvShowsRes.totalResults
        },
        imported: {
          page: importedListRes.page,
          totalPages: importedListRes.totalPages,
          totalResults: importedListRes.totalResults
        }
      });

      setFilterData(moviesRes.results); // Default show Movie
    } catch (error) {
      setLoading(false);
    }
  };

  useAsyncEffect(async () => {
    if (Object.keys(payload).length) {
      setLoading(true);
      if (fetchCategory === TMDBMediaTypeEnum.MOVIE) {
        await getMovies();
      } else if (fetchCategory === TMDBMediaTypeEnum.TV) {
        await getTVs();
      } else if (fetchCategory === TMDBMediaTypeEnum.IMPORTED) {
        await getItemsImported();
      } else {
        await fetchAllData();
      }
      setLoading(false);
      scrollTop(tableScrollToTop);
    }
  }, [payload]);

  useEffect(() => {
    if (Object.keys(pageInfo).length) {
      setCounter({ ...counter, ...pageInfo });
    }
  }, [pageInfo]);

  return (
    <>
      <div className="flow-root">
        <div className="mb-3">
          <TheSearchInput onSearch={onSearch}></TheSearchInput>
        </div>
        <div className="header py-2 flex justify-between items-center">
          <div className="filter flex gap-5">
            <div>
              {counter?.movie?.totalResults > 0 && (
                <button
                  onClick={() => onFilter(TMDBMediaTypeEnum.MOVIE)}
                  type="button"
                  className={`py-1 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent font-semibold text-white/90 hover:text-white/90 hover:bg-gray-500 focus:outline-none  transition-all text-sm dark:hover:bg-gray-600 dark:focus:ring-indigo-600 dark:text-white/90 dark:focus:ring-offset-gray-800 ${
                    filterBy === TMDBMediaTypeEnum.MOVIE
                      ? "bg-indigo-500 text-white/90 hover:bg-indigo-500"
                      : ""
                  }`}
                >
                  Movies{" "}
                  <span
                    className="count bg-gray-100 rounded p-0.5 text-black text-xs h-5"
                    style={{ minWidth: 20 }}
                  >
                    {counter?.movie?.totalResults}
                  </span>
                </button>
              )}
            </div>
            <div>
              {counter?.tv?.totalResults > 0 && (
                <button
                  onClick={() => onFilter(TMDBMediaTypeEnum.TV)}
                  type="button"
                  className={`py-1 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent font-semibold text-white/90 hover:text-white/90 hover:bg-gray-500 focus:outline-none  transition-all text-sm dark:hover:bg-gray-600 dark:focus:ring-indigo-600 dark:text-white/90 dark:focus:ring-offset-gray-800 ${
                    filterBy === TMDBMediaTypeEnum.TV
                      ? "bg-indigo-500 text-white/90 hover:bg-indigo-500"
                      : ""
                  }`}
                >
                  TV Shows{" "}
                  <span
                    className="count bg-gray-100 rounded p-0.5 text-black text-xs h-5"
                    style={{ minWidth: 20 }}
                  >
                    {counter?.tv?.totalResults}
                  </span>
                </button>
              )}
            </div>
            <div>
              {counter?.imported?.totalResults > 0 && (
                <button
                  onClick={() => onFilter(TMDBMediaTypeEnum.IMPORTED)}
                  type="button"
                  className={`py-1 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent font-semibold text-white/90 hover:text-white/90 hover:bg-gray-500 focus:outline-none  transition-all text-sm dark:hover:bg-gray-600 dark:focus:ring-indigo-600 dark:text-white/90 dark:focus:ring-offset-gray-800 ${
                    filterBy === TMDBMediaTypeEnum.IMPORTED
                      ? "bg-indigo-500 text-white/90 hover:bg-indigo-500"
                      : ""
                  }`}
                >
                  Imported{" "}
                  <span
                    className="count bg-gray-100 rounded p-0.5 text-black text-xs h-5"
                    style={{ minWidth: 20 }}
                  >
                    {counter?.imported?.totalResults}
                  </span>
                </button>
              )}
            </div>
          </div>
          <div className="total mb-2">
            <TitleImport
              allTitleSelected={allTitleSelected}
              onToggleSelectAll={onToggleSelectAll}
              totalResults={counter?.[filterBy]?.totalResults}
              hasSelected={itemSelectedList.length > 0}
              handleImport={onImport}
              filterBy={filterBy}
            />
          </div>
        </div>
        <div className="title-list-container relative">
          {loading && (
            <div
              style={{ bottom: 45 }}
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
            style={{ maxHeight: "calc(100vh - 240px)", minHeight: "300px" }}
            ref={tableScrollToTop}
          >
            <table
              className="min-w-full divide-y divide-gray-300"
              style={{ minHeight: "300px" }}
            >
              <thead className="sticky top-0 bg-white" style={{ zIndex: "2" }}>
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
                    Status
                  </th>
                  <th
                    scope="col"
                    className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    style={{ width: "7%" }}
                  ></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 relative">
                {filterData.map((d: any, idx: number) => (
                  <tr key={idx}>
                    <td
                      className="py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-0"
                      width={"35%"}
                    >
                      <div className="flex gap-3">
                        <Image
                          src={d.posterPath ? d.posterPath : DEFAULT_IMAGE_URL}
                          className="max-w-full w-14 h-20 object-container rounded object-cover"
                          width={56}
                          height={84}
                          alt="poster thumbnail"
                        ></Image>
                        <div>
                          <div className="font-semibold">
                            {d?.id ? (
                              <Link
                                href={`/dashboard/titles/${d.id}?tmdbId=${d.tmdbId}`}
                              >
                                {d.name}
                              </Link>
                            ) : (
                              <div>{d.name}</div>
                            )}
                          </div>
                          {d.releaseDate && (
                            <div className="text-gray-500 font-medium">
                              {dayjs(d.releaseDate).format(DATE_FORMAT_LL)}
                            </div>
                          )}
                          <div className="text-gray-500 line-clamp-3">
                            {d.overview}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {d.genres && (
                        <div className="flex gap-1 flex-wrap">
                          {d.genres?.map((g: string, genreIdx: number) => (
                            <div
                              key={genreIdx}
                              className="py-0 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent text-white/90 transition-all text-sm"
                            >
                              {g}
                            </div>
                          ))}
                        </div>
                      )}
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
                      width={"12%"}
                    >
                      {d.id && (
                        <div className="px-3 py-1 bg-green-500 text-white rounded-md inline-block">
                          Imported
                        </div>
                      )}
                    </td>
                    <td className="relative bg-te py-4 pl-3 pr-4 text-sm font-medium sm:pr-0">
                      {!d.id && (
                        <input
                          name="comments"
                          type="checkbox"
                          checked={itemSelectedList.includes(d.tmdbId)}
                          onChange={() => onCheckCard(d.tmdbId, idx)}
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && !filterData.length && (
                  <tr>
                    <td
                      className="text-center text-gray-500 italic text-sm"
                      colSpan={9}
                    >
                      There is no movies or TV shows that matched your query
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div>
            {counter?.[filterBy]?.totalResults > 0 && (
              <ThePagination
                totalItems={counter?.[filterBy].totalResults}
                defaultPage={page}
                itemsPerPage={LIMIT_PER_PAGE}
                paginate={(e: any) => onPageChange(e)}
              ></ThePagination>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Title;
