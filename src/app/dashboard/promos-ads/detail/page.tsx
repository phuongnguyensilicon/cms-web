"use client";

import { useState } from "react";
import TitleDetail from "../(components)/edit";
import { notify, useAsyncEffect } from "@/utils/client.util";
import { useRouter, useSearchParams } from "next/navigation";
import { IMediaAdditionalRequest, IMediaShortInfo, IUpdateMediaRequest } from "@/model/media/media";
import { HttpClient } from "@/utils/http-client";
import { IUpsertPromoAdsRequest } from "@/model/promo-ads/promoAds";
import { MediaDetailSourceEnum } from "@/utils/enum";

export default function Detail() {
  const searchParams = useSearchParams();
  const [id, setId] = useState(searchParams?.get("id"));
  const router = useRouter();
  const [dataSource, setDataSource]: any = useState({});  
  const [isReload, setIsReload]: any = useState(true);
  const [loading, setLoading] = useState(false);

  const submitForm = async (payload: IUpsertPromoAdsRequest|undefined, isValid: boolean) => {
    setIsReload(false);
    if (!isValid || !payload) {
      setLoading(false);
      return;
    }
    await HttpClient.put<any>('promo-ads/upsert', payload);
    setLoading(false);
    notify(`Update successful`);
    if (!id) {
      router.push("dashboard/promos-ads");
    }
  };

  const convertDataSourceToRequest = (dataSource?: IMediaShortInfo): IUpsertPromoAdsRequest => {
    if (!dataSource) {
      return {
        posterPath: '',
        name: ''
      };
    }
    const request: IUpsertPromoAdsRequest = {
      ...dataSource,
      ads3rdUrl: dataSource.ads3rdUrl,
      additionalVideos: dataSource.videos?.map(v => {
        const itm: IMediaAdditionalRequest = {
          ...v, 
          active: v.active ?? false,
          source: MediaDetailSourceEnum.CLIX,
          isSelected: false
         };
        return itm;
      })
    };
    return request;
  }
  
  useAsyncEffect(async () => {
    if (!isReload) {
      return;
    }
    if (loading) {
      return;
    }

    if (!!id) {
      // will trigger after loading to false and after updating form (Refreshing new data)
      const payload = { id };

      const data = HttpClient.get<any>('media/detail', payload);

      const [res] = await Promise.all([data]);

      setDataSource(res.data);
    } else {
      setDataSource({});
    }
    
  }, [loading]);

  return (
    <>
      <div
        className="flex gap-4 w-full"
      >
        <div className="edit verflow-y-auto pr-6" style={{ width: "100%" }}>
          <div className="header font-bold text-2xl mb-4">Promotional Detail</div>
          <TitleDetail
            params={ {id: id ?? ''} }
            dataSource={convertDataSourceToRequest(dataSource)}
            isSubmit={loading}
            onSubmitted={(v, isValid) => submitForm(v, isValid)}
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
          onClick={() => router.push("dashboard/promos-ads")}
          className={`py-3 px-4 inline-flex gap-2 flex-shrink-0 justify-center items-center border rounded-3xl border-transparent font-semibold bg-gray-300  text-white transition-all text-sm w-28`}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
