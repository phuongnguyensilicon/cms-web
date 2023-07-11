import { getEnv } from '@configs/env';
import Cookies from 'js-cookie';
const AUTH_TOKEN_KEY = getEnv('AUTH_TOKEN_KEY');

export function useToken() {
  return {
    setToken(token: string) {
      Cookies.set(AUTH_TOKEN_KEY, token, { expires: 1 });
    },
    getToken() {
      return Cookies.get(AUTH_TOKEN_KEY);
    },
    removeToken() {
      Cookies.remove(AUTH_TOKEN_KEY);
    },
    hasToken() {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      if (!token) return false;
      return true;
    }
  };
}
