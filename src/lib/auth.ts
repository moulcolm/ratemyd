import { prisma } from './prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// SECURITY: No fallback secret - must be configured via environment variables
const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!secretKey && process.env.NODE_ENV === 'production') {
  throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be configured in production');
}
const secret = new TextEncoder().encode(
  secretKey || 'dev-only-secret-do-not-use-in-production'
);

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, secret);

    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.username as string,
        isAdmin: payload.isAdmin as boolean,
      },
    };
  } catch (error) {
    console.error('[Session] Verification error:', error);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
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
