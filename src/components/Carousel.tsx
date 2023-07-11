import { trackButtonClick } from '@helpers/analytics';
import { delay, isDefaultStreamer, verifyPosterPath } from '@helpers/client';
import { breakDate } from '@helpers/ultis';
import { MediaTitle } from '@interfaces/mediaTitle';
import '@scss/clix-carousel.scss';
import defautStreamerSVG from '@svg/ClixStreamer.svg';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AverageRating from './AverageRating';
import { Loading } from './Loading';
gsap.registerPlugin(Draggable, InertiaPlugin);
const progressWrap = gsap.utils.wrap(0, 1);
const cellGap = 7;
let scene: number;
const dragDistancePerRotation = 1200;
let startProgress: number;
let carouselWrapper: HTMLElement | any;
export default function Carousel({ dataSource }: { dataSource: any }) {
  const [items, setItems] = useState<any[]>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);

    if (dataSource) {
      setItems(dataSource.mediaItems);
    }

    if (!Object.keys(dataSource).length) {
      return;
    }

    async function init() {
      const cellElements = carouselWrapper.getElementsByClassName('c-item');
      const cellCount = cellElements.length;
      const cellSize = scene - cellGap;
      const radius =
        Math.round(cellSize / 2 / Math.tan(Math.PI / cellCount)) || 0;

      if (!radius) {
        return;
      }

      for (let i = 0; i < cellCount; i++) {
        cellElements[i].style.width = `${cellSize - cellGap}px`;
        cellElements[i].style.height = `${(cellSize - 20) * 1.5}px`;
      }

      gsap.from(cellElements, {
        rotationY: i => (i * 360) / cellCount,
        stagger: 0.1,
        scale: 0.5,
        opacity: 0
      });

      const spin = gsap.fromTo(
        cellElements,
        { rotationY: i => (i * 360) / cellCount },
        {
          rotationY: '-=360',
          duration: 20,
          ease: 'none',
          repeat: -1,
          transformOrigin: '50% 50% ' + -radius + 'px'
        }
      );
      const proxy = document.createElement('div');

      await delay(1500);

      Draggable.create(proxy, {
        trigger: '#c-wrapper',
        type: 'x',
        inertia: true,
        allowNativeTouchScrolling: true,
        onPress() {
          gsap.killTweensOf(spin);
          spin.timeScale(0);
          startProgress = spin.progress();
        },
        onDrag: updateRotation,
        onThrowUpdate: updateRotation,
        onThrowComplete() {
          gsap.to(spin, { timeScale: 1, duration: 1 });
        }
      });

      function updateRotation(this: Draggable) {
        const p =
          startProgress + (this.startX - this.x) / dragDistancePerRotation;
        spin.progress(progressWrap(p));
      }
    }

    setTimeout(init, 50);
    setLoading(false);

    return () => {
      setItems([]);
    };
  }, [dataSource]);

  useEffect(() => {
    const carouselContainer = document.getElementById(
      'c-container'
    ) as HTMLElement;
    carouselWrapper = document.getElementById('c-wrapper') as any;
    scene = carouselWrapper.offsetWidth * 0.6; // 40%
    carouselWrapper.style.width = `${scene}px`;
    carouselContainer.style.height = `${(scene - 10) * 2}px`;
  }, []);

  return (
    <div id="c-container" className="c-scene thien">
      <div id="c-wrapper" className="c-3d-wrapper">
        {loading ? (
          <div className="my-2">
            <Loading loading={loading}></Loading>
          </div>
        ) : (
          items?.map((title: MediaTitle) => (
            <div key={title.id} className={`c-item`}>
              <div className="streamer-logo mb-[5px]">
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
                />
              </div>
              <Link
                href={`title?LID=${dataSource.slug}&titleId=${title.id}`}
                className="carousel__poster"
                onClick={() =>
                  trackButtonClick(
                    title.name,
                    'Title clicked on to go to Locked Carousel'
                  )
                }
              >
                <div
                  className={`c-item__poster box-reflect ${
                    title.posterPath ? '' : 'default'
                  } w-full h-full bg-[length:100%_100%] bg-center bg-no-repeat min-h-[250px]`}
                  style={{
                    backgroundImage: `url(${verifyPosterPath(
                      title.posterPath
                    )})`
                  }}
                ></div>
              </Link>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
