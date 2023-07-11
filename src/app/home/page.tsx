// /* eslint-disable no-var */
// 'use client';
// import AverageRating from '@components/AverageRating';
// import SlugContainer from '@components/SlugContainer';
// import {
//   isDefaultStreamer,
//   scrollToElement,
//   useAsyncEffect,
//   verifyPosterPath
// } from '@helpers/client';
// import { MediaTitle } from '@interfaces/mediaTitle';
// import '@scss/carousel.scss';
// import { HttpClient } from '@services/http-client';
// import defautStreamerSVG from '@svg/ClixStreamer.svg';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// import { gsap } from 'gsap';
// import { Draggable } from 'gsap/Draggable';
// gsap.registerPlugin(Draggable);
// // const progressWrap = gsap.utils.wrap(0, 1);
// const cellGap = 7;
// let scene: number;
// // const dragDistancePerRotation = 1200;
// // let startProgress: number;

// export default function Home() {
//   const router = useRouter();
//   const [itemSelected, setItemSelected] = useState<any>({});
//   const [listName, setListName] = useState<any>([]);
//   const [listSelectedIdx, setListSelectedIdx] = useState(-1);
//   const [activeButtons, setActiveButtons] = useState<string[]>(['movie', 'tv']);
//   const [slug, setSlug] = useState<string>(window.location.hash.substring(1));

//   useEffect(() => {
//     const carouselContainer = document.getElementById(
//       'c-container'
//     ) as HTMLElement;
//     const carouselWrapper = document.getElementById('c-wrapper') as any;
//     scene = carouselWrapper.offsetWidth * 0.6; // 60%
//     carouselWrapper.style.width = `${scene}px`;
//     carouselContainer.style.height = `${(scene - 10) * 2}px`;
//   }, []);

//   useEffect(() => {
//     const carouselContainer = document.getElementById('c-wrapper') as
//       | HTMLElement
//       | any;

//     if (!Object.keys(itemSelected).length) {
//       return;
//     }

//     function init() {
//       const cellElements = carouselContainer.getElementsByClassName('c-item');
//       const cellCount = cellElements.length;
//       const cellSize = scene - cellGap;
//       const radius =
//         Math.round(cellSize / 2 / Math.tan(Math.PI / cellCount)) || 0;

//       for (let i = 0; i < cellCount; i++) {
//         cellElements[i].style.width = `${cellSize - cellGap}px`;
//         cellElements[i].style.height = `${(cellSize - 20) * 1.5}px`;
//       }

//       if (!radius) {
//         return;
//       }

//       gsap.fromTo(
//         cellElements,
//         {
//           rotationY: i => (i * 360) / cellCount
//         },
//         {
//           rotationY: '-=360',
//           duration: 30,
//           ease: 'none',
//           repeat: -1,
//           transformOrigin: '50% 50% ' + -radius + 'px'
//         }
//       );

//       // const proxy = document.createElement('div');
//       // function updateRotation(this: Draggable) {
//       //   const p =
//       //     startProgress + (this.startX - this.x) / dragDistancePerRotation;
//       //   spin.progress(progressWrap(p));
//       // }

//       // Draggable.create(proxy, {
//       //   trigger: '#c-wrapper',
//       //   type: 'x',
//       //   inertia: true,
//       //   allowNativeTouchScrolling: true,
//       //   onPress() {
//       //     gsap.killTweensOf(spin);
//       //     spin.timeScale(0);
//       //     startProgress = spin.progress();
//       //   },
//       //   onDrag: updateRotation,
//       //   onThrowUpdate: updateRotation,
//       //   onRelease() {
//       //     if (!this.tween || !this.tween.isActive()) {
//       //       gsap.to(spin, { timeScale: 1, duration: 1 });
//       //     }
//       //   },
//       //   onThrowComplete() {
//       //     gsap.to(spin, { timeScale: 1, duration: 1 });
//       //   }
//       // });
//     }

//     setTimeout(init, 0);
//   }, [itemSelected]);

//   const onSelect = (item: any, idx: number) => {
//     setItemSelected(item);
//     setListSelectedIdx(idx);
//     if (item.slug !== slug) {
//       setSlug(slug === item.slug ? slug : `${item.slug}`);
//     }
//     setTimeout(() => {
//       scrollToElement(item.id, 'pills');
//     }, 100);
//   };

