import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { TIER_LIMITS } from '@/lib/subscription-limits';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionTier: true,
        bonusPhotoSlots: true,
        _count: {
          select: {
            photos: {
              where: {
                status: { in: ['PENDING', 'APPROVED'] },
              },
            },
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const limits = TIER_LIMITS[userData.subscriptionTier];
    // photosPerCategory est par catégorie (REPOS, ERECTION), donc on multiplie par 2
    const totalSlots = (limits.photosPerCategory * 2) + userData.bonusPhotoSlots;
    const usedSlots = userData._count.photos;
    const availableSlots = Math.max(0, totalSlots - usedSlots);

    return NextResponse.json({
      data: {
        used: usedSlots,
        total: totalSlots,
        available: availableSlots,
      },
    });
  } catch (error) {
    console.error('Get photo slots error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
