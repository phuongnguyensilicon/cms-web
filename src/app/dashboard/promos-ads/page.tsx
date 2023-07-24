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
import { DATE_FORMAT, DEFAULT_IMAGE_URL, LIMIT_PER_PAGE } from "@/utils/constant.util";
import dayjs from "dayjs";
import CommonDialog from "@/components/Dialog";
import { toast } from "react-toastify";
import Link from "next/link";
import { ClixSearchType, TMDBMediaTypeEnum } from "@/utils/enum";
import { IMediaShortInfo } from "@/model/media/media";

const handleError = () => {
  notify("Error occurred!", { type: "error" });
};


const LIMIT = 20;
export default function Lists() {
  const [loading, setLoading] = useState(true);
  const scrollToTopRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [dataSource, setDataSource] = useState<IMediaShortInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState({ page, query: "", type: ClixSearchType.PROMO_ADS });
  const [deleteId, setDeleteId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  

  const columns: IColumnType<IMediaShortInfo>[] = useMemo(
    () => [
      {
        key: "posterPath",
        title: "Title Poster",
        width: "20%",
        render: (_, { posterPath }) => <div>
          <Image
                            src={ posterPath || DEFAULT_IMAGE_URL }
                            className="max-w-full w-14 h-20 object-container rounded object-cover"
                            width={100}
                            height={100}
                            alt="poster thumbnail"
                          ></Image>
          </div>
      },
      {
        key: "name",
        title: "Title",
        width: "30%",
        render: (_, { name }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{name}</div>
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
        key: "mediaType",
        title: "Category",
        width: "20%",
        render: (_, { mediaType }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{mediaType}</div>
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
              endpoint={`/dashboard/promos-ads/detail?id=${id}`}
            ></ViewEditIcon>
          </div>
        )
      },
      {
        key: "remove",
        title: "Remove",
        width: "5%",
        align: "center",
        render: (_, { id }) => (
          <div className="flex justify-center flex-shrink-0">
            <Image
              onClick={() => handleOpen((id ?? ''))}
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
    []
  );

  const onPageChange = async ({ page }: { page: number }) => {
    setPage(page);
    setPayload({...payload, page: page});
  };

  const onSearch = (searchText: string) => {
    setSearchValue(searchText);
    setPage(1);
    setPayload({ page: 1, query: searchText, type: ClixSearchType.PROMO_ADS });
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
        await apiCall("media/delete", {
          method: "DELETE",
          payload: { ids: deleteId }
        });
        notify("Delete successfully!");
      } catch (error) {
        handleError();
      }
      setPayload({ page, query: "", type: ClixSearchType.PROMO_ADS });
    }
  };

  const fechData = async () => {
    setLoading(true);

    const { results, totalResults } = await apiCall("media/search", {
      method: "GET",
      payload
    });

    setDataSource(results);
    
    setTotalItems(totalResults);
    setLoading(false);
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
          <span className="font-bold">Total Results:</span> &nbsp;
          <span className="text-gray-700">{totalItems}</span>
        </div>
        <div className="button-create">
          <Link
            href={"/dashboard/promos-ads/detail"}
            className="w-auto py-3 px-4 inline-flex gap-2 flex-shrink-0 justify-center items-center border rounded-3xl border-transparent font-semibold  text-white transition-all text-sm w-28 bg-indigo-500"
          >
            Create Promo
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
            draggable={false}
          />
        </div>
      </div>
      <ThePagination
              totalItems={totalItems}
              itemsPerPage={LIMIT}
              paginate={(e: any) => onPageChange(e)}
              defaultPage={page}
            ></ThePagination>
      <CommonDialog
        isOpen={isOpen}
        onClose={handleClose}
        title="Delete promo"
        content="Are you sure you want to delete this promo?"
      />
    </>
  );
}
