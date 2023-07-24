"use client";
import { IColumnType, Table } from "@/components/Table";
import { Switch } from "@headlessui/react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import ViewEditIcon from "@/components/view-edit-icon/ViewEditIcon";
import { notify, useAsyncEffect } from "@/utils/client.util";
import { apiCall } from "@/utils/api.util";
import { IMediaListNameInfo } from "@/model/media-list/media-list.name";
import TheSearchInput from "@/components/TheSearchInput";
import ThePagination from "@/components/ThePagination";
import { DATE_FORMAT, LIMIT_PER_PAGE } from "@/utils/constant.util";
import dayjs from "dayjs";
import CommonDialog from "@/components/Dialog";
import { toast } from "react-toastify";
import Link from "next/link";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

const handleError = () => {
  notify("Error occurred!", { type: "error" });
};

export default function Lists() {
  const [loading, setLoading] = useState(true);
  const scrollToTopRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [dataSource, setDataSource] = useState<IMediaListNameInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState({ page, query: "" });
  const [toggleList, setToggleList] = useState<any>([]);
  const [deleteId, setDeleteId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const columns: IColumnType<IMediaListNameInfo>[] = useMemo(
    () => [
      {
        key: "name",
        title: "List Name",
        width: "20%",
        render: (_, { name }) => <div className="line-clamp-1">{name}</div>
      },
      {
        key: "description",
        title: "Description",
        width: "25%",
        render: (_, { description }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{description}</div>
        )
      },
      {
        key: "hasTmdbChange",
        title: "TMDB Status",
        width: "10%",
        render: (_, { hasTmdbChange }) => ( !!hasTmdbChange && 
          <span className="px-3 py-4 text-sm text-gray-500 text-center">
            <ExclamationCircleIcon
              type="solid"
              name="exclamation-circle"
              className="text-red-600 h-6 w-6 relative inline-flex "
            />
          </span>
        )
      },
      {
        key: "createdAt",
        title: "Date Created",
        width: "15%",
        align: "center",
        render: (_, { createdAt }) => (
          <span>{dayjs(createdAt).format(DATE_FORMAT)}</span>
        )
      },
      {
        key: "visibility",
        title: "Visibility",
        width: "10%",
        align: "center",
        render: (_, { id }) => (
          <>
            <Switch
              checked={toggleList?.includes(id)}
              onChange={() => visibilityToggle(id, !toggleList?.includes(id))}
              className={`${
                toggleList?.includes(id) ? "bg-indigo-400" : "bg-gray-200"
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span
                className={`${
                  toggleList?.includes(id) ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </>
        )
      },
      {
        key: "view",
        title: "View/Edit",
        width: "10%",
        align: "center",
        render: (_, { id }) => (
          <div className="flex justify-center">
            <ViewEditIcon
              endpoint={`/dashboard/lists/upsertList?LID=${id}`}
            ></ViewEditIcon>
          </div>
        )
      },
      {
        key: "remove",
        title: "Remove",
        width: "10%",
        align: "center",
        render: (_, { id }) => (
          <div className="flex justify-center flex-shrink-0">
            <Image
              onClick={() => handleOpen(id)}
              src={"/images/bin.svg"}
              width={100}
              height={16}
              alt="bin"
              className="w-auto h-auto"
            />
          </div>
        )
      }
    ],
    [toggleList]
  );

  const onPageChange = ({ page }: { page: number }) => {
    setPage(page);
    setPayload({ page, query: searchValue });
  };

  const onSearch = (searchText: string) => {
    setSearchValue(searchText);
    setPayload({ page: 1, query: searchText });
  };

  const visibilityToggle = async (id: string, isVisibility: boolean) => {
    const newSelectedIds = toggleList.includes(id)
      ? toggleList.filter((selectedId: string) => selectedId !== id)
      : [...toggleList, id];
    setToggleList(newSelectedIds);

    await toast.promise(
      apiCall("media/list/visibility", {
        method: "PUT",
        payload: { id, isVisibility }
      }),
      {
        pending: "Updating visibility",
        success: "Update successful",
        error: "Update failed"
      }
    );
  };

  const handleOpen = (id: string) => {
    setDeleteId(id);
    setIsOpen(true);
  };

  const handleClose = async (action: boolean) => {
    setIsOpen(false);
    if (action) {
      try {
        setLoading(true);
        await apiCall("media/list/delete", {
          method: "DELETE",
          payload: { ids: deleteId }
        });
        notify("Delete successfully!");
      } catch (error) {
        handleError();
      }
      setPayload({ page, query: "" });
    }
  };

  const fechData = async () => {
    setLoading(true);
    const { results, totalResults } = await apiCall("media/list/search", {
      method: "GET",
      payload
    });

    setDataSource(results);
    setToggleList(
      results.map(
        (item: { active: boolean; id: string }) => item.active && item.id
      )
    );
    setTotalItems(totalResults);
    setLoading(false);
  };

  const handleDragEnd = async (res: { id: string; newIndex: number }) => {
    const { id, newIndex } = res;
    await toast.promise(
      apiCall("media/list/changeOrder", {
        method: "POST",
        payload: { id, newDisplayOrder: (newIndex + 1) * page }
      }),
      {
        pending: "Reordering Lists",
        success: "Update successful",
        error: "Update failed"
      }
    );
  };

  useAsyncEffect(async () => {
    if (Object.keys(payload).length) {
      fechData();
    }
  }, [payload]);

  return (
    <>
      <div className="mb-3">
        <TheSearchInput onSearch={onSearch}></TheSearchInput>
      </div>
      <div className="py-2 flex items-center justify-between">
        <div className="total flex">
          <span className="font-bold">Total Lists:</span> &nbsp;
          <span className="text-gray-700">{totalItems}</span>
        </div>
        <div className="button-create">
          <Link
            href={"/dashboard/lists/upsertList"}
            className="py-3 px-4 inline-flex gap-2 flex-shrink-0 justify-center items-center border rounded-3xl border-transparent font-semibold  text-white transition-all text-sm w-28 bg-indigo-500"
          >
            Create List
          </Link>
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
          style={{ maxHeight: "calc(100vh - 150px)", minHeight: "200px" }}
          ref={scrollToTopRef}
        >
          <Table
            data={dataSource}
            columns={columns}
            draggable={true}
            onDragEnd={handleDragEnd}
          />
        </div>
        {/* <ThePagination
          totalItems={totalItems}
          itemsPerPage={LIMIT_PER_PAGE}
          paginate={(e: any) => onPageChange(e)}
        ></ThePagination> */}
      </div>

      <CommonDialog
        isOpen={isOpen}
        onClose={handleClose}
        title="Delete list"
        content="Are you sure you want to delete this list?"
      />
    </>
  );
}
