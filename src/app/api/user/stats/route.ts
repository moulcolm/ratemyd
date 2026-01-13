import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { calculateGrowerScore } from '@/lib/elo';
import { TIER_LIMITS } from '@/lib/subscription-limits';

export async function GET() {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get user's photos count by category
    const photosRepos = await prisma.photo.count({
      where: { userId: user.id, category: 'REPOS', status: 'APPROVED' },
    });

    const photosErection = await prisma.photo.count({
      where: { userId: user.id, category: 'ERECTION', status: 'APPROVED' },
    });

    const verifiedPhotos = await prisma.photo.count({
      where: { userId: user.id, isVerified: true },
    });

    // Calculate rankings
    const limits = TIER_LIMITS[user.subscriptionTier];

    let rankRepos = null;
    let rankErection = null;
    let rankGlobal = null;

    if (limits.canSeeDetailedStats) {
      // Get repos rank
      const usersWithHigherReposElo = await prisma.user.count({
        where: {
          eloRepos: { gt: user.eloRepos },
          photos: { some: { category: 'REPOS', status: 'APPROVED' } },
        },
      });
      rankRepos = usersWithHigherReposElo + 1;

      // Get erection rank
      const usersWithHigherErectionElo = await prisma.user.count({
        where: {
          eloErection: { gt: user.eloErection },
          photos: { some: { category: 'ERECTION', status: 'APPROVED' } },
        },
      });
      rankErection = usersWithHigherErectionElo + 1;

      // Get global rank
      const usersWithHigherGlobalElo = await prisma.user.count({
        where: {
          eloGlobal: { gt: user.eloGlobal },
          photos: { some: { status: 'APPROVED' } },
        },
      });
      rankGlobal = usersWithHigherGlobalElo + 1;
    }

    const growerScore = calculateGrowerScore(user.eloRepos, user.eloErection);
    const total = user.totalWins + user.totalLosses;
    const winRate = total > 0 ? Math.round((user.totalWins / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        eloRepos: user.eloRepos,
        eloErection: user.eloErection,
        eloGlobal: user.eloGlobal,
        growerScore,
        totalVotesGiven: user.totalVotesGiven,
        totalVotesReceived: user.totalVotesReceived,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        winRate,
        rankRepos,
        rankErection,
        rankGlobal,
        photosRepos,
        photosErection,
        verifiedPhotos,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
