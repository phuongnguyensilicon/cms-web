'use client';

import { Loading } from '@components/Loading';
import { useAsyncEffect, verifyPosterPath } from '@helpers/client';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import { HttpClient } from '@services/http-client';
import { TitleService } from '@services/title';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

export default function WatchList() {
  const [favoriteList, setFavoriteList] = useState<any[]>([]);
  const [payload, setPayload] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);
  const [itemIdxSelected, setIdxItemSelected] = useState<string>('');
  const { setConfig, fetchData } = useMainLayoutContext();

  useEffectOnce(() => {
    setConfig({ backHeader: { title: 'Watch List' }, showStat: false });
  });

  const onRemove = async (item: any) => {
    setIdxItemSelected(item.id);
    setRemoveLoading(true);
    const payload = {
      id: item.id,
      isAddToWatchList: false
    };
    await TitleService.addOrRemoveToWatchList(payload);
    setPayload(payload);
    //trigger fetch daily stats API;
    fetchData();
  };
  useAsyncEffect(async () => {
    setLoading(true);
    const { data } = await HttpClient.get<any>('clix/account/media/watchList');
    setFavoriteList(data || []);
    setLoading(false);
  }, [payload]);
  return (
    <div className="watchlist-container">
      <div className="flex justify-center py-2">
        <Loading loading={loading && !removeLoading}></Loading>
      </div>
      <div className="items">
        {favoriteList?.map((item: any, idx: number) => (
          <div className="item" key={idx}>
            <div className="poster">
              <Image
                key={idx}
                src={verifyPosterPath(item.posterPath)}
                width={77}
                height={115}
                alt="s"
              ></Image>
            </div>
            <div className="info">
              <h1 className="name">{item.name}</h1>
              <p className="description">{item.overview}</p>
            </div>
            <div className="action">
              <div
                className="clix-btn w-[110px] min-h-[31px] cursor-pointer"
                onClick={() => onRemove(item)}
              >
                {removeLoading && itemIdxSelected === item.id ? (
                  <Loading loading={removeLoading}></Loading>
                ) : (
                  'Remove'
                )}
              </div>
              <Link
                href={`/title/${item.id}`}
                className="clix-btn border-gradient-primary w-[110px] min-h-[31px]"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
