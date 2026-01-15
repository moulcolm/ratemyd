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

            // Public routes
            const publicRoutes = ['/', '/login', '/register'];
            const isPublicRoute = publicRoutes.includes(pathname);

            // API routes that don't require auth
            const publicApiRoutes = ['/api/auth', '/api/register', '/api/admin/init-seed'];
            const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

            // Admin routes
            const isAdminRoute = pathname.startsWith('/admin');
            const isAdmin = auth?.user && (auth.user as { isAdmin?: boolean }).isAdmin;

            // Protect admin routes
            if (isAdminRoute && !isAdmin) {
                return false;
            }

            // Public routes and API routes are always accessible
            if (isPublicRoute || isPublicApiRoute) {
                return true;
            }

            // Require login for all other routes
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
