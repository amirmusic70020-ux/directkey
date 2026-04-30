import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findAgencyByEmail } from '@/lib/agencies';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const agency = await findAgencyByEmail(credentials.email);
        if (!agency) return null;

        const valid = await bcrypt.compare(credentials.password, agency.passwordHash);
        if (!valid) return null;

        return {
          id:        agency.id,
          email:     agency.email,
          name:      agency.name,
          subdomain: agency.subdomain,
          plan:      agency.plan,
          status:    agency.status,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.agencyId  = user.id;
        token.subdomain = (user as any).subdomain;
        token.plan      = (user as any).plan;
        token.status    = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).agencyId  = token.agencyId;
      (session.user as any).subdomain = token.subdomain;
      (session.user as any).plan      = token.plan;
      (session.user as any).status    = token.status;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
