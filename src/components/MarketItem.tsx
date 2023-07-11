/* eslint-disable @next/next/no-img-element */
'use client';
import { MARKET_PLACE } from '@configs/common';
import { useRouter } from 'next/navigation';
const { markPNG, coinPNG } = MARKET_PLACE;

interface Props {
  item: {
    logo?: any;
    name?: string;
    action?: string;
    title?: string;
    percents?: string[];
    className?: string;
  };
}

const MarketItem = ({
  item: {
    className = '',
    logo,
    action,
    name = '',
    percents = [],
    title = 'Watch'
  }
}: Props) => {
  const router = useRouter();
  return (
    <div
      className={`item ${className}`}
      onClick={() =>
        router.push(`/marketplace/${name.replace(/[^a-zA-Z0-9-_]/g, '')}`)
      }
    >
      <div className="logo">
        <img src={logo} alt={name} width={300} height={170} />
        <h4>{action || title}</h4>
      </div>
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
        </div>
        <div className="bar">
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default MarketItem;
