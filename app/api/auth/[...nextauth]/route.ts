import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { findAgencyByEmail } from '@/lib/agencies';

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth — needs GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in env
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId:     process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ] : []),

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
          theme:     agency.theme,
        } as any;
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    // Google sign-in: only allow if agency already exists (registered via email first)
    async signIn({ account, user }) {
      if (account?.provider === 'google') {
        const agency = await findAgencyByEmail(user.email!);
        if (!agency) {
          // No account yet — redirect to register
          return '/register?error=NoAccount';
        }
      }
      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Credentials login
      if (user && account?.provider === 'credentials') {
        token.agencyId  = (user as any).id;
        token.subdomain = (user as any).subdomain;
        token.plan      = (user as any).plan;
        token.status    = (user as any).status;
        token.theme     = (user as any).theme;
      }

      // Google login — look up agency by email
      if (account?.provider === 'google') {
        const agency = await findAgencyByEmail(token.email!);
        if (agency) {
          token.agencyId  = agency.id;
          token.subdomain = agency.subdomain;
          token.plan      = agency.plan;
          token.status    = agency.status;
          token.theme     = agency.theme;
          token.name      = agency.name;
        }
      }

      // Session update (called after settings save)
      if (trigger === 'update' && session) {
        if (session.name  !== undefined) token.name  = session.name;
        if (session.theme !== undefined) token.theme = session.theme;
        // logo intentionally not stored in JWT — loaded fresh from /api/settings
      }

      return token;
    },

    async session({ session, token }) {
      const u = session.user as any;
      u.agencyId  = token.agencyId;
      u.subdomain = token.subdomain;
      u.plan      = token.plan;
      u.status    = token.status;
      u.theme     = token.theme;
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