//   const handleButtonClick = (buttonName: string) => {
//     if (activeButtons.includes(buttonName)) {
//       if (activeButtons.length === 1) {
//         // Always have one option selected
//         return;
//       }
//       setActiveButtons(prevButtons =>
//         prevButtons.filter(btn => btn !== buttonName)
//       );
//     } else {
//       setActiveButtons(prevButtons => [...prevButtons, buttonName]);
//     }
//   };

//   useAsyncEffect(async () => {
//     const { data: results } = await HttpClient.post<any>('clix/listname', {});
//     if (results?.length > 0) {
//       const pillIndex = results.findIndex((ia: any) => ia.slug === slug);
//       onSelect(
//         results[pillIndex !== -1 ? pillIndex : 0],
//         pillIndex !== -1 ? pillIndex : 0
//       );
//       setListName(results);
//     }
//   }, []);

//   useEffect(() => {
//     if (slug) {
//       router.push(`/home/#${slug}`);
//     }
//   }, [router, slug]);

//   const renderTitle = (title: MediaTitle) => {
//     return (
//       <div key={title.id} className={`c-item`}>
//         <div className="streamer-logo mb-1">
//           <Image
//             src={
//               isDefaultStreamer(title.watchProvider.logoPath)
//                 ? defautStreamerSVG
//                 : title.watchProvider.logoPath
//             }
//             height={71}
//             width={400}
//             alt="Streamer"
//             className="object-fill max-h-[71px] rounded-[10px]"
//           />
//         </div>
//         <Link
//           href={`title?LID=${listName[listSelectedIdx].slug}&titleId=${title.id}`}
//           className="carousel__poster"
//         >
//           <div
//             className={`c-item__poster box-reflect relative ${
//               title.posterPath ? '' : 'default'
//             } w-full h-full min-h-[250px] bg-cover bg-center bg-no-repeat`}
//             style={{
//               backgroundImage: `url(${verifyPosterPath(title.posterPath)})`
//             }}
//           ></div>
//         </Link>
//         {title?.clixScore && (
//           <div className="score-group pt-[2px] mt-[10px] bg-[rgba(43,43,43,0.6)] w-[40%] mx-auto shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[1px] rounded-[5px]">
//             <div className="hero-score">
//               <Image
//                 src="/clix-logo-compact.png"
//                 width={20}
//                 height={12}
//                 alt="logo"
//                 loading="eager"
//               ></Image>
//               <span className="label-text">Score</span>
//             </div>
//             <div className="point">{(title?.clixScore || 0)?.toFixed(1)}</div>
//             <AverageRating score={title?.clixScore}></AverageRating>
//           </div>
//         )}
//       </div>
//     );
//   };
//   return (
//     <div id="home-carousel" className="relative">
//       <div className="w-full">
//         <div className="px-3">
//           <div className="flex justify-center gap-2">
//             <div className="btn-group basis-1/2">
//               <button
//                 className={`action first:rounded-l-full ${
//                   activeButtons.includes('tv') ? 'active' : ''
//                 }`}
//                 onClick={() => handleButtonClick('tv')}
//               >
//                 <span className="label">Series</span>
//               </button>
//               <button
//                 className={`action last:rounded-r-full ${
//                   activeButtons.includes('movie') ? 'active' : ''
//                 }`}
//                 onClick={() => handleButtonClick('movie')}
//               >
//                 <span className="label">Movies</span>
//               </button>
//             </div>
//           </div>

//           {listName?.[listSelectedIdx]?.description && (
//             <SlugContainer>
//               {listName?.[listSelectedIdx]?.description}
//             </SlugContainer>
//           )}
//         </div>
//       </div>
//       <div id="c-container" className="c-scene">
//         <div id="c-wrapper" className="c-3d-wrapper">
//           {itemSelected?.mediaItems?.map((title: MediaTitle) =>
//             renderTitle(title)
//           )}
//         </div>
//       </div>
//       <div id="pills" className="pills py-2 max-w-[500px] mx-auto">
//         {listName?.map((item: any, idx: number) => (
//           <span
//             id={item.id}
//             onClick={e => {
//               e.stopPropagation();
//               onSelect(item, idx);
//             }}
//             key={idx}
//             className={`pill ${
//               idx === listSelectedIdx ? 'pill__active' : ''
//             } px-3 py-1 text-center font-bold cursor-pointer text-[14px] bg-[#2C2C2C]`}
//           >
//             {item.name}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }

// pages/404.tsx
export default function Custom404() {
  return (
    <>
      <h1>404 - Page Not Found</h1>
    </>
  );
}
