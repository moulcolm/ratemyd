import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// SECURITY: No fallback secret in production
const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!secretKey && process.env.NODE_ENV === 'production') {
  throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be configured in production');
}
const secret = new TextEncoder().encode(
  secretKey || 'dev-only-secret-do-not-use-in-production'
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log('[SimpleLogin] Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: 'User is banned' },
        { status: 403 }
      );
    }

    // Create JWT token - 7 days expiration for better security
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Set cookie with secure settings
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('[SimpleLogin] Login error:', error);
    // SECURITY: Don't expose error details to client
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
