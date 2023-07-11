'use client';

import { ROUTERS } from '@configs/common';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UserLoginEmailPage() {
  const router = useRouter();

  const { data, status: statusSession }: any = useSession();
  useEffect(() => {
    if (statusSession === 'authenticated') {
      if (!!data?.user?.userName) {
        router.push('/');
      } else {
        router.push(ROUTERS.userProfileSetup);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, statusSession]);
}
