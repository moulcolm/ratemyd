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

    // Everyone can see verified leaderboard now

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category') as 'REPOS' | 'ERECTION' | null;

    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      photos: {
        some: {
          status: 'APPROVED',
          isVerified: true,
          ...(category && { category }),
        },
      },
      isBanned: false,
    };

    const orderByField = category === 'REPOS' ? 'eloRepos' : category === 'ERECTION' ? 'eloErection' : 'eloGlobal';

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { [orderByField]: 'desc' },
      take: limit,
      skip,
      select: {
        id: true,
        username: true,
        eloGlobal: true,
        eloRepos: true,
        eloErection: true,
        totalWins: true,
        totalLosses: true,
        photos: {
          where: {
            status: 'APPROVED',
            isVerified: true,
            ...(category && { category }),
          },
          orderBy: { elo: 'desc' },
          take: 1,
          select: {
            id: true,
            imageUrl: true,
            thumbnailUrl: true,
            category: true,
            elo: true,
            totalMatches: true,
            wins: true,
            declaredLength: true,
          },
        },
      },
    });

    const total = await prisma.user.count({ where: whereClause });

    const leaderboard = users.map((u, index) => ({
      rank: skip + index + 1,
      id: u.id,
      username: u.username,
      elo: category === 'REPOS' ? u.eloRepos : category === 'ERECTION' ? u.eloErection : u.eloGlobal,

      isVerified: true,
      totalVotes: u.photos[0]?.totalMatches || 0,
      wins: u.photos[0]?.wins || 0,
      verifiedLength: u.photos[0]?.declaredLength || null,
      category: u.photos[0]?.category || 'REPOS',
      winRate: u.photos[0]?.totalMatches > 0
        ? Math.round((u.photos[0]?.wins / u.photos[0]?.totalMatches) * 100)
        : 0,
      photoId: u.photos[0]?.id || '',
      imageUrl: u.photos[0]?.imageUrl || null,
      thumbnailUrl: u.photos[0]?.thumbnailUrl || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Get leaderboard verified error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
