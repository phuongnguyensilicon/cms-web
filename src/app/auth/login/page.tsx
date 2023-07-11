'use client';
import { ROUTERS } from '@configs/common';

import LogoSVG from '@svg/clixtv-logo.svg';
import EmailSVG from '@svg/email.svg';
import FacebookSVG from '@svg/facebook.svg';
import GoogleSVG from '@svg/google.svg';
import PhoneSVG from '@svg/phone.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLoginPage() {
  const router = useRouter();

  const { status: statusSession }: any = useSession();

  useEffect(() => {
    if (statusSession === 'authenticated') {
      router.push(ROUTERS.auth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusSession]);

  const handleClick = (e: any, path: string) => {
    e.preventDefault();
    router.push(path);
  };

  return (
    <section className="user">
      <div className="logo">
        <Image src={LogoSVG} alt="clixtv-logo" />
      </div>

      <h1>Login</h1>

      <button onClick={e => handleClick(e, ROUTERS.authFacebook)}>
        <Image src={FacebookSVG} alt="Continue with Facebook" /> Continue with
        Facebook
      </button>
      <button onClick={e => handleClick(e, ROUTERS.authGoogle)}>
        <Image src={GoogleSVG} alt="Continue with Google" /> Continue with
        Google
      </button>

      <h2>or</h2>

      <button onClick={e => handleClick(e, ROUTERS.loginPhone)}>
        <Image src={PhoneSVG} alt="Login with Phone" /> Login with Phone
      </button>

      <button onClick={e => handleClick(e, ROUTERS.loginEmail)}>
        <Image src={EmailSVG} alt="Login with Email" /> Login with Email
      </button>

      <div>
        Don’t have an account yet? <Link href={ROUTERS.signup}>Signup</Link>
      </div>
    </section>
  );
}
