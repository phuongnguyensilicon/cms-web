import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import styles from "../title.module.css";
import classNames from "classnames";
import dayjs from "dayjs";
import { DATE_FORMAT_LL } from "@/utils/constant.util";
import Video from "./video";
import { checkPosterPath, notify, toIframeSrc } from "@/utils/client.util";
import { apiCall } from "@/utils/api.util";
import CommonDialog from "@/components/Dialog";
import { useRouter } from "next/navigation";
import { IMediaAdditionalRequest, IUpdateMediaRequest } from "@/model/media/media";
import { IUpsertPromoAdsRequest } from "@/model/promo-ads/promoAds";
import { MediaDetailSourceEnum } from "@/utils/enum";
import Joi from "joi";
import streamerdefaultSVG from '@svg/streamer-default.svg'
import { XMarkIcon } from "@heroicons/react/24/outline";


const enpoint = {
  videos: "/api/title/{id}/videos",
  updateVideo: "/api/title/{titleId}/videos/{videoId}",
  updateTitle: "/api/title/{id}"
};
const tabs = [{ id: "video", name: "Videos", current: true }];

interface IVideo {
  key: string;
  name: string;
  site?: string;
  active?: boolean;
  action?: "INSERT" | "UPDATE" | "DELETE";
}
interface Props {
  params: {
    id?: string;
  };
  dataSource: any;
  isSubmit?: boolean;
  onSubmitted: (payload: IUpsertPromoAdsRequest|undefined, isValid: boolean) => void;
}

function UploadState({ loading, size }: { loading: boolean, size?: {w: number, h: number} }): JSX.Element {
  if (loading) {
    return (
      <span
        className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
        role="status"
        aria-label="loading"
      ></span>
    );
  } else {
    return (
      <Image src="/images/pen-edit.svg" alt="Poster" width={size?.w || 40} height={size?.h || 450} />
    );
  }
}


function UploadStreamerLogoState({ loading, size }: { loading: boolean, size?: {w: number, h: number} }): JSX.Element {
  if (loading) {
    return (
      <span
        className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
        role="status"
        aria-label="loading"
      ></span>
    );
  } else {
    return (
      <Image src="/images/pen-edit.svg" alt="Poster" width={size?.w || 40} height={size?.h || 450} />
    );
  }
}

type FormValidate = {
  name: string;
  isCheck: string;
  ads3rdUrl: string;
};

const schema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': `Title is required.`,
    'any.required': `Title is required.`
  }),
  ads3rdUrl: Joi.when('isCheck', {
      is: Joi.string().invalid('', null),
      then: Joi.string().required(),
      otherwise: Joi.allow(),
  }).messages({
    'string.empty': `Url is required.`,
    'any.required': `Url is required.`
  })
}).options({allowUnknown: true});

