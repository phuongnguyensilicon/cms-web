"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import classNames from "classnames";
import dayjs from "dayjs";
import { DATE_FORMAT_LL } from "@/utils/constant.util";
import { checkPosterPath, formatRuntime } from "@/utils/client.util";
import styles from "../title.module.css";
import Video from "./video";
import { toIframeSrc } from "@/utils/client.util";
import { IMediaAdditionalInfo } from "@/model/media/media";
import { apiCall } from "@/utils/api.util";
import { lowerCase } from "@helpers/ultis";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import DatePicker from "@components/DatePicker";

interface FormModel {
  videos: IMediaAdditionalInfo[];
  selectedProviderId: number;
  selectedGenre: string;
  customReleaseDate?: string;
}
interface Props {
  dataSource: any;
  officialVideoKey: string;
  formUpdate: (formData: FormModel) => void;
  officialVideoUpdate: (id: string) => void;
}
const tabs = [
  { id: "video", name: "Videos", href: "#", count: 0, current: true }
];

export default function ViewTitle({
  dataSource,
  formUpdate,
  officialVideoKey,
  officialVideoUpdate
}: Props) {
  const [tabSelect, setTabSelect]: any = useState("video");
  const [prevTabIdxSlected, setPrevTabIdxSlected] = useState(
    tabs.findIndex(tab => tab.current)
  );
  const [videos, setVideos] = useState<IMediaAdditionalInfo[]>([]);
  const [streamerSelected, setStreamerSelected] = useState<number>(0);
  const [genreSelected, setGenreSelected] = useState<string>("");
  const [searchItems, setSearchItems] = useState<any[]>([]);
  const [customProviderIds, setCustomProviderIds] = useState<number[]>([]);
  const [keyword, setKeyword] = useState("");
  const [theatreLink, setTheatreLink] = useState("");
  const [streamers, setStreamers] = useState<any[]>([]);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);
  const [customReleaseDate, setCustomReleaseDate] = useState<
    string | undefined
  >(undefined);
  const [isCheckDate, setIsCheckDate] = useState(false);
  const [currentDataSource, setCurrentDataSource]: any = useState(dataSource);

  const handleFormUpdated = (data: any, fieldName: string) => {
    let formData: any = {};
    switch (fieldName) {
      case "customReleaseDate":
        formData = {
          videos,
          customProviderIds,
          selectedProviderId: streamerSelected,
          selectedGenre: genreSelected,
          theatreLink: theatreLink,
          customReleaseDate: isCheckDate ? data : undefined
        };
        break;
      case "theatreLink":
        setTheatreLink(data);
        formData = {
          videos,
          customProviderIds,
          selectedProviderId: streamerSelected,
          selectedGenre: genreSelected,
          theatreLink: data,
          customReleaseDate: isCheckDate ? customReleaseDate : undefined
        };
        break;
      case "genre":
        setGenreSelected(data);
        formData = {
          videos,
          customProviderIds,
          selectedProviderId: streamerSelected,
          selectedGenre: data,
          theatreLink,
          customReleaseDate: isCheckDate ? customReleaseDate : undefined
        };
        break;
      case "streamer":
        setStreamerSelected(data);
        formData = {
          videos,
          customProviderIds,
          selectedProviderId: data,
          selectedGenre: genreSelected,
          theatreLink,
          customReleaseDate: isCheckDate ? customReleaseDate : undefined
        };

        if (data === streamerSelected) {
          return;
        }

        const providerSelected = streamers.find(
          (streamer: any) => streamer.providerId === data
        );
        setTheatreLink(providerSelected?.link || "");
        break;
      case "addMoreStreamer":
        formData = {
          videos,
          customProviderIds: data,
          selectedProviderId: streamerSelected,
          selectedGenre: genreSelected,
          theatreLink,
          customReleaseDate: isCheckDate ? customReleaseDate : undefined
        };
        break;
      case "videos":
        const cloned = [...videos];
        cloned[data.idx].active = data.checked;
        setVideos(cloned);

        formData = {
          videos: cloned,
          customProviderIds,
          selectedProviderId: streamerSelected,
          selectedGenre: genreSelected,
          theatreLink,
          customReleaseDate: isCheckDate ? customReleaseDate : undefined
        };
        break;
    }
    formUpdate(formData);
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    officialVideoUpdate(value);
  };

  useEffect(() => {
    handleFormUpdated(customReleaseDate, "customReleaseDate");
  }, [customReleaseDate]);

  useEffect(() => {
    handleFormUpdated(customReleaseDate, "customReleaseDate");
  }, [isCheckDate]);

  const getDirector = (crew: any[]) => {
    if (!crew?.length) {
      return "Unknow";
    }
    const names = crew.map((person: { name: string }) => person.name);

    const joinedNames = names.join(", ");
    return joinedNames;
  };

  const onReleaseDateChange = (val?: string) => {
    setCustomReleaseDate(val);
  };
  const onCheckDateChange = (e: any) => {
    const { checked } = e.target;
    setIsCheckDate(checked);
    if (checked && !customReleaseDate && !!defaultDate) {
      setCustomReleaseDate(defaultDate);
    }
  };
  const onTabSelected = (id: string) => {
    setTabSelect(id);
    const tabIdx = tabs.findIndex(tab => tab.id === id);
    tabs[tabIdx].current = true;
    tabs[prevTabIdxSlected].current = false;
    setPrevTabIdxSlected(tabIdx);
  };

  const onAction = (provider: any) => {
    if (customProviderIds.includes(Number(provider.providerId))) {
      setCustomProviderIds([
        ...customProviderIds.filter(x => x !== provider.providerId)
      ]);
      setStreamers([
        ...streamers.filter(x => x.providerId !== provider.providerId)
      ]);
    } else {
      setCustomProviderIds(prevProviderIds => [
        ...prevProviderIds,
        Number(provider.providerId)
      ]);
      setStreamers(prev => [...prev, provider]);
    }
  };

  useEffect(() => {
    if (!Object.keys(dataSource).length) {
      return;
    }
    setVideos(dataSource.videos);
    const providers = dataSource.watchProviders.map((x: any) => x.providerId);
    setCustomProviderIds(providers);
    const streamerId = dataSource.watchProviders?.find(
      (item: any) => item.isSelected
    );

    setStreamers(dataSource.watchProviders);
    setStreamerSelected(streamerId?.providerId || 0);
    setTheatreLink(streamerId?.link);

    setGenreSelected(dataSource?.genre);

    if (
      dataSource?.releaseDate &&
      currentDataSource?.releaseDate !== dataSource?.releaseDate
    ) {
      setDefaultDate(dataSource.releaseDate);
    }

    if (
      dataSource?.customReleaseDate &&
      currentDataSource?.customReleaseDate !== dataSource?.customReleaseDate
    ) {
      setCustomReleaseDate(dataSource.customReleaseDate);
      setIsCheckDate(!!dataSource.customReleaseDate);
    }

    setCurrentDataSource(dataSource);
  }, [dataSource]);

  useEffect(() => {
    handleFormUpdated(customProviderIds, "addMoreStreamer");
  }, [customProviderIds]);

  useEffect(() => {
    handleFormUpdated(theatreLink, "theatreLink");
  }, [theatreLink]);

  useEffect(() => {
    (async () => {
      const res = await apiCall("metadata/streamers", { method: "GET" });
      if (res && Array.isArray(res)) {
        const providers = res.filter((x: any) => x.logoUpdatePath);
        setSearchItems(providers);
      }
    })();
  }, []);

  const renderSearchItem = ({ index, style }: ListChildComponentProps) => {
    const item = searchItems.filter((x: any) =>
      lowerCase(x.providerName).includes(lowerCase(keyword))
    )[index];
    return (
      <div
        className="flex items-center justify-between gap-2 py-2 px-2 border-b"
        style={style}
      >
        <div className="flex gap-2 items-center">
          <Image
            src={item?.logoPath}
            alt="streamer"
            width={20}
            height={20}
            className="rounded"
          ></Image>
          <div className="name truncate">{item.providerName}</div>
        </div>
        <button
          onClick={() => onAction(item)}
          className={`rounded-3xl px-3 py-1 text-sm font-semibold text-white shadow-sm w-20 flex-shrink-0 ${
            customProviderIds.includes(item.providerId)
              ? "bg-gray-400"
              : "bg-indigo-500"
          }`}
        >
          {customProviderIds.includes(item.providerId) ? "Remove" : "Add"}
        </button>
      </div>
    );
  };

  return (
    <>
      <div
        className={classNames(
          "relative bg-white shadow-sm sm:flex dark:bg-gray-800 dark:border-gray-700 dark:shadow-slate-700/[.7] bg-no-repeat rounded-2xl",
          styles["title-bg-container"]
        )}
        style={{ backgroundImage: `url(${dataSource.backdropPath})` }}
      >
        <div
          className={classNames(
            "p-8 pr-4 pl-5 w-full rounded-2xl",
            styles["title-wrapper"]
          )}
        >
          <div
            className="flex-shrink-0 relative w-full"
            style={{ width: 225, height: 338 }}
          >
            <Image
              className="absolute top-0 left-0 object-cover rounded-2xl h-full"
              src={checkPosterPath(dataSource.posterPath)}
              alt="Poster"
              width={225}
              height={338}
            />
          </div>
          <div className="flex flex-wrap overflow-auto mt-2 flex-1">
            <div className="pl-4 flex flex-col h-full pt-1 w-full">
              {(dataSource.name || dataSource.originalTitle) && (
                <div>
                  <h1 className="font-bold dark:text-white text-2xl">
                    {dataSource.name || dataSource.originalTitle}
                  </h1>
                  <div className="sub-title text-gray-300">
                    {dataSource.releaseDate
                      ? dayjs(dataSource.releaseDate).format(DATE_FORMAT_LL)
                      : ""}
                  </div>
                </div>
              )}
              <div className="info mt-4 pr-2">
                <div className="overview mb-2">
                  {dataSource.overview && (
                    <div>
                      <div className="title font-bold">Overview</div>
                      <div className="label">
                        <p className="mt-1 text-gray-300">
                          {dataSource.overview}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {dataSource?.mediaType && (
                  <div className="flex justify-between gap-3 flex-wrap mt-4">
                    {dataSource?.mediaType === "movie" && (
                      <div className="runtime">
                        <div className="label font-bold">Runtime</div>
                        <div className="value text-gray-300">
                          {formatRuntime(dataSource.runtime)}
                        </div>
                      </div>
                    )}

                    {dataSource?.mediaType === "tv" && (
                      <div className="flex gap-5">
                        <div className="seasons">
                          <div className="label font-bold">Seasons</div>
                          <div className="value text-gray-300">
                            {dataSource?.numberSeasons || 0}
                          </div>
                        </div>
                        <div className="episode">
                          <div className="label font-bold">Episodes</div>
                          <div className="value text-gray-300">
                            {dataSource?.numberEpisodes || 0}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="reating">
                      <div className="label font-bold">Rating</div>
                      <div className="value text-gray-300">
                        {dataSource.voteAveragePercent}
                      </div>
                    </div>
                    <div className="director">
                      <div className="label font-bold">Director</div>
                      <div className="value text-gray-300">
                        {getDirector(dataSource?.directors || [])}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 bg-gray-200 rounded-2xl w-full p-4">
        <div className="text-xl font-bold">Cast</div>
        {dataSource.casts?.length > 0 && (
          <>
            <div
              className="mt-4 grid grid-cols-4 gap-x-4 gap-y-3 overflow-y-auto overflow-x-hidden"
              style={{ minHeight: "60px", maxHeight: "300px" }}
            >
              {dataSource.casts.map((cast: any, idx: number) => (
                <div className="key" key={idx}>
                  <div className="name font-semibold">{cast.name}</div>
                  <div className="character">{cast.knownDepartment}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-5 grid grid-cols-12 gap-2 mb-3">
        <div className="type col-span-2">
          <div className="label font-bold mb-2">Type</div>
          <div className="bg-gray-600 px-3 py-0 rounded inline-block text-white">
            {(dataSource?.mediaType === "tv" && "TV") ||
              (dataSource.mediaType === "movie" && "Movie") ||
              dataSource.mediaType}
          </div>
        </div>
        <div className="gerne col-span-5">
          <div className="label font-bold mb-2">Genre</div>
          <div className="flex gap-2 flex-wrap">
            {dataSource.genres?.map((genre: string, idx: number) => (
              <span
                key={idx}
                className={`px-3 py-0 rounded text-white cursor-pointer ${
                  genreSelected === genre ? "bg-indigo-500" : "bg-gray-600"
                }`}
                onClick={() => handleFormUpdated(genre, "genre")}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
        <div className="release-date col-span-5">
          <div className="label font-bold mb-2">
            <input
              name="checkDate"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600/0"
              checked={isCheckDate}
              onChange={e => onCheckDateChange(e)}
            />
            <span style={{ marginLeft: "5px" }}>Release Date</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isCheckDate && (
              <DatePicker
                placeholder="Select Release Date"
                className={classNames(
                  "flex items-center gap-2 border flex-wrap p-3 rounded border-gray-100 shadow-sm ring-1 ring-inset ring-gray-300",
                  styles["h-25"]
                )}
                value={customReleaseDate}
                onChange={v => onReleaseDateChange(v)}
              ></DatePicker>
            )}
          </div>
        </div>
      </div>

      {customProviderIds.length > 0 && (
        <>
          <div className="cast col-span-10 mb-3">
            <div className="font-bold mb-2">Streamer</div>
            <div className="value text-gray-300 flex gap-2 flex-wrap">
              {streamers.map((x: any, idx: number) => (
                <div
                  className={`title-streamer max-w-full h-auto cursor-pointer ${
                    x.providerId === streamerSelected ? "active" : ""
                  }`}
                  key={x.providerId}
                  onClick={() => handleFormUpdated(x.providerId, "streamer")}
                >
                  <Image
                    key={idx}
                    className="object-cover rounded border"
                    src={x?.logoPath}
                    alt="Image Description"
                    width={50}
                    height={50}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 mb-3">
            <div className="relative">
              <label className="font-bold mb-3" htmlFor="add-streamer">
                Streamer link
              </label>
              <input
                onChange={e => setTheatreLink(e.target.value)}
                value={theatreLink}
                type="text"
                name="theatres-link"
                placeholder="Input an URL"
                className="block w-full rounded-3xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 basis-11/12"
              />
            </div>
          </div>
        </>
      )}

      <div className="w-full">
        <div className="search-input mb-3">
          <div className="relative">
            <label className="font-bold mb-2" htmlFor="add-streamer">
              Add/Remove Streamer
            </label>
            <input
              onChange={e => setKeyword(e.target.value)}
              type="text"
              name="add-streamer"
              value={keyword}
              placeholder="Search Streamer..."
              className="block w-full rounded-3xl border-0 py-2.5 pr-11 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 basis-11/12"
            />
            {keyword && (
              <Image
                className="absolute top-9 right-4 cursor-pointer"
                src="/images/close.svg"
                alt="Close"
                width={16}
                height={16}
                onClick={() => setKeyword("")}
              />
            )}
          </div>
        </div>
        {searchItems?.length > 0 && (
          <div className="list-result bg-gray-100 p-1 pb-0 rounded-xl">
            <FixedSizeList
              height={240}
              width={"100%"}
              itemCount={
                searchItems.filter((x: any) =>
                  lowerCase(x.providerName).includes(lowerCase(keyword))
                ).length
              }
              itemSize={45}
              // onItemsRendered={handleLoadMore}
            >
              {renderSearchItem}
            </FixedSizeList>
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="text-xl font-bold">Media</div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(tab => (
              <div
                key={tab.name}
                onClick={() => onTabSelected(tab.id)}
                className={classNames(
                  tab.current
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700",
                  "flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium cursor-pointer"
                )}
                aria-current={tab.current ? "page" : undefined}
              >
                {tab.name}
                {videos?.length ? (
                  <span
                    className={classNames(
                      tab.current
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-gray-100 text-gray-900",
                      "ml-3 hidden rounded-full py-0.5 px-2.5 text-xs font-medium md:inline-block"
                    )}
                  >
                    {videos?.length}
                  </span>
                ) : null}
              </div>
            ))}
          </nav>
        </div>
        <div className="body mt-3 overflow-x-auto grid grid-rows-2 grid-flow-col gap-4 py-1">
          {tabSelect === "video" &&
            videos?.map((v: IMediaAdditionalInfo, idx: number) => (
              <div key={idx}>
                {v.key && (
                  <div className="relative" style={{ width: "210px" }}>
                    <div className="flex gap-1 justify-between pb-1">
                      <div className="flex items-center gap-1">
                        <input
                          name="comments"
                          type="checkbox"
                          checked={v.active}
                          onChange={e =>
                            handleFormUpdated(
                              { checked: e.target.checked, idx },
                              "videos"
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600/0"
                        />
                        <label className="text-sm text-gray-500 dark:text-gray-400">
                          Visibility
                        </label>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="hs-radio-group"
                          className=" border-gray-200 rounded-full text-indigo-600 focus:ring-indigo-600/0"
                          id="hs-radio-group-1"
                          value={v.key}
                          checked={v.key === officialVideoKey}
                          onChange={handleRadioChange}
                        />
                        <label className="text-sm text-gray-500 dark:text-gray-400">
                          Main video
                        </label>
                      </div>
                    </div>
                    <div className="bg-gray-300 h-full w-full overflow-hidden rounded-lg">
                      <Video
                        src={toIframeSrc(v.key, v.site)}
                        width="210"
                        height="118"
                      ></Video>
                    </div>
                    <div className="mt-2 font-semibold text-left text-sm line-clamp-2">
                      {v.name}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
