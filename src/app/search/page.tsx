'use client';
import { Loading } from '@components/Loading';
import { WatchListButton } from '@components/WatchListButton';
import { verifyPosterPath } from '@helpers/client';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import { HttpClient } from '@services/http-client';
import ArrowDownSVG from '@svg/arrow-down.svg';
import CloseSearchSVG from '@svg/close-input.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

export default function SearchTitle() {
  const { status } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [showMoreLoading, setShowMoreLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | any>();
  const { setConfig } = useMainLayoutContext();

  useEffectOnce(() => {
    setConfig({ backHeader: { title: 'Search' }, showStat: false });
  });

  const onClearSearch = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
      setSearchQuery('');
    }
  };

  const getTitles = async (offset: number) => {
    const { data } = await HttpClient.get<any>('clix/media/search', {
      offset,
      query: searchQuery
    });
    setItems((preItem: any) => [...(offset ? preItem : []), ...data.results]);
    setShowMore(data.hasMoreItem);
    return data.results;
  };

  const onShowMore = async () => {
    setShowMoreLoading(true);
    await getTitles(items.length);
    setShowMoreLoading(false);
  };

  const onWatchListAdded = async (title: any) => {
    if (title?.status?.isExistWatchList) {
      return;
    }
    setItems((prevItems: any[]) =>
      prevItems.map((item: any) => {
        if (item.info.id === title.info.id) {
          return {
            ...item,
            status: { isExistWatchList: true }
          };
        }
        return item;
      })
    );
  };

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    if (searchQuery !== '') {
      debounceTimer = setTimeout(async () => {
        try {
          setLoading(true);
          await getTitles(0);
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      }, 300);
    } else {
    }
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="watchlist-container">
      <div className="clix-input border-gradient-primary my-4">
        <input
          ref={inputRef}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search for titles..."
        ></input>
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
            <Loading size={20}></Loading>
          </div>
        )}
        {!loading && searchQuery && (
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => onClearSearch()}
          >
            <Image
              src={CloseSearchSVG}
              width={25}
              height={25}
              alt="close-input"
              loading="eager"
            ></Image>
          </div>
        )}
      </div>
      <div className="items">
        {items?.map((item: any, idx: number) => (
          <div className="item" key={idx}>
            <div className="poster">
              <Image
                key={idx}
                src={verifyPosterPath(item.info.posterPath)}
                width={77}
                height={115}
                alt="s"
              ></Image>
            </div>
            <div className="info">
              <h1 className="name">{item.info.name}</h1>
              <p className="description line-clamp-5">{item.info.overview}</p>
            </div>
            <div className="action">
              {status === 'authenticated' && (
                <div className="flex w-[110px] min-h-[31px] cursor-pointer gap-1 mx-auto mt-4">
                  <WatchListButton
                    titleId={item?.info?.id}
                    added={item?.status?.isExistWatchList}
                    onAdded={(_res: any) => onWatchListAdded(item)}
                  ></WatchListButton>
                </div>
              )}

              <Link
                href={`/title/${item.info.id}`}
                className="clix-btn border-gradient-primary w-[110px] min-h-[31px]"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      {showMore &&
        (showMoreLoading ? (
          <Loading></Loading>
        ) : (
          <div
            className="flex justify-center gap-2 font-bold"
            onClick={() => onShowMore()}
          >
            Show more
            <Image src={ArrowDownSVG} width={11} height={7} alt="more"></Image>
          </div>
        ))}
    </div>
  );
}
