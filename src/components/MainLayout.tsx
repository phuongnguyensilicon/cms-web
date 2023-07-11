'use client';
import { getUrlBack, ROUTERS } from '@configs/common';
import { formatDecimal, useAsyncEffect } from '@helpers/client';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import BackPNG from '@images/back-btn.png';
import LevelUpPNG from '@images/levelup-bg.png';
import DropdowExpandSVG from '@svg/Dropdown-Expand.svg';
import anime from 'animejs/lib/anime.es.js';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ClixCoin from 'public/images/Coin-clix.png';
import { useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import Popup from './Popup';

const tY = 45;

export default function MainLayout({
  showStat,
  children
}: {
  showStat?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data, fetchData } = useMainLayoutContext();
  const router = useRouter();
  const [isShowStat, setToggleStat] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentLevel, setCurrenLevel] = useState(-1);
  const { status } = useSession();
  const path = usePathname();

  useAsyncEffect(async () => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, pathname]);

  useAsyncEffect(async () => {
    const level = data.levels?.level as number;
    if (level === undefined) {
      return;
    }
    if (currentLevel >= 0 && currentLevel < level) {
      setShowPopup(true);
    }
    setCurrenLevel(level);
  }, [data.levels?.level]);

  const animate = () => {
    const dfParams = {
      easing: 'easeOutExpo',
      duration: 500
    };
    anime({
      targets: document.getElementById('stats'),
      opacity: isShowStat ? 0 : 1,
      minHeight: isShowStat ? 0 : tY,
      translateY: isShowStat ? [-12, -tY] : [-tY, -12],
      ...dfParams
    });
    anime({
      targets: document.getElementById('DropdowExpand'),
      rotate: isShowStat ? 0 : '0.5turn',
      ...dfParams
    });
  };

  const onToggleStat = () => {
    setToggleStat(prev => !prev);
    animate();
  };

  const goBack = () => {
    const urlBack = getUrlBack(pathname);
    if (!urlBack) {
      router.back();
    } else {
      router.push(urlBack);
    }
  };

  const closePopup = async (_action: boolean) => {
    setShowPopup(false);
  };

  return (
    <div className="relative">
      <div className="sticky top-0 z-50 ">
        <Header />
        {Object.keys(data.backHeader || {}).length > 0 && (
          <nav className="menu ">
            <button className="nav" onClick={goBack}>
              <Image
                src={BackPNG}
                alt="back"
                width={15}
                height={15}
                className="w-auto h-auto"
              />
              Back
            </button>
            <h2>{data?.backHeader?.title}</h2>
            <div
              className="nav ml-auto"
              onClick={() => router.push(data.backHeader?.action?.path || '/')}
            >
              {data.backHeader?.action?.name}
            </div>
          </nav>
        )}
      </div>
      <div className="w-full max-w-[430px]">
        {(data.showStat || showStat) && (
          <div
            className={`hero p-3 pb-2 bg-[#070707] ${
              Object.keys(data.backHeader || {}).length > 0 ? 'pt-0' : 'pt-2'
            }`}
          >
            <div className="ads relative z-[2]"></div>
            <div className="relative" onClick={() => onToggleStat()}>
              {(path !== ROUTERS.home || status === 'authenticated') && (
                <div className="daily-stat">
                  <div className="stat-header relative z-[1]">
                    <div
                      id="lv-progress"
                      className="lv-progress-bar h-[24px] relative flex justify-between w-full "
                    >
                      <div
                        className="lv-indicator"
                        style={{
                          width: `${data.levels?.completePercentage || 0}%`
                        }}
                      ></div>
                      <div className="lv-text-indicator-wrapper">
                        <div className="total-balance">
                          <div className="flex items-center gap-1">
                            <Image
                              src={ClixCoin}
                              width={12}
                              height={12}
                              alt="logo"
                              className="w-[12px] h-[12px]"
                              loading="eager"
                            ></Image>
                            <span
                              id="clixPoint"
                              className="label-text mt-[3px]"
                              data-clixpoint={data.levels?.point || 0}
                              data-pointsrequired={
                                data.levels?.pointRequire || 0
                              }
                              data-nextpointsrequired={
                                data.levels?.nextPointRequire || 100
                              }
                            >
                              {formatDecimal(data.levels?.point || 0)}
                            </span>
                          </div>
                        </div>
                        <span className="lv-text-indicator value">
                          {data.levels?.completePercentage || 0}%
                        </span>
                        <div className="flex gap-1 items-center">
                          <label className="lv-text-indicator next-level-text">
                            LVL {data.levels?.nextLevel || 0}
                          </label>
                          <span>
                            <Image
                              id="DropdowExpand"
                              src={DropdowExpandSVG}
                              width={37}
                              height={17}
                              alt="logo"
                              className="w-auto h-auto "
                              loading="eager"
                            ></Image>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    id="stats"
                    className="translate-y-[-50px] h-0 opacity-0 stats-container"
                  >
                    <div className="stats">
                      <div className="stat">
                        <div className="value radius-bl">
                          {data.stats?.totalLike || 0}
                        </div>
                        <div className="label">Titles Liked</div>
                      </div>
                      <div className="stat">
                        <div className="value">
                          {data.stats?.totalDislike || 0}
                        </div>
                        <div className="label">Titles Disliked</div>
                      </div>
                      <div className="stat">
                        <div className="value">
                          {data.stats?.totalWatchlist || 0}
                        </div>
                        <div className="label">+ Watchlist</div>
                      </div>
                      <div className="stat">
                        <div className="value radius-br">
                          {data.stats?.totalDiscountClaim || 0}
                        </div>
                        <div className="label">Discount Claims</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {status === 'unauthenticated' && path === ROUTERS.home && (
                <Link href={'/auth/signup'}>
                  <Image
                    src="/images/signupToEarn.png"
                    width={500}
                    height="20"
                    alt="signupToEarn"
                    className="w-full h-full"
                  ></Image>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <main id="main" className="relative">
        {children}
        <Popup isOpen={showPopup} onClose={closePopup}>
          <div className="lv-up-wrapper px-3">
            <Image
              src={LevelUpPNG}
              alt="back"
              width={400}
              height={450}
              className="w-auto h-auto"
            ></Image>
            <div className="text-[7vw] sm:text-[34px] text-white/90 font-designer uppercase -mt-[15px] mb-[25px] leading-9">
              <p>Congrats!</p>
              <p className="text-[5.5vw] sm:text-[26px]">{`You reached lvl ${
                data.levels?.level || 0
              }!`}</p>
            </div>
            <button
              className="secondary-btn font-extrabold"
              onClick={() => setShowPopup(false)}
            >
              Continue
            </button>
          </div>
        </Popup>
      </main>
      <Footer />
    </div>
  );
}
