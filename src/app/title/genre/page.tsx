'use client';
import Coin from '@components/Coin';
import { Loading } from '@components/Loading';
import MultiSelect from '@components/MultiSelect';
import RatingProgressBar from '@components/RatingProgressBar';
import VideoPopupPlayer from '@components/VideoPlayerPopup';
import { WatchListButton } from '@components/WatchListButton';
import { RATING_OPTIONS } from '@constants/common';
import {
  delay,
  flyout,
  isDefaultStreamer2,
  useAsyncEffect,
  verifyPosterPath
} from '@helpers/client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import PlayButton from '@images/PlayButton.png';
import SliderBackPNG from '@images/slider-back.png';
import SliderNextDisabledPNG from '@images/slider-next-disabled.png';
import SliderNextPNG from '@images/slider-next.png';
import '@scss/title.scss';
import { HttpClient } from '@services/http-client';
import { TitleService } from '@services/title';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Slider from 'rc-slider';
import { useEffect, useState } from 'react';
import SwiperCore, { Navigation, Pagination, SwiperOptions } from 'swiper';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';

const swiperConfigs: SwiperOptions = {
  navigation: false,
  modules: [Navigation, Pagination],
  allowTouchMove: false
};
const swiperChildrenConfigs: SwiperOptions = {
  navigation: false,
  modules: [Navigation],
  pagination: false,
  allowTouchMove: false
};

const ratingOptionSource: any[] = RATING_OPTIONS;

