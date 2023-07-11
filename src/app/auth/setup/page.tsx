'use client';

import UserProfile from '@components/UserProfile';
import { dateUTC } from '@helpers/ultis';
import LogoSVG from '@svg/clixtv-logo.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function UserUpdateProfilePage() {
  const { data: session }: any = useSession();

  const profile: any = session?.user
    ? {
        userName: session.user?.userName || '',
        city: session.user?.city || '',
        state: session.user?.state || '',
        gender: session.user?.gender || '',
        dob: dateUTC(session.user?.dob)
      }
    : null;

  return (
    <>
      <div id="user-page">
        <section className="user">
          <div className="logo">
            <Image src={LogoSVG} alt="clixtv-logo" />
          </div>

          <h1>Profile Setup</h1>
          <h2>Let’s get your account setup</h2>
          {profile && <UserProfile profile={profile}></UserProfile>}
        </section>
      </div>
    </>
  );
}
