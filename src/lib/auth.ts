import { prisma } from './prisma';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        if (user.isBanned) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          isAdmin: user.isAdmin,
        };
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
