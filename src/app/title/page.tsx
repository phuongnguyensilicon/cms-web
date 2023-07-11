/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import AverageRating from '@components/AverageRating';
import Button from '@components/Button';
import { ActionState } from '@components/Button20';
import Coin from '@components/Coin';
import { Loading } from '@components/Loading';
import MultiSelect from '@components/MultiSelect';
import Popup from '@components/Popup';
import RatingProgressBar from '@components/RatingProgressBar';
import Reactions from '@components/Reactions';
import SlugContainer from '@components/SlugContainer';
import StepButtonGroup from '@components/StepButtonGroup';
import ThumbnailVideo from '@components/ThumbnailVideo';
import VideoPopupPlayer from '@components/VideoPlayerPopup';
import { WatchListButton } from '@components/WatchListButton';
import { ROUTERS } from '@configs/common';
import { calculateTimeOnPage, logPageView } from '@helpers/analytics';
import {
  delay,
  flyout,
  isDefaultStreamer,
  useAsyncEffect,
  verifyPosterPath
} from '@helpers/client';
import { breakDate } from '@helpers/ultis';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import { MediaTitle, TitleType, VideoType } from '@interfaces/mediaTitle';
import '@scss/title.scss';
import { HttpClient } from '@services/http-client';
import { TitleService } from '@services/title';
import defautStreamerSVG from '@svg/ClixStreamer.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Slider from 'rc-slider';
import { useEffect, useRef, useState } from 'react';
import SwiperCore from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useEffectOnce } from 'usehooks-ts';

