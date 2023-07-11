/* eslint-disable @next/next/no-img-element */
'use client';

import { MARKET_PLACE } from '@configs/common';
const { markPNG, coinPNG } = MARKET_PLACE;

interface Props {
  item: {
    logo?: any;
    more?: any;
    name?: string;
    title?: string;
    percents?: string[];
    className?: string;
  };
}

const MarketItemDetails = ({
  item: { logo, more, name = '', percents = [], title = 'Watch' }
}: Props) => {
  return (
    <div className={`item`}>
      <div className="logo">
        <img src={logo} alt={name} width={300} height={170} />
        <h5>{name}</h5>
        <h3>{title}</h3>
      </div>
      <div className="px-3">
        <div className="process">
          <div className="line">
            <div className="percent">
              <span>{percents[0]}</span>
            </div>
            <div className="mark">
              <img src={markPNG} alt="mark" />
            </div>
            <div className="point">
              <img src={coinPNG} alt="point" /> 0
            </div>
            <div>EARN MORE POINTS</div>
          </div>
          <div className="line">
            <div className="percent">
              <span>{percents[1]}</span>
            </div>
            <div className="mark">
              <img src={markPNG} alt="mark" />
            </div>
            <div className="point">
              <img src={coinPNG} alt="point" /> 500
            </div>
            <div>CLAIM {percents[1]} OFFER</div>
          </div>
          <div className="line">
            <div className="percent">
              <span>{percents[2]}</span>
            </div>
            <div className="mark">
              <img src={markPNG} alt="mark" />
            </div>
            <div className="point">
              <img src={coinPNG} alt="point" /> 1750
            </div>
            <div>CLAIM {percents[2]} OFFER</div>
          </div>
          <div className="line rounded-tr-[5.48333px] rounded-br-[6px]">
            <div className="percent">
              <span>{percents[3]}</span>
            </div>
            <div className="mark">
              <img src={markPNG} alt="mark" />
            </div>
            <div className="point">
              <img src={coinPNG} alt="point" /> 3500
            </div>
            <div>CLAIM {percents[3]} OFFER</div>
          </div>
          <div className="bar">
            <div></div>
          </div>
        </div>
        <div>
          <h4 className="italic">Claim Instructions</h4>
          <ol>
            <li>Claim and confirm your Clix offer above</li>
            <li>Check your email to redeem gift card</li>
            <li>Complete your gift card purchase to redeem discount</li>
          </ol>
          <h4>Learn more</h4>
          <div className="more">
            <img src={more} alt={name} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketItemDetails;
