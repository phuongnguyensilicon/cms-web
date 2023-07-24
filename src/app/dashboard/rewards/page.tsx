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
import { IUserRewardInfo } from "@/model/account/userInfo";

const handleError = () => {
  notify("Error occurred!", { type: "error" });
};


const LIMIT = 20;
export default function Rewards() {
  const [loading, setLoading] = useState(true);
  const scrollToTopRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [dataSource, setDataSource] = useState<IUserRewardInfo[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState({ page, query: "", isRedeem: '' });
  const [isRedeem, setIsRedeem] = useState<string>("");

  const columns: IColumnType<IUserRewardInfo>[] = useMemo(
    () => [
      {
        key: "userName",
        title: "Username",
        width: "20%",
        render: (_, { userName }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{userName}</div>
        )
      },
      {
        key: "email",
        title: "Email",
        width: "25%",
        render: (_, { email }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{email}</div>
        )
      },
      {
        key: "giftCardType",
        title: "Gift Card Type",
        width: "15%",
        render: (_, { giftCardType }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{giftCardType}</div>
        )
      },
      {
        key: "totalPoints",
        title: "Points Balance",
        width: "10%",
        render: (_, { totalPoints }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{totalPoints}</div>
        )
      },
      {
        key: "redeemDate",
        title: "Redeem Date",
        width: "10%",
        align: "center",
        render: (_, { redeemDate }) => (
          <span>{dayjs(redeemDate).format(DATE_FORMAT)}</span>
        )
      },
      {
        key: "isRedeem",
        title: "Redeemed?",
        width: "15%",
        align: "center",
        render: (_, { isRedeem }) => (
          <span>{!!isRedeem ? 'YES': 'NO'}</span>
        )
      },
      {
        key: "rowChecked",
        title: "",
        render: (_, {}) => (
          <div className="whitespace-pre-wrap line-clamp-3">
            <input
                          name="comments"
                          type="checkbox"
                          checked={true}
                          disabled={true}
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
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
    setPayload({ page: 1, query: searchText, isRedeem: '' });
  };

  const fechData = async () => {
    setLoading(true);

    const { results, totalResults } = await apiCall("users/rewards", {
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
      <div className="header py-2">
        <div className="total flex mb-2">
          <span className="font-bold">Total Results:</span> &nbsp;
          <span className="text-gray-700">{totalItems}</span>
        </div>
        <div className="filter flex gap-5">
          <div className="flex gap-2 max-h-[50px] overflow-x-auto">
            <div className="flex-shrink-0 py-1">
                <button
                    onClick={() => setIsRedeem('')}
                    className={`py-0 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent font-semibold text-white/90 hover:text-white/90 hover:bg-gray-500 focus:outline-none  transition-all text-sm dark:hover:bg-gray-600 dark:focus:ring-indigo-600 dark:text-white/90 dark:focus:ring-offset-gray-800`}
                >
                  All
                </button>
              </div>
          </div>
          <div className="flex gap-2 max-h-[50px] overflow-x-auto">
            <div className="flex-shrink-0 py-1">
                <button
                    onClick={() => setIsRedeem('true')}
                    className={`py-0 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent font-semibold text-white/90 hover:text-white/90 hover:bg-gray-500 focus:outline-none  transition-all text-sm dark:hover:bg-gray-600 dark:focus:ring-indigo-600 dark:text-white/90 dark:focus:ring-offset-gray-800`}
                >
                  Redeemed
                </button>
              </div>
          </div>
          <div className="flex gap-2 max-h-[50px] overflow-x-auto">
            <div className="flex-shrink-0 py-1">
                <button
                    onClick={() => setIsRedeem('false')}
                    className={`py-0 px-3 inline-flex justify-center items-center gap-2 rounded-md bg-gray-600 border border-transparent font-semibold text-white/90 hover:text-white/90 hover:bg-gray-500 focus:outline-none  transition-all text-sm dark:hover:bg-gray-600 dark:focus:ring-indigo-600 dark:text-white/90 dark:focus:ring-offset-gray-800`}
                >
                  Not Redeemed
                </button>
              </div>
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
    </>
  );
}