export default function Movie() {
  const searchParams = useSearchParams();
  const { status } = useSession();
  const router = useRouter();
  const LID = searchParams?.get('LID');
  const titleId = searchParams?.get('titleId');
  const [mediaTitles, setMediaTitles] = useState<MediaTitle[] | any>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenVideoPopup, setIsOpenVideoPopup] = useState(false);
  const [titleSelectedIdx, setTitleSelectedIdx] = useState<number>(-1);
  const [currentStep, setCurrentStep] = useState(0);
  const [questionaires, setQuestionaires] = useState([]);
  const [rankings, setRankings] = useState<any>({});
  const [questionaireInfo, setQuestionaireInfo] = useState<any>({});
  const [multipleChoice, setMultipleChoice] = useState<any>([]);
  const [disableAction, setDisableAction] = useState<boolean>(true);
  const [percent, setPercent] = useState<any>();
  const [titleSelected, setTitleSelected] = useState<MediaTitle | any>();
  const [relatedTitles, setRelatedTitles] = useState<any>([]);
  const [videoSelected, setVideoSelected] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [questionaireLoading, setQuestionaireLoading] =
    useState<boolean>(false);
  const [viewVideoAdsCompleted, setViewVideoAdsCompleted] =
    useState<boolean>(false);
  const [earnedPoint, setEarnedPoint] = useState<number>(0);
  const swiperRef = useRef<any>(null);
  const [popupSwiperRef, setPopupSwiperRef] = useState<SwiperCore>();
  const [activeList, setActiveList] = useState<any>();
  const { setConfig, fetchData } = useMainLayoutContext();
  const mainContext = useMainLayoutContext();

  useEffectOnce(() => {
    setConfig({ backHeader: { title: '' } });
  });

  useEffect(() => {
    return () => {
      if (titleSelected?.name) {
        calculateTimeOnPage(
          `Time spent reviewing on ${titleSelected.name} locked carousel`
        );
      }
    };
  }, [titleSelectedIdx]);

  // Handle action in game mode
  const nextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
    popupSwiperRef?.slideNext();
  };

  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
    popupSwiperRef?.slidePrev();
  };

  const onStep = async (action: ActionState) => {
    if (action === 'prev') {
      prevStep();
    } else if (action === 'next') {
      if (currentStep === 3) {
        handleClose(true);
        return;
      }

      if (questionaireLoading) {
        return;
      }
      if (!titleSelected.status.rate.isRateMedia) {
        flyout({ source: `coin_questionaire`, point: 20 }, mainContext);
      }
      setQuestionaireLoading(true);

      const payload = {
        mediaItemId: titleSelected.id,
        questionaireInfo: {
          id: questionaireInfo.id,
          questions: [
            {
              id: questionaireInfo.question.id,
              options: getQuestionaireUpdated(questionaireInfo.optionKind)
            }
          ]
        }
      };

      // Update questionaire at Child Step 2
      if (isAuthenticated()) {
        await updateQuestionaire(payload);
      } else {
        await delay(500);
      }
      setMediaTitles((prevItems: any) =>
        prevItems.map((item: any) => {
          if (item.id === titleSelected.id) {
            const updatedItem = {
              ...item,
              status: {
                ...item.status,
                rate: {
                  ...item.status.rate,
                  isRateMedia: true
                }
              }
            };
            setTitleSelected(updatedItem);
            return updatedItem;
          }
          return item;
        })
      );

      setQuestionaireLoading(false);

      getEarnedPoints(titleSelected);
      nextStep();
    }
  };

  const getQuestionaireUpdated = (inputKind: string) => {
    if (inputKind === 'input-select') {
      return multipleChoice;
    }
    if (inputKind === 'input-indicator') {
      const optionUpdated =
        titleSelected.status.rate.questionaireSeleted.questions[0].options;
      const rankingsSelected = optionUpdated.filter((r: any) => r.isSelected);
      return rankingsSelected;
    }
  };

  const onRankingChange = (title: any, slider: any, questionIdx: number) => {
    setMediaTitles((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item.id === title.id) {
          const newData = { ...item };
          newData.status.rate.questionaireSeleted.questions[
            questionIdx
          ].options[slider.idx].point = slider.value;
          newData.status.rate.questionaireSeleted.questions[
            questionIdx
          ].options[slider.idx].isSelected = true;
          return {
            ...newData
          };
        }
        return item;
      })
    );

    setRankings({ ...rankings, [slider.idx]: slider.value });
  };

  const onMultipleChoiceSelected = (selected: any) => {
    // setMediaTitles((prevItems: any) =>
    //   prevItems.map((item: any) => {
    //     if (item.id === title.id) {
    //       const newData = { ...item };
    //       console.log(selected);
    //       console.log(newData);

    //       // newData.status.rate.questionaireSeleted.questions[0].options.map(option =>
    //       return {
    //         ...newData
    //       };
    //     }
    //     return item;
    //   })
    // );

    setMultipleChoice(selected);
    setDisableAction(false);
  };

  // Handle close dialog
  const handleClose = async (_action: boolean) => {
    setIsOpen(false);
  };

  const isAuthenticated = () => {
    return status === 'authenticated';
  };

  // Handle watch options flow
  const onChoose = async (title: MediaTitle, reactionSelected: any) => {
    if (!isAuthenticated()) {
      router.push(ROUTERS.login);
      return;
    }
    const quest = reactionSelected?.questions?.[0];
    setQuestionaireInfo({
      id: reactionSelected.id,
      question: quest,
      optionKind: quest.options[0].type
    });

    if (!title?.status?.rate?.isSelectQuestionare) {
      flyout(
        {
          source: `coin_five`,
          point: titleSelected.score.select
        },
        mainContext
      );
    }

    //Update select questionaire for Child Step 1
    const payload = {
      mediaItemId: titleSelected.id,
      questionaireInfo: {
        id: reactionSelected.id
      }
    };

    if (isAuthenticated()) {
      await updateQuestionaire(payload);
      fetchData();
      await delay(500);
    } else {
      await delay(1000);
    }

    // Update local selection questionaire
    setMediaTitles((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item.id === title.id) {
          const updatedItem = {
            ...item,
            status: {
              ...item?.status,
              rate: {
                ...item?.status?.rate,
                isSelectQuestionare: true,
                questionaireSeleted: reactionSelected
              }
            }
          };
          setTitleSelected(updatedItem);

          return updatedItem;
        }
        return item;
      })
    );
  };

  const isReviewed = () => {
    const { isRateMedia, isSelectQuestionare } =
      titleSelected?.status?.rate || {};
    return isRateMedia && isSelectQuestionare;
  };

  const onTellUsMore = () => {
    setIsOpen(true);
    setCurrentStep(1);
    setViewVideoAdsCompleted(false);
  };

  const startQuestionare = () => {
    if (titleSelected?.status?.rate?.isRateMedia) {
      setDisableAction(false);
    }
    nextStep();
  };

  const onTitleSelected = (index: number) => {
    if (mediaTitles[index]?.id === titleId) {
      return;
    }
    setTitleSelectedIdx(index);
    setTitleSelected(mediaTitles[index]);
    getRelatedTitles(mediaTitles[index]?.id);

    if (mediaTitles[index]?.id) {
      router.push(`/title?LID=${LID}&titleId=${mediaTitles[index]?.id}`);
    }
  };

  const onWatchListAdded = async (title: any) => {
    if (title?.status?.isExistWatchList) {
      return;
    }
    // Update local selection WatchAds
    setMediaTitles((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item.id === title.id) {
          const updatedItem = {
            ...item,
            status: {
              ...item.status,
              isExistWatchList: true
            }
          };
          setTitleSelected(updatedItem);
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleSlideChange = (swiper: SwiperCore) => {
    onTitleSelected(swiper.realIndex);
  };

  const getRelatedTitles = async (id: any) => {
    if (!id) {
      return;
    }
    setLoading(true);
    const { data: res } = await HttpClient.post<any>(
      `clix/recommendation?id=${id}`,
      {}
    );
    setRelatedTitles(res?.recomendations);
    setLoading(false);
  };

  const updateQuestionaire = async (payload: any) => {
    return await TitleService.updateQuestionaire(payload);
  };

  const onWatchTrailer = async (title: MediaTitle) => {
    if (!title?.status?.rate?.isWatchAds) {
      const { id } = title;
      const payload = {
        mediaItemId: id
      };

      if (isAuthenticated()) {
        flyout({ source: `coin_trailer-${title.id}`, point: 25 }, mainContext);
        setMediaTitles((prevItems: any) =>
          prevItems.map((item: any) => {
            if (item.id === title.id) {
              const updatedItem = {
                ...item,
                status: {
                  ...item?.status,
                  rate: {
                    ...item?.status?.rate,
                    isWatchAds: true
                  }
                }
              };

              setTitleSelected(updatedItem);
              return updatedItem;
            }
            return item;
          })
        );
        await TitleService.viewTrailer(payload);
      }
    }

    if (Object.keys(title.videos || {}).length) {
      const video = getVideoByType('trailer');
      if (!video) {
        return;
      }
      setIsOpenVideoPopup(true);
      setVideoSelected(video);
    }
  };

  const onWatchVideo = async (title: any) => {
    const video = getVideoByType('game');

    if (!title?.status?.rate?.isWatchGame) {
      const { id } = title;
      const payload = {
        mediaItemId: id
      };
      flyout({ source: `coin_video_${video.key}`, point: 25 }, mainContext);

      // Update local selection WatchAds
      setMediaTitles((prevItems: any) =>
        prevItems.map((item: any) => {
          if (item.id === title.id) {
            const updatedItem = {
              ...item,
              status: {
                ...item.status,
                rate: {
                  ...item.status.rate,
                  isWatchGame: true
                }
              }
            };
            setTitleSelected(updatedItem);
            return updatedItem;
          }
          return item;
        })
      );

      if (isAuthenticated()) {
        await TitleService.viewVideo(payload);
      }
    }

    if (!isAuthenticated()) {
      await delay(500);
    }
    setViewVideoAdsCompleted(true);
  };

  const getEarnedPoints = (title: any) => {
    let sum = 0;
    const { score, status } = title;
    const objA = score; //{ ads, rate, select. game }
    const objB: any = {
      game: status?.rate?.isWatchGame,
      ads: status?.rate?.isWatchAds,
      rate: status?.rate?.isRateMedia,
      select: status?.rate?.isSelectQuestionare
    };
    for (const key in objA) {
      if (objB[key] === true) {
        sum += objA[key];
      }
    }
    setEarnedPoint(sum);
    return sum;
  };

  const getProgressStep = () => {
    const { isRateMedia, isSelectQuestionare, isWatchAds } =
      titleSelected?.status?.rate || {};
    setPercent((100 / 3) * (+isRateMedia + +isSelectQuestionare + +isWatchAds));
  };

  const getQuestionaireSelected = (ratingSelected: any) => {
    const clonedQuestionaires = JSON.parse(JSON.stringify(questionaires));

    const reactionSelected: any = clonedQuestionaires.find(
      (questionaire: any) =>
        questionaire?.isWatched === ratingSelected?.isWatched &&
        questionaire?.isLiked === ratingSelected?.isLiked
    );
    const quest = reactionSelected?.questions?.[0];

    setQuestionaireInfo({
      id: reactionSelected?.id,
      question: quest,
      optionKind: quest?.options[0].type
    });

    return reactionSelected;
  };

  const getVideoByType = (type: VideoType) => {
    const video = titleSelected?.videos.find((v: any) => v.type === type);
    return video || null;
  };

  const isMovieOrTVShow = (type: TitleType) => {
    return type === 'movie' || type === 'tv';
  };

  const onTitleClicked = () => {
    if (isMovieOrTVShow(titleSelected?.mediaType)) {
      router.push(`/title/${titleSelected.id}?LID=${LID}`);
    } else {
      if (titleSelected?.ads3rdUrl) {
        window.open(titleSelected.ads3rdUrl, '_blank');
      }
    }
  };

  const onStreamerClicked = (title: any) => {
    if (isAuthenticated()) {
      window.open(title.watchProvider?.link, '_blank');
    } else {
      router.push(ROUTERS.login);
    }
  };

  // Hooks
  useEffect(() => {
    setDisableAction(!Object.values(rankings).some((value: any) => value > 1));
  }, [rankings]);

  useEffect(() => {
    setDisableAction(!Object.values(multipleChoice).some(value => value));
  }, [multipleChoice]);

  useEffect(() => {
    if (Object.keys(titleSelected || {}).length) {
      if (questionaires.length) {
        if (titleSelected?.status?.rate?.isSelectQuestionare) {
          getQuestionaireSelected(
            titleSelected.status.rate.questionaireSeleted
          );
        }
      }
      getEarnedPoints(titleSelected);
      getProgressStep();
    }
  }, [titleSelected]);

  useAsyncEffect(async () => {
    await getRelatedTitles(titleId);
  }, []);

  useAsyncEffect(async () => {
    if (!mediaTitles?.length) {
      return;
    }

    if (titleSelectedIdx !== -1) {
      setTitleSelected(mediaTitles[titleSelectedIdx]);
    }
  }, [mediaTitles]);

  useEffect(() => {
    logPageView();
    return () => {
      calculateTimeOnPage('Time spent on Locked carousel page');
      swiperRef.current.destroy();
    };
  }, []);

  useAsyncEffect(async () => {
    const { data: results } = await HttpClient.post<any>(
      `clix/listname?slug=${LID}`,
      {}
    );
    const itemList = results[0];
    setMediaTitles(itemList.mediaItems);
    const index = itemList.mediaItems?.findIndex((i: any) => i.id === titleId);
    setTimeout(() => {
      if (swiperRef.current) {
        swiperRef.current.slideToLoop(index);
      }
    }, 250);
    setActiveList(itemList);
    onTitleSelected(index);
  }, []);

  useAsyncEffect(async () => {
    const { data: q } = await HttpClient.get<any>('clix/questionaire');
    setQuestionaires(q);
  }, []);

  const renderTitleElement = (title: MediaTitle, height: number) => {
    return (
      <>
        <div
          className="streamer-logo relative min-h-[50px] max-h-[71px] mb-[5px]"
          onClick={() => onStreamerClicked(title)}
        >
          <Image
            src={
              isDefaultStreamer(title.watchProvider.logoPath)
                ? defautStreamerSVG
                : title.watchProvider.logoPath
            }
            height={71}
            width={400}
            alt="Streamer"
            className="object-fill max-h-[71px] rounded-[4px]"
            loading="eager"
          />
          {title.watchProvider?.link && (
            <div className="share absolute bottom-0 right-0 mb-[7px] mr-[7px]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 27 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.8212 23.5126H2.72765V4.41903H12.2744V1.69139H2.72765C1.2138 1.69139 0 2.91883 0 4.41903V23.5126C0 25.0128 1.2138 26.2402 2.72765 26.2402H21.8212C23.3214 26.2402 24.5488 25.0128 24.5488 23.5126V13.9658H21.8212V23.5126ZM16.6932 0V2.72765H21.5893L9.07701 15.077L11 17L23.5123 4.65064V9.54676H26.24V0H16.6932Z"
                  fill={
                    title.watchProvider.bgColor === '#FFFFFF'
                      ? 'black'
                      : 'white'
                  }
                />
              </svg>
            </div>
          )}
        </div>
        <div className="carousel__poster" onClick={onTitleClicked}>
          <Image
            id="locked-carousel-poster"
            className={`${title.posterPath ? '' : 'default'}`}
            src={verifyPosterPath(title.posterPath)}
            alt="poster"
            width={400}
            height={500}
            style={{ height }}
          />
        </div>
        <div className="cell-bottom">
          <div className="action flex justify-between items-center text-center mb-2 gap-1">
            {isMovieOrTVShow(titleSelected?.mediaType) && (
              <>
                <WatchListButton
                  titleId={title?.id}
                  added={title?.status?.isExistWatchList}
                  onAdded={(_res: any) => onWatchListAdded(title)}
                ></WatchListButton>
                {title?.clixScore && !title?.customReleaseDate && (
                  <div className="score-group">
                    <div className="hero-score">
                      <Image
                        src="/clix-logo-compact.png"
                        width={20}
                        height={12}
                        alt="logo"
                        loading="eager"
                      ></Image>
                      <span className="label-text">Score</span>
                    </div>
                    <div className="point">
                      {(title?.clixScore || 0)?.toFixed(1)}
                    </div>
                    <AverageRating score={title?.clixScore}></AverageRating>
                  </div>
                )}

                {title?.customReleaseDate && (
                  <div className="score-group">
                    <div className="comming-soon">
                      <div className="month">
                        {breakDate(title?.customReleaseDate).month}
                      </div>
                      <div className="day">
                        {breakDate(title?.customReleaseDate).day}
                      </div>
                      <div className="year">
                        {breakDate(title?.customReleaseDate).year}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <button
              className={`clix-btn border-gradient-primary relative min-h-[31px] justify-between ${
                isMovieOrTVShow(titleSelected?.mediaType)
                  ? 'w-[100vw]'
                  : 'w-[100px] mx-auto'
              }`}
              onClick={() => onWatchTrailer(title)}
            >
              <span className="flex items-center">
                <span>
                  <svg
                    width="6"
                    height="9"
                    viewBox="0 0 6 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.62296 5.11927L3.14413 6.9828L1.0025 8.5827C0.884006 8.67363 0.756423 8.70996 0.628836 8.70996C0.300756 8.70996 0 8.45543 0 8.0827V1.15582C0 0.783096 0.309837 0.528564 0.628836 0.528564C0.75642 0.528564 0.884009 0.564898 1.0025 0.655827L3.14413 2.25572L5.62296 4.11016C5.9602 4.36476 5.9602 4.87381 5.62296 5.11927Z"
                      fill="white"
                      fillOpacity="0.8"
                    />
                  </svg>
                </span>
                <span className="ml-1">
                  {isMovieOrTVShow(titleSelected?.mediaType)
                    ? 'SneakPeek'
                    : 'Video'}
                </span>
              </span>

              {isMovieOrTVShow(titleSelected?.mediaType) &&
                isAuthenticated() && (
                  <div
                    id={`coin_trailer-${title?.id}`}
                    className="absolute -right-[28px] -top-[4px]"
                  >
                    <Coin
                      value={titleSelected?.score?.ads}
                      className="text-[9px]"
                      size={{ w: 31, h: 31 }}
                      disabled={titleSelected?.status?.rate?.isWatchAds}
                    ></Coin>
                  </div>
                )}
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="pb-3 relative">
      {activeList?.slug && (
        <div className="mb-2">
          <SlugContainer>{activeList?.description}</SlugContainer>
        </div>
      )}
      <Swiper
        loop={true}
        spaceBetween={10}
        centeredSlides={true}
        slidesPerView={1.5}
        className="locked-carousel"
        onSlideChangeTransitionEnd={handleSlideChange}
        onSwiper={swiper => (swiperRef.current = swiper)}
      >
        {mediaTitles?.map((title: MediaTitle) => {
          const offsetWidth =
            document.getElementById('carousel-item')?.offsetWidth || 0;
          return (
            <SwiperSlide
              key={title.id}
              id="carousel-item"
              className="carousel-cell pb-1"
            >
              {renderTitleElement(title, (offsetWidth - 20) * 1.5)}
            </SwiperSlide>
          );
        })}
      </Swiper>
      {isMovieOrTVShow(titleSelected?.mediaType) && (
        <div className="rating-container flex items-center justify-center flex-col">
          {Object.keys(titleSelected || []).length > 0 && (
            <>
              <div
                className={`relative mb-[5px] mx-3 ${
                  !titleSelected?.status?.rate?.isSelectQuestionare
                    ? ''
                    : 'hidden'
                }`}
              >
                <Reactions
                  options={questionaires}
                  onSelect={v => onChoose(titleSelected, v)}
                ></Reactions>
              </div>
              <div
                className={`flex justify-center ${
                  titleSelected?.status?.rate?.isSelectQuestionare
                    ? ''
                    : 'hidden'
                }`}
              >
                <Button
                  text={isReviewed() ? 'Review Answers' : 'Tell us more!'}
                  click={onTellUsMore}
                  className={`font-bold text-[15px] capitalize max-h-[46px] ${
                    isReviewed() ? 'p-4' : 'pl-7 '
                  }`}
                  coin={{
                    value: isReviewed()
                      ? 0
                      : titleSelected?.score?.game + titleSelected?.score?.rate,
                    className: 'text-[13px]'
                  }}
                ></Button>
              </div>
            </>
          )}
        </div>
      )}
      {Object.keys(titleSelected || {}).length > 0 &&
        isMovieOrTVShow(titleSelected?.mediaType) && (
          <div className="other-genre">
            <div className="top mb-3">{`More from ${
              titleSelected?.watchProvider?.providerName || 'Clix'
            }`}</div>
            <div className="genres">
              {relatedTitles?.length > 0 &&
                relatedTitles?.map((item: any, idx: number) => (
                  <Link href={`/title/${item.id}`} key={idx} className="item">
                    <Image
                      src={verifyPosterPath(item.posterPath)}
                      width={95}
                      height={137}
                      alt="s"
                    ></Image>
                  </Link>
                ))}
            </div>
            {relatedTitles?.length > 0 ? (
              <Link
                href={`/title/${titleSelected.id}/streamer?SID=${titleSelected.watchProvider.providerId}`}
              >
                <div className="bottom">
                  Show more
                  <ChevronDownIcon className="w-4 h-4 stroke-[2.5px]" />
                </div>
              </Link>
            ) : loading ? (
              <Loading></Loading>
            ) : (
              <span className="no-data-msg">No movies or TV shows found.</span>
            )}
          </div>
        )}
      <Popup isOpen={isOpen} onClose={handleClose} title={titleSelected?.name}>
        <div className="py-1 flex-shrink-0 overflow-y-auto overflow-x-hidden flex items-center justify-center">
          <div className="flex-1 h-full w-full flex items-center">
            <Swiper
              navigation={false}
              pagination={false}
              allowTouchMove={false}
              onSwiper={(swiper: SwiperCore) => setPopupSwiperRef(swiper)}
            >
              <SwiperSlide>
                <div className="step1 flex flex-col h-full py-3 px-3">
                  {Object.keys(titleSelected || []).length > 0 && (
                    <div className="relative mb-3">
                      <Reactions
                        options={questionaires}
                        selected={
                          titleSelected.status?.rate?.questionaireSeleted
                        }
                        onSelect={v => onChoose(titleSelected, v)}
                      ></Reactions>
                    </div>
                  )}
                  <div className="flex-shrink-0 overflow-hidden rounded relative mt-3">
                    <ThumbnailVideo
                      video={getVideoByType('game')}
                      hideCoin={titleSelected?.status?.rate?.isWatchGame}
                      completed={viewVideoAdsCompleted}
                      onclick={() => onWatchVideo(titleSelected)}
                    ></ThumbnailVideo>
                  </div>
                  <div className="mt-2 video-title text-[17.9618px] font-semibold leading-[22px] text-[rgba(255,255,255,0.8)]">
                    {getVideoByType('game')?.name}
                  </div>
                  <div
                    style={{ fontWeight: 900 }}
                    className="tell-us-more-text"
                  >
                    Tell us more to earn Clix Points!
                  </div>

                  <div className="flex justify-center mt-3">
                    <Button
                      text={
                        titleSelected?.status?.rate?.isRateMedia
                          ? 'Review Answers'
                          : 'Tell us more!'
                      }
                      click={startQuestionare}
                      className={`font-bold text-[15px] capitalize max-h-[46px] ${
                        titleSelected?.status?.rate?.isRateMedia
                          ? 'p-4'
                          : 'pl-7 '
                      }`}
                      coin={{
                        value: titleSelected?.status?.rate?.isRateMedia
                          ? 0
                          : 20,
                        size: { w: 37, h: 37 }
                      }}
                    ></Button>
                  </div>
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="step2">
                  {titleSelected?.status?.rate?.questionaireSeleted?.questions?.map(
                    (questionaire: any, questionIdx: number) => (
                      <div
                        key={questionaire.id}
                        className="questionaire w-full mt-3"
                      >
                        <div className="flex gap-2 items-center justify-center mb-3">
                          <h3 className="question-name">
                            {questionaire?.title}
                          </h3>
                          <div
                            id={`coin_questionaire`}
                            className="flex justify-center"
                          >
                            <Coin
                              value={20}
                              size={{ w: 37, h: 37 }}
                              disabled={
                                titleSelected?.status?.rate?.isRateMedia
                              }
                            ></Coin>
                          </div>
                        </div>
                        <div className="w-full">
                          <>
                            {questionaire.options[0].type ===
                              'input-indicator' && (
                              <div className="slider-container flex flex-col gap-7 pr-7 pl-8 pb-1 mt-6">
                                {questionaire.options?.map(
                                  (option: any, idx: number) => (
                                    <div
                                      key={option.id}
                                      className="relative pb-2"
                                    >
                                      <div className="w-full absolute bottom-[22px]">
                                        <div className="name text-center">
                                          {option.title}
                                        </div>
                                      </div>
                                      <Slider
                                        min={1}
                                        max={5}
                                        step={1}
                                        dots={true}
                                        value={option.point}
                                        onChange={v =>
                                          onRankingChange(
                                            titleSelected,
                                            {
                                              value: v,
                                              idx
                                            },
                                            questionIdx
                                          )
                                        }
                                        handleRender={props => (
                                          <div className="ranking-input">
                                            {props}
                                          </div>
                                        )}
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </>
                          <>
                            {questionaire.options[0].type ===
                              'input-select' && (
                              <div className="px-5">
                                <MultiSelect
                                  options={questionaire.options}
                                  onSelect={v => onMultipleChoiceSelected(v)}
                                />
                              </div>
                            )}
                          </>
                        </div>
                      </div>
                    )
                  )}
                  {questionaireInfo?.question?.subActions &&
                    questionaireInfo?.question?.subActions.map(
                      (action: any, idx: number) => (
                        <div key={idx} className="flex w-full px-10 mt-3">
                          {action === 'addWatchlist' && (
                            <WatchListButton
                              titleId={titleSelected?.id}
                              added={titleSelected?.status?.isExistWatchList}
                              onAdded={(_res: any) =>
                                onWatchListAdded(titleSelected)
                              }
                            ></WatchListButton>
                          )}
                        </div>
                      )
                    )}
                </div>
              </SwiperSlide>
              <SwiperSlide>
                <div className="step3 flex flex-col h-full">
                  <div className="relative flex-shrink-0 overflow-hidden rounded mx-auto">
                    <Image
                      src="/images/congrats-coin.png"
                      width={250}
                      height={200}
                      alt="logo"
                      className="h-auto w-auto"
                      loading="eager"
                    ></Image>
                  </div>
                  <div className="text-[rgba(255,255,255,0.9)] font-black">
                    <div className="text-[28px]">Congrats!</div>
                    <div className="text-[16px]">
                      {`You earned ${earnedPoint} Clix Points!`}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
        <div className="bottom px-7 mt-3">
          <div className="px-3 mb-6">
            {currentStep !== 1 && (
              <StepButtonGroup
                leftText="Back"
                rightText={currentStep === 3 ? 'Done' : 'Next'}
                disabled={disableAction}
                click={onStep}
                loading={questionaireLoading}
              ></StepButtonGroup>
            )}
          </div>
          <div className="relative -top-[10px]">
            <RatingProgressBar percent={percent}></RatingProgressBar>
          </div>
        </div>
      </Popup>
      <VideoPopupPlayer
        isOpen={isOpenVideoPopup}
        onClose={() => setIsOpenVideoPopup(false)}
        options={videoSelected}
      ></VideoPopupPlayer>
    </div>
  );
}
