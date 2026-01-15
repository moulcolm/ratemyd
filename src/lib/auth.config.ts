import type { NextAuthConfig } from 'next-auth';

// Auth configuration for Edge Runtime (middleware)
// This file should NOT import Prisma, bcrypt, or any Node.js-only modules

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Public routes - always accessible
            const publicRoutes = ['/', '/login', '/register'];
            if (publicRoutes.includes(pathname)) {
                return true;
            }

            // API routes that don't require auth
            if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/register')) {
                return true;
            }

            // Admin routes - require admin privileges
            if (pathname.startsWith('/admin')) {
                const isAdmin = auth?.user && (auth.user as { isAdmin?: boolean }).isAdmin;
                return !!isAdmin;
            }

            // All other routes require authentication
            return isLoggedIn;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.isAdmin = (user as { isAdmin?: boolean }).isAdmin;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id: string }).id = token.id as string;
                (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
            }
            return session;
        },
    },
    providers: [], // Providers are added in auth.ts
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    trustHost: true,
};
