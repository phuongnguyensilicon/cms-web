'use client';
import { ROUTERS } from '@configs/common';
import BackPNG from '@images/back-btn.png';
import defaultAvatarPNG from '@images/Profile.png';
import SearchPNG from '@images/Search.png';
import MenuSVG from '@svg/menu.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Footer from './Footer';

import Logo from './Logo';

export default function Header() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const { data: session, status: statusSession }: any = useSession();

  const onSigninOut = () => {
    setShowMenu(false);
    if (statusSession === 'authenticated') {
      router.push(ROUTERS.userProfile);
    } else {
      router.push(ROUTERS.login);
    }
  };

  const goTo = (url: string) => {
    setShowMenu(false);
    router.push(url);
  };

  return (
    <header className="main__header">
      <div>
        <Image
          src={MenuSVG}
          alt="navigation"
          onClick={() => setShowMenu(!showMenu)}
          width={40}
          height={40}
        />
      </div>
      <div className="logo">
        <Link href={'/'}>
          <Logo w={72} h={22}></Logo>
        </Link>
      </div>
      <div className="right">
        <Image
          src={SearchPNG}
          alt="search"
          className="w-auto h-auto"
          width={30}
          height={30}
          onClick={() => router.push('search')}
        />
        {session?.user?.avatar || session?.user?.picture ? (
          <Image
            src={session.user.avatar || session.user.picture}
            alt="avatar"
            width="30"
            height="30"
            className="avatar object-cover"
            onClick={onSigninOut}
          />
        ) : (
          <Image
            src={defaultAvatarPNG}
            alt="avatar"
            width={30}
            height={30}
            className="w-full h-auto object-cover"
            onClick={onSigninOut}
          />
        )}
      </div>
      <div className={'menu' + (showMenu ? '' : ' hide')}>
        <div className="back-header" onClick={() => setShowMenu(false)}>
          <Image
            src={BackPNG}
            alt="back"
            width={15}
            height={15}
            className="w-auto h-auto"
          />
          Back
        </div>
        <h2>Menu</h2>
        <section>
          <button onClick={() => goTo(ROUTERS.home)}>Home</button>
          <button onClick={() => goTo(ROUTERS.marketplace)}>Marketplace</button>
          <button onClick={() => goTo(ROUTERS.binge)}>Clix Binge</button>
          <Footer />
        </section>
      </div>
    </header>
  );
}
