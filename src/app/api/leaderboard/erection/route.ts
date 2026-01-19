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

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Everyone can see full leaderboard now
    const maxResults = limit;

    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: {
        photos: {
          some: {
            category: 'ERECTION',
            status: 'APPROVED',
          },
        },
        isBanned: false,
      },
      orderBy: { eloErection: 'desc' },
      take: maxResults,
      skip,
      select: {
        id: true,
        username: true,
        eloErection: true,
        totalWins: true,
        totalLosses: true,
        photos: {
          where: {
            category: 'ERECTION',
            status: 'APPROVED',
          },
          orderBy: { elo: 'desc' },
          take: 1,
          select: {
            id: true,
            imageUrl: true,
            thumbnailUrl: true,
            isVerified: true,
            elo: true,
            totalMatches: true,
            declaredLength: true,
            wins: true,
          },
        },
      },
    });

    const total = await prisma.user.count({
      where: {
        photos: {
          some: {
            category: 'ERECTION',
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
      elo: u.eloErection,

      isVerified: u.photos[0]?.isVerified || false,
      totalVotes: u.photos[0]?.totalMatches || 0,
      wins: u.photos[0]?.wins || 0,
      winRate: u.photos[0]?.totalMatches > 0
        ? Math.round((u.photos[0]?.wins / u.photos[0]?.totalMatches) * 100)
        : 0,
      photoId: u.photos[0]?.id || '',
      imageUrl: u.photos[0]?.imageUrl || null,
      thumbnailUrl: u.photos[0]?.thumbnailUrl || null,
      declaredLength: u.photos[0]?.declaredLength || null,
      verifiedLength: u.photos[0]?.isVerified ? u.photos[0]?.declaredLength : null,
      category: 'ERECTION',
    }));

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        total,
        page,
        limit: maxResults,
        hasMore: skip + maxResults < total,
      },
    });
  } catch (error) {
    console.error('Get leaderboard erection error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
