import { ActionState } from './Button20';
import { Loading } from './Loading';

interface Props {
  leftText: string;
  rightText: string;
  disabled: boolean;
  loading?: boolean;
  click?: (action: ActionState) => void;
}

const StepButtonGroup = ({
  leftText,
  rightText,
  disabled,
  loading,
  click
}: Props) => {
  return (
    <div className="flex justify-between text-center gap-2">
      <button
        type="button"
        className="w-full h-[40px] flex justify-center items-center cursor-pointer boder-solid border border-[rgba(255,255,255,0.2)] bg-[linear-gradient(180deg,#101010_0%,#1C1C1C_100%)] shadow-[1.03726px_1.03726px_3.11178px_rgba(0,0,0,0.25)] rounded-[6.22356px]"
        onClick={() => (click ? click('prev') : 0)}
      >
        <span className="font-bold text-[14px] text-[rgba(255,255,255,0.8)]">
          {leftText}
        </span>
      </button>
      <button
        type="button"
        disabled={disabled}
        className={`w-full h-[40px] flex justify-center items-center cursor-pointer border-[1.03726px_1.03726px_3.11178px rgba(0,0,0,0.25)] shadow-[2px_2px_6px_rgba(0,0,0,0.25)] rounded-[6.22356px] ${
          disabled
            ? 'bg-[#3E3E3E] cursor-not-allowed'
            : 'bg-[linear-gradient(180deg,#F11E22_0%,#912A89_100%)]'
        }`}
        onClick={() => {
          if (disabled) {
            return;
          }
          click ? click('next') : 0;
        }}
      >
        {rightText.toLowerCase() === 'done' ? (
          <div id="step_done">
            <span className="font-bold text-[14px] text-[rgba(255,255,255,0.8)]">
              {rightText}
            </span>
          </div>
        ) : (
          <span className="font-bold text-[14px] text-[rgba(255,255,255,0.8)]">
            {!loading && rightText}
            <Loading loading={loading}></Loading>
          </span>
        )}
      </button>
    </div>
  );
};

export default StepButtonGroup;
