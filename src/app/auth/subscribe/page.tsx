'use client';

import { STREAMERS, STREAMER_IDS } from '@constants/common';
import { IStreamser } from '@interfaces/streamer';
import '@scss/user.scss';
import { UserService } from '@services/user';
import LogoSVG from '@svg/clixtv-logo.svg';
import CloseSVG from '@svg/close.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UserSubscribePage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [isMore, setMore] = useState(false);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');

  const [streamers, setStreamers] = useState<IStreamser[]>([]);
  const [prevProviderIds, setPrevProviderIds] = useState<number[]>([]);
  const [providerIds, setProviderIds] = useState<number[]>([]);

  useEffect(() => {
    if (isMore && streamers.length < 1) {
      UserService.getProvidesStreamers(setStreamers, setError, setLoading);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMore]);
  useEffect(() => {
    if (isSuccess) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

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

  const onSubmit = () => {
    UserService.updateSubscribe(
      { providerIds },
      setSuccess,
      setError,
      setSubmitting
    );
  };

  const showMoreCount = () => {
    const streamersExtra = providerIds.filter(
      x => !STREAMER_IDS.includes(Number(x))
    );
    return streamersExtra.length ? `More +${streamersExtra.length}` : 'More';
  };

  const isDisabled = () => providerIds.length < 1;
  const onMore = () => {
    setPrevProviderIds(providerIds);
    setMore(true);
  };
  const onCancelMore = () => {
    setProviderIds(prevProviderIds);
    setMore(false);
  };

  return (
    <div id="user-page">
      <section className="subscribe">
        <div className="logo">
          <Image src={LogoSVG} alt="clixtv-logo" />
        </div>

        <h1>Profile Setup</h1>
        <h2>Which streamers are you subscribed to?</h2>

        {!isMore && (
          <>
            <div className="streamers">
              {STREAMERS.map((x, idx) => (
                <div
                  onClick={() => onSelected(x.providerId)}
                  key={idx}
                  className={
                    providerIds.includes(Number(x.providerId)) ? 'active' : ''
                  }
                >
                  <Image src={x.logoPath} alt={x.providerName} />
                </div>
              ))}
              <div onClick={onMore}>
                <div>{showMoreCount()}</div>
              </div>
            </div>

            {error && <div className="error center">{error}</div>}

            <div className="buttons">
              <button onClick={() => router.push('/')} className="basis-1/2">
                Skip
              </button>
              <button
                disabled={isDisabled()}
                onClick={() => onSubmit()}
                className={'done basis-1/2 ' + (isDisabled() ? 'disabled' : '')}
              >
                {isSubmitting ? 'Submitting...' : 'Done'}
              </button>
            </div>
          </>
        )}

        {isMore && (
          <>
            <div className="p-4">
              <div className="more-streamers">
                <form>
                  <label htmlFor="keyword" className="sr-only">
                    Search
                  </label>
                  <div>
                    <input
                      name="keyword"
                      value={keyword}
                      placeholder="Search streaming services"
                      onChange={e =>
                        setKeyword(e.target.value.toLocaleLowerCase())
                      }
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

            <div className="buttons">
              <button onClick={onCancelMore} className="basis-1/2">
                Cancel
              </button>
              <button className="done basis-1/2" onClick={() => setMore(false)}>
                OK
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
