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

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const limits = TIER_LIMITS[user.subscriptionTier];
    const maxResults = limits.canSeeFullLeaderboard ? limit : Math.min(limit, 100);
    const maxPage = limits.canSeeFullLeaderboard ? undefined : Math.ceil(100 / limit);

    if (maxPage && page > maxPage) {
      return NextResponse.json(
        { error: 'Passez Premium pour voir le classement complet' },
        { status: 403 }
      );
    }

    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: {
        photos: {
          some: {
            status: 'APPROVED',
          },
        },
        isBanned: false,
      },
      orderBy: { eloGlobal: 'desc' },
      take: maxResults,
      skip,
      select: {
        id: true,
        username: true,
        eloGlobal: true,
        eloRepos: true,
        eloErection: true,
        subscriptionTier: true,
        totalWins: true,
        totalLosses: true,
        photos: {
          where: { status: 'APPROVED' },
          orderBy: { elo: 'desc' },
          take: 1,
          select: {
            id: true,
            thumbnailUrl: true,
            isVerified: true,
            totalMatches: true,
          },
        },
      },
    });

    const total = await prisma.user.count({
      where: {
        photos: {
          some: {
            status: 'APPROVED',
          },
        },
        isBanned: false,
      },
    });

    const leaderboard = users.map((u, index) => ({
      rank: skip + index + 1,
      id: u.id,
      username: u.username,
      elo: u.eloGlobal,
      eloRepos: u.eloRepos,
      eloErection: u.eloErection,
      subscriptionTier: u.subscriptionTier,
      isVerified: u.photos.some((p) => p.isVerified),
      totalMatches: u.photos.reduce((sum, p) => sum + p.totalMatches, 0),
      winRate: u.totalWins + u.totalLosses > 0
        ? Math.round((u.totalWins / (u.totalWins + u.totalLosses)) * 100)
        : 0,
      photoId: u.photos[0]?.id || '',
      thumbnailUrl: u.photos[0]?.thumbnailUrl || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        total: limits.canSeeFullLeaderboard ? total : Math.min(total, 100),
        page,
        limit: maxResults,
        hasMore: limits.canSeeFullLeaderboard
          ? skip + maxResults < total
          : skip + maxResults < 100 && skip + maxResults < total,
      },
    });
  } catch (error) {
    console.error('Get leaderboard global error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
