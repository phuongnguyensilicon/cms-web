'use client';
import { ROUTERS } from '@configs/common';
import { formatOTPInput } from '@helpers/ultis';
import { isValidEmail, isValidOTP } from '@helpers/validation';
import { UserService } from '@services/user';

import LogoSVG from '@svg/clixtv-logo.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

export default function UserLoginEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState('');

  const { status: statusSession }: any = useSession();

  useEffect(() => {
    if (statusSession === 'authenticated') {
      router.push(ROUTERS.auth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusSession]);

  const onNext = () => {
    if (isValidEmail(email)) {
      UserService.getCode({ email }, setData, setError, setLoading);
    }
  };

  const onVerifyOTP = async () => {
    if (isValidOTP(code)) {
      const variables = {
        callbackUrl: `${window.location.origin}/${ROUTERS.auth}`,
        redirect: false,
        email,
        code
      };
      UserService.onVerify(variables, setError, setLoading);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(formatOTPInput(e.target.value));
  };

  return (
    <section className="user-email">
      <div className="logo">
        <Image src={LogoSVG} alt="clixtv-logo" />
      </div>

      <h1>{data ? 'Check your email inbox' : 'Login with Email'}</h1>

      <form onSubmit={e => e.preventDefault()} autoComplete="off">
        {!data && (
          <>
            <label htmlFor="email">Please input your email address</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={e => setEmail(e.target.value)}
            />

            {error && <div className="error">{error}</div>}

            <button
              onClick={onNext}
              disabled={loading}
              className={isValidEmail(email) || !loading ? '' : 'disabled'}
            >
              {loading ? 'Loading...' : 'Get Code'}
            </button>

            {isValidEmail(email) ? (
              <div className="left larger">
                New to Clix?{' '}
                <Link href={ROUTERS.signup} className="white">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="left">
                By continuing, you agree to the Clix{' '}
                <a href="#terms">Terms & Conditions</a> and{' '}
                <a href="#privacy">Privacy Policy</a>.
              </div>
            )}
          </>
        )}

        {!!data && (
          <>
            <label htmlFor="code">
              We’ve sent a verification email to {email} containing a 6 digit
              code. Please enter it below.
            </label>
            <input
              type="text"
              name="code"
              placeholder="0-0-0-0-0-0"
              value={code}
              onChange={e => handleInputChange(e)}
              maxLength={11}
            />

            {error && <div className="error">{error}</div>}

            <button
              onClick={onVerifyOTP}
              disabled={loading}
              className={isValidOTP(code) || !loading ? '' : 'disabled'}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <div className="left">
              {error
                ? 'Sorry, that code didn’t work.'
                : 'Didn’t receive the email? Try checking your junk or spam folders.'}{' '}
              <b onClick={onNext} className="text-white cursor-pointer">
                Resend
              </b>
            </div>
          </>
        )}
      </form>
    </section>
  );
}
