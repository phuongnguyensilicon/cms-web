"use client";
import { IColumnType, Table } from "@/components/Table";
import ThePagination from "@/components/ThePagination";
import TheSearchInput from "@/components/TheSearchInput";
import { IUserContestResponse } from "@/model/contests/contest";
import { apiCall } from "@/utils/api.util";
import { notify, useAsyncEffect } from "@/utils/client.util";
import { DATE_FORMAT } from "@/utils/constant.util";
import ViewUserProfileIcon from "@components/view-user-profile-icon/ViewUserProfileIcon";
import dayjs from "dayjs";
import { useMemo, useRef, useState } from "react";
import ContestDetail from "../../../components/ContestDetail";

const handleError = () => {
  notify("Error occurred!", { type: "error" });
};


const LIMIT = 20;
export default function Rewards() {
  const [loading, setLoading] = useState(true);
  const scrollToTopRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [dataSource, setDataSource] = useState<IUserContestResponse[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [payload, setPayload] = useState({ page, query: ""});

  const columns: IColumnType<IUserContestResponse>[] = useMemo(
    () => [
      {
        key: "userName",
        title: "Username",
        width: "15%",
        render: (_, { userName }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{userName}</div>
        )
      },
      {
        key: "email",
        title: "Email",
        width: "15%",
        render: (_, { email }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{email}</div>
        )
      },
      {
        key: "phone",
        title: "Phone Number",
        width: "15%",
        render: (_, { phone }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{phone}</div>
        )
      },
      {
        key: "totalTix",
        title: "Tickets Claimed",
        width: "10%",
        render: (_, { totalTix }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{totalTix}</div>
        )
      },
      {
        key: "tixCreatedAt",
        title: "Date Claimed",
        width: "10%",
        render: (_, { tixCreatedAt }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{dayjs(tixCreatedAt).format(DATE_FORMAT)}</div>
        )
      },
      {
        key: "citySate",
        title: "City/State",
        width: "10%",
        render: (_, { city, state }) => (
          <div className="whitespace-pre-wrap line-clamp-3">{`${city??''}/${state??''}`}</div>
        )
      },
      {
        key: "lastWonDate",
        title: "Won?",
        width: "10%",
        align: "center",
        render: (_, { lastWonDate }) => (
          <span>{
            !lastWonDate
            ? 'No'
            : `Yes ${dayjs(lastWonDate).format(DATE_FORMAT)}`            
          }</span>
        )
      },
      {
        key: "view",
        title: "View Profile",
        width: "10%",
        align: "center",
        render: (_, { id }) => (
          <div className="flex justify-center">
            <ViewUserProfileIcon
              endpoint={`/dashboard/contests/users/profile?id=${id}`}
            ></ViewUserProfileIcon>
          </div>
        )
      },
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
    setPayload({ page: 1, query: searchText});
  };

  const fechData = async () => {
    setLoading(true);

    const { results, totalResults } = await apiCall("contest/users", {
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
      <div className="header py-2 flex">
        <div className="mb-2 flex">
          <span className="font-bold">Date:</span> &nbsp;
          <span className="text-gray-700">{dayjs(new Date()).format(DATE_FORMAT)}</span>
        </div>
        <div className="flex mb-2" style={{
          justifyContent: "flex-end",
          flex: "1"
        }}>
          <ContestDetail></ContestDetail>
        </div>
      </div>
      <div className="header py-2">
        <div className="total flex mb-2">
          <span className="font-bold">Total Results:</span> &nbsp;
          <span className="text-gray-700">{totalItems}</span>
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
