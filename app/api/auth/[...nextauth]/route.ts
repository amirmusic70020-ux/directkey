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
  