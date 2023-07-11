'use client';

import { ROUTERS } from '@configs/common';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import { IStreamser } from '@interfaces/streamer';
import '@scss/user.scss';
import { UserService } from '@services/user';
import CloseSVG from '@svg/close.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

export default function UserStreamerPage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [streamers, setStreamers] = useState<IStreamser[]>([]);
  const [providerIds, setProviderIds] = useState<number[]>([]);

  const { setConfig } = useMainLayoutContext();

  useEffectOnce(() => {
    setConfig({
      backHeader: {
        title: 'My Streaming Services'
      },
      showStat: false
    });
  });

  useEffect(() => {
    if (isSuccess) {
      router.push(ROUTERS.userProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    UserService.getUserStreamers(
      setStreamers,
      setProviderIds,
      setError,
      setLoading
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = () => providerIds.length < 1;

  const onSubmit = () => {
    UserService.updateSubscribe(
      { providerIds },
      setSuccess,
      setError,
      setSubmitting
    );
  };

  const onSelected = (providerId: string | number) => {
    if (providerIds.includes(Number(providerId))) {
      setProviderIds([...providerIds.filter(x => x !== providerId)]);
    } else {
      setProviderIds(prevProviderIds => [
        ...prevProviderIds,
        Number(providerId)
      ]);
    }
  };

  return (
    <section id="user-me-page">
      <div className="p-4">
        <div className="streamers">
          <form>
            <label htmlFor="keyword" className="sr-only">
              Search
            </label>
            <div>
              <input
                name="keyword"
                value={keyword}
                placeholder="Search streaming services"
                onChange={e => setKeyword(e.target.value.toLocaleLowerCase())}
              />
              {keyword && (
                <Image
                  src={CloseSVG}
                  width={16}
                  height={16}
                  alt="clear keyword"
                  onClick={() => setKeyword('')}
                />
              )}
            </div>
          </form>

          <div className="select-multiple">
            {isLoading && <div className="loading">Loading...</div>}
            {streamers.length > 0 &&
              Array.isArray(streamers) &&
              streamers
                .filter(x =>
                  x.providerName?.toLocaleLowerCase().includes(keyword)
                )
                .map(x => (
                  <div
                    onClick={() => onSelected(x.providerId)}
                    key={x.providerId}
                    className={
                      providerIds.includes(Number(x.providerId))
                        ? 'checked'
                        : ''
                    }
                  >
                    {x.providerName}
                  </div>
                ))}
          </div>
        </div>
      </div>

      {error && <div className="error center">{error}</div>}

      <div className="buttons save">
        <button
          disabled={isDisabled()}
          onClick={() => onSubmit()}
          className={'done ' + (isDisabled() ? 'disabled' : '')}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </section>
  );
}
