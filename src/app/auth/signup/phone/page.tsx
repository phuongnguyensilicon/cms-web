'use client';

import { formatOTPInput, formatPhoneInput, PhoneUS } from '@helpers/ultis';
import { isValidOTP, isValidPhoneNumber } from '@helpers/validation';
import LogoSVG from '@svg/clixtv-logo.svg';
import Image from 'next/image';

import { ROUTERS } from '@configs/common';
import { UserService } from '@services/user';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

export default function UserSignupPhonePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [sms, setSMS] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const { status: statusSession }: any = useSession();

  useEffect(() => {
    if (statusSession === 'authenticated') {
      router.push(ROUTERS.auth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusSession]);

  const onNext = () => {
    if (isValidPhoneNumber(sms)) {
      UserService.signup({ sms }, setData, setError, setLoading);
    }
  };

  const onVerifyOTP = async () => {
    if (isValidOTP(code)) {
      const variables = {
        callbackUrl: `${window.location.origin}/${ROUTERS.auth}`,
        redirect: false,
        sms,
        code
      };
      UserService.onVerify(variables, setError, setLoading);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(formatOTPInput(e.target.value));
  };

  const handleInputPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSMS(formatPhoneInput(e.target.value));
  };

  return (
    <section className="user-phone">
      <div className="logo">
        <Image src={LogoSVG} alt="clixtv-logo" />
      </div>

      <h1>{data ? 'Check your SMS' : 'Sign Up with Phone'}</h1>

      <form onSubmit={e => e.preventDefault()} autoComplete="off">
        {!data && (
          <>
            <label htmlFor="phone-number">Please input your phone number</label>
            <input
              type="text"
              name="phone-number"
              placeholder="Phone number"
              value={sms}
              onChange={e => handleInputPhoneChange(e)}
              maxLength={12}
            />

            {error && <div className="error">{error}</div>}

            <button
              onClick={onNext}
              disabled={loading}
              className={isValidPhoneNumber(sms) || !loading ? '' : 'disabled'}
            >
              {loading ? 'Loading...' : 'Get Code'}
            </button>
            <div className="left">
              By continuing, you agree to the Clix{' '}
              <a href="#terms">Terms & Conditions</a> and{' '}
              <a href="#privacy">Privacy Policy</a>.
            </div>
          </>
        )}

        {!!data && (
          <>
            <label htmlFor="code">
              {data?.user && 'This number phone has already been registered. '}
              We’ve sent a verification SMS to {PhoneUS(sms)}. Please enter your
              one-time password
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
              {error ? 'Sorry, that code didn’t work.' : 'Didn’t receive OTP?'}{' '}
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
