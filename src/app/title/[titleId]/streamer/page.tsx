'use client';
import { useAsyncEffect, verifyPosterPath } from '@helpers/client';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import '@scss/title.scss';
import { HttpClient } from '@services/http-client';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
export default function Streamer({ params }: any) {
  const SID = useSearchParams()?.get('SID');
  const { titleId } = params;

  const [streamers, setStreamers] = useState<any>();
  const { setConfig } = useMainLayoutContext();

  useAsyncEffect(async () => {
    const { data } = await HttpClient.post<any>(
      `clix/media/streamer/group?id=${SID}&mediaItemId=${titleId}`,
      {}
    );
    setStreamers(data);
    setConfig({
      backHeader: { title: data?.provider?.providerName },
      showStat: false
    });
  }, []);
  return (
    <div className="streamer-container">
      <div className="genres-group">
        {streamers?.groups?.map((streamer: any, idx: number) => (
          <div key={idx} className="genre">
            <div className="title">{streamer.genre}</div>
            <div className="list-title">
              {streamer.items.map((item: any, i: number) => (
                <Link
                  href={`/title/${item.id}`}
                  key={i}
                  className="flex-shrink-0"
                >
                  <Image
                    className="poster"
                    src={verifyPosterPath(item.posterPath)}
                    alt="poster"
                    width={116}
                    height={167}
                  />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
