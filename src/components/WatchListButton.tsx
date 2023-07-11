import { ROUTERS } from '@configs/common';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import { TitleService } from '@services/title';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loading } from './Loading';

export const WatchListButton = ({
  titleId,
  added,
  className,
  onAdded
}: {
  titleId: string;
  added: boolean;
  className?: string;
  onAdded: (added: boolean) => void;
}) => {
  const router = useRouter();
  const { status } = useSession();
  const { fetchData } = useMainLayoutContext();
  const [loading, setLoading] = useState<boolean>(false);

  const onAddWatchlist = async () => {
    if (added) {
      return;
    }

    if (status !== 'authenticated') {
      router.push(ROUTERS.login);
      return;
    }
    const payload = {
      id: titleId,
      isAddToWatchList: true
    };

    setLoading(true);
    if (status === 'authenticated') {
      await TitleService.addOrRemoveToWatchList(payload);
    }
    if (onAdded) {
      onAdded(true);
    }
    setLoading(false);
    fetchData();
  };
  return (
    <button
      className={`clix-btn border-gradient-primary p-0 w-[100vw] min-h-[31px] gap-1 ${
        className ? className : ''
      } ${added ? 'active-green' : ''}`}
      onClick={() => onAddWatchlist()}
    >
      <span className="px-1 flex items-center gap-1">
        {loading ? (
          <Loading size={10}></Loading>
        ) : (
          <span>
            {added ? (
              <svg
                width="11"
                height="9"
                viewBox="0 0 11 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.6714 1.83566L9.42901 0.375488L3.61572 5.32183L1.46017 2.78847L0 4.03088L2.95653 7.50561L2.96609 7.49748L3.40751 8.01628L10.6714 1.83566Z"
                  fill="#D9D9D9"
                />
              </svg>
            ) : (
              '+ '
            )}
          </span>
        )}
        Watchlist
      </span>
    </button>
  );
};
