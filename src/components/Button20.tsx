import Image from 'next/image';

export type ActionState = 'prev' | 'next';
interface Props {
  leftText: string;
  rightText: string;
  click: (action: ActionState) => void;
}

const Button20 = ({ leftText, rightText, click }: Props) => {
  return (
    <div className="flex justify-between gap-3">
      <div
        className="left-action flex items-center text-center justify-between cursor-pointer"
        onClick={() => click('prev')}
      >
        <Image
          src="/images/20Gold_3x.png"
          width={40}
          height={40}
          alt="logo"
          className="w-auto h-auto"
          loading="eager"
        ></Image>
        <span className="w-full font-bold text-[14px] text-[#ccc] p-1 leading-[15px]">
          {leftText}
        </span>
      </div>
      <div
        className="right-action flex items-center text-center justify-between cursor-pointer"
        onClick={() => click('next')}
      >
        <span className="w-full font-bold text-[14px] text-[#ccc] p-1 leading-[15px]">
          {rightText}
        </span>
        <Image
          src="/images/20Gold_3x.png"
          width={40}
          height={40}
          alt="logo"
          className="w-auto h-auto"
          loading="eager"
        ></Image>
      </div>
    </div>
  );
};

export default Button20;
