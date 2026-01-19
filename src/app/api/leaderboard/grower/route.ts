import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getUserLimits } from '@/lib/subscription-limits';
import { calculateGrowerScore } from '@/lib/elo';

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

    // Get users with photos in BOTH categories
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            photos: {
              some: {
                category: 'REPOS',
                status: 'APPROVED',
              },
            },
          },
          {
            photos: {
              some: {
                category: 'ERECTION',
                status: 'APPROVED',
              },
            },
          },
        ],
        isBanned: false,
      },
      select: {
        id: true,
        username: true,
        eloRepos: true,
        eloErection: true,
        totalWins: true,
        totalLosses: true,
        photos: {
          where: { status: 'APPROVED' },
          select: {
            id: true,
            imageUrl: true,
            thumbnailUrl: true,
            category: true,
            isVerified: true,
            elo: true,
          },
        },
      },
    });

    // Calculate grower score and sort
    const usersWithScore = users
      .map((u) => ({
        ...u,
        growerScore: calculateGrowerScore(u.eloRepos, u.eloErection),
        reposPhoto: u.photos.find((p) => p.category === 'REPOS'),
        erectionPhoto: u.photos.find((p) => p.category === 'ERECTION'),
      }))
      .sort((a, b) => b.growerScore - a.growerScore);

    const total = usersWithScore.length;
    const skip = (page - 1) * limit;
    const paginatedUsers = usersWithScore.slice(skip, skip + maxResults);

    const leaderboard = paginatedUsers.map((u, index) => ({
      rank: skip + index + 1,
      id: u.id,
      username: u.username,
      growerScore: u.growerScore,
      eloRepos: u.eloRepos,
      eloErection: u.eloErection,

      isVerified: u.photos.some((p) => p.isVerified),
      totalVotes: u.reposPhoto?.elo || 0,
      wins: u.totalWins,
      winRate: u.totalWins + u.totalLosses > 0
        ? Math.round((u.totalWins / (u.totalWins + u.totalLosses)) * 100)
        : 0,
      reposThumbnail: u.reposPhoto?.thumbnailUrl || null,
      reposImage: u.reposPhoto?.imageUrl || null,
      erectionThumbnail: u.erectionPhoto?.thumbnailUrl || null,
      erectionImage: u.erectionPhoto?.imageUrl || null,
      photoId: u.erectionPhoto?.id || u.reposPhoto?.id || '',
      imageUrl: u.erectionPhoto?.imageUrl || u.reposPhoto?.imageUrl || null,
      thumbnailUrl: u.erectionPhoto?.thumbnailUrl || u.reposPhoto?.thumbnailUrl || null,
      category: u.erectionPhoto ? 'ERECTION' : 'REPOS',
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
    console.error('Get leaderboard grower error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
