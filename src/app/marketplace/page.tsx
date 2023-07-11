/* eslint-disable @next/next/no-img-element */
'use client';

// import MarketItem from '@components/MarketItem';
import { MARKET_PLACE } from '@configs/common';
import { formatDecimal } from '@helpers/client';
// import { MARKET_PLACE_ITEMS } from '@constants/mockups';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import LogoPNG from '@images/ClixLogo_smooth.png';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

export default function MarketPlacePage() {
  const { setConfig, data } = useMainLayoutContext();
  const { markPNG, coinPNG } = MARKET_PLACE;
  const [percent, setPercent] = useState<any>();

  useEffectOnce(() => {
    setConfig({
      backHeader: {
        title: ''
      },
      showStat: false
    });
  });

  useEffect(() => {
    setPercent(`${((data?.levels?.point || 0) / 5000) * 100}%`);
  }, [data]);

  return (
    <div id="market-place">
      <h3 className="text-center">Exchange Clix Points for Rewards!</h3>
      <div className="points mb-3">
        <img
          className="clix-points"
          src="/images/clix-points.png"
          alt="clix point"
          width={83}
          height={15}
        />
        <div>
          <div>
            <img src={coinPNG} alt="point" height="18px" width="18px" />{' '}
            {formatDecimal(data.levels?.point)}
          </div>
        </div>
      </div>
      <div className="mk-place-custom mb-4">
        <div className="wrapper">
          <div
            className="progress-bar"
            style={{ '--percentClaimed': percent } as React.CSSProperties}
          >
            <div className="top">
              <div className="begin">
                <div className="peg">
                  <span className="value">$0</span>
                  <Image
                    src={markPNG}
                    width={21}
                    height={16}
                    className="w-auto h-auto"
                    alt="mark"
                  />
                </div>
              </div>
              <div className="end">
                <div className="peg">
                  <span className="value">$5</span>
                  <Image
                    src={markPNG}
                    width={21}
                    height={16}
                    className="w-auto h-auto"
                    alt="mark"
                  />
                </div>
              </div>
            </div>
            <div className="bottom">
              <div className="begin">
                <div className="peg">
                  <Image
                    src={coinPNG}
                    width={21}
                    height={16}
                    className="w-auto h-auto"
                    alt="mark"
                  />
                  <span className="value">0</span>
                </div>
                <span className="label">EARN POINTS</span>
              </div>
              <div className="end">
                <div className="peg">
                  <Image
                    src={coinPNG}
                    width={21}
                    height={16}
                    className="w-auto h-auto"
                    alt="mark"
                  />
                  <span className="value">{formatDecimal(5000)}</span>
                </div>
                <span className="label">
                  CLAIM $5 <br /> GIFT cARD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rewards-card">
        <div className="text-center">
          <Image
            src={LogoPNG}
            width={128}
            height={30}
            className="w-auto h-auto"
            alt="logo"
          />
          <p className="mt-2">Rewards Card</p>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Image
                key={index}
                src={`/images/marketplace/image${index + 1}.png`}
                width={46}
                height={30}
                className="w-auto h-auto"
                alt="logo"
              />
            ))}
        </div>
      </div>

      {/* <h3>Entertainment</h3>
      <div className="list">
        {MARKET_PLACE_ITEMS.map((x, idx): any => (
          <MarketItem item={x} key={idx} />
        ))}
      </div>
      <h3>Food & Drinks</h3>
      <div className="list">
        {MARKET_PLACE_FOOD_ITEMS.map((x, idx): any => (
          <MarketItem item={x} key={idx} />
        ))}
      </div> */}
    </div>
  );
}
