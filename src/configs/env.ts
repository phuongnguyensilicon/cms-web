type EnvVariables = {
  readonly ENV: 'production' | 'staging' | 'development' | 'test';
  readonly NODE_ENV: 'production' | 'development';
  readonly AUTH_TOKEN_KEY: string;
  readonly NEXT_PUBLIC_DEFAULT_LANGUAGE: string;
  readonly NEXT_PUBLIC_SITE_URL: string;
  readonly NEXT_PUBLIC_ADMIN_URL: string;
  readonly NEXTAUTH_URL: string;
  readonly NEXTAUTH_SECRET: string;
  readonly API_ENDPOINT: string;
  readonly AUTH0_BASE_URL: string;
  readonly AUTH0_CALLBACK_URL: string;
  readonly AUTH0_DOMAIN: string;
  readonly AUTH0_CLIENT_ID: string;
  readonly AUTH0_CLIENT_SECRET: string;
  readonly AUTH0_AUDIENCE: string;
  readonly AUTH0_ISSUER: string;
  readonly AUTH0_SCOPE: string;
};

const ENV_DEFAULT: EnvVariables = {
  NODE_ENV: 'production',

  NEXT_PUBLIC_DEFAULT_LANGUAGE: '',
  NEXT_PUBLIC_SITE_URL: '',
  NEXT_PUBLIC_ADMIN_URL: '',
  AUTH0_BASE_URL:
    'https://clix-web-git-development-admin-clixtvcom-s-team.vercel.app',
  AUTH0_CALLBACK_URL:
    'https://clix-web-git-development-admin-clixtvcom-s-team.vercel.app/auth/callback',
  AUTH0_DOMAIN: 'dev-guez7ev3yxlby5mm.us.auth0.com',
  AUTH0_ISSUER: 'https://dev-guez7ev3yxlby5mm.us.auth0.com',
  AUTH0_CLIENT_ID: 'FmJdhsyB7FJo3WQytnVcmwpxPKoNk9HM',
  AUTH0_CLIENT_SECRET:
    '0zxPYsdNvVEO0kP4tvv2lUxlOfp6ItMdVyPm4KYTba1W9rc4h1ct4qVXRrEpmUh6',
  AUTH0_AUDIENCE: '',
  AUTH0_SCOPE: 'openid profile',
  AUTH_TOKEN_KEY: 'authToken',
  ENV: 'development',
  API_ENDPOINT:
    'https://clix-cms-git-development-admin-clixtvcom-s-team.vercel.app/api/',
  NEXTAUTH_URL:
    'https://clix-web-git-development-admin-clixtvcom-s-team.vercel.app',
  NEXTAUTH_SECRET: '4S2OzedkNRj9c6OOxik8Z4ZyVPfAl4OD'
};

export function getEnv(
  name: keyof EnvVariables
): EnvVariables[keyof EnvVariables] {
  const val = process.env[name] || ENV_DEFAULT[name];
  if (!val) {
    throw new Error(`Cannot find environmental variable: ${name}`);
  }
  return val;
}
