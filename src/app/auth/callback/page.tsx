/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import MainLayout from '@components/MainLayout';
import { TheLoading } from '@components/TheLoading';
import { ROUTERS } from '@configs/common';
import MainLayoutProvider from '@providers/MainLayoutProvider';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSessionStorage } from 'usehooks-ts';

export default function UserLoginPage() {
  const searchParams = useSearchParams();
  const code = searchParams?.get('code');
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useSessionStorage<any>('welcome', null);
  const router = useRouter();
  useEffect(() => {
    if (isOpen !== false) {
      setIsOpen(true);
    }
    (async () => {
      const userSign = await signIn('sign-auth0', {
        callbackUrl: `${window.location.origin}`,
        redirect: false,
        code
      });

      if (userSign?.error) {
        setError('Invalid verification code.');
      } else {
        router.push(ROUTERS.home);
      }
    })();
  }, []);

  return (
    <MainLayoutProvider>
      <MainLayout showStat={false}>
        {error && <div className="error text-center">Error: {error}</div>}
        <div className="uppercase font-designer text-[20px] text-center">
          <div className="my-3">Loading...</div>
          <TheLoading />
        </div>
      </MainLayout>
    </MainLayoutProvider>
  );
}
