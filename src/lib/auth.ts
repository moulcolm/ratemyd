import { prisma } from './prisma';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
// import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  // Note: Adapter is commented out for Credentials provider
  // PrismaAdapter causes issues with Credentials provider in NextAuth v5
  // adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('[Auth] Starting authorization...');

          if (!credentials?.email || !credentials?.password) {
            console.log('[Auth] Missing credentials');
            return null;
          }

          console.log('[Auth] Looking up user:', credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.hashedPassword) {
            console.log('[Auth] User not found or no password');
            return null;
          }

          console.log('[Auth] Checking password...');
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          );

          if (!isPasswordValid) {
            console.log('[Auth] Invalid password');
            return null;
          }

          if (user.isBanned) {
            console.log('[Auth] User is banned');
            return null;
          }

          console.log('[Auth] Authorization successful for:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.username,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error('[Auth] Authorization error:', error);
          return null;
        }
      },
    }),
  ],
});

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  return await prisma.user.findUnique({
    where: { email: session.user.email },
  });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.isBanned) return null;
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!user.isAdmin) return null;
  return user;
}
