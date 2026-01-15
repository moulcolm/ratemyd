import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
);

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.username as string,
        isAdmin: payload.isAdmin as boolean,
      },
    });
  } catch (error) {
    console.error('[Session] Verification error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
