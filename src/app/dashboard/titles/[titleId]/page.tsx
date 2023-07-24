"use client";

import { useState } from "react";
import TitleDetail from "../(components)/edit";
import ViewTitle from "../(components)/tmdbView";
import { notify, useAsyncEffect } from "@/utils/client.util";
import { useRouter } from "next/navigation";
import { IUpdateMediaRequest } from "@/model/media/media";
import { HttpClient } from "@/utils/http-client";

export default function Detail({
  params,
  searchParams
}: {
  params: { titleId: string };
  searchParams: { [key: string]: string };
}) {
  const { titleId } = params;
  const { tmdbId } = searchParams;
  const router = useRouter();
  const [dataSource, setDataSource]: any = useState({});
  const [tmdbDataSource, setTMDBDataSource]: any = useState({});
  const [loading, setLoading] = useState(false);
  const [TMDBForm, setTMDBForm] = useState<any>();
  const [officialVideoKey, setOfficialVideoKey] = useState('');

  const submitForm = async (payload: IUpdateMediaRequest) => {
    const clixVideos = payload.additionalVideos || [];

    payload.selectedGenre = TMDBForm.selectedGenre;
    payload.customReleaseDate = TMDBForm.customReleaseDate;
    // Mapping providers
    const providers = TMDBForm.customProviderIds.map((p:number) => {
      const a = { id: p, isSelected: TMDBForm.selectedProviderId === p } as any;
      if (p === TMDBForm.selectedProviderId) {
        a.link = TMDBForm.theatreLink;
      }
      return a;
    });
    payload.providers = providers;

    // Set active Official Video
    const videos = [...clixVideos, ...TMDBForm.videos];
    const prevMainVideoIdx = videos.findIndex(v => v.isSelected);
    if (prevMainVideoIdx !== -1) {
      videos[prevMainVideoIdx].isSelected = false;
    }
    const mainVideoSelectedIdx = videos.findIndex(
      v => v.key === officialVideoKey
    );
    if(mainVideoSelectedIdx !== -1) {
      videos[mainVideoSelectedIdx].isSelected = true;
    }

    payload.additionalVideos = videos;


    await HttpClient.put<any>('media/update', payload);
    setLoading(false);
    notify(`Update successful`);
  };

  const onFormUpdated = (formData: any) => {
    setTMDBForm(formData);
  }

  const handleRadioChange = (value: string) => {
    setOfficialVideoKey(value);
  };

  useAsyncEffect(async () => {
    if (loading) {
      return;
    }

    // will trigger after loading to false and after updating form (Refreshing new data)
    const payload = { id: titleId };

    const tmdbData = HttpClient.get<any>('media/detail', { source: "tmdb", ...payload })

    const data = HttpClient.get<any>('media/detail', payload);

    const [res1, res2] = await Promise.all([tmdbData, data]);

    const videos = [...res1.data.videos || [], ...res2.data.videos || []];
    const mainVideo = videos.find(v => v.isSelected);
    setOfficialVideoKey(mainVideo?.key || '');

    setTMDBDataSource(res1.data);
    setDataSource(res2.data);
  }, [loading]);

  return (
    <>
      <div
        className="flex gap-4 w-full"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <div className="view w-1/2 overflow-y-auto pr-3">
          <div className="header font-bold text-2xl mb-2">TMDB Data</div>
          <ViewTitle
            dataSource={tmdbDataSource}
            formUpdate={onFormUpdated}
            officialVideoKey={officialVideoKey}
            officialVideoUpdate={handleRadioChange}
          ></ViewTitle>
        </div>
        <div className="edit w-1/2 overflow-y-auto pr-3">
          <div className="header font-bold text-2xl mb-2">Clix Feed</div>
          <TitleDetail
            params={{ titleId, tmdbId }}
            dataSource={dataSource}
            isSubmit={loading}
            onSubmitted={v => submitForm(v)}
            officialVideoKey={officialVideoKey}
            officialVideoUpdate={handleRadioChange}
          ></TitleDetail>
        </div>
      </div>
      <div className="text-right border-t border-gray-900/10 border-solid mt-4 pt-4 flex justify-end gap-2">
        <button
          onClick={e => {
            e.preventDefault();
            setLoading(true);
          }}
          className={`py-3 px-4 inline-flex gap-2 flex-shrink-0 justify-center items-center border rounded-3xl border-transparent font-semibold  text-white transition-all text-sm w-28 ${
            loading ? "cursor-not-allowed bg-indigo-400" : "bg-indigo-500"
          }`}
          disabled={loading}
        >
          {loading && (
            <span
              className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
              role="status"
              aria-label="loading"
            ></span>
          )}
          Save
        </button>
        <button
          onClick={() => router.push("dashboard/titles")}
          className={`py-3 px-4 inline-flex gap-2 flex-shrink-0 justify-center items-center border rounded-3xl border-transparent font-semibold bg-gray-300  text-white transition-all text-sm w-28`}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
