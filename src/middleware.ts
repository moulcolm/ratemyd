import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // Public routes
  const publicRoutes = ['/', '/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // API routes that don't require auth
  const publicApiRoutes = ['/api/auth', '/api/register'];
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdmin = req.auth?.user && (req.auth.user as { isAdmin?: boolean }).isAdmin;

  // Redirect unauthenticated users to login
  if (!isLoggedIn && !isPublicRoute && !isPublicApiRoute) {
    const url = new URL('/login', nextUrl.origin);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/compare', nextUrl.origin));
  }

  // Protect admin routes
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
