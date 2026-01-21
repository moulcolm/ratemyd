import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';

// Token expires in 1 hour
const TOKEN_EXPIRY_HOURS = 1;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: 3 requests per hour per email
    const rateLimit = await checkRateLimit(`forgot-password:${normalizedEmail}`, 'auth');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    // Always return success to prevent email enumeration
    // But only send email if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Delete any existing tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email: normalizedEmail },
      });

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Store hashed token in database
      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token: hashedToken,
          expires: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
        },
      });

      // TODO: Send email with reset link
      // For now, log the reset URL (in production, use a proper email service)
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      console.log(`[Password Reset] Reset URL for ${normalizedEmail}: ${resetUrl}`);

      // In production, you would send an email here:
      // await sendPasswordResetEmail(normalizedEmail, resetUrl);
    }

    // Always return success message to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    });
  } catch (error) {
    console.error('[Forgot Password] Error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
