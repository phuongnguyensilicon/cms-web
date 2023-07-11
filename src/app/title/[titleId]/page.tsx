'use client';
import ThumbnailVideo from '@components/ThumbnailVideo';
import { WatchListButton } from '@components/WatchListButton';
import {
  formatRuntime,
  isDefaultStreamer,
  useAsyncEffect,
  verifyPosterPath
} from '@helpers/client';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import { VideoType } from '@interfaces/mediaTitle';
import '@scss/title.scss';
import { TitleService } from '@services/title';
import defautStreamerSVG from '@svg/ClixStreamer.svg';
import anime from 'animejs';
import dayjs from 'dayjs';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';
export default function Movie({ params }: any) {
  const { titleId } = params;
  const { status } = useSession();
  const [titleInfo, setTitleInfo] = useState<any>();
  const [showMore, setShowMore] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [addedWatchList, setAddedWatchList] = useState<boolean>(false);
  const [isTrailerVideo, setIsTrailerVideo] = useState<boolean>(false);

  const { setConfig } = useMainLayoutContext();

  useEffectOnce(() => {
    setConfig({ backHeader: { title: '' } });
  });

  const getVideoByType = (type: VideoType) => {
    if (!titleInfo?.videos?.length) {
      return null;
    }
    const video = titleInfo?.videos?.find((v: any) => v.type === type);
    return video || null;
  };

  const onShowMoreVideo = () => {
    setShowMore(!showMore);
    anime({
      targets: document.getElementById('more-video-arrow-down'),
      rotate: showMore ? '0turn' : '0.5turn',
      duration: 300,
      easing: 'easeInOutExpo'
    });
    anime({
      targets: document.getElementById('morevideo'),
      height: showMore ? [100, 0] : [0, 100],
      opacity: showMore ? [1, 0] : [0, 1],
      duration: 200,
      easing: 'easeInOutExpo'
    });
  };

  const onWatchListAdded = async (value: any) => {
    if (value?.status?.isExistWatchList) {
      return;
    }
    setAddedWatchList(true);
  };

  useAsyncEffect(async () => {
    const { data } = await TitleService.getTitleById(titleId);

    setTitleInfo(data.info);
    setAddedWatchList(Boolean(data?.status?.isExistWatchList));
  }, []);

  return (
    <>
      {titleInfo && (
        <div className="title-detail-container title-container">
          <div
            className="hero-section"
            style={{ backgroundImage: `url(${titleInfo.backdropPath})` }}
          >
            <div className="relative z-[1] title-info mb-4">
              <div className="hero-info mb-4">
                <div className="title-header">
                  <h2 className="title">{titleInfo.name}</h2>

                  <div className="clix-tag">
                    <Image
                      src="/images/Clix-compact.png"
                      width={32}
                      height="14"
                      alt="Clix-compact"
                    ></Image>
                    <span className="font-designer mt-[7px] text-[15px]">
                      {(titleInfo?.clixScore || 0)?.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="sub-title-header">
                  {titleInfo.genre && (
                    <>
                      <div className="genre">
                        <span>{titleInfo.genre}</span>
                      </div>
                      <div className="divider"></div>
                    </>
                  )}
                  {titleInfo.certification && (
                    <>
                      <div className="certification">
                        {titleInfo.certification}
                      </div>
                      <div className="divider"></div>
                    </>
                  )}
                  {titleInfo.releaseDate && (
                    <>
                      <div className="release-date">
                        {dayjs(titleInfo.releaseDate).format('MM/DD/YYYY')}
                      </div>
                    </>
                  )}

                  {titleInfo?.mediaType === 'movie' && titleInfo.runtime && (
                    <>
                      <div className="divider"></div>
                      <div className="runtime">
                        {formatRuntime(titleInfo.runtime)}
                      </div>
                    </>
                  )}
                  {titleInfo?.mediaType === 'tv' && titleInfo.numberSeasons && (
                    <>
                      <div className="divider"></div>
                      <div className="runtime">
                        {`${titleInfo.numberSeasons}S ${titleInfo.numberEpisodes}EP`}
                      </div>
                    </>
                  )}
                  <div className="divider"></div>
                  <Image
                    src="/images/tmdb-img.png"
                    height={8}
                    width="68"
                    alt="tmdb"
                  ></Image>
                </div>
              </div>
              <div className="poster-thumbnail flex gap-2 mb-4">
                <div className="poster">
                  <Image
                    id="locked-carousel-poster"
                    className={`shadow-none ${
                      titleInfo.posterPath ? '' : 'default'
                    } `}
                    src={verifyPosterPath(titleInfo.posterPath)}
                    alt="poster"
                    width={316}
                    height={450}
                  />
                </div>
                <div className="flex-shrink-0 overflow-hidden rounded video-container">
                  <ThumbnailVideo
                    video={getVideoByType('trailer')}
                    hideCoin={true}
                    completed={isTrailerVideo}
                    onclick={() => setIsTrailerVideo(true)}
                  ></ThumbnailVideo>
                </div>
              </div>
              <div className="overview mb-4">
                <div className="label">Synopsis</div>
                <div className="max-h-[90px] overflow-y-auto overflow-x-hidden">
                  {titleInfo.overview}
                </div>
              </div>
              <div className="cast-crew mb-4">
                <div className="label">Cast & Crew</div>
                {Object.keys(titleInfo).length > 0 && (
                  <div className="cast-content grid grid-cols-3 gap-1">
                    {[
                      ...(titleInfo?.directors || []),
                      ...(titleInfo.casts || [])
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div className="name">{item.name}</div>
                        <div className="job-title">
                          {item.knownDepartment === 'Acting'
                            ? 'Cast'
                            : item.knownDepartment}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-stretch gap-2">
                <div className="stream w-1/2">
                  <div className="label">Watch now</div>
                  <div className="streamer-logo">
                    <Image
                      src={
                        isDefaultStreamer(titleInfo?.watchProvider?.logoPath)
                          ? defautStreamerSVG
                          : titleInfo?.watchProvider?.logoPath
                      }
                      height={71}
                      width={150}
                      alt="Streamer"
                      loading="eager"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="action w-1/2 flex flex-col">
                  {status === 'authenticated' && (
                    <>
                      <div className="label">Watch later</div>
                      <div className="flex h-full">
                        <WatchListButton
                          titleId={titleInfo?.id}
                          added={addedWatchList}
                          onAdded={(_res: any) => onWatchListAdded(titleInfo)}
                          className="rounded"
                        ></WatchListButton>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {titleInfo.videos?.length > 0 && (
              <div className="hero-video relative z-[1]">
                <div
                  className="show-more-text flex items-center justify-center gap-1"
                  onClick={() => onShowMoreVideo()}
                >
                  Show {!showMore ? 'more' : 'less'}
                  <svg
                    id="more-video-arrow-down"
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.7048 1.05651C1.36207 0.713947 0.806718 0.713947 0.463949 1.05651C0.121392 1.39924 0.121392 1.95459 0.463949 2.29736L5.47767 7.31107C5.8204 7.65363 6.37575 7.65363 6.71852 7.31107L11.7322 2.29736C12.0748 1.95462 12.0748 1.39927 11.7322 1.0565C11.3895 0.713947 10.8342 0.713947 10.4914 1.0565L6.09565 5.45224L1.7048 1.05651Z"
                      fill="white"
                      fillOpacity="0.7"
                    />
                  </svg>
                </div>
              </div>
            )}
            <div className="overlay-bg"></div>
          </div>
          <div className="relative z-[1] more-video mb-2">
            <div
              id="morevideo"
              className="show-more-video text-center h-0 opacity-0"
            >
              {titleInfo.videos?.length > 0 && (
                <div className="videos">
                  {titleInfo.videos?.map((video: any, idx: number) => (
                    <div className="video" key={idx}>
                      <h3 className="text-center video-title">{video.name}</h3>
                      <div className="flex-shrink-0 overflow-hidden rounded w-[128px]">
                        <ThumbnailVideo
                          video={video}
                          hideCoin={true}
                          completed={isOpen}
                          onclick={() => setIsOpen(true)}
                          miniPlay={true}
                        ></ThumbnailVideo>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
