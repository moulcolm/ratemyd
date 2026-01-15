import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getPhotoPair, canUserVote } from '@/lib/matchmaking';
import { checkRateLimit } from '@/lib/rate-limit';
import { getUserLimits } from '@/lib/subscription-limits';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = await checkRateLimit(user.id, 'compare');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    // Check if user can vote
    const canVote = await canUserVote(user.id);
    if (!canVote) {
      return NextResponse.json(
        {
          error: 'Vous avez atteint votre limite de votes quotidiens',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const category = (searchParams.get('category') || 'MIXED') as 'REPOS' | 'ERECTION' | 'MIXED';
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

    // Everyone can filter verified now

    const pair = await getPhotoPair({
      category,
      verifiedOnly,
      voterId: user.id,
    });

    if (!pair) {
      return NextResponse.json(
        { error: 'Pas assez de photos disponibles pour comparer' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        leftPhoto: {
          id: pair.leftPhoto.id,
          imageUrl: pair.leftPhoto.imageUrl,
          category: pair.leftPhoto.category,
          isVerified: pair.leftPhoto.isVerified,
          declaredLength: pair.leftPhoto.declaredLength,
        },
        rightPhoto: {
          id: pair.rightPhoto.id,
          imageUrl: pair.rightPhoto.imageUrl,
          category: pair.rightPhoto.category,
          isVerified: pair.rightPhoto.isVerified,
          declaredLength: pair.rightPhoto.declaredLength,
        },
        category: pair.leftPhoto.category,
      },
    });
  } catch (error) {
    console.error('Get pair error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
