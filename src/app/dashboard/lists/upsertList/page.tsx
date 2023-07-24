"use client";

import { cache, useCallback, useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DraggingStyle,
  DropResult,
  Droppable,
  NotDraggingStyle,
  ResponderProvided
} from "react-beautiful-dnd";
import Image from "next/image";
import dayjs from "dayjs";
import { notify, useAsyncEffect } from "@/utils/client.util";
import { apiCall } from "@/utils/api.util";
import { DEFAULT_IMAGE_URL } from "@/utils/constant.util";
import { IMediaListNameInfo } from "@/model/media-list/media-list.name";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import Link from "next/link";
import { HttpClient } from "@/utils/http-client";
import { toast } from "react-toastify";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { TMDBAdditionalSiteEnum, TMDBMediaTypeEnum } from "@/utils/enum";

const TMDBMediaTypes: string[] = [TMDBMediaTypeEnum.MOVIE, TMDBMediaTypeEnum.TV];

const reorder = (
  list: Iterable<unknown> | ArrayLike<unknown>,
  startIndex: number,
  endIndex: number
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (
  _isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined
) => ({
  margin: "0 0 8px 0",
  ...draggableStyle
});

const getListStyle = (_isDraggingOver: boolean) => ({
  padding: 8,
  width: "100%",
  minHeight: "750px"
});
export default function ListDetail() {
  const searchParams = useSearchParams();
  const [id, setId] = useState(searchParams?.get("LID"));
  const [dataSource, setDataSource] = useState<IMediaListNameInfo>();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [idItems, setIdItems] = useState<string[]>([]);
  const [searchItems, setSearchItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputLoading, setSearchInputLoading] = useState(false);
  const [nameInputLoading, setNameInputLoading] = useState(false);
  const [nameValidationError, setNameValidationError] = useState("");
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [startOffet, setStartOffet] = useState(0);
  const [streamerSelected, setStreamerSelected] = useState<string>();
  function onDragEnd(result: DropResult, _provided: ResponderProvided) {
    if (!result.destination) {
      return;
    }
    const newitems = reorder(
      items,
      result.source.index,
      result.destination.index
    );
    setItems(newitems);
  }

  const onAdd = (searchRecord: any) => {
    setItems([...items, searchRecord]);
    setStreamerSelected(searchRecord?.watchProvider?.providerId || 0);
  };

  const onRemoveItem = (item: any) => {
    const index = items.indexOf(item);
    if (index >= 0) {
      const clonded = [...items];
      clonded.splice(index, 1);
      setItems(clonded);
    }
  };

  const handleSearchQueryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  const onSave = async () => {
    setSubmitting(true);

    const payload = {
      id: id ?? "",
      mediaItemIds: idItems,
      ...formData
    };

    try {
      await apiCall("media/list/upsert", { method: "POST", payload });
      notify(`${id ? "Update" : "Create"} successful`);
      if (!id) {
        router.push("dashboard/lists");
      }
      setSubmitting(false);
    } catch (error) {
      notify("Failed to create list", { type: "error" });
      setSubmitting(false);
    }
  };

  const getTitle = async (offset: number) => {
    const { results, hasMoreItem } = await apiCall("media/searchForList", {
      method: "GET",
      payload: {
        query: searchQuery,
        offset,
        excludeIds: idItems.join(",")
      }
    });
    if (startOffet) {
      if (!results.length) {
        setSearchItems([]);
        return;
      }

      const uniqueNewItems = results.filter(
        (newItem: { id: any }) =>
          !searchItems.some(item => item.id === newItem.id)
      );
      setSearchItems(prevItems => [...prevItems, ...uniqueNewItems]);
    } else {
      setSearchItems(results);
    }

    setHasMoreItems(hasMoreItem);
    setStartOffet(prevIndex => prevIndex + results.length);
  };

  const fetchSearchItems = useCallback(async () => {
    setIsLoading(true);
    await getTitle(startOffet);
    setIsLoading(false);
  }, [startOffet]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || !hasMoreItems) return;
    fetchSearchItems();
  }, [fetchSearchItems, isLoading, hasMoreItems]);

  const onSetTitleReadLog = async (titleId: string) => {
    await apiCall("/log/update-read", {
      method: "PUT",
      payload: {
        id: titleId
      }
    });

    let newItems: any[] = items ?? [];
    newItems.forEach((item: any) => {
      if (item.id === titleId) {
        item.isReadLog = true;
      }
    })
    setItems([...newItems]);
  };

  const onStreamerSelected = async (titleIdx: any, streamerId: any, idx: number) => {
    console.log(id, streamerId);
    console.log(items[titleIdx]);
    if(items[titleIdx].watchProviders[idx].isSelected) {
      return;
    }

    await toast.promise(
      HttpClient.put<any>("media/updateStreamer", {
        id: items[titleIdx].id,
        selectedProviderId: streamerId
      }),
      {
        pending: "Updating streamer",
        success: "Update successful",
        error: "Update failed"
      }
    );

    const streamerIdxSelected = items[titleIdx].watchProviders.findIndex((streamer: any) => streamer.isSelected);
    items[titleIdx].watchProviders[idx].isSelected = true;
    if(streamerIdxSelected !== -1) {
      items[titleIdx].watchProviders[streamerIdxSelected].isSelected = false;
    }

    // To rerender active Streamer after selecting a new stream
    setStreamerSelected(`${idx}|${id}|${streamerId}`);

  };

  useAsyncEffect(async () => {
    if (!id) {
      return;
    }
    const res = await apiCall("media/list/detail", {
      method: "GET",
      payload: { id }
    });
    setFormData({ name: res.name, description: res.description });
    setDataSource(res as IMediaListNameInfo);
    setItems(res?.mediaItems || []);
  }, []);

  useEffect(() => {
    setIdItems(items.map((item: { id: any }) => item.id));
  }, [items]);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    if (searchQuery !== "") {
      debounceTimer = setTimeout(async () => {
        try {
          setSearchInputLoading(true);
          setStartOffet(0);
          await getTitle(0);
          setSearchInputLoading(false);
        } catch (error) {
          setSearchInputLoading(false);
        }
      }, 500);
    } else {
      setSearchItems([]);
    }
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    if (!formData.name) {
      setNameValidationError("");
      return;
    }
    if ((id && formData.name !== dataSource?.name) || !id) {
      debounceTimer = setTimeout(async () => {
        try {
          setNameInputLoading(true);
          const { isValid } = await apiCall("media/list/checkValid", {
            method: "GET",
            payload: {
              name: formData.name
            }
          });
          setNameValidationError(
            !isValid ? "That name already exists. Try another." : ""
          );
          setNameInputLoading(false);
        } catch (error) {
          setNameInputLoading(false);
        }
      }, 500);
    } else {
      setNameValidationError("");
    }
    return () => clearTimeout(debounceTimer);
  }, [formData.name]);

  // Define a function that renders each item in the list
  const renderSearchItem = ({ index, style }: ListChildComponentProps) => {
    const searchItem = searchItems[index];
    return (
      <div
        className="flex items-center justify-between gap-2 py-2 px-2 border-b"
        style={style}
      >
        <div className="name truncate">
          {searchItem.name}{" "}
          <span>
            {" "}
            ({dayjs(searchItem.releaseDate).year()})
          </span>
        </div>
        <button
          onClick={() => onAdd(searchItem)}
          className={`rounded-3xl px-3 py-1 text-sm font-semibold text-white shadow-sm w-16 flex-shrink-0 ${
            idItems.includes(searchItem.id)
              ? "cursor-not-allowed bg-gray-400"
              : "bg-indigo-500"
          }`}
          disabled={idItems.includes(searchItem.id)}
        >
          Add
        </button>
      </div>
    );
  };
  return (
    <>
      <div className="flex gap-4 w-full h-[750px]">
        <div className={`view w-1/2 overflow-y-auto pr-3`}>
          <form>
            <div className="space-y-12">
              <div className="pb-12">
                <div className="grid gap-y-2">
                  <div className="col-span-full">
                    <div className="">
                      <div className="relative">
                        <div className="flex">
                          <input
                            value={formData.name}
                            onChange={e =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            type="text"
                            name="name"
                            autoComplete="name"
                            className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                              nameValidationError
                                ? " focus:ring-red-600 ring-red-600"
                                : "focus:ring-indigo-600 border-0"
                            }`}
                            placeholder="List Name"
                          />
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
                          {nameInputLoading && (
                            <div
                              className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                              role="status"
                              aria-label="loading"
                            >
                              <span className="sr-only">Loading...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {nameValidationError && (
                        <p
                          className="text-sm text-red-600 mt-1"
                          id="hs-validation-name-error-helper"
                        >
                          {nameValidationError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-full">
                    <div className="mt-2">
                      <textarea
                        value={formData.description}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            description: e.target.value
                          })
                        }
                        name="description"
                        rows={3}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="List Description"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="searching-box">
            <div className="search-input mb-3">
              <div className="relative">
                <input
                  onChange={handleSearchQueryChange}
                  type="text"
                  name="link"
                  id="link"
                  placeholder="Search TV series & movie titles & promos/ads..."
                  className="block w-full rounded-3xl border-0 py-2.5 pr-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 basis-11/12"
                />
                {searchInputLoading && (
                  <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-4">
                    <div
                      className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                      role="status"
                      aria-label="loading"
                    >
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {searchItems?.length > 0 && (
              <div className="list-result bg-gray-100 p-1 pb-0 rounded-xl">
                <FixedSizeList
                  height={506}
                  width={"100%"}
                  itemCount={searchItems?.length}
                  itemSize={45}
                  onItemsRendered={handleLoadMore}
                >
                  {renderSearchItem}
                </FixedSizeList>
              </div>
            )}
          </div>
        </div>
        <div className="edit w-1/2 overflow-y-auto">
          <div className="bg-gray-100 rounded-xl">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {items?.map((item: any, index: number) => (
                      <div key={index}>
                        <Draggable draggableId={index.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <div className="flex relative">
                                <div
                                  className="grab mr-2 self-center p-1"
                                  {...provided.dragHandleProps}
                                >
                                  <svg
                                    width="13"
                                    height="5"
                                    viewBox="0 0 13 5"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M0.957947 1.18988L12.7056 1.18988M0.957947 3.99956H12.7056"
                                      stroke="black"
                                      strokeOpacity="0.8"
                                      strokeWidth="0.932269"
                                    />
                                  </svg>
                                </div>
                                <div
                                  className={`flex w-full items-center rounded ${
                                    snapshot.isDragging ? "shadow-md" : ""
                                  }`}
                                  style={{ background: "#D9D9D9" }}
                                >
                                  <div className="self-center font-medium tex-sm w-7 text-center">
                                    {index + 1}
                                  </div>
                                  <div className="thumnail mr-2 shrink-0">
                                    <Image
                                      className=" rounded"
                                      src={
                                        item?.posterPath || DEFAULT_IMAGE_URL
                                      }
                                      width={60}
                                      height={90}
                                      alt="thumnail"
                                    ></Image>
                                  </div>
                                  <div className="title flex-1 p-2 pl-0">
                                    <div className="title font-bold flex items-center gap-1">
                                      <Link
                                        href={
                                          TMDBMediaTypes.some(type => type === item.mediaType)
                                          ? `/dashboard/titles/${item.id}?tmdbId=${item.tmdbId}`
                                          : `/dashboard/promos-ads/detail?id=${item.id}`
                                        }
                                      >
                                        {item.name}
                                      </Link>
                                      <span className="font-semibold">
                                        {" "}
                                        ({dayjs(item.releaseDate).year()})
                                      </span>
                                      <span className="bg-gray-600 px-3 py-0 rounded inline-block text-white text-[12px] font-normal">
                                        {(item?.mediaType === "tv" && "TV") ||
                                          (item.mediaType === "movie" &&
                                            "Movie") ||
                                          item.mediaType}
                                      </span>
                                      {
                                        !!item.hasTmdbChange && !item.isReadLog && 
                                        <span className="absolute right-1 top-1"
                                          style={{cursor: "pointer"}}
                                          onClick={() => onSetTitleReadLog(item.id)}
                                        >
                                          <ExclamationCircleIcon
                                              type="solid"
                                              name="exclamation-circle"
                                              className="text-red-600 h-6 w-6"
                                          />
                                        </span>
                                      }                                      
                                    </div>
                                    <div className="overview line-clamp-2 text-xs mb-1">
                                      {item.overview}
                                    </div>
                                    <div className="flex gap-1">
                                      {item.watchProviders?.map(
                                        (watchProvider: any, idx: number) => (
                                          <div
                                            key={idx}
                                            className={`title-streamer max-w-full h-auto ${
                                              watchProvider.isSelected
                                                ? "active"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              onStreamerSelected(
                                                index,
                                                watchProvider.providerId,
                                                idx
                                              )
                                            }
                                          >
                                            <Image
                                              src={watchProvider.logoPath}
                                              width={35}
                                              height={35}
                                              alt="streamer"
                                              className="object-cover rounded border"
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                  <div className="bin cursor-pointer">
                                    <Image
                                      onClick={() => onRemoveItem(item)}
                                      src={"/images/bin.svg"}
                                      width={25}
                                      height={16}
                                      alt="bin"
                                      className="w-auto h-auto"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-900/10 border-solid mt-4 pt-4">
        <button
          onClick={e => {
            e.preventDefault();
            onSave();
          }}
          className={`py-3 px-4 inline-flex gap-2 flex-shrink-0 justify-center items-center border rounded-3xl border-transparent font-semibold  text-white transition-all text-sm w-28 ${
            submitting ? "cursor-not-allowed bg-indigo-400" : "bg-indigo-500"
          }`}
          disabled={submitting}
        >
          {submitting && (
            <span
              className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
              role="status"
              aria-label="loading"
            ></span>
          )}
          Save
        </button>
        <button
          onClick={() => router.push("dashboard/lists")}
          className={`py-3 px-4 inline-flex gap-2 flex-shrink-0 justify-center items-center border rounded-3xl border-transparent font-semibold bg-gray-300  text-white transition-all text-sm w-28`}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
