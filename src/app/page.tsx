/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
'use client';
import Home from '@components/Home';
import MainLayout from '@components/MainLayout';
import WelcomeModal from '@components/Welcome';
import MainLayoutProvider from '@providers/MainLayoutProvider';
import '@scss/carousel.scss';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useSessionStorage } from 'usehooks-ts';

export default function HomePage() {
  const { status: statusSession }: any = useSession();

  const [isOpen, setIsOpen] = useSessionStorage<any>('welcome', null);

  useEffect(() => {
    if (isOpen !== false) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayoutProvider>
      {statusSession !== 'loading' && (
        <>
          {statusSession !== 'authenticated' && isOpen ? (
            <WelcomeModal handleClick={setIsOpen} />
          ) : (
            <MainLayout showStat={true}>
              <Home />
            </MainLayout>
          )}
        </>
      )}
    </MainLayoutProvider>
  );
}
