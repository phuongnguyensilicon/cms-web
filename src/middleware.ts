import { getEnv } from '@configs/env';
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  secret: getEnv('NEXTAUTH_SECRET')
});

export const config = {
  matcher: [
    '/auth/setup',
    '/user/:path*',
    '/title/genre'
    // '/api/:function*'
  ]
};
