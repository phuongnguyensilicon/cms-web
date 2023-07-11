import { MainLayoutContextValue } from '@providers/MainLayoutProvider';
import defautStreamerSVG from '@svg/ClixStreamer.svg';
import defautPosterPNG from '@svg/default-poster.png';
import anime from 'animejs';
import $ from 'jquery';
import { useEffect } from 'react';

/**
 * Return fetcher for use with SWR
 * @param url {string}
 * @returns {{}}
 */
export const fetcher = (url: string) =>
  fetch(url)
    .then(res => res.json())
    .then(json => json);

/**
 * A wrapper for useEffect that allows for async functions
 * @param asyncEffect {function}
 * @param dependencies {any[]}
 */
export const useAsyncEffect = (asyncEffect: any, dependencies: any[] = []) => {
  useEffect(() => {
    asyncEffect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

export const toIframeSrc = (id: string, site: string, autoplay = false) => {
  const params = autoplay ? '?autoplay=1' : '';
  switch (site?.toLowerCase()) {
    case 'youtube':
      return `https://www.youtube.com/embed/${id}${params}`;

    case 'vimeo':
      return `https://player.vimeo.com/video/${id}${params}`;

    default:
      return `https://player.zype.com/embed/${id}.html?api_key=ztdKXlvaBV9nkwhspiIp8TZvD2I0xqna84LPi2O_e3r8Wi7kJs7qxR8wz0XugXLP&controls=true`;
  }
};

export const scrollTop = (ref: React.RefObject<HTMLDivElement>) => {
  if (!ref?.current) {
    return;
  }
  ref.current.scrollTop = 0;
};

export const formatRuntime = (runtimeInMinutes: number) => {
  if (!runtimeInMinutes) {
    return ``;
  }
  const hours = Math.floor(runtimeInMinutes / 60);
  const minutes = runtimeInMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const isDefaultStreamer2 = (url: string) => {
  if (!url) {
    return defautStreamerSVG;
  }
  const p = new URL(url);
  const isDefault = p.pathname === '/default_n.svg';
  return isDefault ? defautStreamerSVG : url;
};

export const isDefaultStreamer = (url: string) => {
  if (!url) {
    return true;
  }
  const p = new URL(url);
  return p.pathname === '/default_n.svg';
};

export const delay = (delayInms: number) => {
  return new Promise(resolve => setTimeout(resolve, delayInms));
};

export const verifyPosterPath = (path: string | undefined | any) => {
  return path ? encodeURI(path) : defautPosterPNG;
};

const genId = () => {
  return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
};

export const flyout = async (
  options: { source: string; destination?: string; point: number },
  context?: MainLayoutContextValue
) => {
  const { source, destination, point } = options;

  if (!source) {
    return;
  }

  const goal = destination ? $(`#${destination}`) : ($('#lv-progress') as any);
  $('body').addClass('overflow-hidden');
  const pennyImg = document.createElement('img');
  pennyImg.src = '/images/Coin-clix.png';
  pennyImg.width = 40;
  pennyImg.height = 40;
  pennyImg.className = 'w-full h-full aspect-square opacity-0 absolute top-0';

  for (let i = 0; i < 5; i++) {
    const id = `${genId()}-clixcoin`;
    pennyImg.id = id;
    const imgtodrag = $(`#${id}`).eq(0) as any;
    const target = $(`#${source}`)?.append(pennyImg).eq(0) as any;
    if (target) {
      const imgclone = imgtodrag
        .clone()
        .offset({
          top: target.offset().top,
          left: target.offset().left + (!source ? 50 : 0)
        })
        .css({
          opacity: '1',
          position: 'absolute',
          height: '50px',
          width: '50px',
          'z-index': '100',
          display: 'block'
        })
        .appendTo($('body'))
        .animate(
          {
            top: goal.offset().top + 10,
            left: '50%',
            height: 10,
            width: 10,
            rotate: '2turn'
          },
          500 + i * 200
        );
      imgclone.animate(
        {
          width: 0,
          height: 0
        },
        () => {
          imgclone.detach();
        }
      );
    }
  }

  await delay(1000);
  animateUserStats(point, context);
  $('body').removeClass('overflow-hidden');
  pennyImg.remove();
};

export const animateUserStats = async (
  point: any,
  context?: MainLayoutContextValue
) => {
  const currentProgress = anime.get(
    document.querySelector('.lv-indicator'),
    'width',
    'px'
  );

  const clixpointEl = document.getElementById('clixPoint') as any;
  const { clixpoint, nextpointsrequired, pointsrequired } = clixpointEl.dataset;
  const newPoint = (+clixpoint || 0) + point;
  let newProgressPercentage =
    ((newPoint - +pointsrequired) / +nextpointsrequired) * 100;

  if (newProgressPercentage > 99) {
    context?.fetchData();
  }
  newProgressPercentage =
    newProgressPercentage >= 100
      ? newProgressPercentage - 100
      : newProgressPercentage;
  anime({
    targets: '.lv-indicator',
    width: `${newProgressPercentage}%`,
    duration: 0
  });

  anime({
    targets: document.querySelector('.lv-text-indicator.value'),
    innerHTML: [`${currentProgress}%`, `${newProgressPercentage}%`],
    round: 1,
    easing: 'linear',
    duration: 200
  });

  clixpointEl.dataset.clixpoint = newPoint;
  anime({
    targets: clixpointEl,
    innerHTML: [clixpointEl?.innerHTML, newPoint],
    round: 1,
    easing: 'linear',
    duration: 200,
    update: anim => {
      clixpointEl.textContent = formatDecimal(anim.animations[0].currentValue);
    }
  });
};

export const scrollToElement = (elementId: string, containerId: any) => {
  const element = document.getElementById(elementId);
  const container = document.getElementById(containerId);
  if (container && element) {
    const containerWidth = container.offsetWidth;
    const elementWidth = element.offsetWidth;
    const scrollOffset = (containerWidth - elementWidth) / 2;

    container.scrollTo({
      left: element.offsetLeft - scrollOffset,
      behavior: 'smooth'
    });
  }
};

export const formatDecimal = (num: number | string = 0, separator = ',') => {
  const parts = num.toString().split('.');
  return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};
