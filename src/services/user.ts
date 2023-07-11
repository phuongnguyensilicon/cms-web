import { APIS } from '@configs/common';
import { ERROR, STREAMER_IDS } from '@constants/common';
import { IStreamser } from '@interfaces/streamer';
import { signIn } from 'next-auth/react';
import { HttpClient } from './http-client';

export const UserService = {
  signup: (variables: any, setSuccess: any, setError: any, setLoading: any) => {
    setLoading(true);
    HttpClient.post<any>(APIS.authSignup, variables)
      .then(({ data, statusCode, message }) => {
        if (haveError(data?.error, statusCode)) {
          setError(messageError(data?.error_description, message));
        } else {
          setSuccess(data);
          setError('');
        }
      })
      .catch(e => catchError(e, setError))
      .finally(() => setLoading(false));
  },

  token: (variables: any) => {
    return HttpClient.post<any>(APIS.authToken, variables);
  },
  verify: (variables: any) => {
    return HttpClient.post<any>(APIS.authVerifyOTP, variables);
  },

  getProvidesStreamers: (setSuccess: any, setError: any, setLoading: any) => {
    setLoading(true);
    HttpClient.get<any>(APIS.getProvidesStreamers)
      .then(({ data, message, statusCode }) => {
        if (haveError(data?.error, statusCode)) {
          setError(messageError(data?.error_description, message));
        } else {
          setSuccess(
            data.filter(
              (x: IStreamser) => !STREAMER_IDS.includes(Number(x.providerId))
            )
          );
          setError('');
        }
      })
      .catch(e => catchError(e, setError))
      .finally(() => setLoading(false));
  },

  getUserStreamers: (
    setStreamers: any,
    setProviderIds: any,
    setError: any,
    setLoading: any
  ) => {
    HttpClient.get<any>(APIS.getUserStreamers)
      .then(({ data, message, statusCode }) => {
        if (haveError(data?.error, statusCode)) {
          setError(messageError(data?.error_description, message));
        } else {
          setStreamers(data.allStreamers);
          setProviderIds(data.userStreamers.map((x: any) => x.providerId));
          setError('');
        }
      })
      .catch(({ message, response }) => {
        setError(response?.data?.message || message || ERROR.AN_ERROR_OCCURRED);
      })
      .finally(() => {
        setLoading(false);
      });
  },

  updateProfile: (
    variables: any,
    session: any,
    updatedSession: any,
    setSuccess: any,
    setError: any,
    setSubmitting: any
  ) => {
    setSubmitting(true);
    HttpClient.post<any>(APIS.updateProfile, variables)
      .then(async ({ data: user, statusCode, message }) => {
        if (haveError(user?.error, statusCode)) {
          setError(messageError(user?.error_description, message));
        } else {
          await updatedSession({
            ...session,
            user
          });
          setSuccess(true);
        }
      })
      .catch(e => catchError(e, setError))
      .finally(() => setSubmitting(false));
  },

  updateSubscribe: (
    variables: any,
    setSuccess: any,
    setError: any,
    setSubmitting: any
  ) => {
    setSubmitting(true);
    HttpClient.post<any>(APIS.updateSubscribe, variables)
      .then(({ data, message, statusCode }) => {
        if (haveError(data?.error, statusCode)) {
          setError(messageError(data?.error_description, message));
        } else {
          setSuccess(true);
        }
      })
      .catch(e => catchError(e, setError))
      .finally(() => setSubmitting(false));
  },

  onVerify: async (variables: any, setError: any, setLoading: any) => {
    try {
      setLoading(true);
      const userSign = await signIn('sign-auth0', {
        ...variables
      });
      console.log(userSign);
      if (userSign?.error) {
        if (userSign.error.includes('The verification code has expired')) {
          setError('The code you have entered has expired.');
        } else if (userSign.error.includes('verification code')) {
          setError('Invalid verification code.');
        } else {
          setError(userSign?.error);
        }
      }

      setLoading(false);
    } catch (error: any) {
      console.error(error);
      setError(error?.message || ERROR.AN_ERROR_OCCURRED);
    }
  },

  getCode: (
    variables: any,
    setSuccess: any,
    setError: any,
    setLoading: any
  ) => {
    setLoading(true);
    HttpClient.post<any>(APIS.authStart, variables)
      .then(({ data, statusCode, message }) => {
        if (haveError(data?.error, statusCode)) {
          setError(messageError(data?.error_description, message));
        } else {
          setSuccess(data);
          setError('');
        }
      })
      .catch(e => catchError(e, setError))
      .finally(() => setLoading(false));
  },

  getLevel: (setSuccess: any, setError?: any, setLoading?: any) => {
    setLoading(true);
    HttpClient.get<any>(APIS.getLevel)
      .then(({ data, statusCode, message }) => {
        if (haveError(data?.error, statusCode)) {
          setError(messageError(data?.error_description, message));
        } else {
          setSuccess(data);
          setError('');
        }
      })
      .catch(e => catchError(e, setError))
      .finally(() => setLoading(false));
  },

  getStats: (setSuccess: any, setError: any, setLoading: any) => {
    setLoading(true);
    HttpClient.get<any>(APIS.accountStats)
      .then(({ data, statusCode, message }) => {
        if (haveError(data?.error, statusCode)) {
          setError(messageError(data?.error_description, message));
        } else {
          setSuccess(data);
          setError('');
        }
      })
      .catch(e => catchError(e, setError))
      .finally(() => setLoading(false));
  }
};

const catchError = ({ message, response }: any, fn: any) =>
  fn(response?.data?.message || message || ERROR.AN_ERROR_OCCURRED);

const haveError = (error: any, statusCode: any) =>
  error || (Number(statusCode) / 100).toFixed() !== '2';

const messageError = (error_description: any, message: any) =>
  error_description || message || ERROR.AN_ERROR_OCCURRED;
