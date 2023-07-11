/* eslint-disable */
import { getEnv } from '@configs/env';
import { UserService } from '@services/user';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      id: 'sign-auth0',
      name: 'Credentials',
      credentials: {
        sms: {},
        email: {},
        code: {}
      },
      async authorize(credentials) {
        const { email, sms, code } = credentials as any;
        if (email && code) {
          const { data } = await UserService.verify({ email, code });
          return data ?? null;
        } else if (sms && code) {
          const { data } = await UserService.verify({ sms, code });
          return data ?? null;
        } else if (code) {
          const { data } = await UserService.token({ code });
          return data ?? null;
        } else {
          return null;
        }
      }
    })
  ],
  secret: getEnv('NEXTAUTH_SECRET'),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        return { ...token, ...session.user };
      }
      return { ...token, ...user };
    },
    async session({ session, token, user }) {
      session.user = { ...user, ...token };
      return session;
    }
  },
  events: {},
  // Enable debug messages in the console if you are having problems
  debug: getEnv('NODE_ENV') === 'development'
});
