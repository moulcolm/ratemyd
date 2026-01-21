import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
);

// Routes that require authentication
const protectedRoutes = [
  '/profile',
  '/upload',
  '/api/user',
  '/api/photos/upload',
  '/api/photos/my-photos',
];

// Routes that require admin access
const adminRoutes = ['/admin', '/api/admin'];

// Routes that are always public
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth',
  '/api/compare/pair',
  '/api/compare/vote',
  '/api/leaderboard',
  '/compare',
  '/leaderboard',
  '/terms',
  '/privacy',
  '/contact',
  '/faq',
];

async function verifyToken(token: string) {
  try {
    if (!secret.length) {
      console.error('[Middleware] AUTH_SECRET not configured');
      return null;
    }
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublicRoute || pathname === '/') {
    return NextResponse.next();
  }

  // Get auth token
  const token = request.cookies.get('auth-token')?.value;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute) {
    if (!token) {
      // Redirect to login for page routes, return 401 for API routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      // Invalid token - clear it and redirect
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Session expirée' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));

      response.cookies.delete('auth-token');
      return response;
    }

    // Check admin access for admin routes
    if (isAdminRoute && !payload.isAdmin) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
