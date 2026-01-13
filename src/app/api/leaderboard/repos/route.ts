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

    // For FREE users, limit to top 100
    const maxResults = limits.canSeeFullLeaderboard ? limit : Math.min(limit, 100);
    const maxPage = limits.canSeeFullLeaderboard ? undefined : Math.ceil(100 / limit);

    if (maxPage && page > maxPage) {
      return NextResponse.json(
        { error: 'Passez Premium pour voir le classement complet' },
        { status: 403 }
      );
    }

    const skip = (page - 1) * limit;

    // Get users with at least one approved REPOS photo, ordered by eloRepos
    const users = await prisma.user.findMany({
      where: {
        photos: {
          some: {
            category: 'REPOS',
            status: 'APPROVED',
          },
        },
        isBanned: false,
      },
      orderBy: { eloRepos: 'desc' },
      take: maxResults,
      skip,
      select: {
        id: true,
        username: true,
        eloRepos: true,
        subscriptionTier: true,
        totalWins: true,
        totalLosses: true,
        photos: {
          where: {
            category: 'REPOS',
            status: 'APPROVED',
          },
          orderBy: { elo: 'desc' },
          take: 1,
          select: {
            id: true,
            thumbnailUrl: true,
            isVerified: true,
            elo: true,
            totalMatches: true,
            wins: true,
          },
        },
      },
    });

    const total = await prisma.user.count({
      where: {
        photos: {
          some: {
            category: 'REPOS',
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
      elo: u.eloRepos,
      subscriptionTier: u.subscriptionTier,
      isVerified: u.photos[0]?.isVerified || false,
      totalMatches: u.photos[0]?.totalMatches || 0,
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
    console.error('Get leaderboard repos error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
