import { getEnv } from './env';

const API_ENDPOINT = getEnv('API_ENDPOINT');
export const ROUTERS = {
  home: '/',
  contact: '/#contact',
  marketplace: '/marketplace',
  binge: '/#binge',
  userProfile: '/user/profile',
  userProfileUpdate: '/user/profile/update',
  userProfileSetup: '/auth/setup',
  userStreamers: '/user/streamers',
  userSubscribe: '/auth/subscribe',
  userWatchList: '/user/watchlist',
  auth: '/auth',
  login: '/auth/login',
  signup: '/auth/signup',
  loginPhone: '/auth/login/phone',
  loginEmail: '/auth/login/email',
  signupPhone: '/auth/signup/phone',
  signupEmail: '/auth/signup/email',
  authGoogle: API_ENDPOINT + 'auth/signin?connection=google-oauth2',
  authFacebook: API_ENDPOINT + 'auth/signin?connection=facebook'
};

export const APIS = {
  fileAvatar: 'file/avatar',
  accountStats: 'clix/account/stats',
  getProvidesStreamers: 'metadata/streamers',
  getUserStreamers: 'clix/account/streamer',
  updateSubscribe: 'clix/account/streamer',
  updateProfile: 'clix/account/update',
  authToken: 'auth/token',
  authVerifyOTP: 'auth/verify',
  authSignup: 'auth/signup',
  authStart: 'auth/start',
  getLevel: 'clix/account/level'
};

export const APP_CONFIG = {
  header: {
    hideLeft: [],
    hideRight: [ROUTERS.userProfileUpdate]
  },
  goBack: [
    { to: 'to-other-url', from: 'from-url' }
    // { to: ROUTERS.userProfile, from: ROUTERS.userProfileUpdate },
    // { to: ROUTERS.userProfile, from: ROUTERS.userStreamers },
    // { to: ROUTERS.userProfile, from: ROUTERS.userWatchList },
    // { to: ROUTERS.userProfileSetup, from: ROUTERS.userSubscribe },
    // { to: ROUTERS.login, from: ROUTERS.signup },
    // { to: ROUTERS.login, from: ROUTERS.loginPhone },
    // { to: ROUTERS.login, from: ROUTERS.loginEmail },
    // { to: ROUTERS.login, from: ROUTERS.signupPhone },
    // { to: ROUTERS.login, from: ROUTERS.signupEmail }
  ]
};

export const getUrlBack = (pathname: string | null) => {
  return pathname
    ? APP_CONFIG.goBack.filter(x => x.from === pathname)[0]?.to || null
    : null;
};

export const MARKET_PLACE = {
  coinPNG: '/images/marketplace/coin.png',
  markPNG: '/images/marketplace/mark.png'
};