export default function Sweepstake() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const titlesByGenreId = searchParams?.get('id');
  const { setConfig, fetchData } = useMainLayoutContext();
  const mainContext = useMainLayoutContext();
  const [titlesByGenre, setTitlesByGenre] = useState<any>(titlesByGenreId);
  const [parentSwiperRef, setParentSwiperRef] = useState<SwiperCore | any>(
    null
  );
  const [childSwiperRef, setChildSwiperRef] = useState<SwiperCore[]>([]);
  const [parentPrevActiveIndex, setParentPrevActiveIndex] = useState<number>(0);
  const [mediaTitles, setMediaTitles] = useState<any>([]);
  const [mediaTitle, setMediaTitle] = useState<any>({});
  const [genreInfo, setGenreInfo] = useState<any>({});
  const [questionaires, setQuestionaires] = useState([]);
  const [questionaireInfo, setQuestionaireInfo] = useState<any>({});
  const [percent, setPercent] = useState<any>(0);
  const [rankings, setRankings] = useState<any>({});
  const [multipleChoice, setMultipleChoice] = useState<any>([]);
  const [summary, setSummary] = useState<any>();
  const [isSwiperFirst, setIsSwiperFirst] = useState<boolean>(true);
  const [isSwiperLast, setIsSwiperLast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [videoSelected, setVideoSelected] = useState<any>({});
  const [childStepAt, setChildStepAt] = useState<any>(0);
  const [earnedPoint, setEarnedPoint] = useState<number>(0);

  useEffect(() => {
    setConfig({
      backHeader: {
        title: ''
      },
      showStat: true
    });
  }, []);

  useEffect(() => {
    if (questionaires.length) {
      if (mediaTitle.status.rate.isSelectQuestionare) {
        getQuestionaireSelected(mediaTitle.status.rate.questionaireSeleted);
      }
    }
    getProgressStep();

    if (Object.keys(mediaTitle).length) {
      getEarnedPoints(mediaTitle);
    }
  }, [mediaTitle]);

  useEffect(() => {
    if (earnedPoint === 50 && !mediaTitle.status.isCompleteGame) {
      onTitleCompleteReview();
    }
  }, [earnedPoint]);

  useAsyncEffect(async () => {
    resetState();
    if (titlesByGenre !== titlesByGenreId) {
      router.replace(`/title/genre?id=${titlesByGenre}`);
    }
    setLoading(true);
    const {
      data: { genre, titles }
    } = await HttpClient.get<any>('clix/account/game/listing-by-genre', {
      id: titlesByGenre
    });
    setLoading(false);
    setGenreInfo(genre);
    setMediaTitles(titles);
    const activeTitle = titles[0];
    setMediaTitle(activeTitle);
    setParentPrevActiveIndex(0);
    setParentSwiperRef(null);
    setChildSwiperRef([]);
  }, [titlesByGenre]);

  useAsyncEffect(async () => {
    const { data: q } = await HttpClient.get<any>('clix/questionaire');
    setQuestionaires(q);
  });

  const getSummary = async () => {
    const { data } = await HttpClient.get<any>(
      'clix/account/game/genre-summary',
      {
        id: titlesByGenre
      }
    );

    setSummary(data);
  };

  const updateQuestionaire = async (payload: any) => {
    return await TitleService.updateQuestionaire(payload).finally(() => {
      // fetchData;
    });
  };

  const onViewVideo = async (title: any) => {
    if (!title?.status?.rate?.isWatchGame) {
      const { id } = title.info;
      const payload = {
        mediaItemId: id
      };
      flyout(
        { source: `coin_ads_${title.info.id}`, point: title.info.score.ads },
        mainContext
      );
      // Update local selection WatchAds
      setMediaTitles((prevItems: any) =>
        prevItems.map((item: any) => {
          if (item.info.id === title.info.id) {
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
            setMediaTitle(updatedItem);
            return updatedItem;
          }
          return item;
        })
      );

      await delay(500);
      await TitleService.viewVideo(payload).finally(() => {
        // fetchData;
      });
    }

    if (title?.info?.videos?.length) {
      showVideoPlayer(title.info.videos[0]);
    }
  };

  const onTitleCompleteReview = async () => {
    const { id } = mediaTitle.info;
    const payload = {
      id: titlesByGenreId,
      mediaItemId: id
    };
    await TitleService.submitRatingTitle(payload).finally(() => {
      // fetchData;
    });
    markAsDone();

    setMediaTitles((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item.info.id === mediaTitle.info.id) {
          const updatedItem = {
            ...item,
            status: {
              ...item.status,
              isCompleteGame: true
            }
          };
          setMediaTitle(updatedItem);

          return updatedItem;
        }
        return item;
      })
    );
  };

  const showVideoPlayer = (video: any) => {
    setIsOpen(true);
    setVideoSelected(video);
  };

  const markAsDone = () => {
    const paginationBulletActive = document.querySelector(
      '.swiper-pagination-bullet-active'
    );

    if (paginationBulletActive) {
      paginationBulletActive.classList.add('done');
    }
  };

  const resetState = () => {
    setRankings({});
    setMultipleChoice([]);
    setSummary({});
    setIsSwiperFirst(true);
    setIsSwiperLast(false);
    setQuestionaireInfo({});
    setChildStepAt(0);
    setEarnedPoint(0);
  };

  const getProgressStep = () => {
    const { isRateMedia, isSelectQuestionare, isWatchGame } =
      mediaTitle?.status?.rate || {};
    setPercent(
      (100 / 3) * (+isRateMedia + +isSelectQuestionare + +isWatchGame)
    );
  };

  const onWatchListAdded = (title: any) => {
    // Update local selection Add Watch List
    setMediaTitles((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item.info.id === title.info.id) {
          const updatedItem = {
            ...item,
            status: {
              ...item.status,
              isExistWatchList: true,
              rate: {
                ...item.status.rate
              }
            }
          };
          setMediaTitle(updatedItem);
          return updatedItem;
        }
        return item;
      })
    );
  };

  const getQuestionaireSelected = (ratingSelected: any) => {
    const clonedQuestionaires = JSON.parse(JSON.stringify(questionaires));

    const reactionSelected: any = clonedQuestionaires.find(
      (questionaire: any) =>
        questionaire.isWatched === ratingSelected.isWatched &&
        questionaire.isLiked === ratingSelected.isLiked
    );
    const quest = reactionSelected?.questions?.[0];

    setQuestionaireInfo({
      id: reactionSelected.id,
      question: quest,
      optionKind: quest.options[0].type
    });

    return reactionSelected;
  };

  const onMultipleChoiceSelected = (title: any, selected: any) => {
    setMultipleChoice(selected);
  };

  const onChoose = async (obj: any, ratingOptionSourceIdx: number) => {
    const selected: any = getQuestionaireSelected(
      ratingOptionSource[ratingOptionSourceIdx]
    );

    // Update local selection questionaire
    setMediaTitles((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item.info.id === obj.title.info.id) {
          const updatedItem = {
            ...item,
            status: {
              ...item.status,
              rate: {
                ...item.status.rate,
                isSelectQuestionare: true,
                questionaireSeleted: selected
              }
            }
          };
          setMediaTitle(updatedItem);

          return updatedItem;
        }
        return item;
      })
    );

    if (!obj.hasSelected) {
      flyout(
        {
          source: `coin_five_${mediaTitle.info.id}`,
          point: mediaTitle.info.score.select
        },
        mainContext
      );
    }
    //Update select questionaire for Child Step 1
    const payload = {
      mediaItemId: mediaTitle.info.id,
      questionaireInfo: {
        id: selected.id
      }
    };

    await updateQuestionaire(payload);
    fetchData();
  };

  const onRankingChange = (title: any, slider: any, questionIdx: number) => {
    setMediaTitles((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item.info.id === title.info.id) {
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

  const onChildSwiperChange = (childSwiper: SwiperCore) => {
    setChildStepAt(childSwiper.activeIndex);
    setParentPrevActiveIndex(parentSwiperRef.activeIndex);
  };

  const onParentSwiperChange = (swiper: SwiperCore) => {
    setChildStepAt(childSwiperRef[swiper.activeIndex]?.activeIndex);
    setParentPrevActiveIndex(swiper.activeIndex);
    setMediaTitle(mediaTitles[swiper.activeIndex]);
  };

  const onParentSwiperInit = (swiper: SwiperCore) => {
    if (mediaTitles?.length) {
      const indx = mediaTitles.findIndex((t: any) => !t.status.isCompleteGame);
      if (indx > 0) {
        swiper.slideTo(indx);
        setIsSwiperFirst(false);
      }
    }
  };

  const getQuestionaireUpdated = (inputKind: string) => {
    if (inputKind === 'input-select') {
      return multipleChoice;
    }
    if (inputKind === 'input-indicator') {
      const currentTitle = mediaTitles[parentPrevActiveIndex];
      const optionUpdated =
        currentTitle.status.rate.questionaireSeleted.questions[0].options;
      const rankingsSelected = optionUpdated.filter((r: any) => r.isSelected);
      return rankingsSelected;
    }
  };

  const getEarnedPoints = (title: any) => {
    let sum = 0;
    const { info, status } = title;
    const objA = info.score; //{ ads, rate, select }
    const objB: any = {
      ads: status?.rate?.isWatchGame,
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

  const isCardValid = () => {
    const currentTitle = mediaTitles[parentPrevActiveIndex];
    if (childSwiperRef[parentPrevActiveIndex].isBeginning) {
      return currentTitle.status.rate.isSelectQuestionare;
    }
    return true;
  };

  const setFirstLastSwiper = async () => {
    const childSwiper = childSwiperRef[parentSwiperRef.activeIndex];
    const isFirst = parentSwiperRef.isBeginning && childSwiper.isBeginning;
    const isLast = parentSwiperRef.isEnd && childSwiper.isEnd;
    setIsSwiperFirst(isFirst);
    setIsSwiperLast(isLast);

    if (isLast) {
      getSummary();
    }
  };

  const onNext = async () => {
    if (!isCardValid()) {
      return;
    }
    const childSwiper = childSwiperRef[parentPrevActiveIndex];

    if (childSwiper.isEnd) {
      parentSwiperRef.slideNext();
      return;
    }

    if (childSwiper) {
      // update at step2 before next to Title completed!
      if (!childSwiper.isBeginning && !childSwiper.isEnd) {
        if (Object.keys(rankings).length || multipleChoice.length) {
          if (!mediaTitle.status.rate.isRateMedia) {
            flyout(
              {
                source: `coin_questionaire_${mediaTitle.info.id}`,
                point: mediaTitle.info.score.rate
              },
              mainContext
            );
          }
          const payload = {
            mediaItemId: mediaTitle.info.id,
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
          await updateQuestionaire(payload);
          setMediaTitles((prevItems: any) =>
            prevItems.map((item: any) => {
              if (item.info.id === mediaTitle.info.id) {
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
                setMediaTitle(updatedItem);
                return updatedItem;
              }
              return item;
            })
          );
          // reset validate for next
          resetState();
        }
      }
      getEarnedPoints(mediaTitle);
      childSwiper.slideNext();
    }

    setFirstLastSwiper();
  };

  const onPrev = () => {
    const childSwiper = childSwiperRef[parentPrevActiveIndex];
    const childStep2 = !childSwiper.isBeginning && !childSwiper.isEnd;
    if (
      (childSwiper.isEnd || childStep2) &&
      parentSwiperRef.activeIndex === parentPrevActiveIndex
    ) {
      childSwiper.slidePrev();
    } else {
      setChildStepAt(0);
      parentSwiperRef.slidePrev();
    }

    setFirstLastSwiper();
  };

  const ratingOption = (
    obj: { title: any; hasSelected: boolean; rate: any },
    idx: any
  ) => {
    const item = ratingOptionSource[idx];
    return (
      <div className="flex flex-col" onClick={() => onChoose(obj, idx)}>
        <Image
          src={`${
            !obj.hasSelected
              ? `${item?.icon}`
              : `${item?.icon}${
                  obj.rate.questionaireSeleted.isLiked === item.isLiked &&
                  obj.rate.questionaireSeleted.isWatched === item.isWatched
                    ? ''
                    : '-disabled'
                }`
          }.png`}
          width={100}
          height={100}
          alt="logo"
          loading="eager"
          className="mx-auto"
        ></Image>
      </div>
    );
  };

  const Rating = (title: any) => {
    const hasSelected = title?.status?.rate?.isSelectQuestionare;
    const review = { title, hasSelected, rate: title?.status?.rate };
    return (
      <div className="reaction-group">
        <div className="top-label">
          <div className="not-seen">
            <span className="label-text">Not Seen</span>
          </div>
          <div className="seen">
            <span className="label-text">Seen It</span>
          </div>
        </div>
        <div className="reaction-wrapper">
          <div className="reaction">
            <div className="reaction__item">{ratingOption(review, 0)}</div>
            <div className="reaction__item">{ratingOption(review, 1)}</div>
            <div className="reaction__item">{ratingOption(review, 2)}</div>
            <div className="reaction__item">{ratingOption(review, 3)}</div>
          </div>
          <div id={`coin_five_${title.info.id}`} className="coin-five">
            <Coin
              value={5}
              className="text-[12px]"
              size={{ w: 28, h: 28 }}
              disabled={hasSelected}
            ></Coin>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="clix-card-game-container">
      <div className="clix-swiper-pagination-container">
        <div className="label uppercase">
          {`${
            mediaTitles?.filter((t: any) => t?.status?.isCompleteGame)?.length
          }/${genreInfo?.total || 0} ${genreInfo?.name || ''} Titles Completed`}
        </div>
        {loading ? (
          <Loading size={10}></Loading>
        ) : (
          <div className="clix-swiper-pagination"></div>
        )}
      </div>
      <div className="clix-card-container">
        {loading ? (
          <div className="mt-3">
            <Loading></Loading>
          </div>
        ) : (
          <div className="clix-card">
            <h1
              className={`clix-card__title ${
                childStepAt === 2 ? 'opacity-0' : ''
              }`}
            >
              <span>{mediaTitle?.info?.name}</span>
            </h1>

            <Swiper
              className="clix-card__body"
              onSwiper={(swiper: SwiperCore) => setParentSwiperRef(swiper)}
              {...swiperConfigs}
              pagination={{
                el: '.clix-swiper-pagination',
                renderBullet: function (index, className) {
                  return `<div class="${className}  ${
                    mediaTitles[index]?.status.isCompleteGame ? 'done' : ''
                  }"></div>`;
                }
              }}
              onSlideChange={onParentSwiperChange}
              onAfterInit={(swiper: SwiperCore) => onParentSwiperInit(swiper)}
            >
              {mediaTitles.map((item: any, index: number) => {
                const questionaires =
                  item.status.rate.questionaireSeleted?.questions;
                return (
                  <SwiperSlide key={index}>
                    <Swiper
                      {...swiperChildrenConfigs}
                      nested={true}
                      lazyPreloadPrevNext={2}
                      className="card-content-child"
                      onSlideChangeTransitionEnd={onChildSwiperChange}
                      onSwiper={(swiper: SwiperCore) =>
                        setChildSwiperRef(prev => [...prev, swiper])
                      }
                    >
                      <SwiperSlide className="card-content-child__wrapper step1">
                        <div className="title-container mb-5">
                          <div className="streamer-logo flex justify-center max-h-[34px] mb-3">
                            <Image
                              src={isDefaultStreamer2(
                                item.info?.watchProvider?.logoPath
                              )}
                              height={41}
                              width={185}
                              alt="Streamer"
                              loading="eager"
                            />
                          </div>
                          <div className="flex gap-2">
                            <div className="poster w-[45%]">
                              <Image
                                id="locked-carousel-poster"
                                className={`shadow-none ${
                                  item.info.posterPath ? '' : 'default'
                                } `}
                                src={verifyPosterPath(item.info.posterPath)}
                                alt="poster"
                                width={316}
                                height={450}
                              />
                            </div>
                            <div className="w-full h-full  max-w-[55%]">
                              <div className="video-thumbnail relative mb-2 min-h-[90px]">
                                <Image
                                  src={PlayButton}
                                  alt="poster"
                                  width={43}
                                  height={43}
                                  className="center-item w-auto h-auto"
                                  onClick={() => onViewVideo(item)}
                                />
                                {item.info.videos?.length > 0 && (
                                  <Image
                                    id="locked-carousel-poster"
                                    src={item.info.videos[0].thumbnailUrl}
                                    alt="poster"
                                    width={316}
                                    height={450}
                                    className="aspect-video"
                                  />
                                )}

                                <div
                                  id={`coin_ads_${item.info.id}`}
                                  className="flex absolute right-0 bottom-0"
                                >
                                  <Coin
                                    value={25}
                                    size={{ w: 25, h: 25 }}
                                    disabled={item.status.rate.isWatchGame}
                                    className="text-[9px]"
                                  ></Coin>
                                </div>
                              </div>
                              <p className="text-[12px] text-white/90 line-clamp-5">
                                {item.info.overview}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mb-6 w-full">{Rating(item)}</div>
                        <div className="cell-bottom w-full px-3">
                          <div className="action flex items-center">
                            <WatchListButton
                              titleId={item?.info.id}
                              added={item?.status?.isExistWatchList}
                              onAdded={(_res: any) => onWatchListAdded(item)}
                            ></WatchListButton>
                            <button className="clix-btn border-gradient-primary w-[100vw] min-h-[31px] ml-2">
                              <Link
                                href={`/title/${item.info?.id}`}
                                className="px-1"
                              >
                                Details
                              </Link>
                            </button>
                            <br />
                          </div>
                        </div>
                      </SwiperSlide>
                      <SwiperSlide className="card-content-child__wrapper step2">
                        {questionaires?.map(
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
                                  id={`coin_questionaire_${item.info.id}`}
                                  className="flex justify-center"
                                >
                                  <Coin
                                    value={20}
                                    size={{ w: 37, h: 37 }}
                                    disabled={item.status.rate.isRateMedia}
                                  ></Coin>
                                </div>
                              </div>
                              <div className="w-full">
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
                                                item,
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
                                {questionaire.options[0].type ===
                                  'input-select' && (
                                  <div className="px-5">
                                    <MultiSelect
                                      options={questionaire.options}
                                      onSelect={v =>
                                        onMultipleChoiceSelected(item, v)
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </SwiperSlide>
                      <SwiperSlide className="step3">
                        {isSwiperLast ? (
                          <div>
                            <div className="box-summary">
                              <h1>GAME SUMMARY</h1>
                              <div className="items flex flex-col">
                                <div className="item">
                                  <div className="label">genre</div>
                                  <div className="value clix-input border-gradient-primary">
                                    <span className="truncate px-1">
                                      {summary?.genre}
                                    </span>
                                  </div>
                                </div>
                                <div className="item">
                                  <div className="label">
                                    Favourite Fantasy Title
                                  </div>
                                  <div className="value clix-input border-gradient-primary">
                                    <span className="truncate px-1">
                                      {summary?.highestMediaItem?.name}
                                    </span>
                                  </div>
                                </div>
                                <div className="item">
                                  <div className="label">
                                    Clix Points Earned
                                  </div>
                                  <div className="value clix-input border-gradient-primary">
                                    {summary?.totalScore}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bottom">
                              {summary?.nextGameInfo?.name && (
                                <button
                                  className="play-btn"
                                  onClick={() =>
                                    setTitlesByGenre(summary?.nextGameInfo.id)
                                  }
                                >
                                  Play {summary?.nextGameInfo?.name} titles
                                </button>
                              )}
                              <Link
                                href="/"
                                className="clix-btn border-gradient-primary home-btn rounded"
                              >
                                <span className="py-3">Home</span>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="step3 flex flex-col gap-8 items-center h-full font-designer mt-3">
                            <div className="relative flex-shrink-0 overflow-hidden rounded mx-auto">
                              <Image
                                src="/images/Scattered_Coins.png"
                                width={250}
                                height={250}
                                alt="Scattered_Coins"
                                className="w-[250px] h-auto"
                                loading="eager"
                              ></Image>
                            </div>
                            <div className="text-white/90 font-black text-center">
                              <div className="text-[28px] mb-3">Congrats!</div>
                              <div className="text-[21px]">
                                You earned <br /> {earnedPoint} Clix Points!
                              </div>
                            </div>
                          </div>
                        )}
                      </SwiperSlide>
                    </Swiper>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            <div className="clix-card__bottom">
              {childStepAt === 2 && !isSwiperLast && (
                <h3 className="text-white/90 text-center text-[18px] uppercase absolute bottom-[45px] font-designer">
                  Title{' '}
                  {mediaTitle?.status?.isCompleteGame
                    ? 'Completed!'
                    : 'Incompleted!'}
                </h3>
              )}

              <div className="clix-swiper-naviagtion">
                {!isSwiperFirst && (
                  <button className="button-prev" onClick={onPrev}>
                    <Image width={42} height={42} src={SliderBackPNG} alt="a" />
                  </button>
                )}
              </div>
              {!isSwiperLast && (
                <div className="rating-progress-wrapper">
                  <RatingProgressBar percent={percent}></RatingProgressBar>
                </div>
              )}
              <div className="clix-swiper-naviagtion">
                {!isSwiperLast && (
                  <button className="button-next" onClick={onNext}>
                    <Image
                      width={42}
                      height={42}
                      src={
                        mediaTitle?.status?.rate?.questionaireSeleted
                          ? SliderNextPNG
                          : SliderNextDisabledPNG
                      }
                      alt="a"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="absolute -left-[10px] -top-[10px] bg-[radial-gradient(black,#444444)] flex items-center justify-center rounded-full">
          <Link
            href={'/'}
            type="button"
            className="rounded-md text-[#929292] hover:text-gray-500 "
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <VideoPopupPlayer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        options={videoSelected}
      ></VideoPopupPlayer>
    </div>
  );
}
