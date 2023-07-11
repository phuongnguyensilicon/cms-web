import Image from 'next/image';
import ClixCoinBg from 'public/images/Clix-coin-bg.png';
export interface Coins {
  value?: number;
  className?: string;
  size?: {
    w?: number;
    h?: number;
  };
  disabled?: boolean;
}
const Coin = ({ value, className, size, disabled }: Coins) => {
  return (
    <div className={`penny m-[3px] ${disabled ? 'disabled' : ''}`}>
      <div className="relative flex flex-shrink-0 ">
        <span
          className={`center-item coin-value  font-designer ${
            className ? className : 'text-[13px]'
          } `}
        >
          +{value}
        </span>
        <Image
          src={ClixCoinBg}
          width={size?.w || 40}
          height={size?.h || 40}
          alt="logo"
          className={`w-${`[${size?.w || 40}px]`} h-${`[${
            size?.h || 40
          }px]`} min-w-[25px]`}
          loading="eager"
        ></Image>
      </div>
    </div>
  );
};

export default Coin;
