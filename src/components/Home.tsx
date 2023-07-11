/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
'use client';
import Logo from '@components/Logo';
import {
  calculateTimeOnPage,
  logPageView,
  trackButtonClick
} from '@helpers/analytics';
import { scrollToElement, useAsyncEffect } from '@helpers/client';
import { CardBoard } from '@interfaces/mediaTitle';
import '@scss/carousel.scss';
import { HttpClient } from '@services/http-client';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Carousel from './Carousel';
import SlugContainer from './SlugContainer';

const cellGap = 7;
let scene: number;

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  const [itemSelected, setItemSelected] = useState<any>({});
  const [listName, setListName] = useState<any>([]);
  const [listSelectedIdx, setListSelectedIdx] = useState(-1);
  const [cardBoards, setCardBoards] = useState<CardBoard[]>([]);
  const [slug, setSlug] = useState<string>(window.location.hash.substring(1));
  useAsyncEffect(async () => {
    const { data } = await HttpClient.get<any>('clix/game/stat');
    setCardBoards(data);
    logPageView();
  }, []);

  const onSelect = (item: any, idx: number) => {
    setItemSelected(item);
    setListSelectedIdx(idx);
    if (item.slug !== slug) {
      setSlug(slug === item.slug ? slug : `${item.slug}`);
    }
    setTimeout(() => {
      scrollToElement(item.id, 'pills');
    }, 100);
    trackButtonClick(item.name, 'Carousel List Button clicked');
  };

  useAsyncEffect(async () => {
    const { data: results } = await HttpClient.post<any>('clix/listname', {});
    if (results?.length > 0) {
      const pillIndex = results.findIndex((ia: any) => ia.slug === slug);
      onSelect(
        results[pillIndex !== -1 ? pillIndex : 0],
        pillIndex !== -1 ? pillIndex : 0
      );
      setListName(results);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      router.push(`/#${slug}`);
    }
    return () => {
      calculateTimeOnPage(`Time spent reviewing on ${slug} live carousel`);
    };
  }, [router, slug]);

  return (
    <div className="relative">
      <div className="w-full mb-1">
        {listName?.[listSelectedIdx]?.description && (
          <SlugContainer>
            {listName?.[listSelectedIdx]?.description}
          </SlugContainer>
        )}
      </div>
      <Carousel dataSource={itemSelected}></Carousel>
      <div id="pills" className="pills py-2 max-w-[500px] mx-auto">
        {listName?.map((item: any, idx: number) => (
          <span
            id={item.id}
            onClick={e => {
              e.stopPropagation();
              onSelect(item, idx);
            }}
            key={idx}
            className={`pill ${
              idx === listSelectedIdx ? 'pill__active' : ''
            } px-3 py-1 text-center font-bold cursor-pointer text-[14px] bg-[#2C2C2C]`}
          >
            {item.name}
          </span>
        ))}
      </div>
      {status === 'unauthenticated' && listName?.length > 0 && (
        <div className="flex gap-2 items-center justify-center my-3">
          <Link href={'/auth/signup'}>
            <Image
              src="/images/SignUp-btn.png"
              width={140}
              height={40}
              alt="signbtn"
            ></Image>
          </Link>
          <Link href={'/auth/login'}>
            <Image
              src="/images/Login-btn.png"
              width={140}
              height={40}
              alt="signbtn"
            ></Image>
          </Link>
        </div>
      )}
      {listName?.length > 0 && cardBoards?.length > 0 && (
        <div className="sweep-stakes-container">
          <div className="sweep-stakes-wrapper">
            <div className="mb-3">
              <Logo></Logo>
            </div>
            <div className="title">
              <h1>Points binge</h1>
            </div>
            <div className="sweep-stakes">
              {cardBoards?.map((item: any, idx: number) => (
                <div className="sweep-stake" key={idx}>
                  <label className="genre-label">{item.genre}</label>
                  <div className="genre-info">
                    <div className="progress-container">
                      <div className="progress">
                        {item.completePercentage ? (
                          <div
                            className="indicator"
                            style={{ width: `${item.completePercentage}%` }}
                          >
                            <div className="text-indicator">
                              {item.completePercentage}%
                            </div>
                          </div>
                        ) : (
                          <div className="text-indicator">0%</div>
                        )}
                      </div>
                    </div>
                    {(item.completePercentage < 100 || !item?.id) && (
                      <Link
                        href={`/title/genre?id=${item.id}`}
                        className="clix-btn border-gradient-primary"
                      >
                        {item.completePercentage ? 'Continue' : 'Start'}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
