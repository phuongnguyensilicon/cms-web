'use client';
import { useAsyncEffect, verifyPosterPath } from '@helpers/client';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import '@scss/title.scss';
import { HttpClient } from '@services/http-client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
export default function RecommendationList({ params }: any) {
  const { titleId } = params;
  const [dataSource, setDataSource] = useState<any>();
  const { setConfig } = useMainLayoutContext();

  useAsyncEffect(async () => {
    setConfig({ backHeader: { title: '' }, showStat: false });

    const { data: res } = await HttpClient.post<any>(
      `clix/recommendation?id=${titleId}`,
      {}
    );
    console.log(dataSource);
    setDataSource(res);
  }, []);
  return (
    <div className="px-3 text-center text-white/90">
      <h4 className="font-semibold text-[12px]">More like</h4>
      <h1 className="font-black text-[18px]  mb-3">
        {dataSource?.mediaItem?.name}
      </h1>
      <div className="list-title grid grid-cols-3 gap-4">
        {dataSource?.recomendations?.map((item: any, i: number) => (
          <Link href={`/title/${item.id}`} key={i}>
            <Image
              className="poster rounded-lg h-full"
              src={verifyPosterPath(item.posterPath)}
              alt="poster"
              width={116}
              height={167}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
