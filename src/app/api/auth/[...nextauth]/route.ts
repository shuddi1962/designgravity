import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { insforge } from '@/lib/insforge/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await insforge.post<{
            user: { id: string; email: string; name: string };
            accessToken: string;
            refreshToken: string;
          }>('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });

          if (response.user) {
            insforge.setTokens(response.accessToken, response.refreshToken);
            return {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
