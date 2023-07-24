import NextAuth, { NextAuthOptions } from "node_modules/next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      id: process.env.NEXT_PUBLIC_CREDENTIAL_ID,
      credentials: {
        email: {
          label: "Email",
          type: "text"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials, req) {
        if (
          credentials?.email === process.env.NEXT_PUBLIC_EMAIL &&
          credentials?.password === process.env.NEXT_PUBLIC_PASSWORD
        ) {
          return {
            id: "ff3a135c-022c-4d61-a0aa-e459a067eab1",
            name: "Admin",
            email: credentials?.email
          };
        } else {
          throw new Error("Incorrect username and password");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin";
      return token;
    }
  }
};

export default NextAuth(authOptions);
