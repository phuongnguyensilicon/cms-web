'use client';
import UserProfile from '@components/UserProfile';
import { dateUTC } from '@helpers/ultis';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import '@scss/profile.scss';
import { useSession } from 'next-auth/react';
import { useEffectOnce } from 'usehooks-ts';

export default function UserUpdateProfilePage() {
  const { data: session }: any = useSession();

  const profile = session?.user
    ? {
        userName: session.user?.userName || '',
        city: session.user?.city || '',
        state: session.user?.state || '',
        gender: session.user?.gender || '',
        dob: dateUTC(session.user?.dob)
      }
    : null;
  const { setConfig } = useMainLayoutContext();

  useEffectOnce(() => {
    setConfig({
      backHeader: {
        title: 'Profile Update'
      },
      showStat: false
    });
  });
  return (
    <div id="profile-update">
      <section className="user">
        {profile && <UserProfile profile={profile}></UserProfile>}
      </section>
    </div>
  );
}
