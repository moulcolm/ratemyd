import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const photos = await prisma.photo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        imageUrl: true,
        thumbnailUrl: true,
        category: true,
        status: true,
        isVerified: true,
        declaredLength: true,
        declaredGirth: true,
        elo: true,
        totalMatches: true,
        wins: true,
        losses: true,
        draws: true,
        createdAt: true,
        moderationNote: true,
        rejectionReason: true,
        verificationRequestedAt: true,
        verifiedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: photos });
  } catch (error) {
    console.error('Get user photos error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
