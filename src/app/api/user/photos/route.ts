import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    console.log('[User Photos] Request received');
    const user = await requireAuth();
    if (!user) {
      console.log('[User Photos] No user authenticated');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('[User Photos] Fetching photos for user:', user.id);
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
        verifiedLength: true,
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
        boostEndsAt: true,
      },
    });

    console.log('[User Photos] Found photos:', photos.length, photos);

    // Map the response to match frontend expectations
    const formattedPhotos = photos.map(photo => ({
      ...photo,
      totalVotes: photo.totalMatches,
      boostActive: photo.boostEndsAt ? new Date(photo.boostEndsAt) > new Date() : false,
    }));

    return NextResponse.json({ success: true, data: formattedPhotos });
  } catch (error) {
    console.error('Get user photos error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
