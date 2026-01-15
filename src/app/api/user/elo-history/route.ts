import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getUserLimits } from '@/lib/subscription-limits';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check subscription
    const limits = getUserLimits(0);
    if (!limits.canSeeEloHistory) {
      return NextResponse.json(
        { error: 'Fonctionnalité Premium requise' },
        { status: 403 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const history = await prisma.eloHistory.findMany({
      where: {
        userId: user.id,
        ...(category && { category: category as 'REPOS' | 'ERECTION' | 'GLOBAL' }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        category: true,
        eloBefore: true,
        eloAfter: true,
        change: true,
        reason: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('Get ELO history error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
