import Coin, { Coins } from './Coin';

interface Props {
  text: string;
  coin?: Coins;
  active?: boolean;
  className?: string;
  click?: (action: any) => void;
}

const Button = ({ text, coin, className, active, click }: Props) => {
  return (
    <button className="flex justify-between gap-3">
      <div
        className={`btn-primary flex items-center justify-center text-center cursor-pointer ${
          active ? 'active' : ''
        }`}
        onClick={() => (click ? click('next') : 0)}
      >
        <span
          className={`label font-bold text-[#ccc] p-1 leading-[15px] ${
            className ? className : ''
          }`}
        >
          {text}
        </span>
        {coin && (coin?.value || 0) > 0 && (
          <Coin
            value={coin.value}
            className={coin.className}
            size={coin.size}
          ></Coin>
        )}
      </div>
    </button>
  );
};

export default Button;