export default function TitleDetail({
  params,
  dataSource,
  isSubmit,
  onSubmitted
}: Props) {
  const { id } = params;
  const router = useRouter();
  const [tabSelect, setTabSelect]: any = useState("video");
  const [prevTabIdxSlected, setPrevTabIdxSlected] = useState(
    tabs.findIndex(tab => tab.current)
  );
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [videoId, setVideoId] = useState("642d946ba47941000187fb18");
  const [synopsis, setSynopsis]: any = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [streamerLogoUrl, setStreamerLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [streamerUploading, setstreamerUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [formData, setFormData] = useState<FormValidate>({...dataSource, isCheck: '', ads3rdUrl: ''});
  const [errors, setErrors] = useState<any[]>([]);
  const [currentDataSource, setCurrentDataSource]: any = useState(dataSource);

  const submitForm = async () => {
    const isValid = setValidationErrors();
    const payload: IUpsertPromoAdsRequest = {
      id,
      overview: synopsis,
      name: formData?.name,
      posterPath: posterUrl ?? "",
      ads3rdUrl: isCheck && formData?.ads3rdUrl ? formData.ads3rdUrl : "",
      additionalVideos: videos?.map(v => {
        const itm: IMediaAdditionalRequest = {
          ...v,
          active: v.active ?? false,
          source: MediaDetailSourceEnum.CLIX,
          isSelected: false
        };
        return itm;
      }),
      watchProvider: {
        logoPath: streamerLogoUrl || ''
      }
    };
    onSubmitted(payload, isValid);
  };


  const onTabSelected = (id: string) => {
    setTabSelect(id);
    const tabIdx = tabs.findIndex(tab => tab.id === id);
    tabs[tabIdx].current = true;
    tabs[prevTabIdxSlected].current = false;
    setPrevTabIdxSlected(tabIdx);
  };

  const onAddVideo = (e: any) => {
    e.preventDefault();
    if (!videoId) {
      return;
    }
    setVideoId("");
    setVideos([...(videos || []), { key: videoId, name: "", active: true }]);
  };

  const onRemoveVideo = (video: IVideo) => {
    const index = videos.indexOf(video);
    if (index >= 0) {
      const clonded = [...videos];
      clonded.splice(index, 1);
      setVideos(clonded);
    }
  };

  const onVideoUpdate = (e: any, idx: number, type: string, video: any) => {
    const clonded = [...videos];
    if (type === "text") {
      clonded[idx].name = e.target.value;
    }
    if (type === "checked") {
      clonded[idx].active = e.target.checked;
    }
    setVideos(clonded);
  };


  const onStreamerUpload = async (event: ChangeEvent<any>) => {
    setstreamerUploading(true);
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };
    const { fileUrl } = await apiCall("file/upload", {
      method: "POST",
      payload: formData,
      config
    });
    // await new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     resolve
    //   }, 3000);
    // })
    setStreamerLogoUrl(fileUrl);
    setstreamerUploading(false);
  };

  const handleFileUpload = async (event: ChangeEvent<any>) => {
    const file = event.target.files[0];
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };
    const { fileUrl } = await apiCall("file/upload", {
      method: "POST",
      payload: formData,
      config
    });
    setUploading(false);
    setPosterUrl(fileUrl);
  };

  const handleClose = async (action: boolean) => {
    if (action) {
      await apiCall("media/delete", {
        method: "DELETE",
        payload: { ids: id }
      });
      notify("Delete successfully!");
      router.push("dashboard/promos-ads");
    }
    setIsOpen(false);
  };

  const handleCheckBox = (isChecked: boolean) => {
    setIsCheck(isChecked);
    formData.isCheck = isChecked ? 'checked' : '';
    setValidationErrors();
  }

  const handleChange = (e: any) => {
    e.preventDefault();
  };

  const handleKeyUp = (e: any) => {
    e.preventDefault();
    const { name, value } = e.target;
    switch (name) {
      case 'name':
        formData.name = value;
        break;
      case 'ads3rdUrl':
        formData.ads3rdUrl = value;
        break;
    }
    setValidationErrors();
  };

  const setValidationErrors = (): boolean => {
    const { error } = schema.validate(formData, {
      abortEarly: false
    });
    if (error) {
      const validationErrors = error.details.map(detail => {
          const item = {
            name: detail.path[0],
            message: detail.message
          };
          return item;
        }
      );
      setErrors(validationErrors);
      return false;
    } else {
      setErrors([]);
    }
    return true;
  }

  const showError = (name: string) => {
    const error = errors.filter(x => x.name === name)[0];
    return error?.message;
  };

  useEffect(() => {
    if (isSubmit) {
      submitForm();
    }
  }, [isSubmit]);

  useEffect(() => {
    if (JSON.stringify(currentDataSource) !== JSON.stringify(dataSource)) {
      setVideos(dataSource?.videos ?? []);
      setIsCheck(!!dataSource?.ads3rdUrl);
      setFormData({
        ads3rdUrl: dataSource?.ads3rdUrl ?? '',
        isCheck: !!dataSource?.ads3rdUrl ? 'checked': '',
        name: dataSource?.name
      });
      setCurrentDataSource(dataSource);
      setStreamerLogoUrl(dataSource?.watchProvider?.logoPath || '')
    }

  }, [dataSource]);

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
            className="container-upload flex-shrink-0 relative w-full"
            style={{ width: 225, height: 338 }}
          >
            <Image
              className="absolute top-0 left-0 object-cover rounded-2xl h-full"
              src={checkPosterPath(posterUrl || dataSource.posterPath)}
              alt="Poster"
              width={225}
              height={338}
            />
            <div
              className="overlay rounded-2xl"
              style={uploading ? { opacity: 1 } : {}}
            >
              <label
                htmlFor="uploadposter"
                className="bg-gray-300 w-14 h-14 rounded-full flex items-center justify-center icon cursor-pointer"
              >
                <UploadState loading={uploading}></UploadState>
              </label>
              <input
                type="file"
                name="poster"
                id="uploadposter"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
          <div className="flex flex-wrap overflow-auto mt-2 flex-1">
            <div className="pl-4 flex flex-col h-full pt-1 w-full">
              <div className="overview mb-2 pr-2">
                <span className="title font-bold">Title</span>
                <input
                  style={{ padding: "5px" }}
                  defaultValue={formData?.name}
                  id="name"
                  name="name"
                  placeholder="Title"
                  onChange={e => handleChange(e)}
                  onKeyUpCapture={e => handleKeyUp(e)}
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6 mt-1"
                ></input>
              </div>
              {showError("name") && (
                <div className="error">{showError("name")}</div>
              )}
              <div className="sub-title text-gray-300">
                {dataSource?.releaseDate
                  ? dayjs(dataSource?.releaseDate.split("T")[0]).format(
                      DATE_FORMAT_LL
                    )
                  : ""}
              </div>
              <div className="info mt-4">
                <div className="overview mb-2 pr-2">
                  <span className="title font-bold">Synopsis</span>

                  <textarea
                    defaultValue={dataSource?.synopsis || dataSource?.overview}
                    id="description"
                    name="description"
                    rows={10}
                    onChange={e => setSynopsis(e.target.value)}
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6 mt-1"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="del-btn absolute right-0 top-0 mt-2 mr-2">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-3xl bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div
        className="input-gr flex items-center gap-2 mt-10"
        style={{ height: "20px" }}
      >
        <input
          name="ads3Url"
          type="checkbox"
          checked={isCheck}
          onChange={e => handleCheckBox(e.target.checked)}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
        />
        <span style={{ width: "15%" }}>Third Party Ad</span>
        {isCheck && (
          <input
            defaultValue={formData?.ads3rdUrl ?? ""}
            type="text"
            name="ads3rdUrl"
            id="ads3rdUrl"
            placeholder="Input an Url"
            className="w-full rounded-3xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 basis-11/12"
            onChange={e => handleChange(e)}
            onKeyUpCapture={e => handleKeyUp(e)}
          />
        )}
      </div>
      {showError("ads3rdUrl") && (
        <div className="error" style={{ marginTop: "20px" }}>
          {showError("ads3rdUrl")}
        </div>
      )}
      <div className="mt-5">
        <div className="text-xl font-bold mb-2">Ads Banner</div>
        <div className="container-upload flex-shrink-0 relative  !w-[300px] !h-[64px] ">
          <Image
            className="absolute top-0 left-0 object-cover rounded w-full h-full"
            src={
              streamerLogoUrl ||
              streamerdefaultSVG
            }
            alt="Poster"
            width={300}
            height={64}
          />
          <div
            className="overlay rounded "
            style={streamerUploading ? { opacity: 1 } : {}}
          >
            <div className="flex gap-1 absolute bottom-1 right-1">
              <label
                htmlFor="streamerLogoUpload"
                className="bg-gray-300 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              >
                <div className="flex gap-3">
                  <UploadStreamerLogoState
                    loading={streamerUploading}
                    size={{ w: 18, h: 18 }}
                  ></UploadStreamerLogoState>
                </div>
              </label>
              {streamerLogoUrl && (
                <div
                  className="bg-[#d1d5db] p-[4px] rounded-full cursor-pointer"
                  onClick={() => setStreamerLogoUrl("")}
                >
                  <XMarkIcon className="w-5 h-5"></XMarkIcon>
                </div>
              )}
            </div>
            <input
              type="file"
              name="streamerLogoUpload"
              id="streamerLogoUpload"
              className="hidden"
              onChange={onStreamerUpload}
            />
          </div>
        </div>
      </div>
      <div className="add-link mt-10">
        <div className="text-xl font-bold mb-2">Additional Videos</div>
        <form className="mb-3" onSubmit={onAddVideo}>
          <div className="input-gr flex items-center gap-2">
            <input
              type="text"
              name="link"
              id="link"
              placeholder="Input an ID"
              value={videoId}
              className="block w-full rounded-3xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 basis-11/12"
              onChange={e => setVideoId(e.target.value)}
            />
            <div className="enter-btn">
              <button className="rounded-3xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Enter
              </button>
            </div>
          </div>

          <div className="videos mt-3 ">
            {videos?.map((video: IVideo, index: number) => (
              <div className="flex gap-3 items-center my-1" key={index}>
                <div className="flex gap-2 basis-11/12">
                  <div className="border-gray-100 border rounded p-2.5 shadow-sm ring-1 ring-inset ring-gray-300 w-1/2 truncate bg-gray-100">
                    {video.key}
                  </div>
                  <div className="title w-full">
                    <input
                      type="text"
                      name="title"
                      value={video.name}
                      onChange={e => onVideoUpdate(e, index, "text", video)}
                      placeholder="Title"
                      className="block w-full rounded border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <div className="flex flex-1 justify-center">
                  <button
                    type="button"
                    onClick={() => onRemoveVideo(video)}
                    className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm flex justify-center"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>
      <div className="mt-10">
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
            videos?.map((v: IVideo, idx: number) => (
              <div key={idx}>
                {v.key && (
                  <div className="relative" style={{ width: "210px" }}>
                    <div className="flex gap-1 justify-between pb-1">
                      <div className="flex items-center gap-1">
                        <input
                          name="comments"
                          type="checkbox"
                          checked={v.active}
                          onChange={e => onVideoUpdate(e, idx, "checked", v)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600/0"
                        />
                        <label className="text-sm text-gray-500 dark:text-gray-400">
                          Visibility
                        </label>
                      </div>
                    </div>
                    <div className="bg-gray-300 h-full w-full overflow-hidden rounded-lg">
                      <Video
                        src={toIframeSrc(v.key, "")}
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

      <CommonDialog
        isOpen={isOpen}
        onClose={handleClose}
        title="Delete Title"
        content="Are you sure you want to delete this title?"
      />
    </>
  );
}
